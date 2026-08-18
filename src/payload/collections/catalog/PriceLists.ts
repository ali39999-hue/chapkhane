import type { CollectionConfig } from 'payload'
import { invalidatePriceListCache } from '../../../modules/pricing/cache'
import { adminOnly, staffOnly } from '../../access'

export const PriceLists: CollectionConfig = {
  slug: 'price-lists',
  labels: { singular: 'لیست قیمت', plural: 'لیست‌های قیمت' },
  admin: { useAsTitle: 'version' },
  access: {
    // Was `() => true`, which published the entire internal tariff (every
    // `basePrice`) at `GET /api/price-lists`. The pricing engine reads this
    // through the Local API, which ignores access control anyway, so public
    // read bought nothing.
    read: staffOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    afterChange: [
      () => {
        invalidatePriceListCache()
      },
    ],
    afterDelete: [
      () => {
        invalidatePriceListCache()
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req, operation }) => {
        // Prevent editing an already active list unless archiving
        if (operation === 'update' && originalDoc.status === 'active') {
          if (data.status !== 'archived') {
            throw new Error('ویرایش لیست قیمت فعال مجاز نیست. لطفاً یک نسخه جدید (Draft) بسازید.');
          }
        }

        // Auto-archive previous active list when a new one is activated
        if (data.status === 'active' && originalDoc?.status !== 'active') {
          await req.payload.update({
            collection: 'price-lists',
            where: {
              and: [
                { status: { equals: 'active' } },
                { id: { not_equals: originalDoc?.id || data.id } }
              ]
            },
            data: { status: 'archived' }
          });
        }
        return data;
      }
    ]
  },
  fields: [
    { name: 'version', type: 'text', required: true, unique: true },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'active', 'archived'],
      defaultValue: 'draft',
      required: true,
      index: true,
    },
    { name: 'validFrom', type: 'date', required: true },
    {
      name: 'rows',
      type: 'array',
      label: 'ردیف‌های قیمت',
      fields: [
        { name: 'productType', type: 'relationship', relationTo: 'product-types' },
        { name: 'paperType', type: 'relationship', relationTo: 'paper-types' },
        { name: 'finishingOption', type: 'relationship', relationTo: 'finishing-options' },
        { name: 'grammage', type: 'number' },
        { name: 'sides', type: 'number', min: 1, max: 2 },
        { name: 'basePrice', type: 'number', required: true, label: 'قیمت پایه (ریال)' },
      ],
    },
    { name: 'notes', type: 'textarea' },
  ],
}
