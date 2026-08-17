import type { CollectionConfig } from 'payload'

export const Proofs: CollectionConfig = {
  slug: 'proofs',
  labels: { singular: 'پروف (پیش‌نمایش)', plural: 'پروف‌ها' },
  upload: {
    staticDir: '../../private/proofs',
    mimeTypes: ['image/*', 'application/pdf'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator'].includes(user.role)) return true
      return { customer: { equals: user.id } }
    },
    create: ({ req: { user } }) => ['admin', 'operator'].includes(user?.role || ''),
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'orderItem', type: 'relationship', relationTo: 'order-items', required: true },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true },
    { name: 'version', type: 'number', required: true, defaultValue: 1 },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'rejected'],
      defaultValue: 'pending',
      index: true,
    },
    { name: 'customerFeedback', type: 'textarea' },
    { name: 'approvalDate', type: 'date' },
    { name: 'approvalIp', type: 'text' },
    { name: 'signedAgreementText', type: 'textarea' },
  ],
}
