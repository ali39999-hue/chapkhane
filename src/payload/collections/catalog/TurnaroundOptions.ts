import type { CollectionConfig } from 'payload'

export const TurnaroundOptions: CollectionConfig = {
  slug: 'turnaround-options',
  labels: { singular: 'زمان تحویل', plural: 'زمان‌های تحویل' },
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'عنوان (مثلاً فوری)' },
    { name: 'daysToAdd', type: 'number', required: true, label: 'روز کاری اضافه/کم شده' },
    { name: 'priceMultiplier', type: 'number', required: true, defaultValue: 1, label: 'ضریب قیمت (مثلاً 1.2)' },
  ],
}
