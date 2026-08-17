import type { CollectionConfig } from 'payload'

export const PortfolioItems: CollectionConfig = {
  slug: 'portfolio-items',
  labels: { singular: 'نمونه‌کار', plural: 'نمونه‌کارها' },
  admin: { useAsTitle: 'title' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
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
