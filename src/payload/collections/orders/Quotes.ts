import type { CollectionConfig } from 'payload'
import { adminOnly, authenticated, ownerScoped, staffOnly, staffOnlyField } from '../../access'

export const Quotes: CollectionConfig = {
  slug: 'quotes',
  labels: { singular: 'استعلام', plural: 'استعلام‌ها' },
  access: {
    read: ownerScoped('customer'),
    // Was `() => true`. Anonymous creation let a caller attach arbitrary
    // `artworks` IDs and spam the queue with no rate limit or captcha.
    // Requiring a session is the minimum; the `attachments` field is staff-only
    // so a request cannot reference someone else's file either way.
    create: authenticated,
    update: staffOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users', index: true, access: { update: staffOnlyField } },
    { name: 'contactInfo', type: 'json' },
    { name: 'requestDetails', type: 'textarea', required: true },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'artworks',
      hasMany: true,
      access: { update: staffOnlyField },
    },
    { name: 'proposedPrice', type: 'number', access: { update: staffOnlyField } },
    { name: 'adminNotes', type: 'textarea', access: { read: staffOnlyField, update: staffOnlyField } },
    { name: 'expiryDate', type: 'date', access: { update: staffOnlyField } },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'answered', 'converted', 'expired'],
      defaultValue: 'pending',
      index: true,
      access: { update: staffOnlyField },
    },
  ],
}
