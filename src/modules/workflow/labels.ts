import type { Order } from '../../../payload-types'

export type OrderStatus = NonNullable<Order['status']>

/**
 * Persian labels for the order state machine, used everywhere an order status
 * is rendered. Previously each page printed the raw English enum value.
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'پیش‌نویس',
  awaiting_payment: 'در انتظار پرداخت',
  paid: 'پرداخت‌شده',
  file_review: 'بررسی فایل',
  needs_customer_action: 'نیازمند اقدام شما',
  awaiting_proof: 'در انتظار تأیید پروف',
  proof_approved: 'پروف تأیید شد',
  prepress: 'آماده‌سازی چاپ (لیتوگرافی)',
  printing: 'در حال چاپ',
  finishing: 'عملیات تکمیلی',
  quality_check: 'کنترل کیفیت',
  ready: 'آماده تحویل',
  shipped: 'ارسال‌شده',
  delivered: 'تحویل داده شد',
  closed: 'بسته‌شده',
  on_hold: 'متوقف‌شده',
  cancelled: 'لغو‌شده',
  refunded: 'مرجوع‌شده',
}

export function orderStatusLabel(status: string | null | undefined): string {
  if (!status) return 'نامشخص'
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status
}

/** Tailwind classes for the status badge, grouped by lifecycle phase. */
export function orderStatusTone(status: string | null | undefined): string {
  switch (status) {
    case 'delivered':
    case 'closed':
    case 'ready':
    case 'shipped':
      return 'bg-emerald-50 text-emerald-700'
    case 'needs_customer_action':
    case 'awaiting_proof':
    case 'awaiting_payment':
      return 'bg-amber-50 text-amber-700'
    case 'cancelled':
    case 'refunded':
    case 'on_hold':
      return 'bg-red-50 text-red-700'
    case 'printing':
    case 'finishing':
    case 'prepress':
    case 'quality_check':
      return 'bg-blue-50 text-blue-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}
