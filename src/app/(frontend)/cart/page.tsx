import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سبد خرید",
  description: "سبد خرید سفارش‌های چاپی شما.",
};

export default function CartPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground flex flex-col justify-between pt-28 pb-20 relative font-sans overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none -z-10" />
      
      <Navbar />
      
      <div className="container mx-auto px-4 max-w-4xl flex-1 flex items-center justify-center relative z-10">
        <div className="bg-white rounded-2xl border border-secondary-200 shadow-soft p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[400px] w-full">
          <div className="w-24 h-24 bg-secondary-50 border border-secondary-200 rounded-2xl flex items-center justify-center mb-6 text-secondary-300">
            <ShoppingCart size={48} aria-hidden="true" />
          </div>
          {/* h1: this was an h2 on a page with no h1. */}
          <h1 className="text-2xl font-black text-secondary-900 mb-3">سبد خرید شما در حال حاضر خالی است.</h1>
          <p className="text-secondary-600 mb-8 font-medium text-sm max-w-md">برای مشاهده و ثبت سفارش، از بخش محصولات پیکربندی مورد نظر را انتخاب و تسویه حساب سریع را بزنید.</p>
          <Link href="/products">
            <Button size="lg">بازگشت به کاتالوگ محصولات</Button>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
