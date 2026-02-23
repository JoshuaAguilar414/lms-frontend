'use client';

import { useEffect } from 'react';
import { AuthGuard } from '@/components/auth';
import { COMPANY_INFO } from '@/lib/constants';

/**
 * Profile is managed on Shopify. Redirect to Shopify account profile.
 */
export default function ProfileSettingsPage() {
  useEffect(() => {
    window.location.href = COMPANY_INFO.shopifyAccountProfileUrl;
  }, []);

  return (
    <AuthGuard>
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-gray-600">Redirecting to your profile…</p>
      </div>
    </AuthGuard>
  );
}
