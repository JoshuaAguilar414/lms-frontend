import Link from 'next/link';
import Image from 'next/image';
import { MapPinIcon, PhoneIcon, MailIcon } from '@/components/icons';
import { COMPANY_INFO } from '@/lib/constants';

export function FooterCompany() {
  return (
    <div className="space-y-4 pr-20">
      <a
        href={COMPANY_INFO.marketplaceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block shrink-0"
        aria-label="VECTRA Marketplace"
      >
        <Image
          src="/VECTRA LOGO SECONDARY_WHITE SEMI-01.png"
          alt={`${COMPANY_INFO.name} - ${COMPANY_INFO.tagline}`}
          width={220}
          height={58}
          className="h-10 w-auto object-contain"
        />
      </a>
      <div className="space-y-2 mt-3" style={{ fontSize: 'var(--vf-contact-size)', fontWeight: 'var(--vf-contact-weight)', color: 'var(--vf-link)' }}>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY_INFO.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2.5 text-white hover:text-white transition-colors"
        >
          <MapPinIcon className="mt-0.5 flex-shrink-0 w-[18px] h-[18px] text-[#688bb0]" />
          <span>{COMPANY_INFO.address}</span>
        </a>
        <a
          href={`tel:${COMPANY_INFO.phone}`}
          className="flex items-center gap-2.5 text-white hover:text-white transition-colors"
        >
          <PhoneIcon className="flex-shrink-0 w-[18px] h-[18px] text-[#688bb0]" />
          <span>{COMPANY_INFO.phone}</span>
        </a>
        <a
          href={`mailto:${COMPANY_INFO.email}`}
          className="flex items-center gap-2.5 text-white hover:text-white transition-colors"
        >
          <MailIcon className="flex-shrink-0 w-[18px] h-[18px] text-[#688bb0]" />
          <span>{COMPANY_INFO.email}</span>
        </a>
      </div>
    </div>
  );
}
