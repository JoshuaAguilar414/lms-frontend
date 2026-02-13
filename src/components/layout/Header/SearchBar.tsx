'use client';

import { SearchIcon } from '@/components/icons';

interface SearchBarProps {
  /** When true, always visible (e.g. inside mobile menu). Default: desktop-only. */
  inline?: boolean;
}

export function SearchBar({ inline }: SearchBarProps) {
  return (
    <div className={`font-poppins ${inline ? 'w-full' : 'hidden flex-1 max-w-xl mx-4 lg:block'}`}>
      <div className="relative flex items-center overflow-hidden rounded-full border border-gray-200 bg-white">
        <input
          type="search"
          placeholder="Search by regulation, topic, or risk"
          className="w-full py-2.5 pl-4 pr-14 text-base font-normal text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 border-0"
        />
        <button
          type="button"
          className="absolute right-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d4edda] text-black transition-colors hover:bg-[#54bd01] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#54bd01] focus:ring-offset-2"
          aria-label="Search"
        >
          <SearchIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
