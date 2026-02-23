'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, setStoredToken } from '@/lib/api';
import { COMPANY_INFO } from '@/lib/constants';

/** Decode JWT payload without verifying (to peek at claims). Client-only. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  if (typeof atob === 'undefined') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** True if payload looks like our LMS JWT (userId + shopifyCustomerId). */
function isLmsTokenPayload(payload: Record<string, unknown> | null): boolean {
  return Boolean(payload && typeof payload.userId === 'string' && typeof payload.shopifyCustomerId === 'string');
}

/**
 * Auth login: handles redirect from Shopify "My Courses" flow.
 * 1) {BACKEND_URL}/api/courses/user/{customerId}/{email} → backend redirects here with jwtToken (LMS token).
 * 2) Or direct: {FRONTEND_URL}/auth/login?jwtToken=... (external JWT, e.g. ApnaSite). Frontend and backend can be different domains.
 * Accepts both LMS token (store and redirect) and external JWT (exchange via API then redirect).
 */
export default function AuthLoginPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const jwtToken = searchParams.get('jwtToken');
    const errorParam = searchParams.get('error');

    if (errorParam === 'invalid_signature') {
      setStatus('error');
      setErrorMessage(
        'Invalid or missing link signature. For local testing, leave SHOPIFY_LINK_SECRET and SHOPIFY_WEBHOOK_SECRET unset in backend .env.'
      );
      return;
    }

    if (!jwtToken) {
      setStatus('error');
      setErrorMessage('Missing token. Use the "My Courses" link from the marketplace.');
      return;
    }

    const payload = decodeJwtPayload(jwtToken);
    if (isLmsTokenPayload(payload)) {
      setStoredToken(jwtToken);
      setStatus('success');
      window.location.href = '/purchases';
      return;
    }

    let cancelled = false;
    api.auth
      .externalLogin(jwtToken)
      .then((res) => {
        if (cancelled) return;
        setStoredToken(res.token);
        setStatus('success');
        window.location.href = '/purchases';
      })
      .catch((err: Error & { body?: { error?: string } }) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage(err?.body?.error || err?.message || 'Login failed.');
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-gray-600">Signing you in…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-red-600">{errorMessage}</p>
        <Link href={COMPANY_INFO.marketplaceUrl} className="text-[#54bd01] hover:underline">
          Back to Marketplace
        </Link>
        <span className="mx-2">|</span>
        <Link href="/" className="text-[#54bd01] hover:underline">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-gray-600">Redirecting to My Courses…</p>
    </div>
  );
}
