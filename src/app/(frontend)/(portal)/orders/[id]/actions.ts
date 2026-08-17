"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function reorder(orderId: string) {
  const payload = await getPayload({ config: configPromise });

  // Only the order owner (or staff) can reorder
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) {
    redirect("/login");
  }
  
  // 1. Fetch the original order with its items
  const originalOrder = await payload.findByID({
    collection: "orders",
    id: orderId,
    depth: 1, // Get items
  });

  if (!originalOrder || !originalOrder.items) {
    throw new Error("سفارش یافت نشد.");
  }

  const customerId = typeof originalOrder.customer === 'object' ? originalOrder.customer?.id : originalOrder.customer;
  const isStaff = ['admin', 'operator'].includes(user.role);
  if (!isStaff && customerId !== user.id) {
    throw new Error("شما به این سفارش دسترسی ندارید.");
  }

  // 2. We need to create a new order with the same items/config but in 'draft' state
  // In a real scenario with a Cart system, we would copy the items to the User's Cart.
  // For now, we will create a direct duplicate order in draft state.
  
  // Clone items (remove IDs)
  const newItems = await Promise.all(
    (originalOrder.items as any[]).map(async (item) => {
      const newItem = await payload.create({
        collection: "order-items",
        data: {
          productType: item.productType.id || item.productType,
          configuration: item.configuration,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          itemStatus: 'pending',
        }
      });
      return newItem.id;
    })
  );

  // Generate new Order Number
  const orderNumber = `PR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const newOrder = await payload.create({
    collection: "orders",
    data: {
      orderNumber,
      customer: typeof originalOrder.customer === 'object' ? originalOrder.customer.id : originalOrder.customer,
      status: 'draft',
      items: newItems,
      totals: originalOrder.totals,
      priceSnapshot: originalOrder.priceSnapshot,
      priceListVersion: originalOrder.priceListVersion,
      shippingAddress: originalOrder.shippingAddress,
      shippingMethod: originalOrder.shippingMethod,
    }
  });

  // Redirect to checkout or the new order
  redirect(`/orders/${newOrder.id}`);
}
