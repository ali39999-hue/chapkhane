"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronLeft, Package, Sparkles, Layers, Zap } from "lucide-react";

type ProductType = {
  id: string | number;
  name: string;
  slug: string;
  printMethod?: any;
  images?: any[] | null;
};

export function ProductsCatalogView({ initialProducts }: { initialProducts: ProductType[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return initialProducts;
    return initialProducts.filter((product) => product.name.toLowerCase().includes(q.toLowerCase()));
  }, [searchQuery, initialProducts]);

  return (
    <div className="space-y-10 pt-8 pb-20 font-sans relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 font-bold text-xs px-4 py-1.5 rounded-full shadow-sm">
          <Zap size={14} className="text-primary-500" />
          اتصال مستقیم به موتور پردازش چاپ
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-secondary-900 tracking-tight">
          کاتالوگ <span className="text-primary-600">محصولات صنعتی</span>
        </h1>
        <p className="text-secondary-500 text-sm md:text-base font-medium max-w-lg mx-auto">
          محصول مورد نظر را انتخاب کنید تا وارد محیط Configurator شده و پس از اعتبارسنجی فایل (Preflight)، هزینه نهایی محاسبه شود.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-secondary-200 p-4 sm:p-6 rounded-2xl shadow-soft relative z-20">
        <div className="relative w-full max-w-md group">
          <input
            type="text"
            placeholder="جستجو در محصولات (مثلا: کارت ویزیت...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-4 pr-12 rounded-xl bg-secondary-50 border border-secondary-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-sm font-bold text-secondary-900 transition-all placeholder:text-secondary-400"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
        </div>
      </div>

      {/* Grid of Products */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const imageUrl = product.images?.[0]?.url;

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-secondary-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 relative"
              >
                {/* Tech Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-primary-500 transition-colors z-20"></div>

                <div className="relative aspect-[4/3] bg-secondary-50 border-b border-secondary-100 flex items-center justify-center p-6">
                  {/* Subtle Grid in Background */}
                  <div className="absolute inset-0 bg-grid-dots opacity-20 pointer-events-none"></div>

                  <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-500 ease-out z-10 drop-shadow-md">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary-300">
                        <Package size={48} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-primary-600 mb-2 block uppercase tracking-widest bg-primary-50 inline-block px-2 py-0.5 rounded border border-primary-100">
                      چاپ صنعتی
                    </span>
                    <h3 className="text-lg font-black text-secondary-900 group-hover:text-primary-700 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-secondary-100 pt-4">
                    <div className="text-secondary-500 text-xs font-bold flex items-center gap-1.5">
                      <Layers size={14} />
                      شخصی‌سازی فایل
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-secondary-50 text-secondary-400 group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <ChevronLeft size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-secondary-200 p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-secondary-50 border border-secondary-100 rounded-2xl flex items-center justify-center text-secondary-300 mb-6">
            <Package size={32} />
          </div>
          <h3 className="text-lg font-bold text-secondary-900 mb-2">محصولی یافت نشد</h3>
          <p className="text-secondary-500 text-sm font-medium">لطفا عبارت دیگری را جستجو کنید.</p>
        </div>
      )}
    </div>
  );
}