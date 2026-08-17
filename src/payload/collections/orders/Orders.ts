import type { CollectionConfig } from 'payload'
import { isValidTransition, OrderStatus } from '../../../modules/workflow/state-machine'
import { dispatchOrderToCourier } from '../../../modules/shipping/service'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'سفارش', plural: 'سفارشات' },
  admin: { useAsTitle: 'orderNumber' },
  // Speeds up the production Kanban board and the portal order list, which both
  // filter on `status` and sort by `createdAt`.
  indexes: [{ fields: ['status', 'createdAt'] }, { fields: ['customer', 'createdAt'] }],
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator'].includes(user.role)) return true
      return { customer: { equals: user.id } }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator'].includes(user.role)) return true
      return { customer: { equals: user.id } }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req, operation }) => {
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
            
            // Format: INV-YYYYMMDD-XXXX
            const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const serialNumber = `INV-${dateStr}-${randomCode}`;

            await req.payload.create({
              collection: 'invoices',
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
              
              // We use update with req.payload.update so it doesn't trigger hooks again infinitely if configured correctly, 
              // but to be safe, payload update triggers afterChange. Since status doesn't change here, it's fine.
              await req.payload.update({
                collection: 'orders',
                id: doc.id,
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
    { name: 'orderNumber', type: 'text', unique: true, required: true },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true },
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
    },
    { name: 'items', type: 'relationship', relationTo: 'order-items', hasMany: true },
    {
      type: 'group',
      name: 'totals',
      fields: [
        { name: 'subtotal', type: 'number', required: true, defaultValue: 0 },
        { name: 'discount', type: 'number', required: true, defaultValue: 0 },
        { name: 'vat', type: 'number', required: true, defaultValue: 0 },
        { name: 'shipping', type: 'number', required: true, defaultValue: 0 },
        { name: 'total', type: 'number', required: true, defaultValue: 0 },
      ],
    },
    { name: 'priceSnapshot', type: 'json' },
    { name: 'priceListVersion', type: 'text' },
    { name: 'shippingAddress', type: 'json' },
    { name: 'shippingMethod', type: 'text' },
    { name: 'shippingProvider', type: 'text' },
    { name: 'trackingCode', type: 'text' },
    { name: 'trackingUrl', type: 'text' },
    { name: 'internalNotes', type: 'textarea', access: { read: ({ req: { user } }) => ['admin', 'operator'].includes(user?.role || '') } },
    { name: 'customerNotes', type: 'textarea' },
  ],
}
