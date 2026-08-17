import type { CollectionConfig } from 'payload'
// Preflight runs natively inside the upload route (see src/app/api/upload-artwork).

export const Artworks: CollectionConfig = {
  slug: 'artworks',
  labels: { singular: 'فایل طراحی', plural: 'فایل‌های طراحی' },
  upload: {
    staticDir: '../../private/artworks',
    mimeTypes: ['application/pdf', 'image/*', 'application/zip'],
    disableLocalStorage: false, 
  },
  access: {
    // Only owner, admin, or operator can read
    read: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator'].includes(user.role)) return true
      return { owner: { equals: user.id } }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (['admin', 'operator'].includes(user.role)) return true
      return { owner: { equals: user.id } }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'owner', type: 'relationship', relationTo: 'users', required: true, admin: { position: 'sidebar' } },
    { name: 'originalName', type: 'text', required: true },
    { name: 'fileHash', type: 'text', index: true },
    { name: 'virusScanStatus', type: 'select', options: ['pending', 'clean', 'infected'], defaultValue: 'pending' },
    { name: 'preflightResult', type: 'json' },
    { name: 'previewPath', type: 'text' },
  ],
}
