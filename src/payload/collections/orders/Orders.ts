import type { CollectionConfig } from 'payload'
import { isValidTransition, OrderStatus } from '../../../modules/workflow/state-machine'
import { dispatchOrderToCourier } from '../../../modules/shipping/service'
import { nextInvoiceSerial } from '../../../modules/checkout/order-number'
import { adminOnly, authenticated, ownerScoped, staffOnlyField } from '../../access'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'سفارش', plural: 'سفارشات' },
  admin: { useAsTitle: 'orderNumber' },
  // Speeds up the production Kanban board and the portal order list, which both
  // filter on `status` and sort by `createdAt`.
  indexes: [{ fields: ['status', 'createdAt'] }, { fields: ['customer', 'createdAt'] }],
  access: {
    read: ownerScoped('customer'),
    create: authenticated,
    // A customer may reach their own order document, but every field that
    // carries money or drives the workflow is locked to staff below. Without
    // those field guards this rule alone would let a customer PATCH
    // `status: 'paid'` and mint themselves an invoice.
    update: ownerScoped('customer'),
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation === 'update' && data.status && originalDoc.status && data.status !== originalDoc.status) {
          if (!isValidTransition(originalDoc.status as OrderStatus, data.status as OrderStatus)) {
            throw new Error(`تغییر وضعیت از ${originalDoc.status} به ${data.status} مجاز نیست.`);
          }
        }
        return data;
      }
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === 'update' && doc.status !== previousDoc.status && req.payload) {
          await req.payload.create({
            collection: 'audit-logs',
            depth: 0,
            data: {
              action: 'STATUS_CHANGE',
              entity: 'orders',
              entityId: doc.id,
              actor: req.user?.id,
              diff: { from: previousDoc.status, to: doc.status },
              ip: req.headers?.get ? (req.headers.get('x-forwarded-for') || '') : '',
            },
          });

          // Generate Invoice when Paid
          if (doc.status === 'paid' && previousDoc.status !== 'paid') {
            const customerId = typeof doc.customer === 'string' ? doc.customer : doc.customer.id;

            // `serialNumber` is UNIQUE. The previous inline generator used a
            // 4-digit `Math.random()`, which collides within ~100 invoices/day
            // and surfaces as a failed payment transition.
            const serialNumber = await nextInvoiceSerial(req.payload);

            await req.payload.create({
              collection: 'invoices',
              depth: 0,
              data: {
                order: doc.id,
                customer: customerId,
                serialNumber,
                vatAmount: doc.totals?.vat || 0,
                buyerInfo: doc.shippingAddress || {},
              }
            });
          }

          // Generate Tracking Code when Shipped
          if (doc.status === 'shipped' && previousDoc.status !== 'shipped') {
            const method = typeof doc.shippingMethod === 'string' ? doc.shippingMethod : 'post';
            try {
              const shippingData = await dispatchOrderToCourier(doc.orderNumber, doc.shippingAddress, method);

              // `status` is unchanged here, so the guard at the top of this
              // hook short-circuits on the recursive call and there is no loop.
              await req.payload.update({
                collection: 'orders',
                id: doc.id,
                depth: 0,
                data: {
                  shippingProvider: shippingData.courierName,
                  trackingCode: shippingData.trackingCode,
                  trackingUrl: shippingData.trackingUrl,
                }
              });
            } catch (err) {
              console.error("Failed to dispatch order to courier:", err);
            }
          }
        }
      }
    ]
  },
  fields: [
    { name: 'orderNumber', type: 'text', unique: true, required: true, access: { update: staffOnlyField } },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, access: { update: staffOnlyField } },
    {
      name: 'status',
      type: 'select',
      options: [
        'draft', 'awaiting_payment', 'paid', 'file_review', 'needs_customer_action',
        'awaiting_proof', 'proof_approved', 'prepress', 'printing', 'finishing',
        'quality_check', 'ready', 'shipped', 'delivered', 'closed', 'on_hold', 'cancelled', 'refunded'
      ],
      defaultValue: 'draft',
      required: true,
      index: true,
      // Customers must never drive the workflow directly; `awaiting_payment ->
      // paid` is a legal transition, so without this guard a customer could
      // self-promote to paid and trigger invoice generation.
      access: { update: staffOnlyField },
    },
    { name: 'items', type: 'relationship', relationTo: 'order-items', hasMany: true, access: { update: staffOnlyField } },
    {
      type: 'group',
      name: 'totals',
      access: { update: staffOnlyField },
      fields: [
        { name: 'subtotal', type: 'number', required: true, defaultValue: 0 },
        { name: 'discount', type: 'number', required: true, defaultValue: 0 },
        { name: 'vat', type: 'number', required: true, defaultValue: 0 },
        { name: 'shipping', type: 'number', required: true, defaultValue: 0 },
        { name: 'total', type: 'number', required: true, defaultValue: 0 },
      ],
    },
    { name: 'priceSnapshot', type: 'json', access: { read: staffOnlyField, update: staffOnlyField } },
    { name: 'priceListVersion', type: 'text', access: { update: staffOnlyField } },
    { name: 'shippingAddress', type: 'json' },
    { name: 'shippingMethod', type: 'text' },
    { name: 'shippingProvider', type: 'text', access: { update: staffOnlyField } },
    { name: 'trackingCode', type: 'text', access: { update: staffOnlyField } },
    { name: 'trackingUrl', type: 'text', access: { update: staffOnlyField } },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { read: staffOnlyField, update: staffOnlyField },
    },
    { name: 'customerNotes', type: 'textarea' },
  ],
}
