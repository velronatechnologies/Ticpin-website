export interface BookingWindowLike {
  is_sales_paused?: boolean;
  is_canceled?: boolean;
  ticket_open_date?: string;
  ticket_close_date?: string;
  event_end_date?: string;
  date?: string;
  status?: string;
}

export function isEventBookingNotOpenedYet(
  event: BookingWindowLike | null | undefined,
  nowMs: number,
) {
  if (!event?.ticket_open_date) return false;
  const openDate = new Date(event.ticket_open_date);
  if (Number.isNaN(openDate.getTime())) {
    // Malformed open date - block booking (treat as not open) for safety
    return true;
  }
  return openDate.getTime() > nowMs;
}

export function isEventBookingClosed(
  event: BookingWindowLike | null | undefined,
  nowMs: number,
  includePastEventDate = true,
) {
  if (!event) return false;
  if (event.is_sales_paused || event.is_canceled) return true;

  // 1. If ticket_close_date is present, it is the primary controller of sales closing.
  if (event.ticket_close_date) {
    const closeDate = new Date(event.ticket_close_date);
    if (!Number.isNaN(closeDate.getTime())) {
      return closeDate.getTime() < nowMs;
    }
  }

  // 2. If ticket_close_date is not set, fall back to checking event_end_date.
  if (event.event_end_date) {
    const endDate = new Date(event.event_end_date);
    if (!Number.isNaN(endDate.getTime()) && endDate.getTime() < nowMs) {
      return true;
    }
  }

  // 3. Fallback to check if the event start date is in the past.
  if (includePastEventDate && event.date) {
    const eventDate = new Date(event.date);
    const today = new Date(nowMs);
    today.setHours(0, 0, 0, 0);
    if (!Number.isNaN(eventDate.getTime()) && eventDate < today && event.status !== "unlimited") {
      return true;
    }
  }

  return false;
}

export function isExpiringWithinDay(validUntil: string | undefined, nowMs: number) {
  if (!validUntil) return false;
  const expiryMs = new Date(validUntil).getTime();
  if (Number.isNaN(expiryMs)) return false;
  return expiryMs > nowMs && expiryMs <= nowMs + 24 * 60 * 60 * 1000;
}
