import type { CollectionConfig } from 'payload'
import { adminOnly, publicRead } from '../../access'

export const DesignPackages: CollectionConfig = {
  slug: 'design-packages',
  labels: { singular: 'پکیج طراحی', plural: 'پکیج‌های طراحی' },
  admin: { useAsTitle: 'name' },
  access: {
    read: publicRead,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'نام پکیج' },
    { name: 'price', type: 'number', required: true, label: 'قیمت پایه' },
    { name: 'revisions', type: 'number', required: true, label: 'تعداد راند اصلاح رایگان' },
    { name: 'deliveryTime', type: 'number', required: true, label: 'زمان تحویل (روز)' },
    { name: 'deliverables', type: 'textarea', label: 'تحویل‌دادنی‌ها (Deliverables)' },
  ],
}
