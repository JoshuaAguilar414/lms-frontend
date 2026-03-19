/**
 * LMS API client.
 * Uses NEXT_PUBLIC_API_URL and optional token from localStorage (key: lms_token).
 */

const getBaseUrl = () =>
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '')
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const TOKEN_KEY = 'lms_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getStoredToken(), ...init } = options;
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const method = (init.method ?? 'GET').toString().toUpperCase();
  const isGet = method === 'GET';

  // Personalized, authenticated data should not be served from an old cache.
  // This also avoids `304 Not Modified` responses that come back without a JSON body.
  if (isGet) {
    (headers as Record<string, string>)['Cache-Control'] =
      (headers as Record<string, string>)['Cache-Control'] ?? 'no-store, no-cache, must-revalidate';
    (headers as Record<string, string>)['Pragma'] =
      (headers as Record<string, string>)['Pragma'] ?? 'no-cache';
    if ((init as RequestInit).cache == null) (init as RequestInit).cache = 'no-store';
  }

  let res = await fetch(url, { ...init, headers });

  if (isGet && res.status === 304) {
    // Retry once with explicit no-store/no-cache to force a fresh body.
    const retryHeaders = {
      ...(headers as Record<string, string>),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    };
    res = await fetch(url, { ...init, cache: 'no-store', headers: retryHeaders });
  }

  const bodyText = await res.text();
  let data: unknown = {};
  if (bodyText) {
    try {
      data = JSON.parse(bodyText);
    } catch {
      data = {};
    }
  }

  if (!res.ok) {
    const err = new Error(
      (data as any)?.error || (data as any)?.message || res.statusText
    ) as Error & {
      status?: number;
      body?: unknown;
    };
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data as T;
}

export const api = {
  auth: {
    shopifyVerify: (shopifyToken: string) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>(
        '/api/auth/shopify-verify',
        { method: 'POST', body: JSON.stringify({ token: shopifyToken }) }
      ),
    /** External JWT login (e.g. training.vectra-intl.com/auth/login?jwtToken=...). Returns LMS token. */
    externalLogin: (jwtToken: string) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>(
        '/api/auth/external-login',
        { method: 'POST', body: JSON.stringify({ jwtToken }) }
      ),
    /** Current user (from backend; data synced from Shopify). Requires auth token. */
    me: () =>
      request<{
        id: string;
        email: string;
        name: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        shopifyCustomerId?: string;
        shopifyShopDomain?: string | null;
        shopifyShopId?: string | null;
      }>('/api/auth/me', { token: getStoredToken() }),
  },
  enrollments: {
    list: () => request<EnrollmentResponse[]>('/api/enrollments', { token: getStoredToken() }),
  },
  courses: {
    /** List courses (synced from Shopify products). No auth required. */
    list: () => request<CourseResponse[]>('/api/courses'),
  },
};

export interface EnrollmentResponse {
  _id: string;
  userId: { _id: string; name?: string; email?: string };
  courseId: {
    _id: string;
    title: string;
    thumbnail?: string;
    handle?: string;
    scormUrl?: string;
    admissionId?: string;
    totalLessons?: number;
  };
  shopifyOrderId: string;
  shopifyOrderNumber?: string;
  status: string;
  enrolledAt: string;
  progress?: { progress: number; completed: boolean } | null;
}

export interface CourseResponse {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  handle?: string;
  scormUrl?: string;
  admissionId?: string;
  totalLessons?: number;
  isActive: boolean;
}
