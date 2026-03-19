'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import { UserAvatar } from '@/components/ui';
import { api, getStoredToken, setStoredToken } from '@/lib/api';
import { SearchBar } from './SearchBar';
import { COMPANY_INFO } from '@/lib/constants';

const USER_DROPDOWN_FALLBACK = {
  name: 'User',
  email: '',
};

function HamburgerIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

type NavLink = { label: string; href: string; hasDropdown?: boolean; external?: boolean };

const allNavLinks: NavLink[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'My Courses', href: '/purchases' },
];

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isRestrictedPage = pathname === '/restricted';
  const [hasToken, setHasToken] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasToken(!!getStoredToken());
  }, []);

  // Load real user profile from backend using current JWT.
  // Backend resolves `userId` from the LMS JWT, which originates from Shopify login flow.
  useEffect(() => {
    if (!hasToken) return;

    let cancelled = false;
    api.auth
      .me()
      .then((u) => {
        if (cancelled) return;
        setUserName(u?.name ?? null);
        setUserEmail(u?.email ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setUserName(null);
        setUserEmail(null);
      });

    return () => {
      cancelled = true;
    };
  }, [hasToken]);

  async function redirectToShopifyAccount(destination: 'profile' | 'orders') {
    // Always resolve Shopify destination at click-time.
    // This avoids redirecting to internal fallback pages while `api.auth.me()` is still loading.
    try {
      const u = await api.auth.me();
      const shopifyShopIdResolved = u?.shopifyShopId ?? null;
      const shopifyShopDomainResolved = u?.shopifyShopDomain ?? null;

      if (shopifyShopIdResolved) {
        window.location.href = `https://shopify.com/${shopifyShopIdResolved}/account/${destination}`;
        return;
      }
      if (shopifyShopDomainResolved) {
        window.location.href = `https://${shopifyShopDomainResolved}/account/${destination}`;
        return;
      }

      // Last resort fallbacks.
      window.location.href = destination === 'profile' ? '/profile-settings' : '/purchases';
    } catch {
      // If the token is invalid/expired, the user will typically be redirected by other flows.
      window.location.href = '/';
    }
  }

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  if (isRestrictedPage) {
    return (
      <nav className="font-poppins bg-white text-gray-900 border-b border-gray-200">
        <div className="mx-auto flex h-16 items-center justify-start px-4 sm:px-6 md:px-8 lg:px-14">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/VECTRA LOGO SECONDARY.png"
              alt="VECTRA INTERNATIONAL - Enabling Positive Impact"
              width={200}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="font-poppins bg-white text-gray-900 border-b border-gray-200">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 md:px-8 lg:px-14">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-initial md:gap-8">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="flex shrink-0 items-center justify-center p-2 text-gray-700 hover:text-[#54bd01] md:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/VECTRA LOGO SECONDARY.png"
              alt="VECTRA INTERNATIONAL - Enabling Positive Impact"
              width={200}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {(hasToken ? allNavLinks : allNavLinks.filter((l) => l.external)).map(({ label, href, hasDropdown, external }) => {
              const isActive = !external && href !== '#' && (pathname === href || pathname.startsWith(href + '/'));
              const linkClass = isActive
                ? 'text-sm font-semibold text-[#54bd01]'
                : 'text-sm text-gray-700 hover:text-[#54bd01] transition-colors';
              return (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-1 ${linkClass}`}
                  {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  {label}
                  {hasDropdown && <ChevronDownIcon className="w-4 h-4" />}
                </Link>
              );
            })}
          </div>
        </div>

        <SearchBar />

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {hasToken ? (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center justify-center rounded-full transition-opacity hover:opacity-90"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <UserAvatar name={userName ?? USER_DROPDOWN_FALLBACK.name} size="sm" />
            </button>
            {userMenuOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white py-4 shadow-lg"
                role="menu"
              >
                <div className="px-4 pb-3">
                  <div className="flex flex-col items-center text-center">
                    <UserAvatar
                      name={userName ?? USER_DROPDOWN_FALLBACK.name}
                      size="lg"
                      className="mb-2"
                    />
                    <p className="text-sm font-semibold text-gray-900">
                      {userName ?? USER_DROPDOWN_FALLBACK.name}
                    </p>
                    <p className="text-xs text-gray-500">{userEmail ?? USER_DROPDOWN_FALLBACK.email}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200" />
                <div className="py-1">
                  <button
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      redirectToShopifyAccount('profile');
                    }}
                  >
                    My Profile
                  </button>
                  <button
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      redirectToShopifyAccount('orders');
                    }}
                  >
                    My Orders
                  </button>
                  <button
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);

                      // Redirect to Shopify logout so the customer session is cleared too.
                      // Then we return to the marketplace homepage.
                      (async () => {
                        try {
                          const u = await api.auth.me();
                          const shopifyShopIdResolved = u?.shopifyShopId ?? null;
                          const shopifyShopDomainResolved = u?.shopifyShopDomain ?? null;

                          const currentUrl = new URL(window.location.href);
                          const country = currentUrl.searchParams.get('country');
                          const base = COMPANY_INFO.marketplaceUrl.replace(/\/$/, '');
                          const returnUrl = country ? `${base}/?country=${encodeURIComponent(country)}` : base;

                          const logoutUrl =
                            shopifyShopIdResolved
                              ? `https://shopify.com/${shopifyShopIdResolved}/account/logout?return_url=${encodeURIComponent(
                                  returnUrl
                                )}`
                              : shopifyShopDomainResolved
                                ? `https://${shopifyShopDomainResolved}/account/logout?return_url=${encodeURIComponent(
                                    returnUrl
                                  )}`
                                : null;

                          // Clear local LMS session immediately.
                          setStoredToken(null);
                          setHasToken(false);
                          setUserName(null);
                          setUserEmail(null);

                          if (logoutUrl) {
                            window.location.href = logoutUrl;
                            return;
                          }

                          router.replace('/');
                        } catch {
                          // If the user/session can't be resolved, just do a local logout.
                          setStoredToken(null);
                          setHasToken(false);
                          setUserName(null);
                          setUserEmail(null);
                          router.replace('/');
                        }
                      })();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
          ) : (
            <Link
              href={COMPANY_INFO.marketplaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#54bd01' }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu: categories + search bar */}
      <div
        className={`overflow-hidden transition-[visibility] duration-200 md:hidden ${mobileMenuOpen ? 'visible' : 'invisible'}`}
      >
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-out ${mobileMenuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden border-t border-gray-200 bg-white">
            <div className="space-y-4 px-4 py-4 pb-6">
              <div className="w-full">
                <SearchBar inline />
              </div>
              <ul className="space-y-1">
                {(hasToken ? allNavLinks : allNavLinks.filter((l) => l.external)).map(({ label, href, hasDropdown, external }) => {
                  const isActive = !external && href !== '#' && (pathname === href || pathname.startsWith(href + '/'));
                  const linkClass = isActive
                    ? 'font-semibold text-[#54bd01]'
                    : 'font-medium text-gray-700 hover:text-[#54bd01]';
                  return (
                    <li key={label}>
                      <Link
                        href={href}
                        className={`flex items-center gap-1 py-3 text-sm ${linkClass}`}
                        onClick={() => setMobileMenuOpen(false)}
                        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                      >
                        {label}
                        {hasDropdown && <ChevronDownIcon className="w-4 h-4" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
