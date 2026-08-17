import type { CollectionConfig } from 'payload'

export const Templates: CollectionConfig = {
  slug: 'templates',
  labels: { singular: 'قالب آماده', plural: 'قالب‌های آماده' },
  admin: { useAsTitle: 'name', group: 'Content' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'نام قالب' },
    { name: 'slug', type: 'text', required: true, unique: true },
    { 
      name: 'category', 
      type: 'select', 
      options: ['کارت ویزیت', 'تراکت', 'سربرگ', 'فاکتور', 'پاکت'],
      required: true,
      label: 'دسته‌بندی'
    },
    { name: 'productType', type: 'relationship', relationTo: 'product-types', label: 'محصول مرتبط (اختیاری)' },
    { name: 'description', type: 'textarea', label: 'توضیحات' },
    { name: 'previewImage', type: 'upload', relationTo: 'public-assets', required: true, label: 'تصویر پیش‌نمایش' },
    { name: 'downloadFile', type: 'upload', relationTo: 'public-assets', required: true, label: 'فایل لایه باز (PSD, AI, CDR)' },
    { name: 'isActive', type: 'checkbox', defaultValue: true, index: true, label: 'فعال' },
  ],
}
