import type { CollectionConfig } from 'payload'

export const PreflightRules: CollectionConfig = {
  slug: 'preflight-rules',
  labels: { singular: 'قانون پیش‌ازچاپ (Preflight)', plural: 'قوانین پیش‌ازچاپ' },
  admin: { useAsTitle: 'name', group: 'کاتالوگ' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'نام قانون (مثال: کارت ویزیت استاندارد)' },
    { 
      name: 'productType', 
      type: 'relationship', 
      relationTo: 'product-types',
      required: true,
      label: 'مربوط به محصول'
    },
    {
      type: 'group',
      name: 'dimensions',
      label: 'ابعاد استاندارد',
      fields: [
        { name: 'widthMm', type: 'number', required: true, label: 'عرض (میلی‌متر)' },
        { name: 'heightMm', type: 'number', required: true, label: 'ارتفاع (میلی‌متر)' },
        { name: 'bleedMm', type: 'number', required: true, defaultValue: 2, label: 'بلید / حاشیه برش (میلی‌متر)' },
        { name: 'toleranceMm', type: 'number', required: true, defaultValue: 1, label: 'خطای مجاز ابعاد (میلی‌متر)' },
      ],
    },
    {
      type: 'group',
      name: 'quality',
      label: 'الزامات کیفیت',
      fields: [
        { name: 'minResolutionDpi', type: 'number', defaultValue: 300, label: 'حداقل رزولوشن (DPI)' },
        { name: 'allowRgb', type: 'checkbox', defaultValue: false, label: 'اجازه چاپ فایل RGB (با هشدار)' },
        { name: 'requirePdfX', type: 'checkbox', defaultValue: false, label: 'الزام به فرمت PDF/X' },
      ],
    },
    { 
      name: 'active', 
      type: 'checkbox', 
      defaultValue: true, 
      label: 'فعال' 
    }
  ],
}
