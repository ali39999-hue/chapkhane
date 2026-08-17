import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Configurator } from "@/components/products/Configurator";
import { Cpu } from "lucide-react";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise });
    const res = await payload.find({
      collection: "product-types",
      limit: 100,
      select: { slug: true },
    });
    return res.docs.map((d) => ({ slug: d.slug }));
  } catch (err) {
    console.warn("Could not generate static params (DB might be empty)", err);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  
  let product = null;
  try {
    const res = await payload.find({
      collection: "product-types",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    product = res.docs[0];
  } catch (err) {
    console.warn("Error fetching product", err);
  }

  if (!product) return { title: "یافت نشد" };

  const title = `سفارش آنلاین ${product.name} | چاپخانه نگار`;
  const description = `شخصی‌سازی و سفارش آنلاین ${product.name} با محاسبه زنده فاکتور و بررسی هوشمند فایل قبل از لیتوگرافی.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fa_IR",
      siteName: "چاپخانه نگار",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  
  let productRes = { totalDocs: 0, docs: [] as any[] };
  let papersRes = { docs: [] as any[] };
  let sizesRes = { docs: [] as any[] };
  let finishingsRes = { docs: [] as any[] };
  let turnaroundsRes = { docs: [] as any[] };

  try {
    productRes = await payload.find({
      collection: "product-types",
      where: { slug: { equals: slug } },
      limit: 1,
    });

    if (productRes.totalDocs > 0) {
      const results = await Promise.all([
        payload.find({ collection: "paper-types", limit: 50, where: { active: { equals: true } } }),
        payload.find({ collection: "print-sizes", limit: 50 }),
        payload.find({ collection: "finishing-options", limit: 50, where: { active: { equals: true } } }),
        payload.find({ collection: "turnaround-options", limit: 10 }),
      ]);
      papersRes = results[0];
      sizesRes = results[1];
      finishingsRes = results[2];
      turnaroundsRes = results[3];
    }
  } catch (err) {
    console.warn("Error fetching product data", err);
  }

  if (productRes.totalDocs === 0) {
    notFound();
  }

  const product = productRes.docs[0];

  const allowedPaperIds = product.allowedPapers?.map((p: any) => typeof p === 'object' && p !== null ? p.id : p) || [];
  const papers = allowedPaperIds.length > 0 
    ? papersRes.docs.filter(p => allowedPaperIds.includes(p.id)) 
    : papersRes.docs;

  const allowedSizeIds = product.allowedSizes?.map((s: any) => typeof s === 'object' && s !== null ? s.id : s) || [];
  const sizes = allowedSizeIds.length > 0 
    ? sizesRes.docs.filter(s => allowedSizeIds.includes(s.id)) 
    : sizesRes.docs;

  const allowedFinishingIds = product.allowedFinishings?.map((f: any) => typeof f === 'object' && f !== null ? f.id : f) || [];
  let finishings = allowedFinishingIds.length > 0
    ? finishingsRes.docs.filter(f => allowedFinishingIds.includes(f.id))
    : finishingsRes.docs;

  // Fix Duplicate Rendering by ensuring unique finishings by ID
  finishings = Array.from(new Map(finishings.map(f => [f.id, f])).values());

  return (
    <main className="min-h-screen bg-background text-foreground pt-28 pb-20 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-slate opacity-30 pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <Navbar />
      
      <div className="container mx-auto px-4 max-w-7xl pt-6 pb-12 relative z-10">
        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold shadow-sm">
            <Cpu size={14} className="text-primary-600" />
            استودیو یکپارچه استعلام قیمت و ارسال فایل
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-secondary-900 tracking-tight">
            سفارش چاپ <span className="text-primary-600">{product.name}</span>
          </h1>
          <p className="text-secondary-600 text-sm sm:text-base font-medium">
            مشخصات فنی تولید را وارد کنید. سیستم پس از اعتبارسنجی اتوماتیک فایل (Preflight)، سفارش را به خط تولید ارسال می‌کند.
          </p>
        </div>

        <Suspense fallback={<div className="h-[500px] w-full bg-white border border-secondary-200 shadow-sm animate-pulse rounded-[2rem]" />}>
          <Configurator 
            product={product}
            papers={papers}
            sizes={sizes}
            finishings={finishings}
            turnarounds={turnaroundsRes.docs}
          />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
