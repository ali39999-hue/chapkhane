import { getPayload, type Payload } from 'payload';
import configPromise from '../../../../payload.config';
import { NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/guard';

/**
 * Dev-only catalog seeder.
 *
 * Deliberately contains no filesystem access: reading images from disk inside a
 * route handler makes Turbopack trace the entire project into the server
 * bundle (`Dynamic filesystem access causes tracing of the whole project`),
 * which ships every source file and the whole `public/` folder to production.
 * Product images are seeded by `pnpm run seed` (`src/scripts/seed-real-products.ts`).
 */

/* eslint-disable @typescript-eslint/no-explicit-any -- seed fixtures are loosely typed by design */
async function findOrCreate(payload: Payload, collection: any, matchField: string, data: any) {
  const existing = await payload.find({
    collection,
    where: { [matchField]: { equals: data[matchField] } },
    limit: 1,
    depth: 0,
    pagination: false,
  });
  if (existing.docs.length > 0) return existing.docs[0] as any;
  return (await payload.create({ collection, data, depth: 0 })) as any;
}

export async function GET() {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  try {
    const payload = await getPayload({ config: configPromise });
    
    // 1. Methods (match on 'method')
    const [offsetPrint, digitalPrint] = await Promise.all([
      findOrCreate(payload, 'print-methods', 'method', { name: 'چاپ افست', method: 'offset' }),
      findOrCreate(payload, 'print-methods', 'method', { name: 'چاپ دیجیتال', method: 'digital' }),
    ]);

    // 2. Sizes (match on 'name')
    const [sizeBC, sizeA4, sizeA5, sizeDL, size50x70, sizeCircle] = await Promise.all([
      findOrCreate(payload, 'print-sizes', 'name', { name: 'کارت ویزیت (8.5x5.5)', finalWidth: 85, finalHeight: 55, defaultBleed: 2, safeMargin: 5 }),
      findOrCreate(payload, 'print-sizes', 'name', { name: 'A4 استاندارد', finalWidth: 210, finalHeight: 297, defaultBleed: 3, safeMargin: 5 }),
      findOrCreate(payload, 'print-sizes', 'name', { name: 'A5 استاندارد', finalWidth: 148, finalHeight: 210, defaultBleed: 3, safeMargin: 5 }),
      findOrCreate(payload, 'print-sizes', 'name', { name: 'ملخی (DL)', finalWidth: 220, finalHeight: 110, defaultBleed: 3, safeMargin: 5 }),
      findOrCreate(payload, 'print-sizes', 'name', { name: 'پوستر 50x70', finalWidth: 500, finalHeight: 700, defaultBleed: 5, safeMargin: 5 }),
      findOrCreate(payload, 'print-sizes', 'name', { name: 'دایره قطر 5cm', finalWidth: 50, finalHeight: 50, defaultBleed: 2, safeMargin: 3 }),
    ]);

    // 3. Papers (match on 'name')
    const [paper300G, paper135G, paper80G, paper100G, paperSticker, paperNCR] = await Promise.all([
      findOrCreate(payload, 'paper-types', 'name', { name: 'گلاسه 300 گرم', category: 'گلاسه', allowedGrammages: [{ grammage: 300 }] }),
      findOrCreate(payload, 'paper-types', 'name', { name: 'گلاسه 135 گرم', category: 'گلاسه', allowedGrammages: [{ grammage: 135 }] }),
      findOrCreate(payload, 'paper-types', 'name', { name: 'تحریر 80 گرم', category: 'تحریر', allowedGrammages: [{ grammage: 80 }] }),
      findOrCreate(payload, 'paper-types', 'name', { name: 'تحریر 100 گرم', category: 'تحریر', allowedGrammages: [{ grammage: 100 }] }),
      findOrCreate(payload, 'paper-types', 'name', { name: 'لیبل کاغذی', category: 'گلاسه', allowedGrammages: [{ grammage: 80 }] }),
      findOrCreate(payload, 'paper-types', 'name', { name: 'کاغذ کاربن‌لس (NCR)', category: 'کاربن‌لس', allowedGrammages: [{ grammage: 60 }] }),
    ]);

    // 4. Finishings (match on 'code')
    const [finMatte, finGlossy, finFold, finDieCut, finNumbering] = await Promise.all([
      findOrCreate(payload, 'finishing-options', 'code', { name: 'سلفون مات', code: 'matte-lam', calculationType: 'perForm' }),
      findOrCreate(payload, 'finishing-options', 'code', { name: 'لمینت براق', code: 'glossy-lam', calculationType: 'perForm' }),
      findOrCreate(payload, 'finishing-options', 'code', { name: 'خط تا', code: 'crease', calculationType: 'perForm' }),
      findOrCreate(payload, 'finishing-options', 'code', { name: 'قالب‌زنی (دایره)', code: 'die-cut-circle', calculationType: 'perForm' }),
      findOrCreate(payload, 'finishing-options', 'code', { name: 'شماره‌زنی و پرفراژ', code: 'numbering-perf', calculationType: 'perForm' }),
    ]);

    // 5. Products. Images are attached by `pnpm run seed`, which may read from
    //    disk because it is a standalone script rather than a route handler.
    const products = [
      { name: 'کارت ویزیت سلفون مات', slug: 'bc-matte', method: offsetPrint.id, sizes: [sizeBC.id], papers: [paper300G.id], finish: [finMatte.id], model: 'tier' },
      { name: 'کارت ویزیت لمینت براق', slug: 'bc-glossy-lam', method: offsetPrint.id, sizes: [sizeBC.id], papers: [paper300G.id], finish: [finGlossy.id], model: 'tier' },
      { name: 'تراکت A4 گلاسه', slug: 'flyer-a4-glossy', method: offsetPrint.id, sizes: [sizeA4.id], papers: [paper135G.id], finish: [], model: 'tier' },
      { name: 'تراکت A5 تحریر', slug: 'flyer-a5-uncoated', method: offsetPrint.id, sizes: [sizeA5.id], papers: [paper80G.id], finish: [], model: 'tier' },
      { name: 'سربرگ A4', slug: 'letterhead-a4', method: offsetPrint.id, sizes: [sizeA4.id], papers: [paper100G.id], finish: [], model: 'tier' },
      { name: 'پاکت ملخی اداری', slug: 'envelope-dl', method: offsetPrint.id, sizes: [sizeDL.id], papers: [paper100G.id, paper80G.id], finish: [finFold.id], model: 'tier' },
      { name: 'فولدر تبلیغاتی A4', slug: 'folder-a4', method: offsetPrint.id, sizes: [sizeA4.id], papers: [paper300G.id], finish: [finMatte.id, finFold.id], model: 'tier' },
      { name: 'پوستر ۵۰ در ۷۰', slug: 'poster-5070', method: offsetPrint.id, sizes: [size50x70.id], papers: [paper135G.id], finish: [], model: 'tier' },
      { name: 'لیبل دایره ۵ سانت', slug: 'sticker-circle-5', method: digitalPrint.id, sizes: [sizeCircle.id], papers: [paperSticker.id], finish: [finDieCut.id], model: 'area' },
      { name: 'فاکتور ۳ برگی کاربن‌لس', slug: 'invoice-ncr', method: offsetPrint.id, sizes: [sizeA4.id, sizeA5.id], papers: [paperNCR.id], finish: [finNumbering.id], model: 'tier' }
    ];

    const createdProducts = await Promise.all(
      products.map((p) =>
        findOrCreate(payload, 'product-types', 'slug', {
          name: p.name, slug: p.slug, printMethod: p.method, allowedSizes: p.sizes, allowedPapers: p.papers, allowedFinishings: p.finish, pricingModel: p.model,
          minQuantity: 1000, quantityTiers: [{ quantity: 1000 }, { quantity: 2000 }, { quantity: 5000 }], allowDoubleSided: true, standardProductionDays: 3,
        }).then((prod) => ({ prod, source: p }))
      )
    );

    /*
     * Price rows.
     *
     * The previous version produced a price list the engine could not use:
     *   - `grammage` was hardcoded to 300 for every row, while the seeded papers
     *     allow 60/80/100/135/300, so the base-row lookup (which matches on
     *     grammage) missed on 6 of 9 products; and
     *   - `finishingOption` was set on the *base* row, but `calculatePrice`
     *     requires `!r.finishingOption` for a base row, so every product with a
     *     finishing option had no base row at all.
     * Net effect: `/api/pricing/quote` returned "قیمت پایه ... یافت نشد" for
     * almost the whole catalog, so no price and no order was possible.
     *
     * Rows are now generated per (product × allowed paper × allowed grammage ×
     * sides), with finishing surcharges as separate rows.
     */
    const paperById = new Map(
      [paper300G, paper135G, paper80G, paper100G, paperSticker, paperNCR].map((p) => [String(p.id), p])
    );

    type PriceRow = {
      productType: number;
      paperType: number;
      finishingOption?: number | null;
      grammage: number;
      sides: number;
      basePrice: number;
    };

    const priceRows: PriceRow[] = [];

    for (const { prod, source } of createdProducts) {
      if (source.model === 'rfq') continue;

      // Deterministic fixture price so repeated seeds are comparable.
      const seed = 1_000_000 + source.slug.length * 250_000;

      for (const paperId of source.papers) {
        const paper = paperById.get(String(paperId));
        const grammages: number[] = (paper?.allowedGrammages ?? []).map(
          (g: { grammage: number }) => g.grammage
        );

        for (const grammage of grammages.length > 0 ? grammages : [300]) {
          for (const sides of [1, 2]) {
            priceRows.push({
              productType: prod.id,
              paperType: paperId,
              finishingOption: null, // base row
              grammage,
              // Heavier stock and duplex cost more; keeps the fixture plausible.
              sides,
              basePrice: Math.round(seed * (1 + grammage / 1000) * (sides === 2 ? 1.6 : 1)),
            });
          }
        }
      }

      // Finishing surcharge rows, looked up by (productType, finishingOption).
      for (const finishingId of source.finish) {
        priceRows.push({
          productType: prod.id,
          paperType: source.papers[0],
          finishingOption: finishingId,
          grammage: 0,
          sides: 1,
          basePrice: 250_000,
        });
      }
    }

    // Create a master price list
    await findOrCreate(payload, 'price-lists', 'version', {
      version: 'V1-Seed',
      status: 'active',
      validFrom: new Date().toISOString(),
      rows: priceRows,
      notes: 'تولید شده توسط اسکریپت سیدینگ برای 10 محصول پیش‌فرض'
    });

    return NextResponse.json({
      success: true,
      message: `Seeded ${createdProducts.length} products and ${priceRows.length} price rows.`,
    });
  } catch (error: unknown) {
    console.error('[Seed Error]:', error);
    return NextResponse.json({ error: 'Seeding failed.' }, { status: 500 });
  }
}
