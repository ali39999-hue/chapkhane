import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  Settings
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/utils/format-number";
import { requireUser, scopeToUser } from "@/lib/auth";
import { orderStatusLabel, orderStatusTone, type OrderStatus } from "@/modules/workflow/labels";

export const dynamic = "force-dynamic";

const IN_PROGRESS_STATUSES: OrderStatus[] = [
  'paid', 'file_review', 'needs_customer_action', 'awaiting_proof', 'proof_approved',
  'prepress', 'printing', 'finishing', 'quality_check',
];

const READY_STATUSES: OrderStatus[] = ['ready', 'shipped'];

export default async function DashboardPage() {
  const { payload, user } = await requireUser();
  const ownScope = scopeToUser(user);

  const [recentOrders, proofsPending, inProgress, readyToShip, totalOrders] = await Promise.all([
    payload.find({
      collection: "orders",
      where: ownScope,
      limit: 5,
      sort: "-createdAt",
      depth: 0,
      pagination: false,
      select: { orderNumber: true, status: true, totals: true, createdAt: true },
    }),
    payload.find({
      collection: "proofs",
      where: { ...scopeToUser(user), status: { equals: "pending" } },
      limit: 1,
      depth: 0,
    }),
    payload.count({
      collection: "orders",
      where: { ...ownScope, status: { in: IN_PROGRESS_STATUSES } },
    }),
    payload.count({
      collection: "orders",
      where: { ...ownScope, status: { in: READY_STATUSES } },
    }),
    payload.count({ collection: "orders", where: ownScope }),
  ]);

  const stats = [
    { title: "سفارشات جاری", value: formatNumber(inProgress.totalDocs), icon: Clock, color: "text-primary-600", bg: "bg-primary-50 border-primary-100" },
    { title: "آماده تحویل", value: formatNumber(readyToShip.totalDocs), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { title: "کل سفارشات", value: formatNumber(totalOrders.totalDocs), icon: Package, color: "text-secondary-600", bg: "bg-secondary-50 border-secondary-200" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-900 tracking-tight">پنل کاربری چاپخانه نگار</h1>
          <p className="text-secondary-500 mt-2 font-medium text-sm">خوش آمدید! خلاصه وضعیت تولید و سفارشات شما در اینجا قابل مشاهده است.</p>
        </div>
        <Link href="/dashboard/settings">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings size={16} />
            تنظیمات حساب
          </Button>
        </Link>
      </div>

      {/* Alerts / Action Needed */}
      {proofsPending.totalDocs > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center border border-amber-200 shadow-sm animate-pulse">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-900">اقدام فنی مورد نیاز است</h3>
              <p className="text-amber-800 text-sm font-medium mt-1">
                {proofsPending.totalDocs} فایل پیش‌نمایش (Proof) لیتوگرافی در انتظار تأیید شماست.
              </p>
            </div>
          </div>
          <Link href={`/proofs/${proofsPending.docs[0].id}`}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 border-none shrink-0">
              بررسی و تأیید فایل
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-secondary-200 p-6 rounded-2xl shadow-sm flex items-center gap-6 hover:shadow-md hover:border-primary-300 transition-all">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} border rounded-xl flex items-center justify-center shadow-inner shrink-0`}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-secondary-500 text-sm font-bold mb-1">{stat.title}</p>
              <p className="text-3xl font-black text-secondary-900 font-mono">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders List */}
      <div className="bg-white border border-secondary-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-secondary-100 flex justify-between items-center bg-secondary-50/50">
          <h2 className="text-lg font-black text-secondary-900 flex items-center gap-2">
            <Package size={20} className="text-primary-600" />
            سفارش‌های در جریان
          </h2>
          <Link href="/orders" className="text-primary-600 text-xs font-bold hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 transition-colors">
            مدیریت سفارشات
            <ChevronLeft size={14} />
          </Link>
        </div>
        
        <div className="p-0">
          {recentOrders.docs.length > 0 ? (
            <div className="divide-y divide-secondary-100">
              {recentOrders.docs.map((order) => (
                <Link 
                  key={order.id} 
                  href={`/orders/${order.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-secondary-50 transition-colors group gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary-100 border border-secondary-200 rounded-xl flex items-center justify-center text-secondary-500 group-hover:bg-primary-100 group-hover:text-primary-600 group-hover:border-primary-200 transition-all shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-secondary-900 font-mono mb-1">{order.orderNumber}</h4>
                      <p className="text-xs text-secondary-500 font-medium">مبلغ کل: <span className="font-bold">{formatNumber(order.totals?.total ?? 0)}</span> ریال</p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto border-t sm:border-t-0 border-secondary-100 pt-4 sm:pt-0">
                    <span className={`px-3 py-1 text-xs font-black rounded-lg border ${orderStatusTone(order.status)}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                    <span className="text-[11px] text-secondary-400 font-bold">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fa-IR') : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center text-secondary-400">
              <Package size={48} className="mb-4 opacity-50" />
              <p className="font-bold text-secondary-700">شما هنوز هیچ سفارشی ثبت نکرده‌اید.</p>
              <p className="text-xs mt-2">برای ثبت سفارش جدید به کاتالوگ محصولات مراجعه کنید.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
