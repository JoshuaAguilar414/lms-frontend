import Link from 'next/link';

export function FooterBottom() {
  return (
    <div
      className="font-poppins flex flex-col items-center justify-between gap-4 px-6 py-[30px] text-white sm:flex-row sm:px-8 lg:px-12"
      style={{ backgroundColor: '#101822', color: '#ffffff' }}
    >
      <div className="mx-auto flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-white" style={{ fontSize: 'var(--vf-copy-size)' }}>
          © {new Date().getFullYear()} VECTRA International | All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link
            href="https://marketplace.vectra-intl.com/pages/terms-and-conditions"
            className="text-white no-underline hover:underline hover:text-[#1ab012] transition-colors"
            style={{ fontSize: 'var(--vf-legal-size)', fontWeight: 'var(--vf-legal-weight)' }}
          >
            Terms & Conditions
          </Link>
          <Link
            href="https://marketplace.vectra-intl.com/pages/privacy-policy"
            className="text-white no-underline hover:underline hover:text-[#1ab012] transition-colors"
            style={{ fontSize: 'var(--vf-legal-size)', fontWeight: 'var(--vf-legal-weight)' }}
          >
            Privacy Policy
          </Link>
          <Link
            href="https://marketplace.vectra-intl.com/pages/cookie-policy"
            className="text-white no-underline hover:underline hover:text-[#1ab012] transition-colors"
            style={{ fontSize: 'var(--vf-legal-size)', fontWeight: 'var(--vf-legal-weight)' }}
          >
            Cookie Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
