"use client";

import { numberToPersianWords } from "@/lib/number-to-words";
import { PrinterIcon, DownloadIcon } from "lucide-react";
import dayjs from "dayjs";
// import jalali plugin if we need persian dates, for now we can just use normal formatting or a simple helper

export function InvoiceClient({ order }: { order: any }) {
  
  const handlePrint = () => {
    window.print();
  };

  const customerName = typeof order.customer === 'object'
    ? (order.customer.fullName || order.customer.email || 'مشتری ناشناس')
    : 'مشتری ناشناس';

  const customerPhone = typeof order.customer === 'object' ? (order.customer.phone || '-') : '-';

  return (
    <div className="w-full max-w-[210mm] relative">
      {/* Action Toolbar (Hidden in Print) */}
      <div className="print:hidden flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-6 sticky top-4 z-10 border border-slate-200">
        <div>
          <h2 className="text-slate-800 font-bold">فاکتور سفارش {order.orderNumber}</h2>
          <p className="text-xs text-slate-500">برای خروجی PDF روی دکمه چاپ کلیک کرده و Save as PDF را انتخاب کنید.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors"
          >
            <PrinterIcon size={16} />
            چاپ / دانلود PDF
          </button>
        </div>
      </div>

      {/* A4 Paper Canvas */}
      <div className="bg-white min-h-[297mm] w-full p-10 shadow-lg print:shadow-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-primary-500 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary-500/30">
              چاپ
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">چاپخانه آنلاین نگار</h1>
              <p className="text-sm text-slate-500 font-medium">شماره ثبت: ۱۲۳۴۵۶ | شناسه ملی: ۱۰۱۰۱۰۱۰۱۰۱</p>
            </div>
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-black text-primary-600 mb-2">صورت‌حساب فروش</h2>
            <div className="space-y-1 text-sm text-slate-600 font-medium">
              <p>شماره سریال: <bdi className="font-bold text-slate-900">{order.orderNumber}</bdi></p>
              <p>تاریخ صدور: <bdi className="font-bold text-slate-900">{dayjs(order.createdAt).format('YYYY/MM/DD')}</bdi></p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <h3 className="font-black text-slate-800 mb-3 text-sm">مشخصات خریدار</h3>
          <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-600">
            <p>نام خریدار: <span className="font-bold text-slate-900">{customerName}</span></p>
            <p>شماره تماس: <span className="font-bold text-slate-900">{customerPhone}</span></p>
            <p className="col-span-2">آدرس: <span className="font-bold text-slate-900">{order.shippingAddress?.city || 'تهران'} - آدرس ثبت شده در پروفایل</span></p>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="mb-6">
          <table className="w-full text-sm text-right">
            <thead className="bg-primary-50 text-primary-800 font-bold border-y-2 border-primary-200">
              <tr>
                <th className="py-3 px-4">ردیف</th>
                <th className="py-3 px-4">شرح خدمات / محصول</th>
                <th className="py-3 px-4">تیراژ</th>
                <th className="py-3 px-4">فی (ریال)</th>
                <th className="py-3 px-4">مبلغ کل (ریال)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-medium border-b-2 border-primary-200">
              {order.items?.map((item: any, index: number) => {
                const productType = typeof item.productType === 'object' ? item.productType?.name : item.productType;
                return (
                  <tr key={item.id}>
                    <td className="py-4 px-4 font-bold">{index + 1}</td>
                    <td className="py-4 px-4">
                      {productType} 
                      <span className="block text-xs text-slate-400 mt-1">
                        {item.configuration?.size?.width && `ابعاد: ${item.configuration.size.width}x${item.configuration.size.height}`}
                      </span>
                    </td>
                    <td className="py-4 px-4"><bdi>{item.quantity}</bdi></td>
                    <td className="py-4 px-4"><bdi>{new Intl.NumberFormat('fa-IR').format(item.unitPrice)}</bdi></td>
                    <td className="py-4 px-4 font-bold"><bdi>{new Intl.NumberFormat('fa-IR').format(item.totalPrice)}</bdi></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-between items-start">
          {/* Numbers to Words */}
          <div className="w-1/2 pt-4">
            <p className="text-slate-500 text-sm font-medium mb-1">مبلغ نهایی به حروف:</p>
            <p className="text-slate-800 font-black bg-slate-50 p-3 rounded-lg border border-slate-200">
              {numberToPersianWords(order.totals?.total || 0)} ریال
            </p>
            
            <div className="mt-12 flex items-center justify-center gap-16 text-slate-400 font-bold text-sm">
              <div className="text-center">
                <p className="mb-8">مهر و امضای فروشنده</p>
                <div className="w-32 h-px bg-slate-300"></div>
              </div>
              <div className="text-center">
                <p className="mb-8">مهر و امضای خریدار</p>
                <div className="w-32 h-px bg-slate-300"></div>
              </div>
            </div>
          </div>

          {/* Summation */}
          <div className="w-1/3 bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="space-y-3 text-sm font-medium text-slate-600 mb-4">
              <div className="flex justify-between">
                <span>جمع مبالغ:</span>
                <span><bdi>{new Intl.NumberFormat('fa-IR').format(order.totals?.subtotal || 0)}</bdi> ریال</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>تخفیف:</span>
                <span><bdi>{new Intl.NumberFormat('fa-IR').format(order.totals?.discount || 0)}</bdi> ریال</span>
              </div>
              <div className="flex justify-between">
                <span>مالیات بر ارزش افزوده (۱۰٪):</span>
                <span><bdi>{new Intl.NumberFormat('fa-IR').format(order.totals?.vat || 0)}</bdi> ریال</span>
              </div>
            </div>
            
            <div className="pt-4 border-t-2 border-primary-200 flex justify-between items-center">
              <span className="font-bold text-primary-900">مبلغ قابل پرداخت:</span>
              <span className="font-black text-xl text-primary-700">
                <bdi>{new Intl.NumberFormat('fa-IR').format(order.totals?.total || 0)}</bdi>
              </span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
