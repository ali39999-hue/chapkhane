import { getPayload } from "payload";
import configPromise from "@payload-config";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  PlusCircle, 
  FileCheck2, 
  Kanban, 
  BadgePercent, 
  Users, 
  ExternalLink,
  Layers,
  Cpu,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/utils/format-number";
import { DashboardCharts } from "./DashboardCharts";
import { orderStatusLabel } from "@/modules/workflow/labels";

/** Production stages shown in the live workload widget. */
const PRODUCTION_STAGES = [
  { status: 'prepress', label: 'لیتوگرافی و فرم‌بندی', tone: 'blue' },
  { status: 'printing', label: 'سالن چاپ', tone: 'emerald' },
  { status: 'finishing', label: 'پس از چاپ (صحافی)', tone: 'primary' },
  { status: 'quality_check', label: 'کنترل کیفیت', tone: 'amber' },
] as const;

const STAGE_TONES: Record<string, { text: string; bg: string; border: string; bar: string }> = {
  blue: { text: 'text-blue-400', bg: 'bg-blue-950/50', border: 'border-blue-900/50', bar: 'bg-blue-500' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-900/50', bar: 'bg-emerald-500' },
  primary: { text: 'text-primary-400', bg: 'bg-primary-950/50', border: 'border-primary-900/50', bar: 'bg-primary-500' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-950/50', border: 'border-amber-900/50', bar: 'bg-amber-500' },
};

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function CustomDashboard() {
  const payload = await getPayload({ config: configPromise });

  // 1. Get Today's Orders & Revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Window for the revenue chart: the last 7 calendar days including today.
  const chartStart = new Date(today.getTime() - 6 * DAY_MS);

  const [
    todayOrderCount,
    totalOrders,
    allPendingProofs,
    bottleneckOrders,
    recentOrders,
    revenueWindow,
    deliveredOrders,
    stageCounts,
  ] = await Promise.all([
    payload.count({
      collection: "orders",
      where: { createdAt: { greater_than_equal: today.toISOString() } },
    }),
    payload.count({ collection: "orders" }),
    payload.count({
      collection: "proofs",
      where: { status: { equals: "pending" } }
    }),
    payload.find({
      collection: "orders",
      // A single `in` predicate matches the ['status', 'createdAt'] index.
      where: { status: { in: ['needs_customer_action', 'awaiting_proof', 'file_review'] } },
      limit: 8,
      sort: "-createdAt",
      depth: 0,
      pagination: false,
      select: { orderNumber: true, status: true, createdAt: true, totals: true },
    }),
    payload.find({
      collection: "orders",
      limit: 6,
      sort: "-createdAt",
      depth: 0,
      pagination: false,
      select: { orderNumber: true, status: true, createdAt: true, totals: true },
    }),
    // Real revenue for the chart: paid-or-later orders in the window.
    payload.find({
      collection: "orders",
      where: {
        and: [
          { createdAt: { greater_than_equal: chartStart.toISOString() } },
          { status: { not_in: ['draft', 'awaiting_payment', 'cancelled', 'refunded'] } },
        ],
      },
      limit: 1000,
      depth: 0,
      pagination: false,
      select: { createdAt: true, totals: true },
    }),
    // Average turnaround, measured from order creation to delivery.
    payload.find({
      collection: "orders",
      where: { status: { in: ['delivered', 'closed'] } },
      limit: 50,
      sort: "-updatedAt",
      depth: 0,
      pagination: false,
      select: { createdAt: true, updatedAt: true },
    }),
    Promise.all(
      PRODUCTION_STAGES.map((stage) =>
        payload.count({ collection: "orders", where: { status: { equals: stage.status } } })
      )
    ),
  ]);

  // 3. Chart data — measured, not fabricated. The previous version filled six of
  //    the seven days with `Math.random()`, which also made this component
  //    impure and produced a different chart on every render.
  const revenueByDay = new Map<string, number>();
  for (const order of revenueWindow.docs) {
    const key = new Date(order.createdAt).toISOString().slice(0, 10);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + (order.totals?.total ?? 0));
  }

  const todayRevenue = revenueByDay.get(today.toISOString().slice(0, 10)) ?? 0;

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(chartStart.getTime() + i * DAY_MS);
    return {
      date: d.toLocaleDateString('fa-IR', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      revenue: revenueByDay.get(d.toISOString().slice(0, 10)) ?? 0,
    };
  });

  const deliveryDurations = deliveredOrders.docs
    .map((order) => (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / DAY_MS)
    .filter((days) => Number.isFinite(days) && days >= 0);

  const averageDeliveryDays = deliveryDurations.length > 0
    ? Math.round(deliveryDurations.reduce((a, b) => a + b, 0) / deliveryDurations.length)
    : null;

  const stages = PRODUCTION_STAGES.map((stage, i) => ({
    ...stage,
    count: stageCounts[i].totalDocs,
  }));
  const busiestStage = Math.max(1, ...stages.map((s) => s.count));

  const currentDateStr = new Date().toLocaleDateString('fa-IR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-4 sm:p-8 space-y-8 font-sans text-slate-300 min-h-screen bg-slate-950" dir="rtl">
      {/* Top Welcome Bar */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-xs font-bold text-amber-300 border border-white/10">
            <Sparkles size={14} className="text-amber-400" />
            مرکز کنترل صنعتی چاپخانه (Heidelberg Console)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            خوش آمدید، مدیر چاپخانه <span className="text-amber-400">.</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
            امروز {currentDateStr} <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> وضعیت خطوط تولید پایدار است.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link 
            href="/" 
            target="_blank"
            className="px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm rounded-2xl backdrop-blur-md border border-slate-700 transition-all flex items-center gap-2"
          >
            مشاهده سایت
            <ExternalLink size={16} />
          </Link>
          <Link 
            href="/production" 
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-slate-950 font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all flex items-center gap-2 border border-primary-500"
          >
            <Kanban size={18} />
            کارتابل تولید (Kanban)
          </Link>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-slate-800">
        <h2 className="text-sm font-black text-slate-300 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-primary-400" />
          دسترسی‌های سریع سیستم
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link 
            href="/admin/collections/product-types/create" 
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 transition-all border border-slate-800 hover:border-primary-500/50 flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 shadow-sm flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
              <PlusCircle size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300">محصول جدید</span>
          </Link>

          <Link 
            href="/production" 
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 transition-all border border-slate-800 hover:border-blue-500/50 flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 shadow-sm flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Kanban size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300">خط تولید</span>
          </Link>

          <Link 
            href="/admin/collections/proofs" 
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 transition-all border border-slate-800 hover:border-amber-500/50 flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 shadow-sm flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <FileCheck2 size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300">تایید پرف / فایل</span>
          </Link>

          <Link 
            href="/admin/collections/price-lists" 
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 transition-all border border-slate-800 hover:border-emerald-500/50 flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 shadow-sm flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <BadgePercent size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300">لیست تعرفه‌ها</span>
          </Link>

          <Link 
            href="/admin/collections/users" 
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 transition-all border border-slate-800 hover:border-purple-500/50 flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 shadow-sm flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300">مشتریان و همکاران</span>
          </Link>

          <Link 
            href="/admin/collections/orders" 
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 transition-all border border-slate-800 hover:border-rose-500/50 flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 shadow-sm flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Package size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300">همه سفارشات</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-800 flex items-center justify-between hover:bg-slate-900 transition-colors group">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1 group-hover:text-slate-300 transition-colors">سفارشات ثبت‌شده امروز</p>
            <h3 className="text-2xl font-black text-white">{todayOrderCount.totalDocs} عدد</h3>
            <p className="text-xs text-slate-500 mt-2">از مجموع {totalOrders.totalDocs} سفارش کلی</p>
          </div>
          <div className="w-14 h-14 bg-blue-950 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-900/50">
            <Package size={28} />
          </div>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-800 flex items-center justify-between hover:bg-slate-900 transition-colors group">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1 group-hover:text-slate-300 transition-colors">درآمد فروش امروز</p>
            <h3 className="text-2xl font-black text-emerald-400">{formatNumber(todayRevenue)} <span className="text-xs text-emerald-700 font-normal">ریال</span></h3>
            <p className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md inline-block mt-2 font-bold border border-emerald-900/50">
              ✓ واریز مستقیم
            </p>
          </div>
          <div className="w-14 h-14 bg-emerald-950 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-900/50">
            <TrendingUp size={28} />
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-800 flex items-center justify-between hover:bg-slate-900 transition-colors group">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1 group-hover:text-slate-300 transition-colors">فایل‌های در صف تایید</p>
            <h3 className="text-2xl font-black text-amber-400">{allPendingProofs.totalDocs} طرح</h3>
            <p className="text-[10px] text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-md inline-block mt-2 font-bold border border-amber-900/50">
              نیازمند اقدام فوری
            </p>
          </div>
          <div className="w-14 h-14 bg-amber-950 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-900/50">
            <AlertTriangle size={28} />
          </div>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-800 flex items-center justify-between hover:bg-slate-900 transition-colors group">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1 group-hover:text-slate-300 transition-colors">میانگین زمان تحویل</p>
            <h3 className="text-2xl font-black text-purple-400">
              {averageDeliveryDays === null ? '—' : `${averageDeliveryDays.toLocaleString('fa-IR')} روز`}
            </h3>
            <p className="text-[10px] text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded-md inline-block mt-2 font-bold border border-purple-900/50">
              {averageDeliveryDays === null
                ? 'داده کافی نیست'
                : `میانگین ${deliveryDurations.length.toLocaleString('fa-IR')} سفارش اخیر`}
            </p>
          </div>
          <div className="w-14 h-14 bg-purple-950 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-900/50">
            <Clock size={28} />
          </div>
        </div>
      </div>

      {/* Live production workload per stage */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Cpu size={20} className="text-primary-400" />
            بار کاری جاری خطوط تولید
          </h2>
          <Link
            href="/production"
            className="flex items-center gap-1.5 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors"
          >
            کارتابل کانبان
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage) => {
            const tone = STAGE_TONES[stage.tone];
            const widthPercent = Math.round((stage.count / busiestStage) * 100);

            return (
              <div key={stage.status} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">{stage.label}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${tone.bg} ${tone.text} ${tone.border}`}>
                    {stage.count.toLocaleString('fa-IR')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">سفارش در این مرحله</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`${tone.bar} h-full rounded-full`} style={{ width: `${widthPercent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Grid: Charts & Bottleneck Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Chart (7 Columns) */}
        <div className="lg:col-span-7 bg-slate-900/50 backdrop-blur-md rounded-3xl shadow-xl border border-slate-800 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp className="text-primary-400" size={20} />
                روند تله‌متری درآمد
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">REVENUE_TELEMETRY_7D</p>
            </div>
            <span className="text-[10px] font-black text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl uppercase tracking-widest">
              L7D Window
            </span>
          </div>
          <div className="flex-1 w-full mt-4">
            <DashboardCharts data={chartData} />
          </div>
        </div>

        {/* Bottleneck Orders (5 Columns) */}
        <div className="lg:col-span-5 bg-slate-900/50 backdrop-blur-md rounded-3xl shadow-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={20} />
              گلوگاه‌های تولید (Bottlenecks)
            </h2>
            <span className="px-2.5 py-1 bg-amber-950/50 text-amber-400 border border-amber-900/50 rounded-full text-xs font-black">
              {bottleneckOrders.totalDocs} مورد
            </span>
          </div>

          <div className="p-0 flex-1 divide-y divide-slate-800/50 overflow-y-auto max-h-[380px] custom-scrollbar">
            {bottleneckOrders.docs.length > 0 ? (
              bottleneckOrders.docs.map(order => (
                <div key={order.id} className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4 group">
                  <div className="space-y-1">
                    <Link 
                      href={`/admin/collections/orders/${order.id}`} 
                      className="font-bold text-white hover:text-primary-400 flex items-center gap-1.5 text-sm transition-colors"
                    >
                      {order.orderNumber}
                      <ArrowUpRight size={14} className="text-slate-500 group-hover:text-primary-400" />
                    </Link>
                    <p className="text-xs text-slate-400 font-medium font-mono">
                      {formatNumber(order.totals?.total || 0)} IRR
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                      order.status === 'needs_customer_action' ? 'bg-amber-950/50 text-amber-400 border-amber-900/50' : 
                      order.status === 'awaiting_proof' ? 'bg-purple-950/50 text-purple-400 border-purple-900/50' : 
                      'bg-blue-950/50 text-blue-400 border-blue-900/50'
                    }`}>
                      {orderStatusLabel(order.status)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-full bg-emerald-950/50 flex items-center justify-center border border-emerald-900/50">
                  <ShieldCheck size={32} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-white mb-1">گلوگاهی یافت نشد</p>
                  <p className="text-xs">جریان کار در تمامی خطوط بهینه است.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview Table */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Package size={20} className="text-primary-400" />
              لاگ دریافت سفارشات اخیر
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">RECENT_ORDERS_STREAM</p>
          </div>

          <Link 
            href="/admin/collections/orders" 
            className="text-sm font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            مشاهده آرشیو کامل
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-950 text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">شناسه یکتا</th>
                <th className="px-6 py-4">مبلغ فاکتور</th>
                <th className="px-6 py-4">وضعیت پروسس</th>
                <th className="px-6 py-4">تایم‌استمپ ثبت</th>
                <th className="px-6 py-4 text-center">عملیات سیستم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {recentOrders.docs.length > 0 ? (
                recentOrders.docs.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-white font-mono">
                      <Link href={`/admin/collections/orders/${order.id}`} className="hover:text-primary-400 transition-colors">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {formatNumber(order.totals?.total || 0)} <span className="text-xs text-slate-500">IRR</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                        ['delivered', 'closed', 'refunded'].includes(order.status) ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' :
                        ['prepress', 'printing', 'finishing', 'quality_check', 'ready', 'shipped'].includes(order.status) ? 'bg-blue-950/50 text-blue-400 border-blue-900/50' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {orderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')} - {new Date(order.createdAt).toLocaleTimeString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/admin/collections/orders/${order.id}`}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold transition-all inline-block"
                      >
                        اکسپند (Expand)
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    جریان داده خالی است. (No recent orders found)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
