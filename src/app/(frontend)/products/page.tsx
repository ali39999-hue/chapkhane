import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { Metadata } from "next";
import { ProductsCatalogView, type CatalogProduct } from "@/components/products/ProductsCatalogView";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "کاتالوگ کامل محصولات چاپی | چاپخانه آنلاین نگار",
  description: "لیست کامل محصولات چاپی شامل کارت ویزیت، تراکت، کاتالوگ، پاکت و بسته‌بندی با محاسبه آنلاین قیمت.",
};

export default async function ProductsPage() {
  let products: CatalogProduct[] = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const res = await payload.find({
      collection: "product-types",
      limit: 100,
      sort: "name",
      depth: 1,
      pagination: false,
      select: { name: true, slug: true, images: true },
    });
    products = res.docs.map((doc) => ({
      id: doc.id,
      name: doc.name,
      slug: doc.slug,
      imageUrl:
        (Array.isArray(doc.images)
          ? doc.images.find((img) => typeof img === "object" && img !== null)
          : null
        )?.url ?? null,
    }));
  } catch (err) {
    console.warn("Could not fetch products during build:", err);
  }

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground flex flex-col justify-between pt-20 relative overflow-hidden font-sans">
      {/* Ambient Lighting */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-secondary-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <Navbar />
      
      <div className="container mx-auto px-4 max-w-7xl pb-16 flex-1">
        {/* Interactive Products Grid with Search & Filters */}
        <ProductsCatalogView initialProducts={products} />
      </div>

      <Footer />
    </main>
  );
}
