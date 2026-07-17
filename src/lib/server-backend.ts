const DEFAULT_BACKEND_ORIGIN = 'https://ticpin-backend.politebay-860bc91e.centralindia.azurecontainerapps.io';

// Server-rendered pages need an absolute URL during build/prerender. Prefer the
// explicit backend origin when present, and fall back to local development.
const SERVER_BACKEND_ORIGIN =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  DEFAULT_BACKEND_ORIGIN;

export const SERVER_BACKEND_API_BASE = `${SERVER_BACKEND_ORIGIN}/api`;
