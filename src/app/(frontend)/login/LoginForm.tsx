"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  KeyRound, 
  Smartphone, 
  ArrowLeft, 
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();

  // Login Mode: 'otp' or 'password'
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('password');

  // OTP Flow states
  const [phone, setPhone] = useState("");

  // Password Flow states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState(false);

  // Password Login through Payload's REST API
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("ایمیل و کلمه عبور را وارد کنید.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0]?.message || data.message || "نام کاربری یا کلمه عبور اشتباه است.");
        setLoading(false);
        return;
      }

      setMessage("ورود موفق بود. در حال انتقال...");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError("خطا در برقراری ارتباط با سرور.");
      setLoading(false);
    }
  };

  // OTP flow is not implemented (no SMS provider). Keep it disabled with a notice.
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("ورود با پیامک در حال حاضر فعال نیست. لطفاً از کلمه عبور استفاده کنید.");
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-secondary-200 p-8 sm:p-10 shadow-float space-y-6 relative">

      {/* Tab Toggle (OTP vs Password) */}
      <div className="grid grid-cols-2 p-1 bg-secondary-50 rounded-xl border border-secondary-200">
        <button
          type="button"
          onClick={() => { setAuthMode('otp'); setMessage(null); setError(null); }}
          className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            authMode === 'otp' ? "bg-primary-600 text-white shadow-md shadow-primary-600/20" : "text-secondary-500 hover:text-secondary-700"
          }`}
        >
          <Smartphone size={15} />
          <span>ورود با پیامک (OTP)</span>
        </button>

        <button
          type="button"
          onClick={() => { setAuthMode('password'); setMessage(null); setError(null); }}
          className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            authMode === 'password' ? "bg-primary-600 text-white shadow-md shadow-primary-600/20" : "text-secondary-500 hover:text-secondary-700"
          }`}
        >
          <KeyRound size={15} />
          <span>ورود با کلمه عبور</span>
        </button>
      </div>

      {/* Message / Error Banner */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 text-center">
          {error}
        </div>
      )}
      {message && !error && (
        <div className="p-3.5 bg-primary-50 border border-primary-200 rounded-xl text-xs font-bold text-primary-700 text-center">
          {message}
        </div>
      )}

      {/* Form 1: OTP Flow (disabled) */}
      {authMode === 'otp' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary-600 mb-2">شماره تلفن همراه</label>
            <input
              type="tel"
              required
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className="w-full h-13 px-4 rounded-xl bg-secondary-50 border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-secondary-900 text-sm font-bold text-right placeholder:text-secondary-400"
            />
          </div>

          <p className="text-[11px] text-secondary-500 leading-relaxed font-medium">
            سرویس پیامک در حال راه‌اندازی است. فعلاً از ورود با کلمه عبور استفاده کنید.
          </p>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-13 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-md shadow-primary-600/20 flex items-center justify-center gap-2"
          >
            دریافت کد تایید
            <ArrowLeft size={16} />
          </Button>
        </form>
      )}

      {/* Form 2: Password Flow */}
      {authMode === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary-600 mb-2">ایمیل</label>
            <input
              type="email"
              required
              placeholder="admin@chapkhane.ir"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="w-full h-13 px-4 rounded-xl bg-secondary-50 border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-secondary-900 text-sm font-bold text-right placeholder:text-secondary-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-secondary-600">کلمه عبور</label>
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-[11px] text-primary-600 hover:underline font-bold"
              >
                فراموشی رمز؟
              </button>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              className="w-full h-13 px-4 rounded-xl bg-secondary-50 border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-secondary-900 text-sm font-bold placeholder:text-secondary-400"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-13 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-md shadow-primary-600/20 flex items-center justify-center gap-2"
          >
            {loading ? "در حال ورود..." : "ورود به سامانه"}
            <ArrowLeft size={16} />
          </Button>
        </form>
      )}

      {/* Footer info */}
      <div className="pt-4 border-t border-secondary-200 text-center space-y-3">
        <p className="text-xs text-secondary-500 font-medium">
          ورود شما به منزله پذیرش{" "}
          <Link href="/guide" className="text-primary-600 hover:underline font-bold">قوانین و استانداردهای چاپخانه</Link> است.
        </p>

        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-secondary-400 hover:text-secondary-600 font-bold">
          <Cpu size={14} />
          ورود به پنل مدیریت چاپخانه (Admin Console)
        </Link>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl space-y-4 text-right border border-secondary-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-primary-600" />
            <h3 className="text-lg font-black text-secondary-900">بازیابی کلمه عبور</h3>
            <p className="text-xs text-secondary-600 leading-relaxed font-medium">
              ایمیل خود را وارد کنید تا لینک تغییر رمز برای شما ارسال شود.
            </p>
            <input
              type="email"
              placeholder="you@example.com"
              dir="ltr"
              className="w-full h-12 px-4 rounded-xl bg-secondary-50 border border-secondary-200 text-sm font-bold text-secondary-900 text-right outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder:text-secondary-400"
            />
            <Button onClick={() => setForgotModal(false)} className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl">
              ارسال لینک بازیابی
            </Button>
            <button onClick={() => setForgotModal(false)} className="w-full text-center text-xs text-secondary-400 hover:text-secondary-600 py-1 font-bold">
              انصراف و بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}