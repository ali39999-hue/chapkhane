import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";
import { Users, Award, Clock, Printer, Factory, Sparkles, CheckCircle2, Cog, Server, Database, Activity, Layers } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "زیرساخت ابری چاپخانه | نگار سیستم",
  description: "معماری صنعتی و زیرساخت ابری چاپخانه نگار. تلفیق ماشین‌آلات هایدلبرگ و پردازش هوشمند ابری.",
};

const stats = [
  { icon: Printer, value: "۱۲,۰۰۰+", label: "فرم چاپی موفق", color: "text-blue-600 bg-blue-50 border-blue-100" },
  { icon: Database, value: "۳,۵۰۰+", label: "مشتری B2B فعال", color: "text-primary-600 bg-primary-50 border-primary-100" },
  { icon: Award, value: "۹۸٪", label: "دقت در کنترل کیفیت", color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
  { icon: Activity, value: "۹۹.۹٪", label: "پایداری سرورها (Uptime)", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
];

const timeline = [
  { year: "۱۳۹۰", title: "تأسیس هسته اولیه", desc: "راه‌اندازی کارگاه لیتوگرافی و چاپ افست با ماشین‌آلات آنالوگ و تمرکز بر تیراژ صنعتی." },
  { year: "۱۳۹۴", title: "ورود به دیجیتال مارکتینگ", desc: "خرید ماشین‌آلات چاپ دیجیتال سرعت بالا و استقرار اولین سیستم ERP داخلی." },
  { year: "۱۳۹۸", title: "تجهیز به Heidelberg Speedmaster", desc: "نوسازی کامل خط تولید با ماشین‌آلات ۴ و ۵ رنگ آلمانی با سیستم مدیریت رنگ اتوماتیک." },
  { year: "۱۴۰۲", title: "هوشمندسازی (Industry 4.0)", desc: "مهاجرت به معماری ابری (Cloud-Native)، پیاده‌سازی موتور Preflight و محاسبه قیمت بلادرنگ." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between pt-28 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none -z-10" />

      <Navbar />

      <div className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="pt-16 pb-20 px-4 relative overflow-hidden">
          <div className="container mx-auto max-w-5xl text-center z-10 relative">
            <span className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow-sm mb-8">
              <Server size={16} className="text-primary-500" />
              تلفیق صنعت سنگین و نرم‌افزار
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-secondary-900 mb-8 tracking-tight leading-tight">
              معماری ابری؛ <br />
              <span className="text-primary-600">هوشمندسازی ماشین‌آلات چاپ</span>
            </h1>
            <p className="text-lg text-secondary-600 leading-relaxed max-w-2xl mx-auto font-medium">
              نگار یک پلتفرم واسط نیست. ما مالک و مجری یک مجتمع چاپ صنعتی هستیم که توانسته‌ایم خط تولید فیزیکی (ماشین‌آلات هایدلبرگ) را با زیرساخت ابری و موتورهای هوش مصنوعی یکپارچه کنیم.
            </p>
          </div>
          
          {/* Hero Industrial Placeholder */}
          <div className="container mx-auto max-w-6xl mt-16">
            <div className="relative w-full h-64 sm:h-80 md:h-96 bg-secondary-900 rounded-[2rem] sm:rounded-[3rem] border border-secondary-800 shadow-float overflow-hidden group flex items-center justify-center">
              <div className="absolute inset-0 bg-grid-dots opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 via-transparent to-transparent z-10" />
              
              <div className="relative z-20 flex flex-col items-center justify-center text-secondary-500 group-hover:scale-105 transition-transform duration-700">
                <Factory size={64} className="mb-4 text-secondary-600" />
                <span className="text-sm font-black uppercase tracking-widest text-secondary-400">Heidelberg Speedmaster CD 102</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-12 px-4 relative z-20 -mt-20">
          <div className="container mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-secondary-200 shadow-sm text-center hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border ${stat.color}`}>
                  <stat.icon size={28} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-secondary-900 mb-2 font-mono tracking-tight">{stat.value}</div>
                <div className="text-xs sm:text-sm text-secondary-600 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Team / Tech Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="w-full lg:w-1/2 space-y-8 text-right">
                <h2 className="text-3xl sm:text-4xl font-black text-secondary-900 leading-tight">
                  زیرساخت فنی، <br />
                  <span className="text-primary-600">پشتیبان خط تولید</span>
                </h2>
                <p className="text-secondary-600 text-sm sm:text-base leading-relaxed font-medium">
                  تیم ما از دو بازوی قدرتمند تشکیل شده است: مهندسین نرم‌افزار که وظیفه پایداری سرورها و موتور محاسبه قیمت را بر عهده دارند، و تکنسین‌های چاپ که کیفیت خروجی فیزیکی را روی ماشین‌آلات تضمین می‌کنند.
                </p>
                <ul className="space-y-4 pt-4">
                  {[
                    "موتور هوشمند بررسی فایل (Preflight Engine)",
                    "کالیبراسیون سخت‌افزاری رنگ (Color Management)",
                    "معماری میکروسرویس ابری برای پایداری ۱۰۰٪",
                    "اتوماسیون فرم‌بندی (Imposition)"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-secondary-800 text-sm font-bold bg-secondary-50 p-3 rounded-xl border border-secondary-100">
                      <Cog size={20} className="text-primary-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4 pt-10">
                    <div className="h-48 sm:h-64 bg-primary-50 rounded-[2rem] border border-primary-100 flex items-center justify-center relative overflow-hidden shadow-sm">
                       <Server size={48} className="text-primary-300" />
                       <span className="absolute bottom-4 left-4 text-[10px] font-mono text-primary-600 font-bold uppercase">Cloud Infrastructure</span>
                    </div>
                    <div className="h-40 sm:h-56 bg-secondary-50 rounded-[2rem] border border-secondary-200 flex items-center justify-center relative overflow-hidden shadow-sm">
                       <Users size={40} className="text-secondary-300" />
                       <span className="absolute bottom-4 left-4 text-[10px] font-mono text-secondary-500 font-bold uppercase">Engineering Team</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-56 sm:h-72 bg-white rounded-[2rem] border border-secondary-200 flex items-center justify-center relative overflow-hidden shadow-sm">
                       <Printer size={56} className="text-secondary-200" />
                       <span className="absolute bottom-4 left-4 text-[10px] font-mono text-secondary-400 font-bold uppercase">Press Room</span>
                    </div>
                    <div className="h-48 sm:h-64 bg-secondary-100 rounded-[2rem] border border-secondary-200 flex items-center justify-center relative overflow-hidden shadow-sm">
                       <Layers size={40} className="text-secondary-400" />
                       <span className="absolute bottom-4 left-4 text-[10px] font-mono text-secondary-500 font-bold uppercase">Post-Press Dept</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-24 px-4 bg-secondary-50/50 border-y border-secondary-100">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-black text-secondary-900 text-center mb-16">تکامل صنعتی نگار</h2>
            <div className="space-y-8 relative before:absolute before:right-[23px] sm:before:right-[39px] before:top-0 before:bottom-0 before:w-[2px] before:bg-secondary-200">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-6 sm:gap-8 relative group">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-secondary-200 text-secondary-400 group-hover:text-primary-600 group-hover:border-primary-500 flex items-center justify-center shrink-0 text-xs sm:text-sm font-black z-10 shadow-sm transition-all">
                    {item.year}
                  </div>
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200 shadow-soft flex-1 group-hover:border-primary-300 transition-colors">
                    <h3 className="text-xl font-black text-secondary-900 mb-3">{item.title}</h3>
                    <p className="text-secondary-600 text-sm leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="bg-secondary-900 rounded-[3rem] p-12 sm:p-16 text-white shadow-float relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-600/20 rounded-full blur-[100px] -z-10" />
              
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-black mb-6 tracking-tight">آماده پیوستن به اکوسیستم صنعتی هستید؟</h2>
                <p className="text-secondary-400 mb-10 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
                  از محاسبه دقیق و آنلاین قیمت تا تولید و ارسال اتوماتیک سفارش. تکنولوژی روز دنیا را با ما تجربه کنید.
                </p>
                <Link 
                  href="/products" 
                  className="inline-flex items-center justify-center bg-primary-600 text-white font-black text-sm sm:text-base px-10 py-4 rounded-xl hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20 hover:scale-105"
                >
                  ورود به پلتفرم استعلام قیمت
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
