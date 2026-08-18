import type { CollectionConfig } from 'payload'
import { adminOnly, isStaffRole } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'fullName', 'role', 'organization'],
  },
  auth: {
    // Bounded brute-force protection on the login endpoint, which has no
    // application-level rate limit of its own.
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    // Users may read and edit only themselves; staff can manage everyone.
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isStaffRole(user.role)) return true
      return { id: { equals: user.id } }
    },
    create: adminOnly,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    delete: adminOnly,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Operator', value: 'operator' },
        { label: 'Designer', value: 'designer' },
        { label: 'Customer', value: 'customer' },
        { label: 'B2B', value: 'b2b' },
      ],
      required: true,
      defaultValue: 'customer',
      index: true,
      // Only admins may change roles; otherwise a customer could self-promote
      // via the REST API using their own update permission.
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'fullName',
      type: 'text',
      label: 'نام و نام خانوادگی',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'شماره تماس',
      index: true,
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      admin: {
        condition: (data) => data.role === 'b2b' || data.role === 'admin',
      },
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
}
