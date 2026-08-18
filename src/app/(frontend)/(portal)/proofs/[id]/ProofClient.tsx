"use client";

import { useState } from "react";
import { approveProof, rejectProof } from "./actions";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, XCircle, FileImage } from "lucide-react";

/**
 * Lean projection of a proof. The server used to pass the whole document,
 * which serialized `approvalIp`, `signedAgreementText` and the populated
 * `orderItem`/`customer` records into the client payload.
 */
export type ProofView = {
  id: number | string;
  status: string;
  version: number;
  url?: string | null;
  filename?: string | null;
  customerFeedback?: string | null;
};

export function ProofClient({ proof, orderId }: { proof: ProofView; orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [mode, setMode] = useState<"view" | "reject">("view");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const legalText = `اینجانب صحت اطلاعات، املاء، ابعاد و کیفیت فایل آپلودی را بررسی کرده و مسئولیت هرگونه خطای چاپی ناشی از فایل را می‌پذیرم.`;

  const handleApprove = async () => {
    // The agreement text is stored as the customer's signature, so approving
    // without ticking the box would record consent that was never given.
    if (!agreed) {
      setError("برای تأیید، ابتدا متن تعهدنامه را بپذیرید.");
      return;
    }
    if (!confirm("آیا از تأیید نهایی این طرح اطمینان دارید؟ پس از تأیید امکان تغییر وجود ندارد.")) return;

    setError("");
    setLoading(true);
    try {
      await approveProof(String(proof.id), orderId, legalText);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت تأییدیه");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      setError("لطفاً دلیل رد کردن طرح را بنویسید.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await rejectProof(String(proof.id), orderId, feedback);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت اصلاحیه");
    } finally {
      setLoading(false);
    }
  };

  if (proof.status === "approved") {
    return (
      <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-200">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-800 mb-2">طرح تأیید شده است</h2>
        <p className="text-green-700">سفارش شما وارد مرحله پیش‌از‌چاپ (Prepress) شده است. زمان تحویل از این لحظه محاسبه می‌گردد.</p>
      </div>
    );
  }

  if (proof.status === "rejected") {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-800 mb-2">طرح توسط شما رد شد</h2>
        <p className="text-red-700 mb-4">دلیل: {proof.customerFeedback}</p>
        <p className="text-red-700">لطفاً فایل اصلاح‌شده خود را از طریق پنل کاربری مجدداً آپلود کنید.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex gap-4">
        <AlertTriangle className="text-amber-500 flex-shrink-0" size={32} />
        <div>
          <h3 className="font-bold text-amber-900 mb-1">هشدار پیش از چاپ</h3>
          <p className="text-amber-800 text-sm leading-relaxed">
            کاربر گرامی، لطفاً پیش‌نمایش زیر را با دقت بررسی کنید. خطوط قرمز نشان‌دهندهٔ 
            <strong> حاشیه امن </strong> و خطوط آبی نشان‌دهندهٔ <strong> برش </strong> هستند. 
            مسئولیت هرگونه افت کیفیت، غلط املایی یا رفتن متن زیر برش بر عهدهٔ شماست.
          </p>
        </div>
      </div>

      {/* Preview File */}
      <div className="bg-slate-100 rounded-3xl p-4 md:p-12 flex justify-center items-center min-h-[400px] shadow-inner relative overflow-hidden">
        {proof.url ? (
          <div className="relative group">
            {/* Guide Lines Mock */}
            <div className="absolute inset-4 border-2 border-dashed border-red-500/50 pointer-events-none z-10" />
            <div className="absolute inset-0 border border-blue-500/50 pointer-events-none z-10" />
            
            {/* Actual File — private artwork, deliberately not routed through
                the Next image optimizer (shared, unauthenticated cache). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={proof.url} 
              alt="Proof Preview" 
              className="max-w-full max-h-[60vh] object-contain shadow-2xl relative z-0 bg-white" 
            />
          </div>
        ) : (
          <div className="text-slate-400 flex flex-col items-center">
            <FileImage size={64} className="mb-4 opacity-50" />
            <p>در حال رندر پیش‌نمایش...</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        {mode === "view" ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex-1">
              <label className="flex items-start gap-3 cursor-pointer p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700 font-medium">
                  {legalText}
                </span>
              </label>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setMode("reject")}
              >
                نیاز به اصلاح دارد
              </Button>
              <Button 
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30"
                onClick={handleApprove}
                disabled={loading || !agreed}
              >
                {loading ? "در حال ثبت..." : "تأیید و ارسال به چاپ"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 page-enter">
            <h3 className="font-bold text-slate-900">ثبت اصلاحیه (راند {proof.version})</h3>
            <p className="text-sm text-slate-500">لطفاً توضیح دهید چه مشکلی در فایل وجود دارد تا کارشناسان ما بررسی کنند یا پس از رد کردن، فایل جدید آپلود کنید.</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[120px]"
              placeholder="مثلاً: لوگو خیلی به لبه برش نزدیک است..."
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setMode("view")}>انصراف</Button>
              <Button 
                variant="primary"
                className="bg-red-600 hover:bg-red-700" 
                onClick={handleReject} 
                disabled={loading || !feedback.trim()}
              >
                {loading ? "در حال ثبت..." : "ثبت و رد پیش‌نمایش"}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
