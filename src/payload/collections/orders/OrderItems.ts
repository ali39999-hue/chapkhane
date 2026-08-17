import type { CollectionConfig } from 'payload'

export const OrderItems: CollectionConfig = {
  slug: 'order-items',
  labels: { singular: 'آیتم سفارش', plural: 'آیتم‌های سفارش' },
  access: {
    // Customers read their items through the parent order (server-side population).
    // Direct REST reads are restricted to staff to prevent cross-user data leaks.
    read: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator'].includes(user.role)) return true
      return false
    },
    create: ({ req: { user } }) => ['admin', 'operator'].includes(user?.role || ''),
    update: ({ req: { user } }) => ['admin', 'operator'].includes(user?.role || ''),
    delete: ({ req: { user } }) => user?.role === 'admin',
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
    { name: 'itemStatus', type: 'text' },
  ],
}
