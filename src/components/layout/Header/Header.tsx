'use client';

import { TopBar } from './TopBar';
import { MainNav } from './MainNav';

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <TopBar />
      <MainNav />
    </header>
  );
}
