import { notFound } from "next/navigation";
import { ProofClient, type ProofView } from "./ProofClient";
import { requireUser, isStaff } from "@/lib/auth";
import { relationId } from "@/lib/relations";

export const dynamic = "force-dynamic";

export default async function ProofPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, { payload, user }] = await Promise.all([params, requireUser()]);

  // Only the fields the client actually renders. `approvalIp` and
  // `signedAgreementText` are audit-trail data and stay on the server.
  const proof = await payload
    .findByID({
      collection: "proofs",
      id,
      depth: 0,
      select: {
        status: true,
        version: true,
        url: true,
        filename: true,
        customerFeedback: true,
        customer: true,
        orderItem: true,
      },
    })
    .catch(() => null);

  if (!proof) notFound();

  // A proof is a document tied to one customer: only its owner or staff may see it.
  if (!isStaff(user) && relationId(proof.customer) !== user.id) {
    notFound();
  }

  // Get order ID from orderItem relationship. OrderItem has no `order`
  // back-reference, so we query the orders collection to find the parent order.
  const orderItemId = relationId(proof.orderItem);

  const orderRes = orderItemId !== undefined
    ? await payload.find({
        collection: "orders",
        where: { items: { contains: orderItemId } },
        limit: 1,
        depth: 0,
        pagination: false,
        select: {},
      })
    : null;

  const parentOrder = orderRes?.docs[0];
  if (!parentOrder) {
    return <div className="p-10 text-center">خطا: سفارش مربوط به این طرح یافت نشد.</div>;
  }

  const view: ProofView = {
    id: proof.id,
    status: proof.status ?? "pending",
    version: proof.version,
    url: proof.url,
    filename: proof.filename,
    customerFeedback: proof.customerFeedback,
  };

  return (
    // This route is inside the (portal) group, whose layout already provides
    // the sidebar and the `<main id="main-content">` landmark. It previously
    // rendered its own `<main>` plus the public `<Navbar />`, which produced
    // nested <main> elements and a fixed navbar overlapping the portal sidebar.
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">تأییدیه پیش از چاپ (Proof)</h1>
        <p className="text-slate-600 font-medium">لطفاً طرح زیر را بررسی کرده و جهت ارسال به تولید، آن را تأیید کنید.</p>
      </div>

      <ProofClient proof={view} orderId={String(parentOrder.id)} />
    </div>
  );
}
