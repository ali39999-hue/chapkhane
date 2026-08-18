import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Ruler, 
  Type, 
  CheckCircle2, 
  XCircle, 
  Layers,
  Crop,
  Cpu,
  Monitor,
  Printer
} from "lucide-react";

const formats = [
  { format: "PDF (PDF/X-1a)", status: "پیشنهاد اصلی", quality: "۱۰۰٪ بی‌نقص", note: "فونت‌ها تعبیه (Embed) شده و رنگ CMYK" },
  { format: "TIFF / TIF", status: "بسیار عالی", quality: "کیفیت بالا", note: "بدون فشرده‌سازی و ۳۰۰dpi" },
  { format: "AI (Illustrator)", status: "قابل قبول", quality: "عالی", note: "تمام فونت‌ها Create Outlines شده باشند" },
  { format: "PSD (Photoshop)", status: "قابل قبول", quality: "خوب", note: "لایه‌ها Flatten شده و CMYK" },
  { format: "JPG / JPEG", status: "مشروط", quality: "متوسط", note: "حداقل کیفیت ۱۲ و بدون بلور" },
  { format: "PNG / WebP", status: "غیرمجاز", quality: "نامناسب", note: "فاقد پروفایل رنگی CMYK و بلید" },
];

export default function GuidePage() {
  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground flex flex-col justify-between pt-28 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none z-0"></div>

      <Navbar />

      <div className="container mx-auto px-4 max-w-6xl pb-20 flex-1 relative z-10">
        {/* Header Hero */}
        <section className="text-center max-w-3xl mx-auto mb-16 pt-8 space-y-5">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow-sm">
            <Cpu size={16} className="text-primary-500" />
            استانداردهای فنی ماشین‌آلات هایدلبرگ
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-secondary-900 tracking-tight leading-tight">
            مستندات معماری <br className="hidden sm:block" />
            <span className="text-primary-600">فایل برای تولید صنعتی</span>
          </h1>
          <p className="text-secondary-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            برای عبور موفقیت‌آمیز از موتور Preflight و جلوگیری از افت کیفیت در چاپ افست، رعایت دقیق پارامترهای فنی زیر الزامی است.
          </p>
        </section>

        {/* 1. Bleed & Safe Margin Interactive Visual Diagram */}
        <section className="mb-16 bg-white rounded-3xl border border-secondary-200 p-8 sm:p-12 shadow-soft">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Visual Box Diagram */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-secondary-50 rounded-2xl relative overflow-hidden border border-secondary-200 min-h-[360px]">
              <div className="absolute inset-0 bg-grid-dots opacity-40"></div>
              
              <div className="page-enter relative w-64 h-40 sm:w-80 sm:h-56 bg-white border-[3px] border-dashed border-red-400 rounded-lg flex items-center justify-center p-4 z-10 shadow-sm">
                <div style={{ animationDelay: "0.4s" }} className="page-enter absolute -top-4 right-6 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-md shadow-sm">
                  اضافه رنگ (Bleed +3mm)
                </div>

                {/* Trim Line */}
                <div style={{ animationDelay: "0.2s" }} className="page-enter w-full h-full bg-blue-50/50 border-2 border-blue-500 rounded flex items-center justify-center p-5 relative">
                  <div style={{ animationDelay: "0.6s" }} className="page-enter absolute -top-4 left-6 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-md shadow-sm">
                    خط برش (Trim Line)
                  </div>

                  {/* Safe Zone */}
                  <div className="w-full h-full bg-emerald-50 border-2 border-emerald-400 rounded flex flex-col items-center justify-center p-2 text-center relative overflow-hidden shadow-sm">
                    <div style={{ animationDelay: "0.8s" }} className="page-enter absolute -bottom-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-md shadow-sm">
                      حاشیه امن (Safe Zone 5mm)
                    </div>
                    
                    <div style={{ animationDelay: "1s" }} className="page-enter text-center">
                      <Layers size={28} className="mx-auto mb-2 text-emerald-500" />
                      <p className="text-xs font-black text-emerald-700">نواحی مجاز محتوا</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="w-full lg:w-1/2 space-y-5 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-md text-xs font-bold border border-secondary-200">
                <Crop size={16} />
                قاعده اول: خطوط راهنمای برش
              </div>
              <h2 className="text-2xl font-black text-secondary-900">حاشیه برش (Bleed) چیست؟</h2>
              <p className="text-secondary-600 text-sm leading-relaxed font-medium">
                به دلیل تلورانس ۱ الی ۲ میلی‌متری تیغ‌های گیوتین صنعتی، طراحی باید از ابعاد نهایی بزرگتر باشد.
              </p>
              <ul className="space-y-3 text-sm text-secondary-700 font-medium pt-2">
                <li className="page-enter flex items-start gap-3 bg-secondary-50 p-4 rounded-xl border border-secondary-200">
                  <CheckCircle2 size={20} className="text-primary-500 shrink-0" />
                  <span><strong>اضافه رنگ (Bleed):</strong> رنگ پس‌زمینه خود را از هر طرف ۳ میلی‌متر بیشتر از خط برش (Trim Line) گسترش دهید.</span>
                </li>
                <li style={{ animationDelay: "0.1s" }} className="page-enter flex items-start gap-3 bg-secondary-50 p-4 rounded-xl border border-secondary-200">
                  <CheckCircle2 size={20} className="text-primary-500 shrink-0" />
                  <span><strong>حاشیه امن (Safe Zone):</strong> متون و لوگو را حداقل ۵ میلی‌متر از لبه‌های برش فاصله دهید تا وارد ناحیه خطر نشوند.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. CMYK vs RGB Visual Comparison */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* RGB Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-secondary-200 shadow-soft space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1.5 bg-secondary-100 text-secondary-600 border border-secondary-200 rounded-md text-xs font-black flex items-center gap-1.5">
                <XCircle size={16} className="text-red-500" />
                RGB (نمایشگر دیجیتال)
              </span>
              <Monitor size={24} className="text-secondary-400" />
            </div>
            
            <div className="relative h-32 rounded-xl bg-secondary-900 overflow-hidden flex items-center justify-center shadow-inner">
              <div className="relative z-10 flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#ff0000] mix-blend-screen opacity-90 shadow-[0_0_15px_#ff0000]" />
                <div className="w-12 h-12 rounded-full bg-[#00ff00] mix-blend-screen opacity-90 -ml-6 shadow-[0_0_15px_#00ff00]" />
                <div className="w-12 h-12 rounded-full bg-[#0000ff] mix-blend-screen opacity-90 -ml-6 shadow-[0_0_15px_#0000ff]" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-secondary-900 mb-2">منبع نوری؛ نامناسب برای چاپ</h3>
              <p className="text-secondary-600 text-sm leading-relaxed font-medium">
                سیستم RGB بر پایه نور کار می‌کند و درخشندگی مصنوعی دارد. دستگاه چاپ با مرکب واقعی کار می‌کند، بنابراین رنگ‌های RGB در چاپ بسیار کدر می‌شوند.
              </p>
            </div>
          </div>

          {/* CMYK Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-primary-500 shadow-lg space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-yellow-400"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <span className="px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-md text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-primary-500" />
                CMYK (استاندارد لیتوگرافی)
              </span>
              <Printer size={24} className="text-primary-500" />
            </div>
            
            <div className="relative h-32 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-secondary-200 shadow-inner z-10">
              <div className="flex gap-2 relative">
                <div className="w-12 h-12 rounded-full bg-[#00AEEF] mix-blend-multiply opacity-80" />
                <div className="w-12 h-12 rounded-full bg-[#EC008C] mix-blend-multiply opacity-80 -ml-6" />
                <div className="w-12 h-12 rounded-full bg-[#FFF200] mix-blend-multiply opacity-80 -ml-6" />
                <div className="w-12 h-12 rounded-full bg-[#000000] mix-blend-multiply opacity-80 -ml-6" />
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-secondary-900 mb-2">تطابق رنگ فایل با خروجی</h3>
              <p className="text-secondary-600 text-sm leading-relaxed font-medium">
                فایل طراحی باید دقیقاً در حالت <strong>Color Mode: CMYK</strong> ساخته شود تا درصد خطای ترکیب مرکب‌ها روی کاغذ به حداقل برسد.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Resolution (300 DPI vs 72 DPI) & Fonts */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-secondary-200 shadow-soft space-y-5 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-xl bg-secondary-50 border border-secondary-200 text-secondary-700 flex items-center justify-center">
              <Ruler size={24} />
            </div>
            <h3 className="text-xl font-bold text-secondary-900">رزولوشن استاندارد ۳۰۰dpi</h3>
            <p className="text-secondary-600 text-sm leading-relaxed font-medium">
              تصاویر وب رزولوشن ۷۲dpi دارند. برای جلوگیری از پیکسلی شدن، تار شدن متون ریز و افت کیفیت، فایل باید در رزولوشن ۳۰۰ Pixels/Inch خروجی گرفته شود.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-secondary-200 shadow-soft space-y-5 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-xl bg-secondary-50 border border-secondary-200 text-secondary-700 flex items-center justify-center">
              <Type size={24} />
            </div>
            <h3 className="text-xl font-bold text-secondary-900">خروجی متون (Create Outlines)</h3>
            <p className="text-secondary-600 text-sm leading-relaxed font-medium">
              پیش از خروجی، تمام نوشته‌ها باید به Object تبدیل شوند. در ایلوستریتور از کلیدهای ترکیبی <kbd className="px-2 py-1 bg-secondary-100 text-secondary-800 rounded-md font-mono text-xs mx-1 border border-secondary-200">Ctrl + Shift + O</kbd> استفاده کنید تا فونت‌ها جابجا نشوند.
            </p>
          </div>
        </section>

        {/* 4. Format Table */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-secondary-900">فرمت‌های سازگار با سیستم</h2>
            <p className="text-secondary-600 text-sm mt-2 font-medium">لیست فرمت‌های قابل پردازش توسط سرور Preflight</p>
          </div>

          <div className="bg-white rounded-3xl border border-secondary-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-secondary-50 border-b border-secondary-200 text-secondary-800">
                    <th className="px-6 py-5 font-bold">فرمت ارسالی</th>
                    <th className="px-6 py-5 font-bold">وضعیت در لیتوگرافی</th>
                    <th className="px-6 py-5 font-bold">کیفیت خروجی</th>
                    <th className="px-6 py-5 font-bold">نکات فنی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {formats.map((f, i) => (
                    <tr key={i} className="hover:bg-secondary-50/50 transition-colors">
                      <td className="px-6 py-5 font-black text-secondary-900">{f.format}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-md text-xs font-bold border ${
                          f.status.includes("اصلی") || f.status.includes("عالی") 
                            ? "bg-primary-50 text-primary-700 border-primary-200" 
                            : f.status.includes("قابل") 
                            ? "bg-secondary-100 text-secondary-700 border-secondary-200" 
                            : f.status.includes("مشروط") 
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-secondary-700 font-bold">{f.quality}</td>
                      <td className="px-6 py-5 text-secondary-600">{f.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
