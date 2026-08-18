import type { CollectionConfig } from 'payload'
import { adminOnly, publicRead } from '../../access'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'مقاله', plural: 'مقالات' },
  admin: { useAsTitle: 'title' },
  access: {
    read: publicRead,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true },
    { name: 'content', type: 'richText', required: true },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    { name: 'publishedDate', type: 'date' },
    { name: 'coverImage', type: 'upload', relationTo: 'public-assets' },
  ],
}
