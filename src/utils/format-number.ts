/**
 * Dependency-free number formatting helpers.
 *
 * Kept in its own module (separate from the jalali date helpers) so client
 * components can format numbers without pulling dayjs + jalali-dayjs into the
 * browser bundle.
 */

const faNumberFormat = new Intl.NumberFormat('fa-IR')

export function formatNumber(num: number): string {
  return faNumberFormat.format(num)
}
