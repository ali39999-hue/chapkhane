import type { CollectionConfig } from 'payload'

export const FinishingOptions: CollectionConfig = {
  slug: 'finishing-options',
  labels: { singular: 'عملیات تکمیلی', plural: 'عملیات تکمیلی' },
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'نام فارسی' },
    { name: 'code', type: 'text', required: true, unique: true, label: 'کد سیستم' },
    {
      name: 'calculationType',
      type: 'select',
      options: [
        { label: 'بر اساس فرم (perForm)', value: 'perForm' },
        { label: 'بر اساس عدد (perUnit)', value: 'perUnit' },
        { label: 'بر اساس متر مربع (perSquareMeter)', value: 'perSquareMeter' },
        { label: 'هزینه ثابت (flat)', value: 'flat' },
      ],
      required: true,
    },
    { name: 'minCost', type: 'number', defaultValue: 0, label: 'حداقل هزینه (ریال)' },
    { name: 'requiresDieLayer', type: 'checkbox', defaultValue: false, label: 'نیاز به لایه دایکات (Die) در فایل دارد؟' },
    { name: 'description', type: 'textarea', label: 'توضیح فارسی' },
    { name: 'exampleImage', type: 'upload', relationTo: 'public-assets', label: 'تصویر نمونه' },
    { name: 'active', type: 'checkbox', defaultValue: true, index: true },
  ],
}
