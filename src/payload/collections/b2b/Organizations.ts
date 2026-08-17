import type { CollectionConfig } from 'payload'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  labels: { singular: 'سازمان (B2B)', plural: 'سازمان‌ها (B2B)' },
  admin: { useAsTitle: 'name' },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator'].includes(user.role)) return true
      return { users: { equals: user.id } }
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'taxId', type: 'text' },
    { name: 'creditLimit', type: 'number', defaultValue: 0 },
    { name: 'balance', type: 'number', defaultValue: 0 },
    { name: 'baseDiscount', type: 'number', defaultValue: 0 },
    { name: 'users', type: 'relationship', relationTo: 'users', hasMany: true },
    { name: 'status', type: 'select', options: ['active', 'suspended'], defaultValue: 'active', index: true },
  ],
}
