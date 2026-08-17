import type { CollectionConfig } from 'payload'

export const Quotes: CollectionConfig = {
  slug: 'quotes',
  labels: { singular: 'استعلام', plural: 'استعلام‌ها' },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator'].includes(user.role)) return true
      return { customer: { equals: user.id } }
    },
    create: () => true, // Publicly creatable
    update: ({ req: { user } }) => ['admin', 'operator'].includes(user?.role || ''),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users' },
    { name: 'contactInfo', type: 'json' },
    { name: 'requestDetails', type: 'textarea', required: true },
    { name: 'attachments', type: 'relationship', relationTo: 'artworks', hasMany: true },
    { name: 'proposedPrice', type: 'number' },
    { name: 'adminNotes', type: 'textarea' },
    { name: 'expiryDate', type: 'date' },
    { name: 'status', type: 'select', options: ['pending', 'answered', 'converted', 'expired'], defaultValue: 'pending' },
  ],
}
