'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, setStoredToken } from '@/lib/api';

/**
 * Auth callback: handles redirect from Shopify "My Courses" (or similar).
 * Verification: frontend verifies with Shopify by calling backend POST /api/auth/shopify-verify;
 * the backend verifies the Shopify session JWT (signed with SHOPIFY_API_SECRET). If the user
 * was sent via backend GET /api/auth/shopify-redirect, the backend already verified once before
 * redirecting here, so both backend and frontend verify the request with Shopify.
 * Supports:
 * - token=<shopify-session-jwt> → verify via API (backend verifies with Shopify), then redirect to My Courses
 * - lmsToken=<lms-jwt> → store and redirect (used by legacy customerId+email backend redirect)
 */
export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const lmsToken = searchParams.get('lmsToken');
    const shopifyToken = searchParams.get('token');

    if (lmsToken) {
      setStoredToken(lmsToken);
      setStatus('success');
      window.location.href = '/purchases';
      return;
    }

    if (!shopifyToken) {
      setStatus('error');
      setErrorMessage('Missing token. Use the "My Courses" link from the marketplace.');
      return;
    }

    // Verify with Shopify via backend (JWT signed by Shopify; backend holds SHOPIFY_API_SECRET)
    let cancelled = false;
    api.auth
      .shopifyVerify(shopifyToken)
      .then((res) => {
        if (cancelled) return;
        setStoredToken(res.token);
        setStatus('success');
        window.location.href = '/purchases';
      })
      .catch((err: Error & { body?: { error?: string } }) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage(err?.body?.error || err?.message || 'Verification failed.');
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
        <a
          href="/purchases"
          className="text-[#54bd01] hover:underline"
        >
          Go to My Courses
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-gray-600">Redirecting to My Courses…</p>
    </div>
  );
}
