import Link from 'next/link';
import { FOOTER_LINKS } from '@/lib/constants';

export function FooterLinks() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {FOOTER_LINKS.map((group) => (
        <div key={group.title}>
          <h3
            className="text-white mb-3"
            style={{ fontSize: 'var(--vf-hdr-size)', fontWeight: 'var(--vf-hdr-weight)' }}
          >
            {group.title}
          </h3>
          <ul className="space-y-2 list-none p-0 m-0">
            {group.links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#54bd01] hover:underline transition-colors no-underline"
                  style={{ fontSize: 'var(--vf-menu-fs)' }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
