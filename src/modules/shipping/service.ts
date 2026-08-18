// src/modules/shipping/service.ts
import { randomInt } from 'node:crypto'

export interface ShippingProviderResponse {
  trackingCode: string;
  trackingUrl: string;
  courierName: string;
  estimatedDeliveryDays: number;
}

/**
 * MOCK courier integration.
 *
 * This is invoked from a real state transition (`Orders.afterChange` on
 * `shipped`), so the tracking codes it returns are fabricated and will not
 * resolve on the carriers' websites. Replace with real carrier APIs before
 * going live.
 */
export async function dispatchOrderToCourier(
  orderNumber: string,
  shippingAddress: unknown,
  method: string
): Promise<ShippingProviderResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const sevenDigits = () => String(randomInt(1_000_000, 10_000_000));

  if (method === 'motorcycle' || method === 'alopeyk') {
    const trackingCode = `ALO-${sevenDigits()}`;
    return {
      trackingCode,
      trackingUrl: `https://alopeyk.com/track/${trackingCode}`,
      courierName: 'پیک موتوری (الوپیک)',
      estimatedDeliveryDays: 0, // Same day
    };
  }

  if (method === 'tipax') {
    const trackingCode = `TPX-${sevenDigits()}`;
    return {
      trackingCode,
      trackingUrl: `https://tipaxco.com/tracking?id=${trackingCode}`,
      courierName: 'تیپاکس',
      estimatedDeliveryDays: 2,
    };
  }

  // Default to Iran Post: 'IR' + 20 digits
  let trackingCode = 'IR';
  for (let i = 0; i < 20; i++) trackingCode += randomInt(0, 10);

  return {
    trackingCode,
    trackingUrl: `https://tracking.post.ir/search.aspx?id=${trackingCode}`,
    courierName: 'پست پیشتاز',
    estimatedDeliveryDays: 3,
  };
}
