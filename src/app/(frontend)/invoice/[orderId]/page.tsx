import { notFound } from "next/navigation";
import { InvoiceClient, type InvoiceView } from "./InvoiceClient";
import { requireUser, isStaff } from "@/lib/auth";
import { relationId } from "@/lib/relations";

// `requireUser()` reads headers, which already opts this route out of static
// rendering; declared explicitly to match the other private routes.
export const dynamic = "force-dynamic";

/** `configuration` is a `json` column, typed as `unknown` by Payload. */
function configuredSize(configuration: unknown): { width?: number; height?: number } | null {
  if (typeof configuration !== "object" || configuration === null) return null;
  const size = (configuration as { size?: unknown }).size;
  if (typeof size !== "object" || size === null) return null;
  const { width, height } = size as { width?: unknown; height?: unknown };
  return {
    width: typeof width === "number" ? width : undefined,
    height: typeof height === "number" ? height : undefined,
  };
}

export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const [{ orderId }, { payload, user }] = await Promise.all([params, requireUser()]);

  // `findByID` rather than a `find` with an id filter.
  const order = await payload
    .findByID({
      collection: 'orders',
      id: orderId,
      depth: 1, // populate items and customer
    })
    .catch(() => null);

  if (!order) return notFound();

  // Financial documents are private: only the owner customer or staff may view.
  if (!isStaff(user) && relationId(order.customer) !== user.id) {
    notFound();
  }

  const items = (order.items ?? []).flatMap((item) =>
    typeof item === "object" && item !== null ? [item] : []
  );

  // The product names live at depth 2. One batched query is cheaper than
  // populating four relationships per line item, and it keeps `priceSnapshot`
  // out of the browser payload.
  const productTypeIds = [
    ...new Set(items.map((item) => relationId(item.productType)).filter((v): v is number => v !== undefined)),
  ];

  const productsRes = productTypeIds.length > 0
    ? await payload.find({
        collection: "product-types",
        where: { id: { in: productTypeIds } },
        limit: productTypeIds.length,
        depth: 0,
        pagination: false,
        select: { name: true },
      })
    : null;

  const productNameById = new Map((productsRes?.docs ?? []).map((p) => [String(p.id), p.name]));

  const customer = order.customer;
  const shippingAddress = (order.shippingAddress ?? {}) as { city?: unknown };

  const view: InvoiceView = {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customerName:
      typeof customer === "object" && customer !== null
        ? customer.fullName || customer.email || "مشتری ناشناس"
        : "مشتری ناشناس",
    customerPhone:
      typeof customer === "object" && customer !== null ? customer.phone || "-" : "-",
    city: typeof shippingAddress.city === "string" ? shippingAddress.city : "تهران",
    items: items.map((item) => {
      const productTypeId = relationId(item.productType);
      const size = configuredSize(item.configuration);
      return {
        id: item.id,
        productName:
          (productTypeId !== undefined ? productNameById.get(String(productTypeId)) : undefined) ??
          "محصول چاپی",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        width: size?.width,
        height: size?.height,
      };
    }),
    totals: {
      subtotal: order.totals?.subtotal ?? 0,
      discount: order.totals?.discount ?? 0,
      vat: order.totals?.vat ?? 0,
      total: order.totals?.total ?? 0,
    },
  };

  return (
    <main id="main-content" className="min-h-screen bg-slate-100 flex justify-center py-10 print:py-0 print:bg-white dir-rtl">
      <InvoiceClient invoice={view} />
    </main>
  );
}
