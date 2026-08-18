import { getPayload, type Payload } from 'payload';
import configPromise from '@payload-config';
import type { FinishingOption, Order, Organization, ProductType, TurnaroundOption } from '../../../payload-types';
import { calculatePrice } from '../pricing/engine';
import { ClientPricingInputSchema, PricingContext, PriceList, type PricingInput } from '../pricing/types';
import { getCachedActivePriceList } from '../pricing/cache';
import { nextOrderNumber } from './order-number';
import { relationId } from '../../lib/relations';

/**
 * A checkout failure that is safe to show the customer verbatim.
 *
 * The API route uses this to decide between echoing `error.message` and
 * returning a generic 500, so Postgres constraint text never reaches a client.
 */
export class CheckoutError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'CheckoutError';
    this.status = status;
  }
}

export type CheckoutItemInput = {
  config: unknown;
  artworkId?: number | string | null;
};

/** Uniform relationship-ID reader: relations can arrive populated or as a raw ID. */
function relId(value: unknown): number | undefined {
  const id = relationId(value);
  if (typeof id === 'number') return id;
  if (typeof id === 'string') {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export async function processCheckout(
  userId: number | string,
  items: CheckoutItemInput[],
  shippingAddress: unknown,
  paymentMethod: 'gateway' | 'wallet' = 'gateway',
  options: { payload?: Payload } = {}
): Promise<Order> {
  const payload = options.payload ?? (await getPayload({ config: configPromise }));

  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutError('سبد خرید خالی است.');
  }

  // 1. Validate every line item up front so we fail before touching the DB.
  //    The client-facing schema strips `customerTier`/`couponCode`; both are
  //    server-resolved so a crafted body cannot discount itself.
  const parsedItems = items.map((item) => {
    const parseResult = ClientPricingInputSchema.safeParse(item?.config);
    if (!parseResult.success) {
      throw new CheckoutError('خطا در اعتبارسنجی پیکربندی محصول.');
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
  const artworkIds = [
    ...new Set(parsedItems.map((i) => i.artworkId).filter((id): id is number => id !== null)),
  ];

  const [orgs, priceListDoc, productsRes, turnaroundsRes, finishingsRes, artworksRes] =
    await Promise.all([
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
      // Ownership gate for attached artwork. Without this, a customer could
      // attach any artwork ID to their own order and then read the other
      // customer's file through the populated order detail page.
      artworkIds.length > 0
        ? payload.find({
            collection: 'artworks',
            where: { id: { in: artworkIds }, owner: { equals: userId } },
            limit: artworkIds.length,
            depth: 0,
            pagination: false,
            select: {},
          })
        : Promise.resolve(null),
    ]);

  if (!priceListDoc) {
    throw new CheckoutError('هیچ لیست قیمت فعالی یافت نشد.', 500);
  }

  if (artworkIds.length > 0) {
    const ownedIds = new Set((artworksRes?.docs ?? []).map((doc) => doc.id));
    if (ownedIds.size !== artworkIds.length) {
      throw new CheckoutError('فایل ضمیمه‌شده متعلق به شما نیست یا یافت نشد.', 403);
    }
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

  for (const { input: clientInput, artworkId } of parsedItems) {
    const productType = productBySlug.get(clientInput.productTypeSlug);
    if (!productType) throw new CheckoutError('محصول یافت نشد.', 404);

    const turnaround = turnaroundById.get(String(clientInput.turnaroundId));
    if (!turnaround) throw new CheckoutError('گزینه زمان تحویل یافت نشد.', 404);

    // Server-side authority: the tier is derived from the authenticated user's
    // organization, and no coupon can arrive from the client at all.
    const input: PricingInput = {
      ...clientInput,
      customerTier: organization
        ? { type: 'b2b', discountPercent: b2bDiscount }
        : { type: 'guest', discountPercent: 0 },
    };

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
    if (!organization) throw new CheckoutError('کاربر به سازمانی متصل نیست و امکان خرید اعتباری ندارد.', 403);
    const availableCredit = (organization.balance ?? 0) + (organization.creditLimit ?? 0);
    if (availableCredit < finalTotal) {
      throw new CheckoutError(
        `اعتبار کافی نیست. حداکثر قدرت خرید شما: ${new Intl.NumberFormat('fa-IR').format(availableCredit)} ریال`,
        402
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
