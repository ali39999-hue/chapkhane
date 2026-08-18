import type { CollectionConfig } from 'payload'
import { adminOnly, isStaffRole } from '../../access'

export const CreditTransactions: CollectionConfig = {
  slug: 'credit-transactions',
  labels: { singular: 'تراکنش اعتباری', plural: 'تراکنش‌های اعتباری' },
  access: {
    read: async ({ req: { user, payload } }) => {
      if (!user) return false
      if (isStaffRole(user.role)) return true
      // B2B members can only read transactions of their own organization.
      // This costs one query per request, so keep it as lean as possible.
      const org = await payload.find({
        collection: 'organizations',
        where: { users: { equals: user.id }, status: { equals: 'active' } },
        limit: 1,
        depth: 0,
        pagination: false,
        select: {},
      });
      if (org.docs.length === 0) return false
      return { organization: { equals: org.docs[0].id } }
    },
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        // Use the request-scoped payload instance instead of `getPayload`, so
        // this participates in the caller's transaction/context.
        const payload = req.payload;
        const orgId = typeof doc.organization === 'string' ? doc.organization : doc.organization.id;

        // Atomic balance mutation. A single guarded UPDATE is immune to the
        // lost-update race of the previous read-modify-write flow (two
        // concurrent deducts could otherwise both read the same balance and
        // overwrite each other). `FOR UPDATE`-free but still serialized by the
        // row lock the UPDATE itself takes.
        const pool = (payload.db as unknown as { pool: { query: (sql: string, params: unknown[]) => Promise<{ rowCount: number }> } }).pool;

        if (doc.type === 'charge') {
          await pool.query(
            'UPDATE organizations SET balance = balance + $1 WHERE id = $2',
            [doc.amount, orgId]
          );
        } else if (doc.type === 'deduct') {
          const res = await pool.query(
            `UPDATE organizations
                SET balance = balance - $1
              WHERE id = $2
                AND balance + COALESCE(credit_limit, 0) >= $1
              RETURNING balance`,
            [doc.amount, orgId]
          );
          if (res.rowCount === 0) {
            // Credit check failed atomically — remove the audit row and fail.
            await payload.delete({ collection: 'credit-transactions', id: doc.id });
            throw new Error('اعتبار کافی نیست.');
          }
        }
      }
    ]
  },
  fields: [
    { name: 'organization', type: 'relationship', relationTo: 'organizations', required: true, index: true },
    { name: 'amount', type: 'number', required: true },
    { name: 'type', type: 'select', options: ['charge', 'deduct'], required: true },
    { name: 'orderReference', type: 'relationship', relationTo: 'orders' },
    { name: 'notes', type: 'textarea' },
  ],
}
