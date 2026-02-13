'use client';

import { usePathname } from 'next/navigation';
import { TopBar } from './TopBar';
import { MainNav } from './MainNav';

export function Header() {
  const pathname = usePathname();
  const isRestrictedPage = pathname === '/restricted';

  return (
    <header className="sticky top-0 z-50">
      {!isRestrictedPage && <TopBar />}
      <MainNav />
    </header>
  );
}
