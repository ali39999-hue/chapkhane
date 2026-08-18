"use client";

import { useState } from "react";

export type PortfolioItem = {
  title: string;
  category: string;
  color: string;
};

/**
 * Client island for the category filter.
 *
 * The whole portfolio page used to be a client component (`"use client"` at the
 * top of `page.tsx`) purely to hold this one piece of state, which pulled the
 * navbar, footer and all the static markup into the browser bundle.
 */
export function PortfolioGallery({
  categories,
  items,
}: {
  categories: string[];
  items: PortfolioItem[];
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const filtered =
    activeCategory === categories[0]
      ? items
      : items.filter((i) => i.category === activeCategory);

  return (
    <>
      {/* Filters */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-5xl">
          <div
            className="flex flex-wrap items-center justify-center gap-2"
            role="group"
            aria-label="فیلتر دسته‌بندی نمونه‌کارها"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`px-5 py-3 min-h-11 rounded-xl text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary-200 hover:text-primary-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {filtered.length} نمونه‌کار نمایش داده می‌شود
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-8 px-4 pb-20">
        <div className="container mx-auto max-w-5xl">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0">
            {filtered.map((item, i) => (
              <li
                key={item.title}
                style={{ animationDelay: `${i * 0.05}s` }}
                className="page-enter group"
              >
                <div
                  className={`h-52 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <span className="text-white/90 text-sm font-bold bg-black/25 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                    {item.category}
                  </span>
                </div>
                {/* h2: these were h3 directly under the page h1. */}
                <h2 className="text-base font-bold text-slate-800 mt-4 px-1">{item.title}</h2>
              </li>
            ))}
          </ul>

          {filtered.length === 0 && (
            <p className="text-center text-slate-500 font-medium py-16">
              در این دسته‌بندی نمونه‌کاری ثبت نشده است.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
