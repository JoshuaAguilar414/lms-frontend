'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth';
import { api, getStoredToken } from '@/lib/api';

/**
 * Profile is managed on Shopify. Redirect to Shopify account profile.
 */
export default function ProfileSettingsPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      window.location.href = '/';
      return;
    }

    let cancelled = false;
    api.auth
      .me()
      .then((u) => {
        if (cancelled) return;
        const shopifyShopId = u?.shopifyShopId;
        const shopifyShopDomain = u?.shopifyShopDomain;

        if (shopifyShopId) {
          window.location.href = `https://shopify.com/${shopifyShopId}/account/profile`;
          return;
        }
        if (shopifyShopDomain) {
          window.location.href = `https://${shopifyShopDomain}/account/profile`;
          return;
        }

        setError('Could not determine your Shopify shop. Please sign out and sign in again.');
      })
      .catch(() => {
        if (cancelled) return;
        setError('Could not load your Shopify session. Please sign out and sign in again.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthGuard>
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-gray-600">
          {error ? error : 'Redirecting to your profile…'}
        </p>
      </div>
    </AuthGuard>
  );
}
