/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/api.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';

export function getStoredToken(): string | null {
  return localStorage.getItem('api_token');
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem('api_token', token);
  else localStorage.removeItem('api_token');
}

export function getAuthHeader(): Record<string, string> {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

console.log('DEBUG API_URL =', API_URL);

/**
 * Generic fetch helper
 */
export async function fetchJson<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  // pastikan selalu ada Accept: application/json
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(init?.headers || {}),
  };

  const res = await fetch(input, {
    credentials: 'same-origin',
    ...init,
    headers,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data as any).message) ||
      (data && typeof data === 'object' && (data as any).error) ||
      res.statusText;
    throw new Error(String(message || 'API error'));
  }

  return data as T;
}

/**
 * POST helper untuk FormData (upload)
 */
export async function postForm(url: string, formData: FormData) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...getAuthHeader(),
  };

  const res = await fetch(url, { method: 'POST', body: formData, headers });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && typeof data === 'object' && (data as any).message) || res.statusText;
    throw new Error(String(message || 'API error'));
  }

  return data;
}
