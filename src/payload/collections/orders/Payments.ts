import type { CollectionConfig } from 'payload'

export const Payments: CollectionConfig = {
  slug: 'payments',
  labels: { singular: 'پرداخت', plural: 'پرداخت‌ها' },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator'].includes(user.role)) return true
      return { customer: { equals: user.id } }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => ['admin', 'operator'].includes(user?.role || ''),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true },
    { name: 'amount', type: 'number', required: true },
    { name: 'provider', type: 'text', required: true },
    { name: 'refId', type: 'text' },
    { name: 'status', type: 'select', options: ['pending', 'success', 'failed', 'refunded'], defaultValue: 'pending' },
    { name: 'idempotencyKey', type: 'text', unique: true, required: true },
    { name: 'rawPayload', type: 'json' },
  ],
}
