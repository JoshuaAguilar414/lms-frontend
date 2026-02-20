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

  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || res.statusText) as Error & {
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
