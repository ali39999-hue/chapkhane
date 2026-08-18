import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const vazirmatn = localFont({
  src: [
    {
      path: "./fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    }
  ],
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: {
    template: '%s | چاپخانه آنلاین',
    default: 'چاپخانه آنلاین - چاپ فوری و باکیفیت',
  },
  description: 'سفارش آنلاین چاپ با محاسبه قیمت لحظه‌ای. چاپ کارت ویزیت، تراکت، کاتالوگ و بسته‌بندی با بالاترین کیفیت و ارسال به سراسر کشور.',
  keywords: ['چاپ آنلاین', 'چاپخانه', 'کارت ویزیت', 'چاپ تراکت', 'چاپ افست', 'چاپ دیجیتال'],
  authors: [{ name: 'چاپخانه آنلاین' }],
  creator: 'چاپخانه آنلاین',
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://chapkhane.test',
    title: 'چاپخانه آنلاین - سیستم یکپارچه وب‌توپرینت',
    description: 'تجربه کاربری بی‌نظیر برای سفارش آنلاین محصولات چاپی، آپلود مستقیم و مشاهده لحظه‌ای قیمت.',
    siteName: 'چاپخانه آنلاین',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'چاپخانه آنلاین - چاپ فوری',
    description: 'سفارش اینترنتی خدمات چاپ با بررسی هوشمند فایل‌ها',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        {/*
          First focusable element on every page, so keyboard users can bypass
          the fixed navbar instead of tabbing through it on every navigation.
          Visually hidden until focused (see `.skip-link` in globals.css).
        */}
        <a href="#main-content" className="skip-link">
          رفتن به محتوای اصلی
        </a>
        {children}
      </body>
    </html>
  );
}
