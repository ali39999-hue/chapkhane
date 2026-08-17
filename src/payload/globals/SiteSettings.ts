import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'تنظیمات سایت',
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'چاپخانه آنلاین' },
    { name: 'contactEmail', type: 'email' },
    { name: 'contactPhone', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'socialLinks', type: 'array', fields: [{ name: 'platform', type: 'text' }, { name: 'url', type: 'text' }] },
  ],
}
