"use server";

import { redirect } from "next/navigation";
import { getAuthContext, isStaff } from "@/lib/auth";
import { relationId } from "@/lib/relations";
import { nextOrderNumber } from "@/modules/checkout/order-number";

/**
 * Duplicates an order back into `draft` so the customer can pay for it again.
 */
export async function reorder(orderId: string) {
  // Uses the request-deduplicated auth context instead of a second
  // `payload.auth` call.
  const { payload, user } = await getAuthContext();
  if (!user) {
    redirect("/login");
  }

  const originalOrder = await payload.findByID({
    collection: "orders",
    id: orderId,
    // `depth: 0` leaves `items` as IDs; the line items are fetched in one
    // batched query below rather than through a deep populate.
    depth: 0,
  });

  if (!originalOrder) {
    throw new Error("سفارش یافت نشد.");
  }

  if (!isStaff(user) && relationId(originalOrder.customer) !== user.id) {
    throw new Error("شما به این سفارش دسترسی ندارید.");
  }

  const itemIds = (originalOrder.items ?? [])
    .map((item) => relationId(item))
    .filter((id): id is number => id !== undefined);

  if (itemIds.length === 0) {
    throw new Error("این سفارش آیتمی برای تکرار ندارد.");
  }

  const originalItems = await payload.find({
    collection: "order-items",
    where: { id: { in: itemIds } },
    limit: itemIds.length,
    depth: 0,
    pagination: false,
    select: {
      productType: true,
      configuration: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
    },
  });

  const newItems = await Promise.all(
    originalItems.docs.map(async (item) => {
      const productTypeId = relationId(item.productType);
      if (productTypeId === undefined) {
        throw new Error("آیتم سفارش فاقد محصول معتبر است.");
      }

      const created = await payload.create({
        collection: "order-items",
        depth: 0,
        data: {
          productType: productTypeId,
          configuration: item.configuration,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          itemStatus: 'pending',
        },
      });
      return created.id;
    })
  );

  const customerId = relationId(originalOrder.customer);
  if (customerId === undefined) {
    throw new Error("سفارش فاقد مشتری معتبر است.");
  }

  // `orderNumber` is UNIQUE; the previous inline `Math.random()` generator
  // could collide and surface as a 500. `nextOrderNumber` verifies against the
  // database and retries.
  const orderNumber = await nextOrderNumber(payload);

  const newOrder = await payload.create({
    collection: "orders",
    depth: 0,
    data: {
      orderNumber,
      customer: customerId,
      status: 'draft',
      items: newItems,
      totals: originalOrder.totals,
      priceSnapshot: originalOrder.priceSnapshot,
      priceListVersion: originalOrder.priceListVersion,
      shippingAddress: originalOrder.shippingAddress,
      shippingMethod: originalOrder.shippingMethod,
    },
  });

  redirect(`/orders/${newOrder.id}`);
}

import { transitionOrderState, OrderStatus } from "@/modules/workflow/state-machine";
import { revalidatePath } from "next/cache";

/**
 * Cancels an order if it is in an eligible state.
 */
export async function cancelOrder(orderId: string) {
  const { payload, user } = await getAuthContext();
  if (!user) {
    throw new Error("لطفا ابتدا وارد حساب کاربری خود شوید.");
  }

  const order = await payload.findByID({
    collection: "orders",
    id: orderId,
    depth: 0,
  });

  if (!order) {
    throw new Error("سفارش یافت نشد.");
  }

  if (!isStaff(user) && relationId(order.customer) !== user.id) {
    throw new Error("شما به این سفارش دسترسی ندارید.");
  }

  // Only allow cancelling draft and awaiting_payment orders
  const cancellableStatuses: OrderStatus[] = ['draft', 'awaiting_payment'];
  if (!cancellableStatuses.includes(order.status as OrderStatus)) {
    throw new Error("این سفارش در حال حاضر قابل لغو نیست.");
  }

  await transitionOrderState(orderId, 'cancelled', { payload });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  redirect("/orders");
}
