import type { CollectionConfig } from 'payload'
import { adminOnly, publicRead } from '../../access'

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
    read: publicRead,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'alt', type: 'text', label: 'متن جایگزین (Alt)' },
  ],
}
