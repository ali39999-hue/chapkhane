import { notFound } from "next/navigation";
import { ProofClient } from "./ProofClient";
import { Navbar } from "@/components/layout/Navbar";
import { requireUser, isStaff } from "@/lib/auth";
import { relationId } from "@/lib/relations";

export const dynamic = "force-dynamic";

export default async function ProofPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, { payload, user }] = await Promise.all([params, requireUser()]);

  // Fetch the proof
  const proof = await payload
    .findByID({
      collection: "proofs",
      id,
      depth: 1, // populate orderItem
    })
    .catch(() => null);

  if (!proof) notFound();

  // A proof is a document tied to one customer: only its owner or staff may see it.
  if (!isStaff(user) && relationId(proof.customer) !== user.id) {
    notFound();
  }

  // Get order ID from orderItem relationship. OrderItem has no `order`
  // back-reference, so we query the orders collection to find the parent order.
  const orderItemId = typeof proof.orderItem === 'object' ? proof.orderItem.id : proof.orderItem;

  const orderRes = await payload.find({
    collection: "orders",
    where: {
      items: { contains: orderItemId },
    },
    limit: 1,
    depth: 0,
    pagination: false,
  });

  if (orderRes.totalDocs === 0) {
    return <div className="p-10 text-center">خطا: سفارش مربوط به این طرح یافت نشد.</div>;
  }

  const orderId = String(orderRes.docs[0].id);

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-20">
      <Navbar />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">تأییدیه پیش از چاپ (Proof)</h1>
          <p className="text-slate-600 font-medium">لطفاً طرح زیر را بررسی کرده و جهت ارسال به تولید، آن را تأیید کنید.</p>
        </div>

        <ProofClient proof={proof} orderId={orderId} />
      </div>
    </main>
  );
}
