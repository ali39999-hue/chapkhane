"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Receipt, CreditCard, ChevronLeft, Loader2, AlertCircle } from "lucide-react";

export type MockPaymentOrder = {
  id: number | string;
  orderNumber: string;
  total: number;
};

export function PaymentMockUI({ order }: { order: MockPaymentOrder }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async (status: 'success' | 'failed') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The outcome is a *request* to the sandbox gateway, not the verdict:
        // the server resolves the real status through the gateway module.
        body: JSON.stringify({ orderId: order.id, callback: { status } }),
      });

      if (!res.ok) {
        throw new Error('خطا در ارتباط با سرور شاپرک');
      }

      router.push(status === 'success' ? '/dashboard?payment=success' : '/dashboard?payment=failed');
    } catch {
      alert('خطا در پردازش تراکنش');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden" dir="rtl">
      {/* Security Background Decor */}
      <div className="absolute inset-0 bg-grid-slate opacity-20 pointer-events-none -z-10" />
      <div className="absolute top-0 w-full h-96 bg-primary-600 -z-10 skew-y-3 origin-top-left -translate-y-24 opacity-10" />

      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full font-bold text-sm shadow-sm mb-4">
          <ShieldCheck size={18} />
          درگاه پرداخت امن الکترونیک
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-secondary-900 tracking-tight">تسویه‌حساب سفارش</h1>
        <p className="text-secondary-500 font-medium mt-2">محیط شبیه‌سازی پرداخت (Sandbox)</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-secondary-900/5 overflow-hidden border border-secondary-200 relative">
        
        {/* Receipt Top Edge */}
        <div className="h-2 w-full bg-[url('/img/receipt-edge.svg')] bg-repeat-x opacity-20" />

        <div className="p-8">
          <div className="flex items-center gap-3 text-secondary-800 mb-6 pb-6 border-b border-secondary-100 border-dashed">
            <Receipt className="text-primary-600" size={24} />
            <h2 className="text-lg font-black">فاکتور پرداخت اینترنتی</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-secondary-500 font-bold text-sm">پذیرنده (فروشگاه):</span>
              <span className="text-secondary-900 font-black">چاپخانه آنلاین نگار</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-secondary-500 font-bold text-sm">شماره سفارش:</span>
              <span className="text-secondary-900 font-black font-mono bg-secondary-50 px-3 py-1 rounded-lg border border-secondary-100">
                {order.orderNumber}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-t border-secondary-100 mt-2 pt-4">
              <span className="text-secondary-500 font-bold text-sm">مبلغ قابل پرداخت:</span>
              <div className="text-left" dir="ltr">
                <span className="text-primary-700 text-3xl font-black">
                  {new Intl.NumberFormat('fa-IR').format(order.total)}
                </span>
                <span className="text-sm font-bold text-secondary-500 ml-1">ریال</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-secondary-50 p-8 border-t border-secondary-200 space-y-4 relative">
          <Button 
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-black shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 border-0 transition-transform active:scale-95"
            onClick={() => handlePayment('success')}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <CreditCard size={20} />
                پرداخت موفق و تکمیل خرید
              </>
            )}
          </Button>
          
          <button 
            className="w-full h-14 rounded-xl text-secondary-500 hover:bg-white hover:text-red-600 font-bold transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-red-100"
            onClick={() => handlePayment('failed')}
            disabled={isLoading}
          >
            <ChevronLeft size={18} />
            انصراف از پرداخت و بازگشت
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-xs font-bold text-secondary-400 bg-secondary-100 px-4 py-2 rounded-lg">
        <AlertCircle size={14} />
        این یک محیط آزمایشی است و از حساب شما پولی کسر نخواهد شد.
      </div>
    </div>
  );
}
