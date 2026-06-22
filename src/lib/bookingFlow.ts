export interface EventCartTicket {
  name: string;
  price: number;
  quantity: number;
}

export interface EventCartData {
  eventId: string;
  eventName?: string;
  city?: string;
  tickets: EventCartTicket[];
  totalPrice: number;
  type?: 'event' | 'dining' | 'play';
  landscape_image_url?: string;
  portrait_image_url?: string;
  use_pass?: boolean;
  pass_id?: string;
}

export function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function isCurrentEventCart(cart: unknown, eventId: string): cart is EventCartData {
  if (!cart || typeof cart !== 'object') return false;
  const candidate = cart as Partial<EventCartData>;
  return (
    (candidate.type ?? 'event') === 'event' &&
    candidate.eventId === eventId &&
    Array.isArray(candidate.tickets)
  );
}

export function readEventCart(eventId: string): EventCartData | null {
  if (typeof window === 'undefined') return null;
  const parsed = safeJsonParse<EventCartData>(sessionStorage.getItem('ticpin_cart'));
  return isCurrentEventCart(parsed, eventId) ? parsed : null;
}

export function readScopedTempCounts(eventId: string): EventCartTicket[] | null {
  if (typeof window === 'undefined') return null;
  const parsed = safeJsonParse<{ eventId?: string; tickets?: EventCartTicket[] } | EventCartTicket[]>(
    sessionStorage.getItem('ticpin_temp_counts'),
  );

  if (Array.isArray(parsed)) return parsed;
  if (parsed?.eventId === eventId && Array.isArray(parsed.tickets)) return parsed.tickets;
  return null;
}

export function writeScopedTempCounts(eventId: string, tickets: EventCartTicket[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('ticpin_temp_counts', JSON.stringify({ eventId, tickets }));
}

export function clearEventBookingStorage(options: { keepCart?: boolean } = {}) {
  if (typeof window === 'undefined') return;
  if (!options.keepCart) sessionStorage.removeItem('ticpin_cart');
  sessionStorage.removeItem('ticpin_restore_counts');
  sessionStorage.removeItem('ticpin_edit_selection');
  sessionStorage.removeItem('ticpin_temp_counts');
  sessionStorage.removeItem('ticpin_force_new_selection');
}
