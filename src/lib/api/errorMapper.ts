/**
 * Shared Event and Booking Error Mapper for Ticpin
 * Converts backend errors, status codes, and network failures into user-friendly messages.
 */

export function getFriendlyErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!err) return fallback;

  let raw = '';
  if (typeof err === 'string') raw = err;
  else if (err instanceof Error) raw = err.message;
  else if (typeof err === 'object' && err !== null) {
    if ('error' in err) raw = String((err as any).error);
    else if ('message' in err) raw = String((err as any).message);
  }

  const lower = raw.toLowerCase().trim();

  // Network / server connection
  if (lower.includes('failed to fetch') || lower.includes('network error') || lower.includes('networkerror') || lower.includes('econnrefused')) {
    return 'Unable to connect to server. Please check your internet connection.';
  }

  // 502 / 503 / 504 / backend crash
  if (lower.includes('502') || lower.includes('503') || lower.includes('504') || lower.includes('bad gateway') || lower.includes('service unavailable')) {
    return 'Our booking service is currently experiencing high demand. Please try again in a moment.';
  }

  // OTP Errors
  if (lower.includes('invalid otp') || lower.includes('wrong otp') || lower.includes('invalid verification code') || lower.includes('invalid token')) {
    return 'Invalid OTP. Please check the 6-digit code and try again.';
  }
  if (lower.includes('otp expired') || lower.includes('token expired') || lower.includes('code expired') || lower.includes('not found or expired')) {
    return 'OTP has expired. Please tap "Resend OTP" to receive a new code.';
  }
  if (lower.includes('cooldown:') || lower.includes('maximum 3 otp') || lower.includes('rate limit') || lower.includes('too many attempts')) {
    return raw.replace(/^cooldown:\s*/i, '') || 'Too many OTP requests. Please wait a few minutes before trying again.';
  }

  // Ticket availability & Reservation errors
  if (lower.includes('sold out') || lower.includes('capacity exceeded') || lower.includes('no tickets available') || lower.includes('not enough tickets')) {
    return 'These tickets are currently sold out. Please select another tier or category.';
  }
  if (lower.includes('reservation expired') || lower.includes('lock expired') || lower.includes('expired lock')) {
    return 'Your seat reservation has expired. Please select your tickets again.';
  }
  if (lower.includes('seat selected by another') || lower.includes('already reserved') || lower.includes('seat already locked') || lower.includes('concurrent booking conflict')) {
    return 'These seats were just chosen by another guest. Please select different seats.';
  }
  if (lower.includes('ticket booking has not opened') || lower.includes('not opened yet')) {
    return 'Ticket sales for this event have not opened yet.';
  }
  if (lower.includes('booking has already closed') || lower.includes('sales paused') || lower.includes('event is cancelled') || lower.includes('canceled')) {
    return 'Bookings for this event are currently unavailable.';
  }

  // Payment errors
  if (lower.includes('payment verification failed') || lower.includes('payment amount mismatch') || lower.includes('payment_id is required')) {
    return 'Payment could not be confirmed. If any amount was deducted, it will be automatically refunded.';
  }
  if (lower.includes('payment cancelled') || lower.includes('payment cancelled by user') || lower.includes('user cancelled')) {
    return 'Payment was cancelled. You can retry before your reservation expires.';
  }

  // Coupon / Promo errors
  if (lower.includes('invalid coupon') || lower.includes('coupon not found') || lower.includes('coupon expired') || lower.includes('coupon already used') || lower.includes('coupon limit')) {
    return 'This promo code is invalid or has expired.';
  }

  // Cancellation errors
  if (lower.includes('cannot cancel a booking on or after') || lower.includes('on or after the event date')) {
    return 'Tickets cannot be cancelled on or after the event date.';
  }
  if (lower.includes('used tickets cannot be cancelled') || lower.includes('checked_in') || lower.includes('checked_out')) {
    return 'Attended tickets cannot be cancelled.';
  }

  // Suppress technical JS runtime errors from leaking into the UI
  if (lower.includes('is not defined') || lower.includes('referenceerror') || lower.includes('typeerror') || lower.includes('syntaxerror') || lower.includes('cannot read property') || lower.includes('cannot read properties')) {
    return fallback;
  }

  return raw || fallback;
}
