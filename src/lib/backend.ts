const LOCAL_BACKEND_ORIGIN = 'http://127.0.0.1:9000';

const SERVER_BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_URL || LOCAL_BACKEND_ORIGIN;

// In the browser we should always hit the same-origin `/backend` rewrite so
// auth cookies remain attached on hosted domains like ticpin.in.
export const BACKEND_ORIGIN =
  typeof window === 'undefined' ? SERVER_BACKEND_ORIGIN : '/backend';

export const BACKEND_API_BASE = `${BACKEND_ORIGIN}/api`;
