import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  PaymentGatewayUnavailableError,
  __resetPaymentGatewayCache,
  resolvePaymentGateway,
} from './gateway'

const ORIGINAL = {
  PAYMENT_GATEWAY: process.env.PAYMENT_GATEWAY,
  ALLOW_MOCK_PAYMENTS: process.env.ALLOW_MOCK_PAYMENTS,
  NODE_ENV: process.env.NODE_ENV,
}

function setEnv(key: keyof typeof ORIGINAL, value: string | undefined) {
  if (value === undefined) delete process.env[key]
  else (process.env as Record<string, string>)[key] = value
}

describe('resolvePaymentGateway', () => {
  beforeEach(() => {
    __resetPaymentGatewayCache()
  })

  afterEach(() => {
    for (const key of Object.keys(ORIGINAL) as Array<keyof typeof ORIGINAL>) {
      setEnv(key, ORIGINAL[key])
    }
    __resetPaymentGatewayCache()
  })

  it('returns the sandbox gateway outside production', () => {
    setEnv('NODE_ENV', 'development')
    setEnv('PAYMENT_GATEWAY', 'mock')

    expect(resolvePaymentGateway().name).toBe('mock-zarinpal')
  })

  it('refuses the sandbox in production unless explicitly allowed', () => {
    setEnv('NODE_ENV', 'production')
    setEnv('PAYMENT_GATEWAY', 'mock')
    setEnv('ALLOW_MOCK_PAYMENTS', undefined)

    expect(() => resolvePaymentGateway()).toThrow(PaymentGatewayUnavailableError)

    __resetPaymentGatewayCache()
    setEnv('ALLOW_MOCK_PAYMENTS', 'true')
    expect(resolvePaymentGateway().name).toBe('mock-zarinpal')
  })

  it('refuses an unimplemented provider', () => {
    setEnv('NODE_ENV', 'development')
    setEnv('PAYMENT_GATEWAY', 'zarinpal')

    expect(() => resolvePaymentGateway()).toThrow(PaymentGatewayUnavailableError)
  })

  it('never reports success unless the callback asked for it', async () => {
    setEnv('NODE_ENV', 'development')
    setEnv('PAYMENT_GATEWAY', 'mock')
    const gateway = resolvePaymentGateway()

    const failed = await gateway.verify({ orderId: 1, amount: 1000, callback: {} })
    expect(failed.status).toBe('failed')

    const cancelled = await gateway.verify({ orderId: 1, amount: 1000, callback: { status: 'nope' } })
    expect(cancelled.status).toBe('failed')

    const ok = await gateway.verify({ orderId: 1, amount: 1000, callback: { status: 'success' } })
    expect(ok.status).toBe('success')
    // The refId is what the idempotency key is derived from, so it must exist.
    expect(ok.refId).toBeTruthy()
    expect(ok.provider).toBe('mock-zarinpal')
  })

  it('preserves a provider-supplied reference id', async () => {
    setEnv('NODE_ENV', 'development')
    setEnv('PAYMENT_GATEWAY', 'mock')

    const verdict = await resolvePaymentGateway().verify({
      orderId: 1,
      amount: 1000,
      callback: { status: 'success', refId: 'TRX-123' },
    })

    expect(verdict.refId).toBe('TRX-123')
  })
})
