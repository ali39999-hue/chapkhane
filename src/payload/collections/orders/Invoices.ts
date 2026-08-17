import type { CollectionConfig } from 'payload'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  labels: { singular: 'فاکتور', plural: 'فاکتورها' },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator'].includes(user.role)) return true
      return { customer: { equals: user.id } }
    },
    create: ({ req: { user } }) => ['admin', 'operator'].includes(user?.role || ''),
    update: ({ req: { user } }) => ['admin', 'operator'].includes(user?.role || ''),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true },
    { name: 'serialNumber', type: 'text', unique: true, required: true },
    { name: 'vatAmount', type: 'number', required: true },
    { name: 'buyerInfo', type: 'json', required: true },
    { name: 'pdfPath', type: 'text' },
  ],
}
