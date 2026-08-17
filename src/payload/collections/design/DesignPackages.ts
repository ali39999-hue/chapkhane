import type { CollectionConfig } from 'payload'

export const DesignPackages: CollectionConfig = {
  slug: 'design-packages',
  labels: { singular: 'پکیج طراحی', plural: 'پکیج‌های طراحی' },
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'نام پکیج' },
    { name: 'price', type: 'number', required: true, label: 'قیمت پایه' },
    { name: 'revisions', type: 'number', required: true, label: 'تعداد راند اصلاح رایگان' },
    { name: 'deliveryTime', type: 'number', required: true, label: 'زمان تحویل (روز)' },
    { name: 'deliverables', type: 'textarea', label: 'تحویل‌دادنی‌ها (Deliverables)' },
  ],
}
