import { describe, it, expect } from 'vitest'
import { formatNumber } from './format'

describe('Format Utils', () => {
  it('formats numbers to Persian', () => {
    expect(formatNumber(123456)).toBe('۱۲۳٬۴۵۶')
  })
})
