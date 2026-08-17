import type { Access, CollectionConfig, Where } from 'payload'

const readAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (['admin', 'operator'].includes(user.role)) return true
  const scope: Where =
    user.role === 'designer'
      ? { designer: { equals: user.id } }
      : { customer: { equals: user.id } }
  return scope
}

export const DesignProjects: CollectionConfig = {
  slug: 'design-projects',
  labels: { singular: 'پروژه طراحی', plural: 'پروژه‌های طراحی' },
  access: {
    read: readAccess,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user, // Granular control needed via field access or hooks
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true },
    { name: 'designer', type: 'relationship', relationTo: 'users' },
    { name: 'package', type: 'relationship', relationTo: 'design-packages', required: true },
    { name: 'orderItem', type: 'relationship', relationTo: 'order-items' },
    { name: 'brief', type: 'json' },
    { name: 'rounds', type: 'array', fields: [{ name: 'files', type: 'relationship', relationTo: 'artworks', hasMany: true }, { name: 'feedback', type: 'textarea' }] },
    { name: 'deliverables', type: 'relationship', relationTo: 'artworks', hasMany: true },
    { name: 'status', type: 'select', options: ['brief_submitted', 'in_design', 'awaiting_feedback', 'revision', 'final_approval', 'delivered'], defaultValue: 'brief_submitted', index: true },
    { name: 'finalApprovalSignature', type: 'textarea' },
  ],
}
