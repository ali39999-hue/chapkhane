import type { CollectionConfig } from 'payload'
import { adminOnly, publicRead } from '../../access'

export const TurnaroundOptions: CollectionConfig = {
  slug: 'turnaround-options',
  labels: { singular: 'زمان تحویل', plural: 'زمان‌های تحویل' },
  admin: { useAsTitle: 'name' },
  access: {
    read: publicRead,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'عنوان (مثلاً فوری)' },
    { name: 'daysToAdd', type: 'number', required: true, label: 'روز کاری اضافه/کم شده' },
    { name: 'priceMultiplier', type: 'number', required: true, defaultValue: 1, label: 'ضریب قیمت (مثلاً 1.2)' },
  ],
}
