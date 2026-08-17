import type { CollectionConfig } from 'payload'

export const PublicAssets: CollectionConfig = {
  slug: 'public-assets',
  labels: { singular: 'رسانه عمومی', plural: 'رسانه‌های عمومی' },
  upload: {
    staticDir: '../../public/media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'alt', type: 'text', label: 'متن جایگزین (Alt)' },
  ],
}
