import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import type { ProductType } from "../../../../../payload-types";
import { Configurator } from "@/components/products/Configurator";
import { relationId } from "@/lib/relations";
import { Cpu } from "lucide-react";

export const revalidate = 300;

/**
 * `generateMetadata` and the page component both need the product.
 * `React.cache` deduplicates them into a single query per render, the same
 * pattern `src/lib/auth.ts` uses for `payload.auth`.
 */
const getProductBySlug = cache(async (slug: string): Promise<ProductType | null> => {
  try {
    const payload = await getPayload({ config: configPromise });
    const res = await payload.find({
      collection: "product-types",
      where: { slug: { equals: slug } },
      limit: 1,
      // depth 0: the allowed-* relations are only needed as IDs, and they are
      // used below to fetch exactly the referenced catalog rows.
      depth: 1,
      pagination: false,
    });
    return res.docs[0] ?? null;
  } catch (err) {
    console.warn("Error fetching product", err);
    return null;
  }
});

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise });
    const res = await payload.find({
      collection: "product-types",
      limit: 100,
      depth: 0,
      pagination: false,
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
  const product = await getProductBySlug(slug);

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

/** Relationship arrays arrive as IDs or populated docs; normalise to IDs. */
function toIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => relationId(entry)).filter((id): id is number => id !== undefined);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const payload = await getPayload({ config: configPromise });

  const paperIds = toIds(product.allowedPapers);
  const sizeIds = toIds(product.allowedSizes);
  const finishingIds = toIds(product.allowedFinishings);

  // Fetch only the catalog rows this product actually allows. The previous
  // version read the entire papers/sizes/finishings tables and filtered them in
  // JavaScript, which also made the in-memory dedupe necessary.
  const [papersRes, sizesRes, finishingsRes, turnaroundsRes] = await Promise.all([
    paperIds.length > 0
      ? payload.find({
          collection: "paper-types",
          where: { id: { in: paperIds }, active: { equals: true } },
          limit: paperIds.length,
          depth: 0,
          pagination: false,
          select: { name: true, allowedGrammages: true },
        })
      : payload.find({
          collection: "paper-types",
          where: { active: { equals: true } },
          limit: 50,
          depth: 0,
          pagination: false,
          select: { name: true, allowedGrammages: true },
        }),
    sizeIds.length > 0
      ? payload.find({
          collection: "print-sizes",
          where: { id: { in: sizeIds } },
          limit: sizeIds.length,
          depth: 0,
          pagination: false,
          select: { name: true, finalWidth: true, finalHeight: true },
        })
      : payload.find({
          collection: "print-sizes",
          limit: 50,
          depth: 0,
          pagination: false,
          select: { name: true, finalWidth: true, finalHeight: true },
        }),
    finishingIds.length > 0
      ? payload.find({
          collection: "finishing-options",
          where: { id: { in: finishingIds }, active: { equals: true } },
          limit: finishingIds.length,
          depth: 0,
          pagination: false,
          select: { name: true },
        })
      : Promise.resolve(null),
    payload.find({
      collection: "turnaround-options",
      limit: 10,
      depth: 0,
      pagination: false,
      select: { name: true },
    }),
  ]).catch((err) => {
    console.warn("Error fetching catalog data", err);
    return [null, null, null, null] as const;
  });

  const productImageUrl =
    (Array.isArray(product.images)
      ? product.images.find((img) => typeof img === "object" && img !== null)
      : null)?.url ?? null;

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground pt-28 pb-20 relative overflow-hidden font-sans">
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
            product={{
              slug: product.slug,
              name: product.name,
              imageUrl: productImageUrl,
            }}
            papers={(papersRes?.docs ?? []).map((p) => ({
              id: p.id,
              name: p.name,
              allowedGrammages: (p.allowedGrammages ?? []).map((g) => ({ grammage: g.grammage })),
            }))}
            sizes={(sizesRes?.docs ?? []).map((s) => ({
              id: s.id,
              name: s.name,
              finalWidth: s.finalWidth,
              finalHeight: s.finalHeight,
            }))}
            finishings={(finishingsRes?.docs ?? []).map((f) => ({ id: f.id, name: f.name }))}
            turnarounds={(turnaroundsRes?.docs ?? []).map((t) => ({ id: t.id, name: t.name }))}
          />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
