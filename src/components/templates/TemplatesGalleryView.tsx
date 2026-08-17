"use client";

import React, { useState, useMemo } from "react";
import { 
  Download, 
  Search, 
  Bell, 
  CheckCircle2, 
  Cpu,
  Layers,
  FileCode2,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  dimensions: string;
  bleed: string;
  formats: string[];
  description: string;
  svgPlaceholder: React.ReactNode;
}

const DEFAULT_TEMPLATES: TemplateItem[] = [
  {
    id: "bc-standard",
    name: "ماتریس استاندارد کارت ویزیت",
    category: "کارت ویزیت",
    dimensions: "۸۵ × ۵۵ میلی‌متر",
    bleed: "+۳mm اضافه رنگ (Bleed)",
    formats: ["PDF", "AI", "PSD"],
    description: "قالب مهندسی شده با خطوط راهنمای دقیق برش و حاشیه امن برای تیغ‌زنی صنعتی.",
    svgPlaceholder: (
      <svg width="100%" height="100%" viewBox="0 0 200 120" className="text-secondary-400">
        <rect x="20" y="20" width="160" height="80" rx="4" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-primary-400"/>
        <rect x="25" y="25" width="150" height="70" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
        <line x1="100" y1="20" x2="100" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
      </svg>
    )
  },
  {
    id: "flyer-a4",
    name: "شبکه راهنمای پوستر A4",
    category: "تراکت و پوستر",
    dimensions: "۲۱۰ × ۲۹۷ میلی‌متر",
    bleed: "+۳mm اضافه رنگ (Bleed)",
    formats: ["PDF", "AI", "PSD"],
    description: "وایرفریم دقیق A4 کالیبره شده با رزولوشن ۳۰۰dpi مخصوص ماشین‌های ۴ رنگ.",
    svgPlaceholder: (
      <svg width="100%" height="100%" viewBox="0 0 160 220" className="text-secondary-400">
        <rect x="20" y="20" width="120" height="180" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-primary-400"/>
        <rect x="25" y="25" width="110" height="170" fill="none" stroke="currentColor" strokeWidth="1"/>
        <path d="M 20,40 L 140,40 M 20,200 L 140,200" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
      </svg>
    )
  },
  {
    id: "flyer-a5",
    name: "ساختار شبکه تراکت A5",
    category: "تراکت و پوستر",
    dimensions: "۱۴۸ × ۲۱۰ میلی‌متر",
    bleed: "+۳mm اضافه رنگ (Bleed)",
    formats: ["PDF", "AI", "PSD"],
    description: "دارای کراپ‌مارک‌های استاندارد صنعتی و پروفایل رنگی تعبیه شده CMYK.",
    svgPlaceholder: (
      <svg width="100%" height="100%" viewBox="0 0 160 200" className="text-secondary-400">
        <rect x="30" y="30" width="100" height="140" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-primary-400"/>
        <rect x="35" y="35" width="90" height="130" fill="none" stroke="currentColor" strokeWidth="1"/>
      </svg>
    )
  },
  {
    id: "letterhead-a4",
    name: "قالب استاندارد سربرگ",
    category: "اوراق اداری",
    dimensions: "۲۱۰ × ۲۹۷ میلی‌متر",
    bleed: "+۲mm اضافه رنگ (Bleed)",
    formats: ["PDF", "AI", "PSD"],
    description: "پیکربندی شده برای چاپ افست تیراژ بالا با رعایت مارجین‌های دستگاه چاپ.",
    svgPlaceholder: (
      <svg width="100%" height="100%" viewBox="0 0 160 220" className="text-secondary-400">
        <rect x="20" y="20" width="120" height="180" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-400"/>
        <rect x="30" y="30" width="30" height="15" fill="currentColor" opacity="0.2"/>
        <line x1="30" y1="55" x2="130" y2="55" stroke="currentColor" strokeWidth="1"/>
        <line x1="30" y1="65" x2="100" y2="65" stroke="currentColor" strokeWidth="1"/>
      </svg>
    )
  },
  {
    id: "envelope-dl",
    name: "گسترده دایکات پاکت ملخی",
    category: "اوراق اداری",
    dimensions: "۲۲۰ × ۱۱۰ میلی‌متر",
    bleed: "خطوط تیغ و تا مشخص شده",
    formats: ["PDF", "AI"],
    description: "نقشه مهندسی گسترده پاکت با خطوط تفکیک شده‌ی تا (Crease) و برش (Cut).",
    svgPlaceholder: (
      <svg width="100%" height="100%" viewBox="0 0 200 160" className="text-secondary-400">
        <path d="M 30,60 L 170,60 L 170,120 L 30,120 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-400"/>
        <path d="M 30,60 L 100,100 L 170,60" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
        <path d="M 30,60 L 50,30 L 150,30 L 170,60" fill="none" stroke="currentColor" strokeWidth="1"/>
      </svg>
    )
  },
  {
    id: "folder-a4",
    name: "نقشه تیغ فولدر شرکتی",
    category: "بسته‌بندی و فولدر",
    dimensions: "مناسب کاغذ A4 + عطف ۵mm",
    bleed: "فایل وکتور اختصاصی دایکات",
    formats: ["PDF", "AI"],
    description: "طرح تیغ‌زنی صنعتی شامل قفل پاکت، خط تا و محل قرارگیری کارت ویزیت.",
    svgPlaceholder: (
      <svg width="100%" height="100%" viewBox="0 0 240 180" className="text-secondary-400">
        <rect x="20" y="20" width="200" height="140" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-400"/>
        <line x1="120" y1="20" x2="120" y2="160" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
        <path d="M 120,100 L 220,100 L 220,160 L 120,160 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
      </svg>
    )
  },
];

const CATEGORIES = ["همه دسته‌ها", "کارت ویزیت", "تراکت و پوستر", "اوراق اداری", "بسته‌بندی و فولدر"];

export function TemplatesGalleryView() {
  const [selectedCategory, setSelectedCategory] = useState("همه دسته‌ها");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifyModal, setNotifyModal] = useState(false);
  const [templateRequest, setTemplateRequest] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const filteredTemplates = useMemo(() => {
    return DEFAULT_TEMPLATES.filter((t) => {
      const matchCat = selectedCategory === "همه دسته‌ها" || t.category === selectedCategory;
      const matchSearch = t.name.includes(searchQuery) || t.description.includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-10 pt-8 pb-20 font-sans relative">
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none -z-10" />

      <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold shadow-sm">
          <FileCode2 size={14} className="text-primary-600" />
          مخزن فایل‌های استاندارد لیتوگرافی
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-secondary-900 tracking-tight">
          قالب‌های <span className="text-primary-600">مهندسی طراحی</span>
        </h1>
        <p className="text-secondary-600 text-sm md:text-base leading-relaxed font-medium">
          برای جلوگیری از خطاهای متداول در سیستم Preflight، اکیداً توصیه می‌شود طراحی خود را بر پایه این فایل‌های استاندارد آغاز کنید.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-secondary-200 p-4 sm:p-6 rounded-2xl shadow-soft space-y-6 relative z-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md group">
            <input
              type="text"
              placeholder="جستجو در آرشیو قالب‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-4 pr-12 rounded-xl bg-secondary-50 border border-secondary-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-sm font-bold text-secondary-900 transition-all placeholder:text-secondary-400"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500" size={20} />
          </div>

          <button
            onClick={() => {
              setTemplateRequest("");
              setRequestSent(false);
              setNotifyModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-secondary-900 hover:bg-secondary-800 text-white rounded-xl text-sm font-bold transition-all w-full md:w-auto justify-center shadow-md shadow-secondary-900/20"
          >
            <Bell size={18} className="text-primary-400" />
            درخواست قالب جدید 
          </button>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                  isSelected 
                    ? "bg-primary-50 text-primary-700 border-primary-500 shadow-sm" 
                    : "bg-white text-secondary-600 border-secondary-200 hover:border-secondary-400 hover:bg-secondary-50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Templates */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id} 
              className="bg-white rounded-2xl border border-secondary-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Visual Card Header */}
              <div className={`p-6 border-b border-secondary-200 bg-secondary-50 relative overflow-hidden h-48 flex items-center justify-center`}>
                <div className="absolute inset-0 bg-grid-dots opacity-40"></div>
                
                {/* SVG Wireframe Placeholder */}
                <div className="relative z-10 w-full h-full flex items-center justify-center text-current drop-shadow-sm group-hover:scale-105 transition-transform duration-500">
                  {template.svgPlaceholder}
                </div>

                <div className="absolute top-4 left-4 z-20">
                  <span className="px-2 py-1 bg-white border border-secondary-200 text-secondary-600 rounded text-[10px] uppercase font-bold shadow-sm">
                    {template.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-lg font-black text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors">{template.name}</h3>
                  <div className="flex flex-col gap-2 mb-3">
                    <span className="text-xs text-secondary-600 font-bold flex items-center gap-2 bg-secondary-50 px-2 py-1.5 rounded-md border border-secondary-100">
                      <Settings size={14} className="text-primary-500" />
                      سایز: {template.dimensions}
                    </span>
                    <span className="text-xs text-secondary-600 font-bold flex items-center gap-2 bg-secondary-50 px-2 py-1.5 rounded-md border border-secondary-100">
                      <Layers size={14} className="text-primary-500" />
                      {template.bleed}
                    </span>
                  </div>
                  <p className="text-xs text-secondary-500 leading-relaxed font-medium">
                    {template.description}
                  </p>
                </div>

                {/* Download Buttons */}
                <div className="space-y-3 pt-4 border-t border-secondary-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 block mb-1">
                    فرمت‌های آماده: {template.formats.join("، ")}
                  </span>
                  <button
                    onClick={() => {
                      setTemplateRequest(`دریافت قالب «${template.name}» (${template.formats.join(", ")})`);
                      setRequestSent(false);
                      setNotifyModal(true);
                    }}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-primary-600/20"
                  >
                    <Download size={15} />
                    دریافت فایل قالب
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-secondary-200 p-16 text-center shadow-sm space-y-5">
          <div className="w-16 h-16 bg-secondary-50 border border-secondary-100 rounded-2xl flex items-center justify-center mx-auto text-secondary-400">
            <FileCode2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-secondary-900">قالبی در این سیستم یافت نشد</h3>
          <p className="text-secondary-500 text-sm font-medium">
            می‌توانید درخواست ایجاد قالب سفارشی خود را ثبت کنید.
          </p>
        </div>
      )}

      {/* Notify Modal */}
      {notifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6 text-right border border-secondary-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-primary-600" />
            {requestSent ? (
              <>
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-xl font-black text-secondary-900 text-center">درخواست شما ثبت شد</h3>
                <p className="text-sm text-secondary-600 text-center font-medium">
                  تیم طراحی نقشه فایل موردنظر را آماده کرده و از طریق تماس با شما هماهنگ خواهد کرد.
                </p>
                <button
                  onClick={() => setNotifyModal(false)}
                  className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-all"
                >
                  بستن پنجره
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black text-secondary-900 mb-2">درخواست قالب</h3>
                <p className="text-sm text-secondary-600 font-medium">
                  مشخصات ساختاری فایل مورد نظر را بنویسید تا تیم طراحی نقشه آن را ایجاد کند.
                </p>
                <textarea
                  value={templateRequest}
                  onChange={(e) => setTemplateRequest(e.target.value)}
                  rows={4}
                  placeholder="مثلاً: قالب استاندارد کارت دعوت A6 با سلفون مات..."
                  className="w-full p-4 rounded-xl bg-secondary-50 border border-secondary-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-sm font-bold text-secondary-900 resize-none"
                />
                <button
                  onClick={() => setRequestSent(true)}
                  className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary-600/20"
                >
                  ثبت درخواست
                </button>
                <button
                  onClick={() => setNotifyModal(false)}
                  className="w-full h-12 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-bold text-sm rounded-xl transition-all"
                >
                  انصراف
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
