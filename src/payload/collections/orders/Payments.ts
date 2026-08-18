import type { CollectionConfig } from 'payload'
import { adminOnly, ownerScoped, staffOnly } from '../../access'

export const Payments: CollectionConfig = {
  slug: 'payments',
  labels: { singular: 'پرداخت', plural: 'پرداخت‌ها' },
  access: {
    read: ownerScoped('customer'),
    // Was `!!user`, which let a customer forge a `status: 'success'` payment row
    // to match a self-promoted order. Payments are written exclusively by the
    // verify route through the Local API (access overridden).
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'amount', type: 'number', required: true },
    { name: 'provider', type: 'text', required: true },
    { name: 'refId', type: 'text', index: true },
    { name: 'status', type: 'select', options: ['pending', 'success', 'failed', 'refunded'], defaultValue: 'pending', index: true },
    { name: 'idempotencyKey', type: 'text', unique: true, required: true },
    { name: 'rawPayload', type: 'json' },
  ],
}
