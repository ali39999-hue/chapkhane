import { notFound } from "next/navigation";
import { InvoiceClient } from "./InvoiceClient";
import { requireUser, isStaff } from "@/lib/auth";
import { relationId } from "@/lib/relations";

export const revalidate = 0; // Dynamic rendering for invoices

export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const [{ orderId }, { payload, user }] = await Promise.all([params, requireUser()]);

  const orderRes = await payload
    .find({
      collection: 'orders',
      where: { id: { equals: orderId } },
      limit: 1,
      depth: 2, // populate items and customer
      pagination: false,
    })
    .catch(() => null);

  if (!orderRes || orderRes.totalDocs === 0) return notFound();

  const order = orderRes.docs[0];

  // Financial documents are private: only the owner customer or staff may view.
  if (!isStaff(user) && relationId(order.customer) !== user.id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center py-10 print:py-0 print:bg-white dir-rtl">
      <InvoiceClient order={order} />
    </main>
  );
}