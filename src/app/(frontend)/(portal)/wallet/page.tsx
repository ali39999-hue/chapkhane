import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, CreditCard, RefreshCw } from "lucide-react";
import { formatNumber } from "@/utils/format-number";
import { requireUser } from "@/lib/auth";
import { relationId } from "@/lib/relations";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { CreditTransaction } from "../../../../../payload-types";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const { payload, user } = await requireUser();

  // The wallet reflects the organization's credit account for b2b users; for
  // regular customers we show the (pending) personal wallet as zero.
  const orgId = user.organization ? relationId(user.organization) : null;

  let balance = 0;
  let transactions: CreditTransaction[] = [];

  if (orgId) {
    const org = await payload.findByID({ collection: "organizations", id: orgId, depth: 0 });
    balance = org?.balance || 0;
    const res = await payload.find({
      collection: "credit-transactions",
      where: { organization: { equals: orgId } },
      sort: "-createdAt",
      limit: 10,
      depth: 0,
      pagination: false,
    });
    transactions = res.docs;
  }

  const currentBalance = balance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-900 tracking-tight">کیف پول و اعتبارات</h1>
          <p className="text-secondary-500 mt-2 font-medium text-sm">مدیریت موجودی و سوابق تراکنش‌های مالی حساب شما</p>
        </div>

        <Link href="/contact">
          <Button className="gap-2 shrink-0">
            <Plus size={18} />
            افزایش موجودی
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          {/* Wallet Card - Corporate Blue style */}
          <div className="bg-primary-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-md shadow-primary-600/20">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-400/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 text-primary-100 mb-8">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Wallet size={20} />
                </div>
                <span className="font-bold text-sm">موجودی فعلی (کیف پول اختصاصی)</span>
              </div>

              <div className="mb-10">
                <div className="text-3xl sm:text-4xl font-black mb-2 flex items-baseline gap-2 font-mono" dir="ltr">
                  <span className="text-lg text-primary-200 font-bold font-sans">IRR</span>
                  {formatNumber(currentBalance)}
                </div>
                <p className="text-primary-100 text-xs flex items-center gap-1 font-bold">
                  <CheckCircle size={14} className="text-emerald-400" />
                  قابل استفاده برای سفارشات آنلاین چاپ
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/contact"
                  className="flex-1 bg-white text-primary-700 hover:bg-secondary-50 transition-colors py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <CreditCard size={18} />
                  شارژ حساب
                </Link>
                <button className="p-3 bg-primary-700 hover:bg-primary-800 text-white rounded-xl transition-colors shadow-sm" title="به‌روزرسانی موجودی">
                  <RefreshCw size={18} />
                </button>
              </div>
          </div>
        </div>
      </div>

        <div className="md:col-span-2">
          <div className="bg-white border border-secondary-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between bg-secondary-50/50">
              <h2 className="text-lg font-black text-secondary-900">سوابق تراکنش‌ها</h2>
            </div>

            <div className="divide-y divide-secondary-100 flex-1 overflow-y-auto">
              {transactions.length > 0 ? transactions.map((tx) => (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-secondary-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                      tx.type === 'charge'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : 'bg-rose-50 border-rose-100 text-rose-600'
                    }`}>
                      {tx.type === 'charge' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                    </div>
                    <div>
                      <p className="font-black text-secondary-900 group-hover:text-primary-700 transition-colors">{tx.notes || 'تراکنش اعتباری'}</p>
                      <p className="text-secondary-500 text-xs mt-1 font-medium">{new Date(tx.createdAt).toLocaleDateString('fa-IR')} - #{tx.id}</p>
                    </div>
                  </div>
                  <div className={`font-black font-mono text-base sm:text-lg ${
                    tx.type === 'charge' ? 'text-emerald-600' : 'text-rose-600'
                  }`} dir="ltr">
                    {tx.type === 'charge' ? '+' : '-'} {formatNumber(tx.amount)}
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-secondary-400 h-full flex flex-col justify-center items-center">
                  <Wallet size={48} className="mb-4 text-secondary-300" />
                  <p className="font-bold text-secondary-800">هنوز تراکنشی ثبت نشده است.</p>
                  <p className="text-sm mt-2 font-medium">پس از شارژ یا پرداخت سفارش‌ها، سوابق در اینجا نمایش داده می‌شوند.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple internal icon for CheckCircle since lucide imports didn't have it on top
function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}