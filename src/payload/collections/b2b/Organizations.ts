import type { CollectionConfig } from 'payload'
import { adminOnly, ownerScoped } from '../../access'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  labels: { singular: 'سازمان (B2B)', plural: 'سازمان‌ها (B2B)' },
  admin: { useAsTitle: 'name' },
  access: {
    // Members read their own organization; only admins may touch credit terms.
    read: ownerScoped('users'),
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'taxId', type: 'text' },
    { name: 'creditLimit', type: 'number', defaultValue: 0 },
    { name: 'balance', type: 'number', defaultValue: 0 },
    { name: 'baseDiscount', type: 'number', defaultValue: 0 },
    { name: 'users', type: 'relationship', relationTo: 'users', hasMany: true, index: true },
    { name: 'status', type: 'select', options: ['active', 'suspended'], defaultValue: 'active', index: true },
  ],
}
