import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PortfolioGallery, type PortfolioItem } from "@/components/portfolio/PortfolioGallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "نمونه‌کارها",
  description: "گالری نمونه‌کارهای چاپی چاپخانه آنلاین نگار: کارت ویزیت، تراکت، کاتالوگ، بسته‌بندی و لیبل.",
};

const categories = ["همه", "کارت ویزیت", "تراکت", "کاتالوگ", "بسته‌بندی", "لیبل"];

const items: PortfolioItem[] = [
  { title: "کارت ویزیت لمینت براق", category: "کارت ویزیت", color: "from-blue-400 to-indigo-500" },
  { title: "تراکت A5 گلاسه", category: "تراکت", color: "from-rose-400 to-pink-500" },
  { title: "کاتالوگ ۱۶ صفحه‌ای", category: "کاتالوگ", color: "from-emerald-400 to-teal-500" },
  { title: "جعبه محصول آرایشی", category: "بسته‌بندی", color: "from-amber-400 to-orange-500" },
  { title: "کارت ویزیت سلفون مات", category: "کارت ویزیت", color: "from-violet-400 to-purple-500" },
  { title: "تراکت A4 تحریر", category: "تراکت", color: "from-cyan-400 to-sky-500" },
  { title: "لیبل برچسب شیشه‌ای", category: "لیبل", color: "from-lime-400 to-green-500" },
  { title: "بروشور سه‌لت", category: "کاتالوگ", color: "from-fuchsia-400 to-pink-500" },
  { title: "جعبه غذایی", category: "بسته‌بندی", color: "from-red-400 to-rose-500" },
];

export default function PortfolioPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col">
      <Navbar />

      <section className="pt-32 pb-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-block bg-violet-50 text-violet-700 font-bold text-sm px-4 py-2 rounded-full mb-6 border border-violet-100">
            نمونه‌کارها
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">گالری آثار ما</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            نمونه‌ای از پروژه‌های اخیر چاپخانه آنلاین نگار را مشاهده کنید.
          </p>
        </div>
      </section>

      <div className="flex-1">
        <PortfolioGallery categories={categories} items={items} />
      </div>

      {/* The page previously ended without a footer, unlike every other public
          route, so the site navigation dead-ended here. */}
      <Footer />
    </main>
  );
}
