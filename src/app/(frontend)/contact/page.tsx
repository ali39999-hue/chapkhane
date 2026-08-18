"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  ExternalLink, 
  Navigation,
  CheckCircle2,
  Cpu
} from "lucide-react";

const contactInfo = [
  { icon: Phone, label: "تلفن مستقیم کارگاه", value: "۰۲۱-۶۶۷۷۸۸۹۹", href: "tel:02166778899", desc: "پاسخگویی سریع در ساعات اداری" },
  { icon: MessageSquare, label: "پشتیبانی واتساپ و تلگرام", value: "۰۹۱۲۳۴۵۶۷۸۹", href: "https://wa.me/989123456789", desc: "ارسال فایل و مشاوره آنلاین" },
  { icon: Mail, label: "ایمیل رسمی لیتوگرافی", value: "info@chapkhane.ir", href: "mailto:info@chapkhane.ir", desc: "ارسال فاکتورهای رسمی و قراردادها" },
  { icon: Clock, label: "ساعات کاری چاپخانه", value: "شنبه تا چهارشنبه ۹ الی ۱۸ | پنج‌شنبه ۹ الی ۱۴", href: "#", desc: "جمعه‌ها و تعطیلات رسمی تعطیل است" },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground flex flex-col justify-between pt-28 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <Navbar />

      <div className="container mx-auto px-4 max-w-6xl pb-20 flex-1 relative z-10">
        {/* Header Hero */}
        <section className="text-center max-w-2xl mx-auto mb-16 pt-8 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow-sm">
            <Cpu size={16} className="text-primary-500" />
            مرکز ارتباط با دفتر مرکزی و کارگاه چاپ
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-secondary-900 tracking-tight">
            ارتباط با <span className="text-primary-600">چاپخانه نگار</span>
          </h1>
          <p className="text-secondary-600 text-sm sm:text-base leading-relaxed font-medium">
            جهت مشاوره در خصوص گرماژ کاغذ، انتخاب روکش، استعلام قیمت تیراژهای میلیونی و سفارشات سازمانی با ما در تماس باشید.
          </p>
        </section>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Right Column: Contact Cards & Map (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((item, i) => (
                <a 
                  key={i} 
                  href={item.href} 
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  className="bg-white rounded-2xl p-5 border border-secondary-200 shadow-soft hover:shadow-lg hover:border-primary-300 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <span className="text-xs text-secondary-500 font-bold block">{item.label}</span>
                      <strong className="text-secondary-900 text-sm block mt-0.5">{item.value}</strong>
                    </div>
                  </div>
                  <span className="text-[11px] text-secondary-400 mt-3 block font-medium">{item.desc}</span>
                </a>
              ))}
            </div>

            {/* Map Widget */}
            <div className="bg-white rounded-2xl border border-secondary-200 p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="text-red-500" size={20} />
                  <h2 className="font-black text-secondary-900 text-base">موقعیت مکانی چاپخانه و لیتوگرافی</h2>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  مراجعه با هماهنگی
                </span>
              </div>

              <p className="text-xs text-secondary-600 leading-relaxed font-medium">
                تهران، میدان انقلاب، تقاطع خیابان وصال شیرازی، پلاک ۱۲۰، مجتمع چاپ و نشر نگار (طبقه همکف)
              </p>

              {/* Map Graphic Box */}
              <div className="h-52 w-full rounded-xl bg-secondary-50 relative overflow-hidden flex items-center justify-center p-4 border border-secondary-200">
                <div className="absolute inset-0 bg-grid-dots opacity-40" />
                <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-red-50 border-2 border-red-400 text-red-500 flex items-center justify-center animate-bounce shadow-md">
                    <MapPin size={24} />
                  </div>
                  <span className="font-bold text-sm text-secondary-900">دفتر فنی و چاپخانه آنلاین نگار</span>
                  <span className="text-xs text-secondary-500 font-mono">35.7008° N, 51.3912° E</span>
                </div>
              </div>

              {/* Navigation Links — external, so `rel` is required and the
                  new-tab behaviour is announced. */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <a 
                  href="https://nshn.ir" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-3 min-h-12 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1.5 border border-secondary-200"
                >
                  <Navigation size={14} className="text-primary-500" aria-hidden="true" />
                  مسیریابی با نشان
                  <span className="sr-only">(در تب جدید باز می‌شود)</span>
                </a>
                <a 
                  href="https://balad.ir" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-3 min-h-12 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1.5 border border-secondary-200"
                >
                  <Navigation size={14} className="text-primary-500" aria-hidden="true" />
                  مسیریابی با بلد
                  <span className="sr-only">(در تب جدید باز می‌شود)</span>
                </a>
                <a 
                  href="https://maps.google.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-3 min-h-12 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1.5 border border-secondary-200"
                >
                  <ExternalLink size={14} className="text-primary-500" aria-hidden="true" />
                  Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Left Column: Direct Message Form (5 Cols) */}
          <div className="lg:col-span-5">
            {submitted ? (
              <div className="bg-white rounded-2xl border border-secondary-200 p-10 shadow-soft text-center space-y-4" role="status">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} aria-hidden="true" />
                </div>
                <h2 className="text-xl font-black text-secondary-900">اطلاعات شما ثبت شد</h2>
                <p className="text-secondary-600 text-xs sm:text-sm leading-relaxed font-medium">
                  برای پیگیری فوری، لطفاً با شماره‌های درج‌شده در همین صفحه تماس بگیرید یا از طریق واتساپ پیام دهید.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 min-h-12 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-bold text-xs rounded-xl transition-all"
                >
                  بازگشت به فرم
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-secondary-200 p-6 sm:p-8 shadow-soft space-y-4">
                <h2 className="text-lg font-black text-secondary-900 mb-1">ارسال پیام به مدیر تولید</h2>
                <p className="text-xs text-secondary-500 mb-4 font-medium">فرم زیر را تکمیل کنید تا کارشناسان چاپخانه با شما تماس بگیرند.</p>

                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-secondary-600 mb-1.5">نام و نام خانوادگی</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="مثلاً: علیرضا حسینی"
                    className="w-full h-12 px-4 rounded-xl bg-secondary-50 border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-secondary-900 text-sm font-bold transition-all placeholder:text-secondary-400"
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-bold text-secondary-600 mb-1.5">شماره همراه</label>
                  <input
                    id="contact-phone"
                    name="tel"
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    pattern="0[0-9]{9,10}"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    dir="ltr"
                    className="w-full h-12 px-4 rounded-xl bg-secondary-50 border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-secondary-900 text-sm font-bold transition-all text-right placeholder:text-secondary-400"
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-bold text-secondary-600 mb-1.5">موضوع پیام</label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    required
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    placeholder="مثلاً: استعلام قیمت تیراژ ۵۰,۰۰۰ عدد"
                    className="w-full h-12 px-4 rounded-xl bg-secondary-50 border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-secondary-900 text-sm font-bold transition-all placeholder:text-secondary-400"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-bold text-secondary-600 mb-1.5">مشخصات سفارش یا پیام</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    required
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="ابعاد، گرماژ، نوع روکش یا سوال خود را بنویسید..."
                    className="w-full p-4 rounded-xl bg-secondary-50 border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-secondary-900 text-sm font-bold resize-none transition-all placeholder:text-secondary-400"
                  />
                </div>

                {/*
                  This form is not yet wired to a backend endpoint: submitting
                  only switches to the confirmation panel. Say so, rather than
                  implying a message was delivered.
                */}
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 font-bold">
                  توجه: ارسال این فرم فعلاً پیام را ثبت نمی‌کند. برای پیگیری فوری با شماره تلفن بالا تماس بگیرید.
                </p>

                <button
                  type="submit"
                  className="w-full h-13 min-h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-md shadow-primary-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Send size={16} aria-hidden="true" />
                  <span>ارسال پیام به واحد لیتوگرافی</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
