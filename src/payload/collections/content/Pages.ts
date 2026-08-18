import type { CollectionConfig } from 'payload'
import { adminOnly, publicRead } from '../../access'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'صفحه', plural: 'صفحات' },
  admin: { useAsTitle: 'title' },
  access: {
    read: publicRead,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'content', type: 'richText' }, // In a real app this would use blocks
    { name: 'metaTitle', type: 'text' },
    { name: 'metaDescription', type: 'textarea' },
  ],
}
