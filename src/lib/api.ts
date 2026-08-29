import { resilientFetch } from '@/utils/resilientFetch';

export function getApiUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002/api').replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const devApi = localStorage.getItem('dev_api_url')?.trim()?.replace(/\/+$/, '');
    if (isLocalhost) {
      if (devApi && (devApi.includes(':8000') || devApi.includes(':8001'))) {
        try {
          localStorage.removeItem('dev_api_url');
        } catch {}
      }
      if (devApi && (devApi.includes('localhost') || devApi.includes('127.0.0.1')) && !devApi.includes(':8000') && !devApi.includes(':8001')) {
        return devApi;
      }
      return envUrl;
    }
    return devApi || envUrl;
  }
  return envUrl;
}

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown; // auto-JSON-stringified unless it's already FormData
}

// Single call site for: base URL resolution, the httpOnly auth cookie
// (credentials: 'include'), JSON parsing, the {status:'error'} envelope this
// API uses, and resilientFetch's one-retry-on-network-drop behavior.
export async function apiFetch<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
  };
  if (storedToken) {
    reqHeaders['Authorization'] = `Bearer ${storedToken}`;
  }

  const res = await resilientFetch(`${getApiUrl()}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...reqHeaders,
      ...(headers as Record<string, string> | undefined),
    },
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.status === 'error') {
    throw new ApiError(json?.message || 'Request failed', res.status, json);
  }

  return (json?.data ?? json) as T;
}

export const api = {
  get: <T = unknown>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  put: <T = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  patch: <T = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  del: <T = unknown>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
  delete: <T = unknown>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
