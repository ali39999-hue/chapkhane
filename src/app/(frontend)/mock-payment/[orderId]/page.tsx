import { notFound } from "next/navigation";
import { PaymentMockUI } from "./PaymentMockUI";
import { requireUser, isStaff } from "@/lib/auth";
import { relationId } from "@/lib/relations";

export default async function MockPaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [{ orderId }, { payload, user }] = await Promise.all([params, requireUser()]);

  const order = await payload
    .findByID({
      collection: 'orders',
      id: orderId,
      depth: 0,
      // Only the receipt fields; `priceSnapshot` and `shippingAddress` would
      // otherwise be serialized into the client payload for nothing.
      select: { orderNumber: true, status: true, customer: true, totals: true },
    })
    .catch(() => null);

  if (!order) notFound();

  // Only the order owner (or staff) may pay for it.
  if (!isStaff(user) && relationId(order.customer) !== user.id) {
    notFound();
  }

  if (order.status !== 'draft' && order.status !== 'awaiting_payment') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">خطا در پرداخت</h1>
          <p className="text-slate-500">این سفارش قبلاً پرداخت شده یا قابل پرداخت نیست.</p>
        </div>
      </div>
    );
  }

  return (
    <PaymentMockUI
      order={{
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.totals?.total ?? 0,
      }}
    />
  );
}
