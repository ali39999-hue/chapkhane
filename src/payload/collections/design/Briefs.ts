import type { Access, CollectionConfig } from 'payload'
import { adminOnly, authenticated, isStaffRole } from '../../access'

const readAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isStaffRole(user.role) || user.role === 'designer') return true
  return { customer: { equals: user.id } }
}

export const Briefs: CollectionConfig = {
  slug: 'briefs',
  labels: { singular: 'بریف طراحی', plural: 'بریف‌های طراحی' },
  access: {
    read: readAccess,
    create: authenticated,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'projectType', type: 'text', required: true },
    { name: 'answers', type: 'json', required: true },
  ],
}
