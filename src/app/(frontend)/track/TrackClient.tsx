"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  FileCheck,
  Printer,
  Layers,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

const TRACKING_STEPS = [
  { key: "registered", title: "ثبت سفارش", desc: "پذیرش و صدور پیش‌فاکتور", icon: Package },
  { key: "paid", title: "پرداخت", desc: "تایید فاکتور و مالی", icon: CreditCard },
  { key: "file_review", title: "بررسی فنی فایل", desc: "تطبیق CMYK و ابعاد بلید", icon: FileCheck },
  { key: "production", title: "لیتوگرافی و چاپ", desc: "شیت‌بندی و چاپ", icon: Printer },
  { key: "finishing", title: "خدمات تکمیلی", desc: "سلفون، خط تا و برش", icon: Layers },
  { key: "quality_check", title: "کنترل کیفیت", desc: "بازرسی و بسته‌بندی", icon: CheckCircle2 },
  { key: "shipped", title: "ارسال سفارش", desc: "تحویل به باربری", icon: Truck },
];

const CANCELED_STATUSES = ["cancelled", "refunded"];

/** Maps a real order status to a 0..6 progress index on the stepper. */
function statusToStepIndex(status: string): number {
  switch (status) {
    case "draft":
      return 0;
    case "awaiting_payment":
      return 0;
    case "paid":
      return 1;
    case "file_review":
    case "needs_customer_action":
    case "awaiting_proof":
    case "proof_approved":
      return 2;
    case "prepress":
    case "printing":
    case "on_hold":
      return 3;
    case "finishing":
      return 4;
    case "quality_check":
      return 5;
    case "ready":
    case "shipped":
    case "delivered":
    case "closed":
      return 6;
    default:
      return 0;
  }
}

interface TrackOrder {
  id: number;
  orderNumber: string;
  status: string;
  createdAt: string;
  totals?: { total?: number } | null;
}

export function TrackClient({
  initialOrder,
  initialQuery,
}: {
  initialOrder: TrackOrder | null;
  initialQuery: string;
}) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState(initialQuery);

  const order = initialOrder;
  const isCanceled = order ? CANCELED_STATUSES.includes(order.status) : false;
  const activeStepIndex = order ? statusToStepIndex(order.status) : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const code = orderNumber.trim();
    if (!code) return;
    router.push(`/track?order=${encodeURIComponent(code)}`);
  };

  return (
    <>
      {/* Search Bar */}
      <section className="max-w-xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative flex items-center shadow-soft rounded-xl bg-white p-2 border border-secondary-200">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="مثلاً: ORD-9821"
            className="flex-1 h-13 px-4 bg-transparent outline-none font-bold text-secondary-900 text-sm sm:text-base placeholder:text-secondary-400"
            dir="ltr"
          />
          <button
            type="submit"
            className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-lg shadow-md shadow-primary-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 shrink-0"
          >
            <Search size={18} />
            <span>استعلام وضعیت</span>
          </button>
        </form>

        {!order && initialQuery && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            سفارشی با این شماره یافت نشد. شماره سفارش را درست وارد کنید.
          </div>
        )}
      </section>

      {/* Tracking Results */}
      {order ? (
        <section className="space-y-8">
          {/* Work Ticket Header Card */}
          <div className="bg-white rounded-2xl border border-secondary-200 p-6 sm:p-8 shadow-soft grid grid-cols-2 sm:grid-cols-4 gap-6 text-right relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary-100/50 rounded-full blur-2xl pointer-events-none" />

            <div>
              <span className="text-xs text-secondary-500 font-bold block mb-1">شماره سفارش</span>
              <span className="text-lg font-black text-secondary-900 font-mono" dir="ltr">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-xs text-secondary-500 font-bold block mb-1">تاریخ ثبت</span>
              <span className="text-sm font-bold text-secondary-700">
                {new Date(order.createdAt).toLocaleDateString('fa-IR')}
              </span>
            </div>
            <div>
              <span className="text-xs text-secondary-500 font-bold block mb-1">مبلغ سفارش</span>
              <span className="text-sm font-bold text-emerald-600">
                {new Intl.NumberFormat('fa-IR').format(order.totals?.total || 0)} ریال
              </span>
            </div>
            <div>
              <span className="text-xs text-secondary-500 font-bold block mb-1">وضعیت جاری</span>
              {isCanceled ? (
                <span className="inline-block px-3 py-1 bg-red-50 border border-red-200 text-red-700 font-black text-xs rounded-lg">
                  لغو شده
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-primary-50 border border-primary-200 text-primary-700 font-black text-xs rounded-lg">
                  {TRACKING_STEPS[activeStepIndex].title}
                </span>
              )}
            </div>
          </div>

          {/* Visual Stepper Timeline */}
          {!isCanceled && (
            <div className="bg-white rounded-2xl border border-secondary-200 p-6 sm:p-10 shadow-soft">
              <h3 className="text-lg font-black text-secondary-900 mb-8 flex items-center gap-2">
                <Clock size={20} className="text-primary-500" />
                خط سیر تولید و پردازش کارگاهی
              </h3>

              {/* Horizontal Stepper (Desktop) */}
              <div className="hidden md:flex items-center justify-between relative">
                <div className="absolute top-6 right-8 left-8 h-1 bg-secondary-200 -z-0" />
                <div
                  className="absolute top-6 right-8 h-1 bg-gradient-to-l from-primary-500 to-accent-500 transition-all duration-700 -z-0"
                  style={{ width: `${(activeStepIndex / (TRACKING_STEPS.length - 1)) * 90}%` }}
                />

                {TRACKING_STEPS.map((step, idx) => {
                  const isDone = idx < activeStepIndex;
                  const isCurrent = idx === activeStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center relative z-10 w-24">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${
                        isCurrent
                          ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30 ring-4 ring-primary-100 scale-110"
                          : isDone
                          ? "bg-emerald-500 text-white"
                          : "bg-secondary-100 border border-secondary-200 text-secondary-400"
                      }`}>
                        {isDone ? <CheckCircle2 size={22} /> : <step.icon size={20} />}
                      </div>
                      <span className={`text-xs font-bold mt-3 ${isCurrent ? "text-primary-700 font-black" : isDone ? "text-secondary-800" : "text-secondary-400"}`}>
                        {step.title}
                      </span>
                      <span className="text-[10px] text-secondary-400 mt-1 line-clamp-1">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Vertical Stepper (Mobile) */}
              <div className="md:hidden space-y-6">
                {TRACKING_STEPS.map((step, idx) => {
                  const isDone = idx < activeStepIndex;
                  const isCurrent = idx === activeStepIndex;
                  return (
                    <div key={step.key} className="flex items-start gap-4 relative">
                      {idx < TRACKING_STEPS.length - 1 && (
                        <div className={`absolute top-10 right-5 bottom-0 w-0.5 ${idx < activeStepIndex ? "bg-primary-500" : "bg-secondary-200"}`} />
                      )}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 ${
                        isCurrent
                          ? "bg-primary-600 text-white shadow-md ring-2 ring-primary-100"
                          : isDone
                          ? "bg-emerald-500 text-white"
                          : "bg-secondary-100 border border-secondary-200 text-secondary-400"
                      }`}>
                        {isDone ? <CheckCircle2 size={18} /> : <step.icon size={18} />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isCurrent ? "text-primary-700 font-black" : isDone ? "text-secondary-900" : "text-secondary-400"}`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-secondary-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}