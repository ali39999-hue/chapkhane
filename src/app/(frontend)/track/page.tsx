import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrackClient } from "./TrackClient";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

interface TrackPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const { order: orderQuery } = await searchParams;
  const payload = await getPayload({ config: configPromise });

  let order = null;
  if (orderQuery) {
    const res = await payload
      .find({
        collection: "orders",
        where: { orderNumber: { equals: orderQuery } },
        limit: 1,
        depth: 1,
        pagination: false,
      })
      .catch(() => null);
    order = res && res.totalDocs > 0 ? res.docs[0] : null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between pt-28 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <Navbar />

      <div className="container mx-auto px-4 max-w-5xl pb-20 flex-1 relative z-10">
        {/* Header Hero */}
        <section className="text-center max-w-2xl mx-auto mb-10 pt-8 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow-sm">
            <Cpu size={16} className="text-primary-500" />
            سامانه رهگیری لحظه‌ای خط تولید چاپخانه
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-secondary-900 tracking-tight">
            پیگیری بارنامه و <span className="text-primary-600">سفارش چاپی</span>
          </h1>
          <p className="text-secondary-600 text-sm sm:text-base leading-relaxed font-medium">
            شماره فاکتور یا کد سفارش را وارد کنید تا وضعیت کار در خطوط لیتوگرافی، چاپ و صحافی را مشاهده کنید.
          </p>
        </section>

        <TrackClient initialOrder={order} initialQuery={orderQuery || ""} />
      </div>

      <Footer />
    </main>
  );
}