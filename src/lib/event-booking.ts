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
  return !Number.isNaN(openDate.getTime()) && openDate.getTime() > nowMs;
}

export function isEventBookingClosed(
  event: BookingWindowLike | null | undefined,
  nowMs: number,
  includePastEventDate = false,
) {
  if (!event) return false;
  if (event.is_sales_paused || event.is_canceled) return true;

  if (event.ticket_close_date) {
    const closeDate = new Date(event.ticket_close_date);
    if (!Number.isNaN(closeDate.getTime()) && closeDate.getTime() < nowMs) {
      return true;
    }
  }

  if (event.event_end_date) {
    const endDate = new Date(event.event_end_date);
    if (!Number.isNaN(endDate.getTime()) && endDate.getTime() < nowMs) {
      return true;
    }
  }

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
