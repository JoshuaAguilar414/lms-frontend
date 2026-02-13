import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/constants';

export function AccessRestricted() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-[#F6F7F9] px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1
          className="text-2xl font-bold sm:text-[1.6rem]"
          style={{ color: '#00263d' }}
        >
          Access Restricted
        </h1>
        <h2
          className="mt-2 text-xl font-semibold sm:text-[1.3rem]"
          style={{ color: '#54bd01' }}
        >
          Login or Purchase Required
        </h2>
        <p className="mt-4 text-base leading-relaxed text-gray-600">
          You&apos;re trying to access the VECTRA International Learning Portal without logging in
          or purchasing a course. Please log in or buy a course to continue learning and unlock full
          access.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={COMPANY_INFO.marketplaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#54bd01' }}
          >
            Purchase Course Now
          </Link>
        </div>
      </div>
    </div>
  );
}
