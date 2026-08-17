import { getPayload } from 'payload'
import configPromise from '../../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })

  // 1. Print Methods
  const offsetMethod = await payload.create({
    collection: 'print-methods',
    data: { name: 'افست', method: 'offset', minQuantity: 1000, maxQuantity: 50000 },
  })
  const digitalMethod = await payload.create({
    collection: 'print-methods',
    data: { name: 'دیجیتال', method: 'digital', minQuantity: 1, maxQuantity: 1000 },
  })
  const lfMethod = await payload.create({
    collection: 'print-methods',
    data: { name: 'لارج فرمت', method: 'largeFormat', minQuantity: 1, maxQuantity: 1000 },
  })

  // 2. Paper Types
  const matte300 = await payload.create({
    collection: 'paper-types',
    data: { name: 'Matte 300g', category: 'گلاسه', allowedGrammages: [{ grammage: 300 }] },
  })
  const glossy135 = await payload.create({
    collection: 'paper-types',
    data: { name: 'Glossy 135g', category: 'گلاسه', allowedGrammages: [{ grammage: 135 }] },
  })
  const banner10oz = await payload.create({
    collection: 'paper-types',
    data: { name: 'Banner 10oz', category: 'بنر', allowedGrammages: [{ grammage: 280 }] },
  })

  // 3. Print Sizes
  const sizeVizit = await payload.create({
    collection: 'print-sizes',
    data: { name: 'کارت ویزیت استاندارد', finalWidth: 85, finalHeight: 48, defaultBleed: 3, safeMargin: 5 },
  })
  const sizeA5 = await payload.create({
    collection: 'print-sizes',
    data: { name: 'A5 تراکت', finalWidth: 148, finalHeight: 210, defaultBleed: 3, safeMargin: 5 },
  })

  // 4. Products
  const businessCard = await payload.create({
    collection: 'product-types',
    data: {
      name: 'کارت ویزیت افست',
      slug: 'business-card-offset',
      printMethod: offsetMethod.id,
      pricingModel: 'tier',
      allowDoubleSided: true,
      standardProductionDays: 7,
      allowedSizes: [sizeVizit.id],
      allowedPapers: [matte300.id],
      quantityTiers: [{ quantity: 1000 }, { quantity: 2000 }, { quantity: 5000 }],
    },
  })

  const flyer = await payload.create({
    collection: 'product-types',
    data: {
      name: 'تراکت دیجیتال',
      slug: 'flyer-digital',
      printMethod: digitalMethod.id,
      pricingModel: 'perSheet',
      allowDoubleSided: true,
      standardProductionDays: 1,
      allowedSizes: [sizeA5.id],
      allowedPapers: [glossy135.id],
      quantityTiers: [{ quantity: 50 }, { quantity: 100 }, { quantity: 500 }],
    },
  })

  const banner = await payload.create({
    collection: 'product-types',
    data: {
      name: 'چاپ بنر',
      slug: 'banner-print',
      printMethod: lfMethod.id,
      pricingModel: 'area',
      allowDoubleSided: false,
      standardProductionDays: 1,
      allowedPapers: [banner10oz.id],
    },
  })

  // 5. PriceList
  await payload.create({
    collection: 'price-lists',
    data: {
      version: 'v1.0.0',
      status: 'active',
      validFrom: new Date().toISOString(),
      rows: [
        { productType: businessCard.id, paperType: matte300.id, grammage: 300, sides: 2, basePrice: 5000000 },
        { productType: flyer.id, paperType: glossy135.id, grammage: 135, sides: 1, basePrice: 20000 },
      ],
    },
  })

  console.log('Seed completed successfully.')
  process.exit(0)
}

run().catch(console.error)
