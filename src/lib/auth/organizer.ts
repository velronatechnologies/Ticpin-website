// ─── Organizer Session ────────────────────────────────────────────
// Session is stored in TWO cookies set by the backend on VerifyOTP:
//   __Host-ticpin_session — HttpOnly access JWT
//   __Host-ticpin_refresh — HttpOnly refresh JWT
//   ticpin_session_info   — base64 JSON for UI only; non-sensitive identity info
//
// The frontend reads/writes ticpin_session_info for UI state.
// clearOrganizerSession() calls the logout endpoint to clear the HttpOnly cookie too.

import { useState, useEffect } from 'react';
import { clearAllData } from './clearAll';

export interface OrganizerSession {
  id: string;
  email: string;
  /** 'dining' | 'events' | 'play' | 'admin' */
  vertical: string;
  isAdmin: boolean;
  /** Per-category status: "pending" | "approved" | "rejected" */
  categoryStatus?: Record<string, string>;
}

// ── Cookie helpers ─────────────────────────────────────────────────

function getCookieRaw(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
  );
  return match ? match[1] : null;
}

function setCookieRaw(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value}; path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; SameSite=Lax; Max-Age=-1`;
  const host = window.location.hostname;
  document.cookie = `${name}=; path=/; domain=${host}; Max-Age=-1`;
  document.cookie = `${name}=; path=/; domain=.${host}; Max-Age=-1`;
}

// ── Public API ─────────────────────────────────────────────────────

/** Read session from ticpin_session_info cookie (set by backend or saveOrganizerSession). */
export function getOrganizerSession(): OrganizerSession | null {
  const raw = getCookieRaw('ticpin_session_info');
  if (!raw) return null;
  try {
    // Backend uses base64.StdEncoding; atob handles standard base64
    const json = atob(raw);
    return JSON.parse(json) as OrganizerSession;
  } catch {
    return null;
  }
}

/**
 * Write the session info cookie.
 * Called by OTP pages after verifyOTP (backend also sets it, but we need the
 * organizer-auth-change event to fire so Navbar re-renders immediately).
 */
export function saveOrganizerSession(session: OrganizerSession): void {
  if (typeof window === 'undefined') return;
  const encoded = btoa(JSON.stringify(session));
  setCookieRaw('ticpin_session_info', encoded, 6);
  window.dispatchEvent(new Event('organizer-auth-change'));
}

/** Clear both cookies and sessionStorage. Fires backend logout to clear HttpOnly cookie. */
export function clearOrganizerSession(): void {
  if (typeof window === 'undefined') return;

  // Log what we're clearing
  console.log('[Auth] Clearing organizer session...');

  // Clear specific sessionStorage keys used during setup
  const setupKeys = [
    'setup_events',
    'setup_dining',
    'setup_play',
    'ticpin_cart',
    'ticpin_billing_data',
    'ticpin_pending_payment',
    'ticpin_pending_renew',
    'otp_pending_email',
    'otp_pending_type',
  ];

  setupKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
      console.debug(`[Auth] Clearing sessionStorage.${key}`);
      sessionStorage.removeItem(key);
    }
  });

  // BUG FIX #1: Clear all booking-related state to prevent data isolation issues
  const bookingKeys = [
    'event_cart',
    'dining_cart',
    'play_cart',
    'payment_attempt',
    'reservation_timer',
    'event_booking_pending',
    'dining_booking_pending',
    'play_booking_pending',
  ];

  bookingKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
      console.debug(`[Auth] Clearing booking sessionStorage.${key}`);
      sessionStorage.removeItem(key);
    }
  });

  // BUG FIX #2: Clear lock key to prevent lock key replay attacks
  if (localStorage.getItem('ticpin_lock_key')) {
    console.debug('[Auth] Clearing ticpin_lock_key from localStorage');
    localStorage.removeItem('ticpin_lock_key');
  }

  // Clear localStorage organizer preferences
  localStorage.removeItem('organizer_preferences');
  console.debug('[Auth] Cleared organizer_preferences from localStorage');

  // Fire-and-forget — clears the HttpOnly token on the server
  fetch('/backend/api/auth/logout/organizer', { method: 'POST', credentials: 'include' })
    .catch(err => console.error('[Auth] Organizer Logout API call failed:', err));

  // Clear readable UI cookies. HttpOnly auth cookies are cleared by the backend logout endpoint.
  deleteCookie('ticpin_session_info');
  deleteCookie('active_role');

  window.dispatchEvent(new Event('organizer-auth-change'));

  setTimeout(() => {
    window.location.reload();
  }, 100);
}

/** Updates a single category status inside the stored session cookie */
export function updateSessionCategoryStatus(category: string, status: string): void {
  const session = getOrganizerSession();
  if (!session) return;
  saveOrganizerSession({
    ...session,
    categoryStatus: { ...(session.categoryStatus ?? {}), [category]: status },
  });
}

/** Updates the email inside the stored session cookie */
export function updateSessionEmail(newEmail: string): void {
  const session = getOrganizerSession();
  if (!session) return;
  saveOrganizerSession({
    ...session,
    email: newEmail,
  });
}

/** Updates the phone inside the stored session cookie if it is the primary login identifier */
export function updateSessionPhone(newPhone: string): void {
  const session = getOrganizerSession();
  if (!session) return;
  // If the session email (identifier) does not contain '@', it means they logged in via phone
  if (session.email && !session.email.includes('@')) {
    saveOrganizerSession({
      ...session,
      email: newPhone,
    });
  }
}

/** React hook to get and track organizer session */
export function useOrganizerSession() {
  const [session, setSession] = useState<OrganizerSession | null>(null);

  useEffect(() => {
    const load = () => setSession(getOrganizerSession());
    load();
    window.addEventListener('organizer-auth-change', load);
    return () => window.removeEventListener('organizer-auth-change', load);
  }, []);

  return session;
}
