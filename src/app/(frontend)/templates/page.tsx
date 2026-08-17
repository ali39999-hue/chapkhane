import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";
import { TemplatesGalleryView } from "@/components/templates/TemplatesGalleryView";

export const metadata: Metadata = {
  title: "دانلود رایگان قالب‌های چاپ استاندارد (PDF, PSD) | چاپخانه نگار",
  description: "دانلود قالب‌های استاندارد کارت ویزیت، تراکت، سربرگ، پاکت و فولدر مطابق با ابعاد و بلید چاپخانه.",
};

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between pt-20 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <Navbar />

      <div className="container mx-auto px-4 max-w-7xl pb-20 flex-1">
        <TemplatesGalleryView />
      </div>

      <Footer />
    </main>
  );
}
