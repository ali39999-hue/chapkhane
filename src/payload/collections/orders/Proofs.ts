import type { CollectionConfig } from 'payload'
import { adminOnly, ownerScoped, staffOnly, staffOnlyField } from '../../access'

export const Proofs: CollectionConfig = {
  slug: 'proofs',
  labels: { singular: 'پروف (پیش‌نمایش)', plural: 'پروف‌ها' },
  upload: {
    staticDir: '../../private/proofs',
    mimeTypes: ['image/*', 'application/pdf'],
  },
  access: {
    read: ownerScoped('customer'),
    create: staffOnly,
    // Was `!!user`, which let any logged-in account approve someone else's
    // proof — a forged print sign-off. Approval itself goes through the
    // `approveProof` server action (Local API, access overridden), so the
    // REST surface only needs to reach the customer's own document.
    update: ownerScoped('customer'),
    delete: adminOnly,
  },
  fields: [
    { name: 'orderItem', type: 'relationship', relationTo: 'order-items', required: true, access: { update: staffOnlyField } },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, access: { update: staffOnlyField } },
    { name: 'version', type: 'number', required: true, defaultValue: 1, access: { update: staffOnlyField } },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'rejected'],
      defaultValue: 'pending',
      index: true,
      access: { update: staffOnlyField },
    },
    { name: 'customerFeedback', type: 'textarea' },
    { name: 'approvalDate', type: 'date', access: { update: staffOnlyField } },
    // Recorded for the legal audit trail; not customer-editable and not
    // customer-readable.
    { name: 'approvalIp', type: 'text', access: { read: staffOnlyField, update: staffOnlyField } },
    { name: 'signedAgreementText', type: 'textarea', access: { update: staffOnlyField } },
  ],
}
