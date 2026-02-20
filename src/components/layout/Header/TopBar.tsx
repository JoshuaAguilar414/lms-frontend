'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TopBar() {
  const pathname = usePathname();
  const isMyCourses =
    pathname === '/' ||
    pathname.startsWith('/purchases') ||
    pathname.startsWith('/courses') ||
    pathname.startsWith('/learning');

  return (
    <div
      className="font-poppins text-white font-normal py-2 px-4 sm:px-6 md:px-8 lg:px-12"
      style={{ backgroundColor: '#0a2543' }}
    >
      <nav className="flex items-center" aria-label="Top links">
        <ul className="flex list-none flex-row items-center gap-6 p-0 m-0" role="list">
          <li>
            <Link
              href="https://marketplace.vectra-intl.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-normal transition-colors hover:text-[#54bd01] ${!isMyCourses ? 'font-semibold underline' : 'no-underline'}`}
            >
              Marketplace
            </Link>
          </li>
          <li>
            <Link
              href="/courses"
              className={`text-sm font-normal transition-colors hover:text-[#54bd01] no-underline ${isMyCourses ? 'font-semibold underline' : ''}`}
            >
              My Courses
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
