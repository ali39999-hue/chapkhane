import type { Access, CollectionConfig, Where } from 'payload'
import { adminOnly, authenticated, isStaffRole, staffOnlyField } from '../../access'

const scopeForUser = (user: { id: number | string; role?: unknown }): Where =>
  user.role === 'designer'
    ? { designer: { equals: user.id } }
    : { customer: { equals: user.id } }

const readAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isStaffRole(user.role)) return true
  return scopeForUser(user)
}

/**
 * Was `!!user`, which let any logged-in account reassign the designer or swap
 * the deliverables on any project. Customers reach only their own project, and
 * the fields that matter are staff-only below; the `submitFeedback` action
 * performs the real mutations through the Local API.
 */
const updateAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isStaffRole(user.role)) return true
  return scopeForUser(user)
}

export const DesignProjects: CollectionConfig = {
  slug: 'design-projects',
  labels: { singular: 'پروژه طراحی', plural: 'پروژه‌های طراحی' },
  access: {
    read: readAccess,
    create: authenticated,
    update: updateAccess,
    delete: adminOnly,
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, access: { update: staffOnlyField } },
    { name: 'designer', type: 'relationship', relationTo: 'users', access: { update: staffOnlyField } },
    { name: 'package', type: 'relationship', relationTo: 'design-packages', required: true, access: { update: staffOnlyField } },
    { name: 'orderItem', type: 'relationship', relationTo: 'order-items', access: { update: staffOnlyField } },
    { name: 'brief', type: 'json' },
    {
      name: 'rounds',
      type: 'array',
      access: { update: staffOnlyField },
      fields: [
        { name: 'files', type: 'relationship', relationTo: 'artworks', hasMany: true },
        { name: 'feedback', type: 'textarea' },
      ],
    },
    { name: 'deliverables', type: 'relationship', relationTo: 'artworks', hasMany: true, access: { update: staffOnlyField } },
    { name: 'status', type: 'select', options: ['brief_submitted', 'in_design', 'awaiting_feedback', 'revision', 'final_approval', 'delivered'], defaultValue: 'brief_submitted', index: true, access: { update: staffOnlyField } },
    { name: 'finalApprovalSignature', type: 'textarea', access: { update: staffOnlyField } },
  ],
}
