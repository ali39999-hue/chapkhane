import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'fullName', 'role', 'organization'],
  },
  auth: true,
  access: {
    // Users may read and edit only themselves; staff can manage everyone.
    read: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator'].includes(user.role)) return true
      return { id: { equals: user.id } }
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
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
