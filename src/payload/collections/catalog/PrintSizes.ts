import type { CollectionConfig } from 'payload'

export const PrintSizes: CollectionConfig = {
  slug: 'print-sizes',
  labels: { singular: 'سایز چاپ', plural: 'سایزهای چاپ' },
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'نام فارسی (مثلاً A4)' },
    { name: 'category', type: 'text', label: 'دسته‌بندی (اختیاری)' },
    { 
      type: 'row', 
      fields: [
        { name: 'finalWidth', type: 'number', required: true, label: 'عرض نهایی (mm)' },
        { name: 'finalHeight', type: 'number', required: true, label: 'ارتفاع نهایی (mm)' },
      ]
    },
    { 
      type: 'row', 
      fields: [
        { name: 'defaultBleed', type: 'number', required: true, defaultValue: 3, label: 'بلید پیش‌فرض (mm)' },
        { name: 'safeMargin', type: 'number', required: true, defaultValue: 5, label: 'حاشیه امن (mm)' },
      ]
    }
  ],
}
