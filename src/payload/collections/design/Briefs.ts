import type { CollectionConfig } from 'payload'

export const Briefs: CollectionConfig = {
  slug: 'briefs',
  labels: { singular: 'بریف طراحی', plural: 'بریف‌های طراحی' },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator', 'designer'].includes(user.role)) return true
      return { customer: { equals: user.id } }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true },
    { name: 'projectType', type: 'text', required: true },
    { name: 'answers', type: 'json', required: true },
  ],
}
