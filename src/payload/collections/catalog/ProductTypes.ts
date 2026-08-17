import type { CollectionConfig } from 'payload'

export const ProductTypes: CollectionConfig = {
  slug: 'product-types',
  labels: { singular: 'نوع محصول', plural: 'انواع محصول' },
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'نام فارسی' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'printMethod', type: 'relationship', relationTo: 'print-methods', required: true },
    { name: 'allowedSizes', type: 'relationship', relationTo: 'print-sizes', hasMany: true },
    { name: 'allowedPapers', type: 'relationship', relationTo: 'paper-types', hasMany: true },
    { name: 'allowedFinishings', type: 'relationship', relationTo: 'finishing-options', hasMany: true },
    {
      name: 'pricingModel',
      type: 'select',
      options: [
        { label: 'جدول تیراژ/پله‌ای (tier)', value: 'tier' },
        { label: 'بر اساس مساحت (area)', value: 'area' },
        { label: 'ورقی/دیجیتال (perSheet)', value: 'perSheet' },
        { label: 'استعلامی (rfq)', value: 'rfq' },
      ],
      required: true,
    },
    { name: 'minQuantity', type: 'number', defaultValue: 1 },
    { 
      name: 'quantityTiers', 
      type: 'array', 
      label: 'پله‌های تیراژ مجاز', 
      fields: [{ name: 'quantity', type: 'number', required: true }] 
    },
    { name: 'allowDoubleSided', type: 'checkbox', defaultValue: false, label: 'امکان چاپ دورو دارد؟' },
    { name: 'standardProductionDays', type: 'number', required: true, label: 'زمان تولید استاندارد (روز کاری)' },
    { name: 'seoContent', type: 'richText', label: 'محتوای سئو' },
    { name: 'images', type: 'upload', relationTo: 'public-assets', hasMany: true },
  ],
}
