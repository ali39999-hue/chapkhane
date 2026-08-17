"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";
import { ChevronDown, HelpCircle, Cpu } from "lucide-react";

const faqData = [
  {
    category: "سفارش و خرید",
    items: [
      { q: "حداقل تیراژ سفارش چقدر است؟", a: "حداقل تیراژ بسته به نوع محصول متفاوت است. برای چاپ افست حداقل ۱۰۰۰ عدد و برای چاپ دیجیتال از ۱ عدد امکان‌پذیر است." },
      { q: "آیا امکان سفارش نمونه قبل از تیراژ اصلی وجود دارد؟", a: "بله، شما می‌توانید قبل از چاپ تیراژ اصلی، یک نمونه چاپ دیجیتال سفارش دهید تا از کیفیت رنگ و طرح مطمئن شوید." },
      { q: "چگونه قیمت سفارش محاسبه می‌شود؟", a: "قیمت بر اساس نوع محصول، تیراژ، جنس کاغذ، ابعاد و خدمات تکمیلی (مانند سلفون، طلاکوب و UV) به صورت آنلاین محاسبه می‌شود." },
    ]
  },
  {
    category: "فایل و طراحی",
    items: [
      { q: "فایل چاپی باید با چه فرمتی ارسال شود؟", a: "فرمت پیشنهادی PDF با رزولوشن ۳۰۰dpi و فضای رنگی CMYK است. فایل‌های PNG، JPG، WEBP و بسته‌های ZIP نیز پذیرفته می‌شوند." },
      { q: "بلید (Bleed) چیست و چرا مهم است؟", a: "بلید ناحیه اضافی ۳ میلی‌متری اطراف طرح است که هنگام برش نهایی، از ایجاد حاشیه سفید ناخواسته جلوگیری می‌کند." },
      { q: "آیا سیستم شما فایل را بررسی می‌کند؟", a: "بله، سیستم Preflight هوشمند ما فایل شما را از نظر ابعاد، فضای رنگی و کیفیت بررسی کرده و در صورت مشکل اطلاع می‌دهد." },
    ]
  },
  {
    category: "ارسال و تحویل",
    items: [
      { q: "زمان تولید و ارسال چقدر است؟", a: "زمان تولید معمولاً ۳ تا ۵ روز کاری است. با انتخاب گزینه فوری، ۱ تا ۲ روز کاری تحویل داده می‌شود." },
      { q: "هزینه ارسال چقدر است؟", a: "ارسال با تیپاکس انجام می‌شود و هزینه آن بر اساس وزن و مقصد محاسبه می‌شود. سفارش‌های بالای ۵ میلیون تومان ارسال رایگان دارند." },
    ]
  },
  {
    category: "پرداخت",
    items: [
      { q: "چه روش‌های پرداختی پشتیبانی می‌شود؟", a: "پرداخت آنلاین از طریق درگاه بانکی (زرین‌پال) و همچنین کیف پول اعتباری برای همکاران و مشتریان عمده." },
      { q: "آیا فاکتور رسمی صادر می‌شود؟", a: "بله، برای تمام سفارش‌ها فاکتور رسمی با سریال یکتا و جزئیات مالیاتی صادر می‌شود." },
    ]
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-secondary-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 text-right hover:bg-secondary-50 transition-colors">
        <span className="text-base font-bold text-secondary-800">{q}</span>
        <ChevronDown size={20} className={`text-secondary-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="px-5 pb-5 text-secondary-600 text-sm leading-relaxed font-medium">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none -z-10" />

      <Navbar />

      <section className="pt-32 pb-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow-sm mb-6">
            <HelpCircle size={16} className="text-primary-500" />
            پاسخ به پرسش‌های متداول
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-secondary-900 mb-6 tracking-tight">
            سوالات <span className="text-primary-600">متداول</span>
          </h1>
          <p className="text-base text-secondary-600 max-w-xl mx-auto font-medium">
            پاسخ رایج‌ترین سوالات مشتریان ما را در این صفحه بیابید.
          </p>
        </div>
      </section>

      <section className="py-8 px-4 pb-20 flex-1">
        <div className="container mx-auto max-w-3xl space-y-10">
          {faqData.map((section, i) => (
            <div key={i}>
              <h2 className="text-xl font-black text-secondary-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-100 text-primary-600 flex items-center justify-center text-sm font-black">{i + 1}</span>
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, j) => (
                  <AccordionItem key={j} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
