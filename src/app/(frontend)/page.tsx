import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Printer, 
  Settings2, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  ChevronLeft,
  GaugeCircle,
  Database,
  MonitorPlay
} from "lucide-react";
import Link from "next/link";
import { CMYKSimulator } from "@/design-system/components/CMYKSimulator";
import { TactileSwatchBook } from "@/design-system/components/TactileSwatchBook";
import { Card } from "@/design-system/components/Card";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/design-system/components/PriceTag";
import { CropMarks } from "@/design-system/components/CropMarks";
import { Badge } from "@/design-system/components/Badge";

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground flex flex-col justify-between pt-20 font-sans relative overflow-hidden">
      
      {/* Light Tech Grid Background */}
      <div className="absolute inset-0 bg-grid-slate opacity-40 pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <Navbar />

      <div className="flex-1 relative z-10">
        
        {/* HERO SECTION */}
        <section className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16">
            
            {/* Text Content */}
            <div className="w-full lg:w-1/2 space-y-8 text-right z-10">
              <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 font-bold text-xs px-4 py-2 rounded-lg shadow-sm">
                <Cpu size={16} className="text-primary-500" />
                Industry 4.0 Print Infrastructure
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-secondary-900 tracking-tight leading-[1.15]">
                زیرساخت ابری <br />
                <span className="text-primary-600">تولیدات چاپی صنعتی</span>
              </h1>
              
              <p className="text-secondary-600 text-base sm:text-lg leading-relaxed font-medium max-w-lg">
                سامانه جامع بررسی هوشمند فایل (Preflight)، محاسبه بلادرنگ فاکتور و اتصال مستقیم سفارشات به خط تولید ماشین‌آلات پیشرفته Heidelberg.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/products" 
                  className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-md shadow-primary-500/20 transition-all hover:-translate-y-1"
                >
                  <Settings2 size={18} />
                  محاسبه آنلاین قیمت
                </Link>
                <Link 
                  href="/guide" 
                  className="flex items-center justify-center gap-2 bg-white hover:bg-secondary-50 text-secondary-700 font-bold text-sm px-8 py-4 rounded-xl shadow-sm border border-secondary-200 transition-all"
                >
                  <GaugeCircle size={18} className="text-secondary-400" />
                  مستندات استانداردسازی
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 flex items-center gap-6 text-sm font-bold text-secondary-500">
                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary-500" />ISO 12647-2</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary-500" />Preflight Engine</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary-500" />Automated PDF/X</span>
              </div>
            </div>

            {/* Hero Visual: CMYK Simulator integrated into original Tech UI Dashboard */}
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute inset-0 bg-primary-400/10 blur-[80px] rounded-full -z-10"></div>
              <div className="relative bg-white border border-secondary-200 rounded-2xl shadow-float p-2 overflow-hidden flex flex-col items-center justify-center gap-6">
                 
                 <div className="w-full bg-secondary-50 rounded-xl border border-secondary-200 overflow-hidden flex flex-col">
                  {/* Fake UI Header */}
                  <div className="h-10 bg-white border-b border-secondary-200 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary-300"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary-300"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary-300"></div>
                    <div className="ml-auto w-32 h-4 bg-secondary-100 rounded"></div>
                  </div>
                  {/* CMYK Simulator Body */}
                  <div className="flex-1 p-6 relative flex items-center justify-center min-h-[300px]">
                    <div className="absolute inset-0 bg-grid-dots opacity-30"></div>
                    <div className="relative z-10 w-full flex justify-center scale-75 sm:scale-100 origin-center">
                      <CMYKSimulator />
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white border border-secondary-200 shadow-lg rounded-xl p-4 flex items-center gap-4 z-20">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                  <Database size={24} />
                </div>
                <div>
                  <span className="block text-xs text-secondary-500 font-bold mb-1">وضعیت سرور لیتوگرافی</span>
                  <span className="block text-sm font-black text-secondary-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    فعال و آماده دریافت
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 px-4 bg-secondary-50/50 border-y border-secondary-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate opacity-20 pointer-events-none"></div>
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-black text-secondary-900 mb-4">هسته‌ی پردازشی چاپخانه نگار</h2>
              <p className="text-secondary-600 text-sm font-medium">پلتفرم ما فرآیندهای سنتی و زمان‌بر لیتوگرافی را با استفاده از الگوریتم‌های هوشمند اتوماسیون کرده است.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: MonitorPlay, 
                  title: "Preflight خودکار فایل", 
                  desc: "بررسی سیستمی رزولوشن، خطوط برش، حاشیه امن و فضای رنگی CMYK در زمان آپلود.", 
                  color: "text-blue-600",
                  bg: "bg-blue-50"
                },
                { 
                  icon: Zap, 
                  title: "موتور قیمت‌گذاری زنده", 
                  desc: "محاسبه دقیق قیمت بر اساس متریال، ابعاد، پوشش و زمان تولید بدون نیاز به استعلام تلفنی.", 
                  color: "text-amber-500",
                  bg: "bg-amber-50"
                },
                { 
                  icon: Printer, 
                  title: "تولید فرم‌های صنعتی", 
                  desc: "اتصال خروجی تایید شده به سیستم مدیریت رنگ (CMS) برای چاپ روی ماشین‌های چهاررنگ.", 
                  color: "text-cyan-600",
                  bg: "bg-cyan-50"
                }
              ].map((feat, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border border-secondary-200 shadow-soft hover:-translate-y-1 transition-transform group">
                  <div className={`w-14 h-14 rounded-xl ${feat.bg} ${feat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feat.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-3">{feat.title}</h3>
                  <p className="text-secondary-600 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 
          ========================================================
          NEW SECTION: TACTILE SWATCH BOOK 
          ======================================================== 
        */}
        <section className="py-24 px-4 overflow-hidden relative border-b border-secondary-200">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 text-right md:text-right">
              <Button variant="outline" className="order-2 md:order-1">درخواست ارسال کالیته فیزیکی</Button>
              <div className="order-1 md:order-2">
                <h2 className="text-3xl md:text-4xl font-black text-ink-black mb-4">کالیته متریال و پوشش‌ها</h2>
                <p className="text-gray-500 text-lg max-w-xl ml-auto">
                  با حرکت دادن ماوس روی کارت‌های زیر، بازتاب نور روی متریال‌های مختلف چاپخانه را به صورت مجازی تجربه کنید.
                </p>
              </div>
            </div>

            <TactileSwatchBook />
          </div>
        </section>

        {/* 
          ========================================================
          NEW SECTION: PORTFOLIO / CONFIGURATOR LINKS
          ======================================================== 
        */}
        <section className="py-24 px-4 bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-ink-black mb-4">خدمات چاپ و بسته‌بندی</h2>
              <p className="text-gray-500 text-lg">دسته‌بندی‌های اصلی چاپ با قابلیت محاسبه زنده قیمت</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link href="/products/bc-glossy-lam" className="block h-full group">
                <CropMarks>
                  <Card withHoverEffect className="h-full flex flex-col justify-between group-hover:border-primary-500 transition-colors">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-600 transition-colors">کارت ویزیت</h3>
                      <p className="text-gray-500 mb-6">انواع کارت ویزیت سلفون مات، براق، لمینت برجسته و طلاکوب با برش خاص.</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">شروع قیمت از</span>
                        <PriceTag amount={450000} size="sm" />
                      </div>
                      <Button size="sm" variant="ghost" className="pointer-events-none flex items-center gap-1">
                        مشاهده و پیکربندی <ChevronLeft size={14} />
                      </Button>
                    </div>
                  </Card>
                </CropMarks>
              </Link>

              <Link href="/products/envelope-dl" className="block h-full group">
                <CropMarks>
                  <Card withHoverEffect className="h-full flex flex-col justify-between bg-ink-black text-paper-white group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-shadow">
                    <div>
                      <Badge variant="urgent" className="mb-4 bg-gold-foil/20 text-gold-foil border-gold-foil/30">پرطرفدار</Badge>
                      <h3 className="text-2xl font-bold mb-2 text-gold-foil">پاکت ملخی اداری</h3>
                      <p className="text-gray-400 mb-6">پاکت نامه‌نگاری استاندارد شرکت‌ها با چاپ افست باکیفیت و خط تای دقیق.</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <Button size="sm" variant="luxury" className="w-full pointer-events-none">محاسبه و سفارش</Button>
                    </div>
                  </Card>
                </CropMarks>
              </Link>

              <Link href="/products/flyer-a4-glossy" className="block h-full group">
                <CropMarks>
                  <Card withHoverEffect className="h-full flex flex-col justify-between group-hover:border-primary-500 transition-colors">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-600 transition-colors">تراکت و بروشور</h3>
                      <p className="text-gray-500 mb-6">چاپ افست تیراژ بالا، کاغذ گلاسه و تحریر با خط تا و صحافی دقیق.</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">شروع قیمت از</span>
                        <PriceTag amount={1800000} size="sm" />
                      </div>
                      <Button size="sm" variant="ghost" className="pointer-events-none flex items-center gap-1">
                        مشاهده و پیکربندی <ChevronLeft size={14} />
                      </Button>
                    </div>
                  </Card>
                </CropMarks>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA BATCH */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-secondary-900 rounded-[2rem] p-12 sm:p-16 text-center shadow-float relative overflow-hidden flex flex-col items-center">
              {/* Tech Glows */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 via-accent-400 to-primary-600"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/20 blur-[100px] rounded-full"></div>
              
              <div className="relative z-10 w-full max-w-2xl">
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 tracking-tight">آماده ارسال فایل به خط تولید؟</h2>
                <p className="text-secondary-300 text-sm sm:text-base leading-relaxed mb-10 font-medium">
                  پلتفرم ابری نگار با محاسبه دقیق تمام متغیرهای چاپ افست، فرآیند سفارش را برای کانون‌های تبلیغاتی و طراحان مستقل تسریع کرده است.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                    href="/products" 
                    className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 flex items-center justify-center gap-2"
                  >
                    <Settings2 size={18} />
                    ورود به استودیوی محصولات
                  </Link>
                  <Link 
                    href="/templates" 
                    className="w-full sm:w-auto px-8 py-4 bg-secondary-800 hover:bg-secondary-700 text-white font-bold text-sm rounded-xl border border-secondary-700 transition-all flex items-center justify-center gap-2"
                  >
                    دانلود قالب‌های آماده
                    <ChevronLeft size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
      
      <Footer />
    </main>
  );
}
