import type { CollectionConfig } from 'payload'

export const PrintMethods: CollectionConfig = {
  slug: 'print-methods',
  labels: { singular: 'روش چاپ', plural: 'روش‌های چاپ' },
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'عنوان نمایشی' },
    {
      name: 'method',
      type: 'select',
      options: [
        { label: 'دیجیتال (Digital)', value: 'digital' },
        { label: 'افست (Offset)', value: 'offset' },
        { label: 'لارج فرمت عریض (Large Format)', value: 'largeFormat' },
      ],
      required: true,
      unique: true,
    },
    { name: 'minQuantity', type: 'number', label: 'حداقل تیراژ مجاز' },
    { name: 'maxQuantity', type: 'number', label: 'حداکثر تیراژ مجاز' },
  ],
}
