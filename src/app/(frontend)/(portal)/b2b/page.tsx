import { redirect } from "next/navigation";
import { Building2, CreditCard, ArrowDownRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { formatNumber } from "@/utils/format-number";
import { requireUser } from "@/lib/auth";
import { relationId } from "@/lib/relations";

export const dynamic = "force-dynamic";

export default async function B2BPortalPage() {
  const { payload, user } = await requireUser();

  // Only b2b partners (and admins reviewing on their behalf) may view this panel.
  if (user.role !== 'b2b' && user.role !== 'admin') {
    redirect("/dashboard");
  }

  const orgId = user.organization ? relationId(user.organization) : null;
  if (!orgId) {
    return <div className="p-8">شما به هیچ سازمان همکار متصل نیستید.</div>;
  }

  const organization = await payload
    .findByID({
      collection: "organizations",
      id: orgId,
      depth: 0,
    })
    .catch(() => null);

  if (!organization) {
    return <div className="p-8">شما به هیچ سازمان همکار متصل نیستید.</div>;
  }

  const availableCredit = (organization.balance || 0) + (organization.creditLimit || 0);

  // Fetch transactions for this organization only
  const transactions = await payload.find({
    collection: "credit-transactions",
    where: { organization: { equals: organization.id } },
    sort: "-createdAt",
    limit: 50,
    depth: 0,
    pagination: false,
  });

  return (
    <div className="space-y-8 page-enter">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
          <Building2 size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">پنل همکار (B2B)</h1>
          <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
            سازمان: <span className="font-bold text-slate-700">{organization.name}</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-md">فعال</span>
          </p>
        </div>
      </div>

      {/* Credit Summary - Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-3xl shadow-lg shadow-indigo-500/30 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <CreditCard size={24} className="text-indigo-200" />
            <h3 className="font-bold text-indigo-100">قدرت خرید فعلی</h3>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black">{formatNumber(availableCredit)}</p>
            <p className="text-indigo-200 text-sm mt-1">ریال</p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm">
          <h3 className="font-bold text-slate-500 mb-6 flex items-center gap-2">
            <ArrowDownRight size={20} className="text-slate-400" />
            موجودی کیف پول (Balance)
          </h3>
          <p className={`text-3xl font-black ${(organization.balance || 0) < 0 ? 'text-red-500' : 'text-slate-800'}`}>
            {formatNumber(organization.balance || 0)}
          </p>
          <p className="text-slate-400 text-sm mt-1">ریال</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm">
          <h3 className="font-bold text-slate-500 mb-6 flex items-center gap-2">
            <ShieldCheck size={20} className="text-slate-400" />
            سقف اعتبار (بدهی مجاز)
          </h3>
          <p className="text-3xl font-black text-slate-800">{formatNumber(organization.creditLimit || 0)}</p>
          <p className="text-slate-400 text-sm mt-1">ریال</p>
        </div>
      </div>

      {/* Discount Info */}
      {(organization.baseDiscount || 0) > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
          <p className="text-emerald-800 font-medium">
            شما به‌عنوان همکار، مشمول <strong>{organization.baseDiscount}٪ تخفیف ثابت</strong> روی تمامی سفارشات هستید که در فاکتور نهایی اعمال می‌شود.
          </p>
        </div>
      )}

      {/* Ledger */}
      <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="p-6 border-b border-slate-100/50 bg-white/50">
          <h2 className="text-xl font-bold text-slate-800">صورت‌حساب و تراکنش‌های اعتباری</h2>
        </div>

        <div className="overflow-x-auto">
          {transactions.docs.length > 0 ? (
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100/80">
                <tr>
                  <th className="px-6 py-4">تاریخ</th>
                  <th className="px-6 py-4">نوع</th>
                  <th className="px-6 py-4">مبلغ (ریال)</th>
                  <th className="px-6 py-4">توضیحات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {transactions.docs.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                      {new Date(trx.createdAt).toLocaleString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      {trx.type === 'charge' ? (
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md w-fit font-bold">
                          <ArrowUpRight size={14} /> شارژ حساب
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md w-fit font-bold">
                          <ArrowDownRight size={14} /> کسر اعتبار
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 font-black ${trx.type === 'charge' ? 'text-green-600' : 'text-red-600'}`}>
                      {trx.type === 'charge' ? '+' : '-'}{formatNumber(trx.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {trx.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center text-slate-500">
              هیچ تراکنش اعتباری برای سازمان شما ثبت نشده است.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}