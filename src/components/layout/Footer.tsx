import Link from "next/link";
import { Phone, Mail, MapPin, Sparkles, ShieldCheck, Truck, Clock, Cpu, Award } from "lucide-react";

const footerLinks = {
  "خدمات چاپ صنعتی": [
    { label: "چاپ افست فرم‌های عمومی و اختصاصی", href: "/products" },
    { label: "کاتالوگ، بروشور و ژورنال", href: "/products" },
    { label: "جعبه و بسته‌بندی مقوایی", href: "/products" },
    { label: "اوراق اداری و سربرگ سازمانی", href: "/products" },
  ],
  "ابزارهای مهندسی": [
    { label: "راهنمای تخصصی Preflight", href: "/guide" },
    { label: "دانلود وایرفریم‌ها و قالب‌های دقیق", href: "/templates" },
    { label: "رهگیری لحظه‌ای خط تولید", href: "/track" },
    { label: "ورود به داشبورد مشتریان", href: "/login" },
  ],
  "نگار؛ چاپخانه هوشمند": [
    { label: "درباره تجهیزات لیتوگرافی و چاپ", href: "/about" },
    { label: "تماس با کنترل کیفیت", href: "/contact" },
    { label: "ورود به پنل مدیریت (Admin)", href: "/admin" },
    { label: "استانداردها و سوالات متداول", href: "/faq" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-secondary-950 text-secondary-300 pt-20 pb-12 px-4 relative overflow-hidden font-sans border-t-4 border-primary-600" dir="rtl">
      {/* Subtle Tech Grids */}
      <div className="absolute inset-0 bg-grid-slate opacity-10 pointer-events-none"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Top Badges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-16 mb-16 border-b border-secondary-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary-900 border border-secondary-800 flex items-center justify-center text-accent-400 shrink-0 shadow-inner">
              <Award size={24} />
            </div>
            <div>
              <strong className="text-white block text-sm mb-1">دقت رنگ کالیبره شده</strong>
              <span className="text-secondary-400 text-xs">مطابق استاندارد ISO 12647</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary-900 border border-secondary-800 flex items-center justify-center text-primary-400 shrink-0 shadow-inner">
              <Cpu size={24} />
            </div>
            <div>
              <strong className="text-white block text-sm mb-1">پردازش ابری سفارشات</strong>
              <span className="text-secondary-400 text-xs">هوشمندسازی Industry 4.0</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary-900 border border-secondary-800 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
              <Clock size={24} />
            </div>
            <div>
              <strong className="text-white block text-sm mb-1">تحویل برنامه‌ریزی شده</strong>
              <span className="text-secondary-400 text-xs">ماشین‌آلات Heidelberg آلمان</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary-900 border border-secondary-800 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Truck size={24} />
            </div>
            <div>
              <strong className="text-white block text-sm mb-1">لجستیک و ارسال یکپارچه</strong>
              <span className="text-secondary-400 text-xs">بسته‌بندی پالت و کارتن ۵ لایه</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand & About (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-white font-black text-xl">چ</span>
              </div>
              <div>
                <span className="text-2xl font-black text-white block tracking-tight">چاپخانه نگار</span>
                <span className="text-sm text-primary-400 font-bold">زیرساخت ابری تولیدات چاپی</span>
              </div>
            </Link>
            <p className="text-sm text-secondary-400 leading-relaxed max-w-sm font-medium">
              سامانه جامع سفارش آنلاین چاپ فرم‌های عمومی و اختصاصی. با استفاده از موتور پردازش فایل ما (Preflight)، سفارشات خود را بدون ریسک خرابی و با بالاترین کیفیت صنعتی تولید کنید.
            </p>
            <div className="pt-4 text-sm text-secondary-300 space-y-3 font-medium">
              <p className="flex items-center gap-3">
                <Phone size={18} className="text-primary-500" />
                <span dir="ltr">021 - 66 77 88 99</span>
              </p>
              <p className="flex items-center gap-3">
                <MapPin size={18} className="text-primary-500" />
                <span>تهران، منطقه صنعتی، فاز ۱، خیابان چاپگران، بلوک ۴</span>
              </p>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-5">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest border-r-2 border-primary-500 pr-3">{title}</h4>
              <ul className="space-y-3 text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-secondary-400 hover:text-white transition-colors inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-secondary-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-secondary-500 font-medium">
          <p>© ۱۴۰۵ نگار سیستم. زیرساخت ابری چاپ صنعتی.</p>
          <div className="flex items-center gap-6">
            <Link href="/guide" className="hover:text-white transition-colors">مستندات فایل</Link>
            <Link href="/track" className="hover:text-white transition-colors">مانیتورینگ سفارش</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
