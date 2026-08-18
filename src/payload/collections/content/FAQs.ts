import type { CollectionConfig } from 'payload'
import { adminOnly, publicRead } from '../../access'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'سوال متداول', plural: 'سوالات متداول' },
  admin: { useAsTitle: 'question' },
  access: {
    read: publicRead,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'question', type: 'text', required: true, label: 'سوال' },
    { name: 'answer', type: 'richText', required: true, label: 'پاسخ' },
    { name: 'category', type: 'text' },
  ],
}
