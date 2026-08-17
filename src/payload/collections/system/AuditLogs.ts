import type { CollectionConfig } from 'payload'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: { singular: 'لاگ سیستم', plural: 'لاگ‌های سیستم' },
  // This is the fastest-growing table in the system (one row per order status
  // change), so the "history for entity X" lookup needs a composite index.
  indexes: [{ fields: ['entity', 'entityId', 'createdAt'] }],
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: () => false, // Handled internally via hooks
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'actor', type: 'relationship', relationTo: 'users' },
    { name: 'action', type: 'text', required: true },
    { name: 'entity', type: 'text', required: true },
    { name: 'entityId', type: 'text', required: true },
    { name: 'diff', type: 'json' },
    { name: 'ip', type: 'text' },
    { name: 'userAgent', type: 'text' },
  ],
}
