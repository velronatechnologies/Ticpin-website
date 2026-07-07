const DEFAULT_BACKEND_ORIGIN = 'https://go-backend.itzrvm2337.workers.dev';

const SERVER_BACKEND_ORIGIN =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  DEFAULT_BACKEND_ORIGIN;

// In the browser we should always hit the same-origin `/backend` rewrite so
// auth cookies remain attached on hosted domains like ticpin.in.
export const BACKEND_ORIGIN =
  typeof window === 'undefined' ? SERVER_BACKEND_ORIGIN : '/backend';

export const BACKEND_API_BASE = `${BACKEND_ORIGIN}/api`;
