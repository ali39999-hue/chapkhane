// src/modules/shipping/service.ts

export interface ShippingProviderResponse {
  trackingCode: string;
  trackingUrl: string;
  courierName: string;
  estimatedDeliveryDays: number;
}

export async function dispatchOrderToCourier(
  orderNumber: string, 
  shippingAddress: any, 
  method: string
): Promise<ShippingProviderResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Determine mock provider based on method
  let courierName = 'پست پیشتاز';
  let trackingUrlBase = 'https://tracking.post.ir/search.aspx?id=';
  let trackingCode = '';
  let estimatedDeliveryDays = 3;

  if (method === 'motorcycle' || method === 'alopeyk') {
    courierName = 'پیک موتوری (الوپیک)';
    trackingUrlBase = 'https://alopeyk.com/track/';
    trackingCode = `ALO-${Math.floor(1000000 + Math.random() * 9000000)}`;
    estimatedDeliveryDays = 0; // Same day
  } else if (method === 'tipax') {
    courierName = 'تیپاکس';
    trackingUrlBase = 'https://tipaxco.com/tracking?id=';
    trackingCode = `TPX-${Math.floor(1000000 + Math.random() * 9000000)}`;
    estimatedDeliveryDays = 2;
  } else {
    // Default to Iran Post
    const chars = '0123456789';
    let code = 'IR';
    for(let i = 0; i < 20; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    trackingCode = code;
  }

  return {
    trackingCode,
    trackingUrl: `${trackingUrlBase}${trackingCode}`,
    courierName,
    estimatedDeliveryDays,
  };
}
