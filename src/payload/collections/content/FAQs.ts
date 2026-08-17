import type { CollectionConfig } from 'payload'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'سوال متداول', plural: 'سوالات متداول' },
  admin: { useAsTitle: 'question' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'question', type: 'text', required: true, label: 'سوال' },
    { name: 'answer', type: 'richText', required: true, label: 'پاسخ' },
    { name: 'category', type: 'text' },
  ],
}
