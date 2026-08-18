import { getPayload, type Payload } from 'payload';
import configPromise from '../../payload.config';
import fs from 'fs';
import path from 'path';

// Was a hardcoded absolute Windows path; override with SEED_IMAGES_DIR.
const IMAGES_DIR = process.env.SEED_IMAGES_DIR ?? path.join(process.cwd(), 'scripts-local', 'seed-images');

const mockImages = {
  bc_matte: 'business_card_matte_1786870268165.jpg',
  bc_glossy: 'business_card_glossy_1786870296143.jpg',
  flyer_a4: 'flyer_a4_1786870304022.jpg',
  flyer_a5: 'flyer_a5_1786870323279.jpg',
  letterhead: 'letterhead_a4_1786870333729.jpg',
  envelope: 'envelope_dl_1786870342105.jpg',
  folder: 'folder_a4_1786870362621.jpg',
  poster: 'poster_50x70_1786870371006.jpg',
  sticker: 'sticker_circle_1786870379402.jpg',
  invoice: 'invoice_book_1786870387411.jpg',
};

async function uploadImage(payload: Payload, filename: string) {
  const filePath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Image missing: ${filePath}`);
    return null;
  }

  const buffer = fs.readFileSync(filePath);
  const asset = await payload.create({
    collection: 'public-assets',
    data: { alt: 'Product Image' },
    file: {
      data: buffer,
      mimetype: 'image/jpeg',
      name: filename,
      size: buffer.length,
    }
  });
  return asset.id;
}

async function run() {
  const payload = await getPayload({ config: configPromise });
  console.log('Starting DB Seed...');

  // 1. Create Base Taxonomy
  const offsetPrint = await payload.create({ collection: 'print-methods', data: { name: 'چاپ افست', method: 'offset' }});
  const digitalPrint = await payload.create({ collection: 'print-methods', data: { name: 'چاپ دیجیتال', method: 'digital' }});

  // Sizes
  const sizeBC = await payload.create({ collection: 'print-sizes', data: { name: 'کارت ویزیت (8.5x5.5)', finalWidth: 85, finalHeight: 55, defaultBleed: 2, safeMargin: 3 }});
  const sizeA4 = await payload.create({ collection: 'print-sizes', data: { name: 'A4 استاندارد', finalWidth: 210, finalHeight: 297, defaultBleed: 3, safeMargin: 5 }});
  const sizeA5 = await payload.create({ collection: 'print-sizes', data: { name: 'A5 استاندارد', finalWidth: 148, finalHeight: 210, defaultBleed: 3, safeMargin: 5 }});
  const sizeDL = await payload.create({ collection: 'print-sizes', data: { name: 'ملخی (DL)', finalWidth: 220, finalHeight: 110, defaultBleed: 3, safeMargin: 3 }});
  const size50x70 = await payload.create({ collection: 'print-sizes', data: { name: 'پوستر 50x70', finalWidth: 500, finalHeight: 700, defaultBleed: 5, safeMargin: 10 }});
  const sizeCircle = await payload.create({ collection: 'print-sizes', data: { name: 'دایره قطر 5cm', finalWidth: 50, finalHeight: 50, defaultBleed: 2, safeMargin: 3 }});

  // Papers
  const paper300G = await payload.create({ collection: 'paper-types', data: { name: 'گلاسه 300 گرم', category: 'گلاسه', allowedGrammages: [{ grammage: 300 }] }});
  const paper135G = await payload.create({ collection: 'paper-types', data: { name: 'گلاسه 135 گرم', category: 'گلاسه', allowedGrammages: [{ grammage: 135 }] }});
  const paper80G = await payload.create({ collection: 'paper-types', data: { name: 'تحریر 80 گرم', category: 'تحریر', allowedGrammages: [{ grammage: 80 }] }});
  const paper100G = await payload.create({ collection: 'paper-types', data: { name: 'تحریر 100 گرم', category: 'تحریر', allowedGrammages: [{ grammage: 100 }] }});
  const paperSticker = await payload.create({ collection: 'paper-types', data: { name: 'لیبل کاغذی', category: 'گلاسه', allowedGrammages: [{ grammage: 80 }] }});
  const paperNCR = await payload.create({ collection: 'paper-types', data: { name: 'کاغذ کاربن‌لس (NCR)', category: 'کاربن‌لس', allowedGrammages: [{ grammage: 60 }] }});

  // Finishings
  const finMatte = await payload.create({ collection: 'finishing-options', data: { name: 'سلفون مات', code: 'matte-lam', calculationType: 'perForm' }});
  const finGlossy = await payload.create({ collection: 'finishing-options', data: { name: 'لمینت براق', code: 'glossy-lam', calculationType: 'perForm' }});
  const finFold = await payload.create({ collection: 'finishing-options', data: { name: 'خط تا', code: 'crease', calculationType: 'perForm' }});
  const finDieCut = await payload.create({ collection: 'finishing-options', data: { name: 'قالب‌زنی (دایره)', code: 'die-cut-circle', calculationType: 'perUnit' }});
  const finNumbering = await payload.create({ collection: 'finishing-options', data: { name: 'شماره‌زنی و پرفراژ', code: 'numbering-perf', calculationType: 'perForm' }});

  // 2. Upload Images
  const imgBCMatte = await uploadImage(payload, mockImages.bc_matte);
  const imgBCGlossy = await uploadImage(payload, mockImages.bc_glossy);
  const imgFlyerA4 = await uploadImage(payload, mockImages.flyer_a4);
  const imgFlyerA5 = await uploadImage(payload, mockImages.flyer_a5);
  const imgLetterhead = await uploadImage(payload, mockImages.letterhead);
  const imgEnvelope = await uploadImage(payload, mockImages.envelope);
  const imgFolder = await uploadImage(payload, mockImages.folder);
  const imgPoster = await uploadImage(payload, mockImages.poster);
  const imgSticker = await uploadImage(payload, mockImages.sticker);
  const imgInvoice = await uploadImage(payload, mockImages.invoice);

  // 3. Create 10 Real Products
  const products = [
    {
      name: 'کارت ویزیت سلفون مات', slug: 'bc-matte', img: imgBCMatte,
      method: offsetPrint.id, sizes: [sizeBC.id], papers: [paper300G.id], finish: [finMatte.id], model: 'tier' as const
    },
    {
      name: 'کارت ویزیت لمینت براق', slug: 'bc-glossy-lam', img: imgBCGlossy,
      method: offsetPrint.id, sizes: [sizeBC.id], papers: [paper300G.id], finish: [finGlossy.id], model: 'tier' as const
    },
    {
      name: 'تراکت A4 گلاسه', slug: 'flyer-a4-glossy', img: imgFlyerA4,
      method: offsetPrint.id, sizes: [sizeA4.id], papers: [paper135G.id], finish: [], model: 'tier' as const
    },
    {
      name: 'تراکت A5 تحریر', slug: 'flyer-a5-uncoated', img: imgFlyerA5,
      method: offsetPrint.id, sizes: [sizeA5.id], papers: [paper80G.id], finish: [], model: 'tier' as const
    },
    {
      name: 'سربرگ A4', slug: 'letterhead-a4', img: imgLetterhead,
      method: offsetPrint.id, sizes: [sizeA4.id], papers: [paper100G.id], finish: [], model: 'tier' as const
    },
    {
      name: 'پاکت ملخی اداری', slug: 'envelope-dl', img: imgEnvelope,
      method: offsetPrint.id, sizes: [sizeDL.id], papers: [paper100G.id, paper80G.id], finish: [finFold.id], model: 'tier' as const
    },
    {
      name: 'فولدر تبلیغاتی A4', slug: 'folder-a4', img: imgFolder,
      method: offsetPrint.id, sizes: [sizeA4.id], papers: [paper300G.id], finish: [finMatte.id, finFold.id], model: 'tier' as const
    },
    {
      name: 'پوستر ۵۰ در ۷۰', slug: 'poster-5070', img: imgPoster,
      method: offsetPrint.id, sizes: [size50x70.id], papers: [paper135G.id], finish: [], model: 'tier' as const
    },
    {
      name: 'لیبل دایره ۵ سانت', slug: 'sticker-circle-5', img: imgSticker,
      method: digitalPrint.id, sizes: [sizeCircle.id], papers: [paperSticker.id], finish: [finDieCut.id], model: 'area' as const
    },
    {
      name: 'فاکتور ۳ برگی کاربن‌لس', slug: 'invoice-ncr', img: imgInvoice,
      method: offsetPrint.id, sizes: [sizeA4.id, sizeA5.id], papers: [paperNCR.id], finish: [finNumbering.id], model: 'tier' as const
    }
  ];

  for (const p of products) {
    const prod = await payload.create({
      collection: 'product-types',
      data: {
        name: p.name,
        slug: p.slug,
        printMethod: p.method,
        allowedSizes: p.sizes,
        allowedPapers: p.papers,
        allowedFinishings: p.finish,
        pricingModel: p.model,
        minQuantity: 1000,
        quantityTiers: [{ quantity: 1000 }, { quantity: 2000 }, { quantity: 5000 }],
        allowDoubleSided: true,
        standardProductionDays: 3,
        images: p.img ? [p.img] : [],
      }
    });

    // Add a basic price list for this product
    await payload.create({
      collection: 'price-lists',
      data: {
        version: `v1-${p.slug}`,
        status: 'active',
        validFrom: new Date().toISOString(),
        rows: [
          {
            productType: prod.id,
            paperType: p.papers[0],
            basePrice: 5000000, // 5M Rials base
          },
        ],
      }
    });
  }

  console.log('Seeded 10 Products Successfully!');
  process.exit(0);
}

run().catch(console.error);