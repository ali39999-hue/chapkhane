import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { Cpu, Printer } from "lucide-react";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const redirectTo = next && next.startsWith("/") ? next : "/dashboard";

  return (
    <main id="main-content" className="min-h-screen bg-secondary-50 text-foreground flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden font-sans" dir="rtl">
      {/* Background decor */}
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Top Logo */}
      <Link href="/" className="mb-8 flex items-center gap-3 group" aria-label="چاپخانه آنلاین نگار — صفحه اصلی">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 text-white flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
          <Printer size={24} aria-hidden="true" />
        </div>
        <div>
          <span className="text-xl font-black text-secondary-900 block">چاپخانه آنلاین نگار</span>
          <span className="text-[10px] text-primary-600 font-bold flex items-center gap-1">
            <Cpu size={10} aria-hidden="true" />
            پلتفرم یکپارچه چاپ صنعتی
          </span>
        </div>
      </Link>

      <div className="w-full max-w-md flex flex-col items-center gap-3 mb-6">
        {/* The page had no h1 at all, so screen-reader users landed on a page
            with no announced title. */}
        <h1 className="text-2xl font-black text-secondary-900 text-center">ورود به حساب کاربری</h1>
        <span className="inline-flex items-center gap-2 text-[11px] font-bold text-primary-700 bg-primary-50 border border-primary-100 px-4 py-1.5 rounded-full shadow-sm">
          <Cpu size={12} aria-hidden="true" />
          سامانه سفارش چاپ نگار
        </span>
      </div>

      <LoginForm next={redirectTo} />
    </main>
  );
}