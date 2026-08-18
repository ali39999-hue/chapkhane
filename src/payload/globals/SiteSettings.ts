import type { GlobalConfig } from 'payload'
import { adminOnly, publicRead } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'تنظیمات سایت',
  access: {
    read: publicRead,
    update: adminOnly,
  },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'چاپخانه آنلاین' },
    { name: 'contactEmail', type: 'email' },
    { name: 'contactPhone', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'socialLinks', type: 'array', fields: [{ name: 'platform', type: 'text' }, { name: 'url', type: 'text' }] },
  ],
}
