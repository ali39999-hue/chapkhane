import { getPayload } from 'payload';
import configPromise from '@payload-config';
import type { FinishingOption, Order, Organization, ProductType, TurnaroundOption } from '../../../payload-types';
import { calculatePrice } from '../pricing/engine';
import { PricingInputSchema, PricingContext, PriceList, type PricingInput } from '../pricing/types';
import { getCachedActivePriceList } from '../pricing/cache';
import { nextOrderNumber } from './order-number';

export type CheckoutItemInput = {
  config: unknown;
  artworkId?: number | string | null;
};

/** Uniform relationship-ID reader: relations can arrive populated or as a raw ID. */
function relId(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    return relId((value as { id: unknown }).id);
  }
  return undefined;
}

export async function processCheckout(
  userId: number | string,
  items: CheckoutItemInput[],
  shippingAddress: unknown,
  paymentMethod: 'gateway' | 'wallet' = 'gateway'
): Promise<Order> {
  const payload = await getPayload({ config: configPromise });

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('سبد خرید خالی است.');
  }

  // 1. Validate every line item up front so we fail before touching the DB.
  const parsedItems = items.map((item) => {
    const parseResult = PricingInputSchema.safeParse(item?.config);
    if (!parseResult.success) {
      throw new Error('خطا در اعتبارسنجی پیکربندی محصول.');
    }
    return { input: parseResult.data, artworkId: relId(item?.artworkId) ?? null };
  });

  // 2. Resolve the organization, the active price list and every referenced
  //    catalog entity in a single parallel batch. Previously this issued three
  //    queries *per line item* inside a loop (N+1).
  const productSlugs = [...new Set(parsedItems.map((i) => i.input.productTypeSlug))];
  const turnaroundIds = [...new Set(parsedItems.map((i) => i.input.turnaroundId))];
  const finishingIds = [
    ...new Set(parsedItems.flatMap((i) => i.input.finishing.map((f) => f.id))),
  ];

  const [orgs, priceListDoc, productsRes, turnaroundsRes, finishingsRes] = await Promise.all([
    payload.find({
      collection: 'organizations',
      where: { users: { equals: userId }, status: { equals: 'active' } },
      limit: 1,
      depth: 0,
      pagination: false,
    }),
    getCachedActivePriceList(payload),
    payload.find({
      collection: 'product-types',
      where: { slug: { in: productSlugs } },
      limit: productSlugs.length,
      depth: 0,
      pagination: false,
    }),
    payload.find({
      collection: 'turnaround-options',
      where: { id: { in: turnaroundIds } },
      limit: turnaroundIds.length,
      depth: 0,
      pagination: false,
    }),
    finishingIds.length > 0
      ? payload.find({
          collection: 'finishing-options',
          where: { id: { in: finishingIds } },
          limit: finishingIds.length,
          depth: 0,
          pagination: false,
        })
      : Promise.resolve(null),
  ]);

  if (!priceListDoc) {
    throw new Error('هیچ لیست قیمت فعالی یافت نشد.');
  }

  const organization: Organization | null = orgs.docs[0] ?? null;
  const b2bDiscount = organization?.baseDiscount ?? 0;

  const productBySlug = new Map<string, ProductType>(
    productsRes.docs.map((doc) => [doc.slug, doc])
  );
  const turnaroundById = new Map<string, TurnaroundOption>(
    turnaroundsRes.docs.map((doc) => [String(doc.id), doc])
  );
  const finishingById = new Map<string, FinishingOption>(
    (finishingsRes?.docs ?? []).map((doc) => [String(doc.id), doc])
  );

  const priceList: PriceList = {
    version: priceListDoc.version,
    status: priceListDoc.status,
    validFrom: priceListDoc.validFrom ?? '',
    rows: (priceListDoc.rows ?? []).map((r) => ({
      productType: relId(r.productType) ?? '',
      paperType: relId(r.paperType) ?? '',
      finishingOption: r.finishingOption ? relId(r.finishingOption) : undefined,
      grammage: r.grammage ?? 0,
      sides: r.sides ?? 1,
      basePrice: r.basePrice,
    })),
  };

  // 3. Price every line item in memory (no I/O inside this loop).
  let subtotal = 0;
  let totalDiscount = 0;
  let totalVat = 0;
  let grandTotal = 0;
  const priceSnapshots: Array<{ itemConfig: PricingInput; result: ReturnType<typeof calculatePrice> }> = [];
  const itemsToCreate: Array<{ productTypeId: number; input: PricingInput; artworkId: number | null; unitPrice: number; totalPrice: number }> = [];

  for (const { input, artworkId } of parsedItems) {
    const productType = productBySlug.get(input.productTypeSlug);
    if (!productType) throw new Error('محصول یافت نشد.');

    const turnaround = turnaroundById.get(String(input.turnaroundId));
    if (!turnaround) throw new Error('گزینه زمان تحویل یافت نشد.');

    // Server-side authority: the client-provided tier is always overwritten.
    input.customerTier = organization
      ? { type: 'b2b', discountPercent: b2bDiscount }
      : { type: 'guest', discountPercent: 0 };

    const context: PricingContext = {
      productConfig: {
        id: productType.id,
        slug: productType.slug,
        pricingModel: productType.pricingModel,
        standardProductionDays: productType.standardProductionDays,
        minQuantity: productType.minQuantity ?? 1,
        allowDoubleSided: productType.allowDoubleSided ?? false,
        itemsPerForm: 1000,
        itemsPerSheet: 1,
        minArea: 1,
      },
      turnaroundConfig: {
        id: turnaround.id,
        name: turnaround.name,
        daysToAdd: turnaround.daysToAdd,
        priceMultiplier: turnaround.priceMultiplier,
      },
      finishingConfigs: input.finishing.flatMap((f) => {
        const config = finishingById.get(String(f.id));
        if (!config) return [];
        return [{
          id: config.id,
          name: config.name,
          calculationType: config.calculationType,
          minCost: config.minCost ?? 0,
        }];
      }),
    };

    const result = calculatePrice(input, priceList, context);

    subtotal += result.subtotal;
    totalDiscount += result.discount;
    totalVat += result.vat;
    grandTotal += result.total;

    priceSnapshots.push({ itemConfig: input, result });
    itemsToCreate.push({
      productTypeId: productType.id,
      input,
      artworkId,
      unitPrice: Math.round(result.subtotal / input.quantity),
      totalPrice: result.total,
    });
  }

  const finalTotal = grandTotal;

  // 4. Credit check happens before any write so a failed wallet payment does
  //    not leave orphaned order-items behind.
  if (paymentMethod === 'wallet') {
    if (!organization) throw new Error('کاربر به سازمانی متصل نیست و امکان خرید اعتباری ندارد.');
    const availableCredit = (organization.balance ?? 0) + (organization.creditLimit ?? 0);
    if (availableCredit < finalTotal) {
      throw new Error(
        `اعتبار کافی نیست. حداکثر قدرت خرید شما: ${new Intl.NumberFormat('fa-IR').format(availableCredit)} ریال`
      );
    }
  }

  const orderNumber = await nextOrderNumber(payload);

  // 5. Create the order-items in parallel, then the order that owns them.
  const createdItems = await Promise.all(
    itemsToCreate.map((item) =>
      payload.create({
        collection: 'order-items',
        depth: 0,
        data: {
          productType: item.productTypeId,
          configuration: item.input,
          quantity: item.input.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          artwork: item.artworkId,
          itemStatus: 'pending',
        },
      })
    )
  );

  if (paymentMethod === 'wallet' && organization) {
    try {
      await payload.create({
        collection: 'credit-transactions',
        depth: 0,
        data: {
          organization: organization.id,
          amount: finalTotal,
          type: 'deduct',
          notes: `پرداخت هزینه سفارش ${orderNumber}`,
        },
      });
    } catch (err) {
      // The atomic credit guard in the transaction hook refused the deduction
      // (raced balance). Remove the items we just created so no orphans remain.
      await Promise.all(
        createdItems.map((item) =>
          payload.delete({ collection: 'order-items', id: item.id })
        )
      );
      throw err;
    }
  }

  return payload.create({
    collection: 'orders',
    depth: 0,
    data: {
      orderNumber,
      customer: relId(userId)!,
      status: paymentMethod === 'wallet' ? 'paid' : 'awaiting_payment',
      items: createdItems.map((doc) => doc.id),
      totals: {
        subtotal,
        discount: totalDiscount,
        vat: totalVat,
        shipping: 0,
        total: finalTotal,
      },
      priceSnapshot: priceSnapshots,
      priceListVersion: priceList.version,
      shippingAddress: (shippingAddress as Record<string, unknown>) ?? {},
      shippingMethod: 'standard',
    },
  });
}
