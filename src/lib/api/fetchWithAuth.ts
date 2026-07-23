/**
 * Fetch wrapper with automatic 401 (token expiration) handling
 * Intercepts 401 responses and logs out the user automatically
 */
import { clearUserSession } from '../auth/user';

export async function fetchWithAuth<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });

  // Handle 401 Unauthorized (Expired Token) - Auto logout
  if (res.status === 401) {
    console.warn('[FetchWithAuth] 401 Unauthorized - Token expired, auto-logging out user');
    console.warn('[FetchWithAuth] URL:', url);
    clearUserSession(true);
    return Promise.reject(new Error('Session expired. Please login again.'));
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed with status ${res.status}`);
  }
  return data as T;
}

/**
 * Simplified wrapper for GET requests with auth
 */
export async function getWithAuth<T>(url: string): Promise<T> {
  return fetchWithAuth<T>(url, { method: 'GET' });
}

/**
 * Simplified wrapper for POST requests with auth
 */
export async function postWithAuth<T>(
  url: string,
  body: Record<string, unknown>
): Promise<T> {
  return fetchWithAuth<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Simplified wrapper for PUT requests with auth
 */
export async function putWithAuth<T>(
  url: string,
  body: Record<string, unknown>
): Promise<T> {
  return fetchWithAuth<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Simplified wrapper for DELETE requests with auth
 */
export async function deleteWithAuth<T>(url: string): Promise<T> {
  return fetchWithAuth<T>(url, { method: 'DELETE' });
}
