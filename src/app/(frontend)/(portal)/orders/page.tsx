import type { Where } from "payload";
import Link from "next/link";
import { Package, Eye } from "lucide-react";
import { formatNumber } from "@/utils/format-number";
import { requireUser, scopeToUser } from "@/lib/auth";
import { orderStatusLabel, orderStatusTone } from "@/modules/workflow/labels";
import { ReorderButton } from "./[id]/ReorderButton";

export const dynamic = "force-dynamic";

export default async function OrdersListPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ status?: string }> 
}) {
  const [resolvedSearchParams, { payload, user }] = await Promise.all([
    searchParams,
    requireUser(),
  ]);
  const statusFilter = resolvedSearchParams.status;

  const where: Where = { ...scopeToUser(user) };
  if (statusFilter && statusFilter !== 'all') {
    where.status = { equals: statusFilter };
  }

  const orders = await payload.find({
    collection: "orders",
    where,
    sort: "-createdAt",
    limit: 50,
    depth: 0,
    pagination: false,
    select: {
      orderNumber: true,
      createdAt: true,
      status: true,
      totals: true,
    },
  });

  const statusOptions = [
    { value: 'all', label: 'همه سفارشات' },
    { value: 'draft', label: 'پیش‌نویس' },
    { value: 'needs_customer_action', label: 'نیازمند اقدام' },
    { value: 'printing', label: 'در حال چاپ' },
    { value: 'ready', label: 'آماده تحویل' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-900 tracking-tight">سفارش‌های من</h1>
          <p className="text-secondary-500 mt-2 font-medium text-sm">لیست تمامی سفارشات چاپی شما</p>
        </div>
        
        {/* Simple Filters */}
        <div className="bg-secondary-50 border border-secondary-200 p-1.5 rounded-xl flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {statusOptions.map(opt => {
            const isActive = (statusFilter || 'all') === opt.value;
            return (
              <Link 
                key={opt.value} 
                href={opt.value === 'all' ? '/orders' : `/orders?status=${opt.value}`}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' 
                    : 'text-secondary-500 hover:text-secondary-800 hover:bg-secondary-100'
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-secondary-200 rounded-2xl shadow-sm overflow-hidden">
        {orders.docs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-secondary-50 text-secondary-600 font-bold border-b border-secondary-200">
                <tr>
                  <th className="px-6 py-4">شماره سفارش</th>
                  <th className="px-6 py-4">تاریخ ثبت</th>
                  <th className="px-6 py-4">مبلغ نهایی (ریال)</th>
                  <th className="px-6 py-4">وضعیت</th>
                  <th className="px-6 py-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {orders.docs.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center text-secondary-500 group-hover:bg-primary-100 group-hover:text-primary-600 border border-transparent group-hover:border-primary-200 transition-colors">
                          <Package size={18} />
                        </div>
                        <span className="font-black font-mono text-secondary-900">{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-secondary-600 font-medium">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fa-IR') : ''}
                    </td>
                    <td className="px-6 py-5 font-bold text-secondary-900">
                      {formatNumber(order.totals?.total ?? 0)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 text-xs font-black rounded-lg border ${orderStatusTone(order.status)}`}>
                        {orderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/orders/${order.id}`}
                          className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                          title="مشاهده جزئیات"
                        >
                          <Eye size={18} aria-hidden="true" />
                          <span className="sr-only">مشاهده جزئیات سفارش {order.orderNumber}</span>
                        </Link>
                        <ReorderButton orderId={order.id.toString()} variant="icon" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-secondary-400 bg-secondary-50/50">
            <Package size={48} className="mb-4 text-secondary-300" />
            <p className="text-lg font-bold text-secondary-800">سفارشی یافت نشد!</p>
            <p className="text-sm mt-2 font-medium">با تغییر فیلترها یا ثبت سفارش جدید، این لیست به‌روز خواهد شد.</p>
          </div>
        )}
      </div>
    </div>
  );
}
