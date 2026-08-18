import { notFound } from "next/navigation";
import { ReorderButton } from "./ReorderButton";
import { formatNumber } from "@/utils/format-number";
import { ArrowRight, CheckCircle, Clock, FileText, Truck, ExternalLink, Printer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { requireUser, isStaff } from "@/lib/auth";
import { relationId } from "@/lib/relations";
import { orderStatusLabel, orderStatusTone } from "@/modules/workflow/labels";

import { CancelOrderButton } from "./CancelOrderButton";

export const dynamic = "force-dynamic";

/** `configuration` is a `json` column, so Payload types it as `unknown`. */
function configuredPaperId(configuration: unknown): string | undefined {
  if (typeof configuration !== "object" || configuration === null) return undefined;
  const value = (configuration as { paperTypeId?: unknown }).paperTypeId;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, { payload, user }] = await Promise.all([params, requireUser()]);

  const order = await payload
    .findByID({
      collection: "orders",
      id,
      // `depth: 1` populates `items`. `depth: 2` would additionally resolve
      // each item's productType, artwork, designProject and every proof —
      // four relationships per line — to render one product name.
      depth: 1,
    })
    .catch(() => null);

  if (!order) notFound();

  // Ownership check: staff or the order's customer only.
  if (!isStaff(user) && relationId(order.customer) !== user.id) {
    notFound();
  }

  const items = (order.items ?? []).flatMap((item) =>
    typeof item === "object" && item !== null ? [item] : []
  );

  // Resolve paper and product names in two batched queries instead of a deep
  // populate.
  const paperIds = [
    ...new Set(items.map((item) => configuredPaperId(item.configuration)).filter((v): v is string => !!v)),
  ];
  const productTypeIds = [
    ...new Set(items.map((item) => relationId(item.productType)).filter((v): v is number => v !== undefined)),
  ];

  const [papersRes, productsRes] = await Promise.all([
    paperIds.length > 0
      ? payload.find({
          collection: "paper-types",
          where: { id: { in: paperIds } },
          limit: paperIds.length,
          depth: 0,
          pagination: false,
          select: { name: true },
        })
      : Promise.resolve(null),
    productTypeIds.length > 0
      ? payload.find({
          collection: "product-types",
          where: { id: { in: productTypeIds } },
          limit: productTypeIds.length,
          depth: 0,
          pagination: false,
          select: { name: true },
        })
      : Promise.resolve(null),
  ]);

  const paperNameById = new Map((papersRes?.docs ?? []).map((p) => [String(p.id), p.name]));
  const productNameById = new Map((productsRes?.docs ?? []).map((p) => [String(p.id), p.name]));

  const timelineSteps = [
    { key: "draft", label: "ثبت اولیه" },
    { key: "paid", label: "تأیید مالی" },
    { key: "file_review", label: "بررسی فایل" },
    { key: "printing", label: "در حال چاپ" },
    { key: "ready", label: "آماده تحویل" },
    { key: "delivered", label: "تحویل شده" },
  ];

  // Map current status to an index (simplified logic for demo)
  const currentStatusIndex = timelineSteps.findIndex(s => 
    s.key === order.status || 
    (order.status === 'awaiting_payment' && s.key === 'draft') ||
    (order.status === 'proof_approved' && s.key === 'file_review') ||
    (order.status === 'prepress' && s.key === 'printing') ||
    (order.status === 'shipped' && s.key === 'delivered')
  );
  
  const stepIndex = currentStatusIndex === -1 ? 0 : currentStatusIndex;

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/orders" className="w-10 h-10 bg-secondary-50 border border-secondary-200 rounded-xl flex items-center justify-center text-secondary-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-secondary-900 tracking-tight flex flex-wrap items-center gap-3">
              سفارش <span className="font-mono text-primary-600">{order.orderNumber}</span>
              <span className={`px-3 py-1 text-sm font-black rounded-lg border border-primary-100 ${orderStatusTone(order.status)}`}>
                {orderStatusLabel(order.status)}
              </span>
            </h1>
            <p className="text-secondary-500 mt-1 font-medium text-sm">
              ثبت شده در {new Date(order.createdAt).toLocaleDateString('fa-IR')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {(order.status === 'draft' || order.status === 'awaiting_payment') && (
            <CancelOrderButton orderId={String(order.id)} />
          )}
          <Link href={`/invoice/${order.id}`} target="_blank">
            <Button variant="outline" className="bg-white hover:bg-secondary-50 border-secondary-200">
              <FileText size={18} className="ml-2" />
              فاکتور رسمی
            </Button>
          </Link>
          <ReorderButton orderId={String(order.id)} />
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white border border-secondary-200 p-8 rounded-2xl shadow-sm overflow-x-auto">
        <div className="min-w-[600px] flex justify-between relative">
          <div className="absolute top-5 left-8 right-8 h-1 bg-secondary-100 rounded-full -z-10" />
          <div 
            className="absolute top-5 right-8 h-1 bg-primary-600 rounded-full -z-10 transition-all duration-1000" 
            style={{ width: `${(stepIndex / (timelineSteps.length - 1)) * 100}%` }}
          />
          
          {timelineSteps.map((step, idx) => {
            const isCompleted = idx <= stepIndex;
            const isCurrent = idx === stepIndex;
            return (
              <div key={step.key} className="flex flex-col items-center gap-3 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm font-bold ${
                  isCompleted ? 'bg-primary-600 text-white shadow-primary-600/20' : 'bg-white border-2 border-secondary-200 text-secondary-300'
                } ${isCurrent ? 'ring-4 ring-primary-100 scale-110' : ''}`}>
                  {isCompleted ? <CheckCircle size={20} /> : <Clock size={18} />}
                </div>
                <span className={`text-sm font-bold ${isCurrent ? 'text-primary-700' : isCompleted ? 'text-secondary-900' : 'text-secondary-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking Info Box (If Shipped) */}
          {(order.status === 'shipped' || order.status === 'delivered') && order.trackingCode && (
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-8">
              <div className="w-16 h-16 bg-white border border-primary-200 text-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Truck size={32} />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h3 className="text-xl font-black text-secondary-900 mb-1">سفارش شما ارسال شده است!</h3>
                <p className="text-secondary-600 font-medium">محموله شما از طریق <strong>{order.shippingProvider || "پست/پیک"}</strong> ارسال گردید.</p>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <div className="bg-white px-4 py-3 rounded-xl border border-primary-100 flex items-center justify-center font-mono text-lg font-black text-secondary-900 shadow-sm">
                  {order.trackingCode}
                </div>
                {order.trackingUrl && (
                  <a 
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-primary-600 hover:bg-primary-700 text-white w-full py-2.5 rounded-xl flex justify-center items-center gap-2 font-bold transition-all hover:-translate-y-0.5 shadow-md shadow-primary-600/20"
                  >
                    پیگیری آنلاین
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          )}

          <h2 className="text-xl font-black text-secondary-900 flex items-center gap-2">
            <Printer size={20} className="text-primary-600" />
            اقلام سفارش
          </h2>
          {items.map((item) => {
            const paperId = configuredPaperId(item.configuration);
            const productTypeId = relationId(item.productType);
            const productName =
              (productTypeId !== undefined ? productNameById.get(String(productTypeId)) : undefined) ??
              (typeof item.productType === "object" && item.productType !== null
                ? item.productType.name
                : undefined) ??
              "محصول چاپی";

            return (
              <div key={item.id} className="bg-white border border-secondary-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-24 h-24 bg-secondary-50 rounded-xl border border-secondary-100 flex items-center justify-center flex-shrink-0 text-secondary-400">
                  <FileText size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-secondary-900 mb-2">
                    {productName}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-secondary-50 border border-secondary-200 text-secondary-700 rounded-lg text-xs font-bold">تیراژ: {item.quantity}</span>
                    {paperId && (
                      <span className="px-3 py-1 bg-secondary-50 border border-secondary-200 text-secondary-700 rounded-lg text-xs font-bold">
                        کاغذ: {paperNameById.get(paperId) || paperId}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-end border-t border-secondary-100 pt-4 mt-2">
                    <span className="text-secondary-500 font-bold text-sm">مبلغ این آیتم:</span>
                    <span className="text-lg font-black text-secondary-900">{formatNumber(item.totalPrice)} ریال</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Summary */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-secondary-900">خلاصه مالی</h2>
          <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between text-secondary-600 text-sm font-bold">
              <span>مبلغ کل (بدون تخفیف)</span>
              <span>{formatNumber(order.totals?.subtotal || 0)} ریال</span>
            </div>
            <div className="flex justify-between text-red-600 text-sm font-bold">
              <span>تخفیف</span>
              <span>{formatNumber(order.totals?.discount || 0)} ریال</span>
            </div>
            <div className="flex justify-between text-secondary-600 text-sm font-bold">
              <span>هزینه ارسال</span>
              <span>{formatNumber(order.totals?.shipping || 0)} ریال</span>
            </div>
            <div className="flex justify-between text-secondary-600 text-sm font-bold">
              <span>مالیات بر ارزش افزوده (۱۰٪)</span>
              <span>{formatNumber(order.totals?.vat || 0)} ریال</span>
            </div>
            
            <div className="border-t border-secondary-200 pt-4 mt-2 flex justify-between items-center">
              <span className="font-black text-secondary-900">مبلغ نهایی</span>
              <span className="text-2xl font-black text-primary-600">{formatNumber(order.totals?.total || 0)} ریال</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
