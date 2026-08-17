import dayjs from 'dayjs'
// jalali-dayjs ships no type declarations
// @ts-expect-error -- untyped plugin
import jalaliday from 'jalali-dayjs'

dayjs.extend(jalaliday)

/**
 * Formats a date in the Jalali (Persian) calendar.
 *
 * Server-only by convention: importing this pulls dayjs + jalali-dayjs, so do
 * not use it from client components. Use `formatJalaliDate` from
 * `@/utils/format-number`-adjacent helpers or `Intl.DateTimeFormat` there.
 */
export function formatDate(date: Date | string, format: string = 'YYYY/MM/DD'): string {
  // @ts-expect-error -- `calendar` is added by the jalaliday plugin
  return dayjs(date).calendar('jalali').locale('fa').format(format)
}

export { formatNumber } from './format-number'
