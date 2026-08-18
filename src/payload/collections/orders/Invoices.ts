import type { CollectionConfig } from 'payload'
import { adminOnly, ownerScoped, staffOnly } from '../../access'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  labels: { singular: 'فاکتور', plural: 'فاکتورها' },
  access: {
    read: ownerScoped('customer'),
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'serialNumber', type: 'text', unique: true, required: true },
    { name: 'vatAmount', type: 'number', required: true },
    { name: 'buyerInfo', type: 'json', required: true },
    { name: 'pdfPath', type: 'text' },
  ],
}
