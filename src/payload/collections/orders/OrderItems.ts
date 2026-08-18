import type { CollectionConfig } from 'payload'
import { adminOnly, staffOnly } from '../../access'

export const OrderItems: CollectionConfig = {
  slug: 'order-items',
  labels: { singular: 'آیتم سفارش', plural: 'آیتم‌های سفارش' },
  access: {
    // Customers read their items through the parent order (server-side population).
    // Direct REST reads are restricted to staff to prevent cross-user data leaks.
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'productType', type: 'relationship', relationTo: 'product-types', required: true },
    { name: 'configuration', type: 'json', required: true, label: 'پیکربندی انتخاب شده' },
    { name: 'quantity', type: 'number', required: true },
    { name: 'unitPrice', type: 'number', required: true },
    { name: 'totalPrice', type: 'number', required: true },
    { name: 'artwork', type: 'relationship', relationTo: 'artworks' },
    { name: 'designProject', type: 'relationship', relationTo: 'design-projects' },
    { name: 'proofs', type: 'relationship', relationTo: 'proofs', hasMany: true },
    {
      name: 'itemStatus',
      type: 'select',
      // Was an unconstrained `text` field, so `POST /api/order-items/:id/status`
      // could write any string into the production pipeline.
      options: [
        'pending',
        'prepress',
        'printing',
        'finishing',
        'quality_check',
        'ready',
        'done',
        'on_hold',
        'cancelled',
      ],
      defaultValue: 'pending',
      index: true,
    },
  ],
}

