import { CollectionConfig } from 'payload'
import { staffOnly } from '../../access'

export const TemplateRequests: CollectionConfig = {
  slug: 'template-requests',
  labels: { singular: 'درخواست قالب', plural: 'درخواست‌های قالب' },
  admin: {
    useAsTitle: 'message',
    group: 'محتوا',
    description: 'درخواست‌های مشتریان برای طراحی قالب اختصاصی',
  },
  access: {
    // Anyone can submit a request (even guests)
    create: () => true,
    // Only staff can read/update/delete
    read: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'متن درخواست',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      label: 'وضعیت بررسی',
      options: [
        { label: 'در انتظار بررسی', value: 'pending' },
        { label: 'در حال طراحی', value: 'in_progress' },
        { label: 'انجام شده', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'کاربر درخواست دهنده',
      admin: {
        position: 'sidebar',
        description: 'اگر کاربر در سایت لاگین بوده باشد اینجا ثبت می‌شود.',
      },
    }
  ],
}
