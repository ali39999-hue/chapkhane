import type { CollectionConfig } from 'payload'
import { adminOnly, authenticated, ownerScoped, staffOnlyField } from '../../access'
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
    read: ownerScoped('owner'),
    create: authenticated,
    update: ownerScoped('owner'),
    delete: adminOnly,
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
      access: { update: staffOnlyField },
    },
    { name: 'originalName', type: 'text', required: true },
    { name: 'filename', type: 'text', required: true },
    { name: 'mimeType', type: 'text', required: true },
    { name: 'filesize', type: 'number', required: true },
    { name: 'url', type: 'text', required: true },
    { name: 'fileHash', type: 'text', index: true },
    // Preflight and malware verdicts are machine-produced. They gate whether a
    // file may enter production, so a customer must not be able to write them
    // through the REST API — the narrow `forcePassPreflight` action is the only
    // customer-facing path, and it permits `warning -> pass` only.
    {
      name: 'virusScanStatus',
      type: 'select',
      options: ['pending', 'clean', 'infected'],
      defaultValue: 'pending',
      access: { update: staffOnlyField },
    },
    { name: 'preflightResult', type: 'json', access: { update: staffOnlyField } },
    { name: 'previewPath', type: 'text', access: { update: staffOnlyField } },
  ],
}
