import type { CollectionConfig } from 'payload'

export const PaperTypes: CollectionConfig = {
  slug: 'paper-types',
  labels: { singular: 'نوع کاغذ', plural: 'انواع کاغذ' },
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true, // Publicly readable for configurator
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'نام فارسی' },
    {
      name: 'category',
      type: 'select',
      options: ['تحریر', 'گلاسه', 'کتان', 'کاربن‌لس', 'مقوا', 'PVC', 'بنر'],
      required: true,
      label: 'دسته',
    },
    { 
      name: 'allowedGrammages', 
      type: 'array', 
      label: 'گراماژهای مجاز (g/m2)', 
      fields: [{ name: 'grammage', type: 'number', required: true, min: 40, max: 1000 }] 
    },
    { name: 'color', type: 'text', label: 'رنگ پایه' },
    { name: 'description', type: 'textarea', label: 'توضیح' },
    { name: 'textureImage', type: 'upload', relationTo: 'public-assets', label: 'تصویر بافت' },
    { name: 'active', type: 'checkbox', defaultValue: true, index: true, label: 'فعال' },
  ],
}
