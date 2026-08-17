import { getPayload } from 'payload';
import configPromise from '../../../../payload.config';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/guard';

const IMAGES_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\1be1683b-a22c-4610-bae3-a7029a78514c';

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

async function findOrCreate(payload: any, collection: string, matchField: string, data: any) {
  const existing = await payload.find({
    collection,
    where: {
      [matchField]: { equals: data[matchField] }
    }
  });
  if (existing.docs.length > 0) return existing.docs[0];
  return await payload.create({ collection, data });
}

async function uploadImage(payload: any, filename: string) {
  const filePath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Image missing: ${filePath}`);
    return null;
  }
  
  const existing = await payload.find({
    collection: 'public-assets',
    where: { filename: { equals: filename } }
  });
  if (existing.docs.length > 0) return existing.docs[0].id;

  const buffer = fs.readFileSync(filePath);
  const asset = await payload.create({
    collection: 'public-assets',
    data: { alt: 'Product Image' },
    file: { data: buffer, mimetype: 'image/jpeg', name: filename, size: buffer.length }
  });
  return asset.id;
}

export async function GET() {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  try {
    const payload = await getPayload({ config: configPromise });
    
    // 1. Methods (match on 'method')
    const offsetPrint = await findOrCreate(payload, 'print-methods', 'method', { name: 'چاپ افست', method: 'offset' });
    const digitalPrint = await findOrCreate(payload, 'print-methods', 'method', { name: 'چاپ دیجیتال', method: 'digital' });
    
    // 2. Sizes (match on 'name')
    const sizeBC = await findOrCreate(payload, 'print-sizes', 'name', { name: 'کارت ویزیت (8.5x5.5)', finalWidth: 85, finalHeight: 55, defaultBleed: 2, safeMargin: 5 });
    const sizeA4 = await findOrCreate(payload, 'print-sizes', 'name', { name: 'A4 استاندارد', finalWidth: 210, finalHeight: 297, defaultBleed: 3, safeMargin: 5 });
    const sizeA5 = await findOrCreate(payload, 'print-sizes', 'name', { name: 'A5 استاندارد', finalWidth: 148, finalHeight: 210, defaultBleed: 3, safeMargin: 5 });
    const sizeDL = await findOrCreate(payload, 'print-sizes', 'name', { name: 'ملخی (DL)', finalWidth: 220, finalHeight: 110, defaultBleed: 3, safeMargin: 5 });
    const size50x70 = await findOrCreate(payload, 'print-sizes', 'name', { name: 'پوستر 50x70', finalWidth: 500, finalHeight: 700, defaultBleed: 5, safeMargin: 5 });
    const sizeCircle = await findOrCreate(payload, 'print-sizes', 'name', { name: 'دایره قطر 5cm', finalWidth: 50, finalHeight: 50, defaultBleed: 2, safeMargin: 3 });

    // 3. Papers (match on 'name')
    const paper300G = await findOrCreate(payload, 'paper-types', 'name', { name: 'گلاسه 300 گرم', category: 'گلاسه', allowedGrammages: [{ grammage: 300 }] });
    const paper135G = await findOrCreate(payload, 'paper-types', 'name', { name: 'گلاسه 135 گرم', category: 'گلاسه', allowedGrammages: [{ grammage: 135 }] });
    const paper80G = await findOrCreate(payload, 'paper-types', 'name', { name: 'تحریر 80 گرم', category: 'تحریر', allowedGrammages: [{ grammage: 80 }] });
    const paper100G = await findOrCreate(payload, 'paper-types', 'name', { name: 'تحریر 100 گرم', category: 'تحریر', allowedGrammages: [{ grammage: 100 }] });
    const paperSticker = await findOrCreate(payload, 'paper-types', 'name', { name: 'لیبل کاغذی', category: 'گلاسه', allowedGrammages: [{ grammage: 80 }] });
    const paperNCR = await findOrCreate(payload, 'paper-types', 'name', { name: 'کاغذ کاربن‌لس (NCR)', category: 'کاربن‌لس', allowedGrammages: [{ grammage: 60 }] });

    // 4. Finishings (match on 'code')
    const finMatte = await findOrCreate(payload, 'finishing-options', 'code', { name: 'سلفون مات', code: 'matte-lam', calculationType: 'perForm' });
    const finGlossy = await findOrCreate(payload, 'finishing-options', 'code', { name: 'لمینت براق', code: 'glossy-lam', calculationType: 'perForm' });
    const finFold = await findOrCreate(payload, 'finishing-options', 'code', { name: 'خط تا', code: 'crease', calculationType: 'perForm' });
    const finDieCut = await findOrCreate(payload, 'finishing-options', 'code', { name: 'قالب‌زنی (دایره)', code: 'die-cut-circle', calculationType: 'perForm' });
    const finNumbering = await findOrCreate(payload, 'finishing-options', 'code', { name: 'شماره‌زنی و پرفراژ', code: 'numbering-perf', calculationType: 'perForm' });

    // 5. Upload Images
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

    // 6. Products
    const products = [
      { name: 'کارت ویزیت سلفون مات', slug: 'bc-matte', img: imgBCMatte, method: offsetPrint.id, sizes: [sizeBC.id], papers: [paper300G.id], finish: [finMatte.id], model: 'tier' },
      { name: 'کارت ویزیت لمینت براق', slug: 'bc-glossy-lam', img: imgBCGlossy, method: offsetPrint.id, sizes: [sizeBC.id], papers: [paper300G.id], finish: [finGlossy.id], model: 'tier' },
      { name: 'تراکت A4 گلاسه', slug: 'flyer-a4-glossy', img: imgFlyerA4, method: offsetPrint.id, sizes: [sizeA4.id], papers: [paper135G.id], finish: [], model: 'tier' },
      { name: 'تراکت A5 تحریر', slug: 'flyer-a5-uncoated', img: imgFlyerA5, method: offsetPrint.id, sizes: [sizeA5.id], papers: [paper80G.id], finish: [], model: 'tier' },
      { name: 'سربرگ A4', slug: 'letterhead-a4', img: imgLetterhead, method: offsetPrint.id, sizes: [sizeA4.id], papers: [paper100G.id], finish: [], model: 'tier' },
      { name: 'پاکت ملخی اداری', slug: 'envelope-dl', img: imgEnvelope, method: offsetPrint.id, sizes: [sizeDL.id], papers: [paper100G.id, paper80G.id], finish: [finFold.id], model: 'tier' },
      { name: 'فولدر تبلیغاتی A4', slug: 'folder-a4', img: imgFolder, method: offsetPrint.id, sizes: [sizeA4.id], papers: [paper300G.id], finish: [finMatte.id, finFold.id], model: 'tier' },
      { name: 'پوستر ۵۰ در ۷۰', slug: 'poster-5070', img: imgPoster, method: offsetPrint.id, sizes: [size50x70.id], papers: [paper135G.id], finish: [], model: 'tier' },
      { name: 'لیبل دایره ۵ سانت', slug: 'sticker-circle-5', img: imgSticker, method: digitalPrint.id, sizes: [sizeCircle.id], papers: [paperSticker.id], finish: [finDieCut.id], model: 'area' },
      { name: 'فاکتور ۳ برگی کاربن‌لس', slug: 'invoice-ncr', img: imgInvoice, method: offsetPrint.id, sizes: [sizeA4.id, sizeA5.id], papers: [paperNCR.id], finish: [finNumbering.id], model: 'tier' }
    ];

    const priceRows: any[] = [];

    for (const p of products) {
      const prod = await findOrCreate(payload, 'product-types', 'slug', {
        name: p.name, slug: p.slug, printMethod: p.method, allowedSizes: p.sizes, allowedPapers: p.papers, allowedFinishings: p.finish, pricingModel: p.model,
        minQuantity: 1000, quantityTiers: [{ quantity: 1000 }, { quantity: 2000 }, { quantity: 5000 }], allowDoubleSided: true, standardProductionDays: 3, images: p.img ? [p.img] : [],
      });
      
      if (p.model === 'tier') {
        priceRows.push({
          productType: prod.id,
          paperType: p.papers[0],
          finishingOption: p.finish.length > 0 ? p.finish[0] : null,
          grammage: 300,
          sides: 1,
          basePrice: Math.floor(Math.random() * 5000000) + 1000000, // Random base price between 1M - 6M Rials
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

    return NextResponse.json({ success: true, message: 'Seeded 10 Products Successfully!' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
