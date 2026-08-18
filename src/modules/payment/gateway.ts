/**
 * Payment gateway abstraction.
 *
 * The verify endpoint used to trust a `status` field from the request body,
 * which meant any authenticated customer could POST
 * `{ orderId, status: 'success' }` and receive a paid order plus a generated
 * invoice. A gateway verdict must come from the provider, never from the
 * caller — this module is the seam where that happens.
 *
 * `MockGateway` reproduces the old sandbox behaviour but refuses to load
 * unless it has been explicitly enabled, so a production deployment that has
 * not configured a real provider fails closed instead of giving away print
 * jobs.
 */

export type GatewayVerdict = {
  status: 'success' | 'failed'
  /** Provider-side transaction reference, used as the idempotency anchor. */
  refId: string
  provider: string
  raw?: Record<string, unknown>
}

export type VerifyRequest = {
  orderId: number | string
  /** Expected amount in Rials, read from the order — never from the client. */
  amount: number
  /** Provider callback parameters as received (authority, token, refId, ...). */
  callback: Record<string, unknown>
}

export interface PaymentGateway {
  readonly name: string
  verify(request: VerifyRequest): Promise<GatewayVerdict>
}

export class PaymentGatewayUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PaymentGatewayUnavailableError'
  }
}

/**
 * Sandbox gateway. Echoes the outcome the sandbox UI asked for, which is only
 * acceptable because it cannot be enabled by accident.
 */
class MockGateway implements PaymentGateway {
  readonly name = 'mock-zarinpal'

  async verify({ callback }: VerifyRequest): Promise<GatewayVerdict> {
    const requested = callback.status === 'success' ? 'success' : 'failed'
    const refId =
      typeof callback.refId === 'string' && callback.refId.length > 0
        ? callback.refId
        : `TRX-MOCK-${requested === 'success' ? 'OK' : 'FAILED'}-${Date.now()}`

    return {
      status: requested,
      refId,
      provider: this.name,
      raw: { gateway: 'MockZarinpal', sandbox: true },
    }
  }
}

let cached: PaymentGateway | null = null

/**
 * Resolves the configured gateway.
 *
 * `PAYMENT_GATEWAY=mock` enables the sandbox. In production that also requires
 * `ALLOW_MOCK_PAYMENTS=true`, so shipping the sandbox live has to be a
 * deliberate, auditable act.
 */
export function resolvePaymentGateway(): PaymentGateway {
  if (cached) return cached

  const configured = (process.env.PAYMENT_GATEWAY || 'mock').toLowerCase()
  const isProduction = process.env.NODE_ENV === 'production'

  if (configured === 'mock') {
    if (isProduction && process.env.ALLOW_MOCK_PAYMENTS !== 'true') {
      throw new PaymentGatewayUnavailableError(
        'درگاه پرداخت واقعی پیکربندی نشده است. لطفاً با پشتیبانی تماس بگیرید.'
      )
    }
    cached = new MockGateway()
    return cached
  }

  throw new PaymentGatewayUnavailableError(
    `درگاه پرداخت «${configured}» پیاده‌سازی نشده است.`
  )
}

/** Test seam. */
export function __resetPaymentGatewayCache(): void {
  cached = null
}
