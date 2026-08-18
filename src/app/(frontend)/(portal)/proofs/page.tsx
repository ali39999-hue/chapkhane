import Link from "next/link";
import { CheckCircle, AlertTriangle, XCircle, FileImage, ExternalLink } from "lucide-react";
import { requireUser, scopeToUser } from "@/lib/auth";
import { relationId } from "@/lib/relations";

export const dynamic = "force-dynamic";

export default async function ProofsPage() {
  const { payload, user } = await requireUser();

  const proofs = await payload.find({
    collection: "proofs",
    where: scopeToUser(user, "customer"),
    limit: 50,
    sort: "-createdAt",
    depth: 0,
    pagination: false,
    select: {
      status: true,
      version: true,
      url: true,
      createdAt: true,
      orderItem: true,
    },
  });

  // The card shows the product name, which lives two relationships away
  // (proof -> orderItem -> productType). `depth: 1` populated `orderItem` but
  // left `productType` as an ID, so the name never rendered; `depth: 2` would
  // pull four relationships per item. Two batched queries instead.
  const orderItemIds = [
    ...new Set(
      proofs.docs
        .map((proof) => relationId(proof.orderItem))
        .filter((id): id is number => id !== undefined)
    ),
  ];

  const orderItems = orderItemIds.length > 0
    ? await payload.find({
        collection: "order-items",
        where: { id: { in: orderItemIds } },
        limit: orderItemIds.length,
        depth: 1,
        pagination: false,
        select: { productType: true },
      })
    : null;

  const productNameByOrderItem = new Map<number, string>(
    (orderItems?.docs ?? []).flatMap((item) => {
      const productType = item.productType;
      if (typeof productType !== "object" || productType === null) return [];
      return [[item.id, productType.name] as const];
    })
  );

  const productNameFor = (orderItem: unknown): string => {
    const id = relationId(orderItem);
    return (id !== undefined ? productNameByOrderItem.get(id) : undefined) ?? "محصول چاپی";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">تأییدیه‌های چاپ (Proofs)</h1>
          <p className="text-slate-500 mt-2 font-medium">مشاهده و بررسی فرم‌های نهایی ارسالی از سمت لیتوگرافی</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proofs.docs.length > 0 ? proofs.docs.map((proof) => {
          return (
            <div key={proof.id} className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  proof.status === 'approved' ? 'bg-green-100 text-green-700' :
                  proof.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700 animate-pulse'
                }`}>
                  {proof.status === 'approved' && <CheckCircle size={14} />}
                  {proof.status === 'rejected' && <XCircle size={14} />}
                  {proof.status === 'pending' && <AlertTriangle size={14} />}
                  {proof.status === 'approved' ? 'تأیید شده' : proof.status === 'rejected' ? 'رد شده' : 'نیازمند بررسی شما'}
                </div>
                <span className="text-xs text-slate-400 font-medium font-mono bg-slate-50 px-2 py-1 rounded-md">
                  V-{proof.version}
                </span>
              </div>

              <div className="aspect-video bg-slate-50 rounded-2xl mb-4 flex items-center justify-center overflow-hidden border border-slate-100 relative">
                {proof.url ? (
                  // Proofs are private files served from the artwork bucket.
                  // Routing them through the Next image optimizer would cache
                  // customer artwork in a shared, unauthenticated cache.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={proof.url} alt="Proof" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <FileImage size={40} className="text-slate-300" />
                )}
                {proof.status === 'pending' && (
                  <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Link href={`/proofs/${proof.id}`}>
                      <span className="bg-primary-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                        بررسی و تأیید
                        <ExternalLink size={16} />
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {productNameFor(proof.orderItem)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    تاریخ: {new Date(proof.createdAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                {proof.status !== 'pending' && (
                  <Link href={`/proofs/${proof.id}`} className="text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                    مشاهده جزئیات
                  </Link>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full p-16 flex flex-col items-center justify-center text-slate-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/50">
            <CheckCircle size={48} className="mb-4 text-green-300" />
            <p className="text-lg font-medium">شما هیچ تأییدیه منتظر بررسی ندارید.</p>
            <p className="text-sm mt-1">فایل‌های ارسالی شما مستقیماً وارد مرحله چاپ شده‌اند.</p>
          </div>
        )}
      </div>
    </div>
  );
}