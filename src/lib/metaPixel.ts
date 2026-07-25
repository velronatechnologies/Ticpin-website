/**
 * Meta (Facebook) Pixel Helper Utility
 * Standard events:
 * - InitiateCheckout
 * - AddToCart
 * - Purchase
 * - ViewContent
 */

export const trackMetaEvent = (
  eventName: 'InitiateCheckout' | 'AddToCart' | 'Purchase' | 'ViewContent' | string,
  params?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    try {
      if (params) {
        (window as any).fbq('track', eventName, params);
      } else {
        (window as any).fbq('track', eventName);
      }
    } catch (e) {
      console.error('[Meta Pixel] Error tracking event:', e);
    }
  }
};
