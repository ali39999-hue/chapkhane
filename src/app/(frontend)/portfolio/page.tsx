"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useState } from "react";

const categories = ["همه", "کارت ویزیت", "تراکت", "کاتالوگ", "بسته‌بندی", "لیبل"];

const items = [
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
  const [activeCategory, setActiveCategory] = useState("همه");

  const filtered = activeCategory === "همه" ? items : items.filter(i => i.category === activeCategory);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
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

      {/* Filters */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary-200 hover:text-primary-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-8 px-4 pb-20">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item, i) => (
              <div
                key={item.title}
                style={{ animationDelay: `${i * 0.05}s` }}
                className="page-enter group cursor-pointer"
              >
                <div className={`h-52 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm group-hover:shadow-xl transition-shadow duration-300`}>
                  <span className="text-white/80 text-sm font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mt-4 px-1">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
