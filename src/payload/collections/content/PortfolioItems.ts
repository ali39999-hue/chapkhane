import type { CollectionConfig } from 'payload'
import { adminOnly, publicRead } from '../../access'

export const PortfolioItems: CollectionConfig = {
  slug: 'portfolio-items',
  labels: { singular: 'نمونه‌کار', plural: 'نمونه‌کارها' },
  admin: { useAsTitle: 'title' },
  access: {
    read: publicRead,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'images', type: 'upload', relationTo: 'public-assets', hasMany: true, required: true },
    { name: 'customer', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'printSpecs', type: 'json', label: 'مشخصات چاپ (کاغذ، عملیات، تیراژ)' },
    { name: 'description', type: 'richText' },
  ],
}
