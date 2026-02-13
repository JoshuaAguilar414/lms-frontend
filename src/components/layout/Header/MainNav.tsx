'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import { UserAvatar } from '@/components/ui';
import { SearchBar } from './SearchBar';

const USER_DROPDOWN = {
  name: 'Gustian Lee',
  email: 'dev+admin@vectra-intl.com',
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

const navLinks: NavLink[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'My Courses', href: '/purchases' },
  { label: 'VECTRA HOME', href: 'https://vectra-intl.com/', external: true },
];

export function MainNav() {
  const pathname = usePathname();
  const isRestrictedPage = pathname === '/restricted';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
            {navLinks.map(({ label, href, hasDropdown, external }) => {
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
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center justify-center rounded-full transition-opacity hover:opacity-90"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <UserAvatar name={USER_DROPDOWN.name} size="sm" />
            </button>
            {userMenuOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white py-4 shadow-lg"
                role="menu"
              >
                <div className="px-4 pb-3">
                  <div className="flex flex-col items-center text-center">
                    <UserAvatar name={USER_DROPDOWN.name} size="lg" className="mb-2" />
                    <p className="text-sm font-semibold text-gray-900">{USER_DROPDOWN.name}</p>
                    <p className="text-xs text-gray-500">{USER_DROPDOWN.email}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200" />
                <div className="py-1">
                  <Link
                    href="/profile-settings"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/courses"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      // TODO: sign out
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
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
                {navLinks.map(({ label, href, hasDropdown, external }) => {
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
