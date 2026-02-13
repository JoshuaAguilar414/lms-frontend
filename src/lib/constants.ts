import type { FooterLinkGroup } from '@/types';

export const COMPANY_INFO = {
  name: 'VECTRA INTERNATIONAL',
  tagline: 'Enabling Positive Impact',
  address: 'Chaussée de Wavre 1517B, B-1160 Brussels, Belgium',
  phone: '+32 495 239088',
  email: 'info@vectra-intl.com',
  marketplaceUrl: 'https://marketplace.vectra-intl.com',
  websiteUrl: 'https://vectra-intl.com',
} as const;

export const FOOTER_LINKS: FooterLinkGroup[] = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Home', href: 'https://marketplace.vectra-intl.com/' },
      { label: 'Learning', href: 'https://marketplace.vectra-intl.com/collections/courses' },
      { label: 'Tools', href: 'https://marketplace.vectra-intl.com/collections/assessments' },
      { label: 'Consultancy', href: 'https://marketplace.vectra-intl.com/pages/consultancy' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { label: 'About Us', href: 'https://vectra-intl.com/about/' },
      { label: 'Free Consultation', href: 'https://marketplace.vectra-intl.com/pages/consultancy' },
      { label: 'Ebooks', href: 'https://vectra-intl.com/ebook/' },
      { label: 'Events', href: 'https://vectra-intl.com/events/' },
      { label: 'Resources', href: 'https://vectra-intl.com/resources/' },
      { label: 'Podcasts', href: 'https://vectra-intl.com/podcast/' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Pre & Post Audit Assistance', href: 'https://vectra-intl.com/services/current-situation-analysis/' },
      { label: 'Compliance, Risk, & Due Diligence', href: 'https://vectra-intl.com/services/compliance-risk-due-diligence/' },
      { label: 'Independent Quality Assurance', href: 'https://vectra-intl.com/service-detail/independent-quality-assurance' },
      { label: 'Factory, Farm & Mine Performance Improvement', href: 'https://vectra-intl.com/services/factory-farm-mine-performance-improvement/' },
      { label: 'Reporting', href: 'https://vectra-intl.com/services/reporting/' },
      { label: 'Virtual and Onsite Trainings', href: 'https://vectra-intl.com/services/trainings/' },
    ],
  },
  {
    title: 'Pledges',
    links: [
      { label: 'AI Pledge', href: 'https://vectra-intl.com/ai-pledge/' },
      { label: 'DEI Pledge', href: 'https://vectra-intl.com/dei-pledge/' },
      { label: 'Environmental Pledge', href: 'https://vectra-intl.com/environmental-pledge/' },
      { label: 'Social Impact Pledge', href: 'https://vectra-intl.com/social-impact-pledge/' },
    ],
  },
];

export const SOCIAL_LINKS = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/vectra-international/', icon: 'linkedin' },
  { name: 'YouTube', href: 'https://www.youtube.com/@VECTRAInternational', icon: 'youtube' },
  { name: 'Facebook', href: 'https://www.facebook.com/vectrainternational', icon: 'facebook' },
  { name: 'Instagram', href: 'https://www.instagram.com/vectrainternational/', icon: 'instagram' },
  { name: 'Twitter', href: '#', icon: 'twitter' },
] as const;
