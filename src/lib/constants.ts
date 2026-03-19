import type { FooterLinkGroup } from '@/types';

/** Base URL of this LMS app (for Shopify "My Courses" redirect target). */
const getLmsBaseUrl = () =>
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const COMPANY_INFO = {
  name: 'VECTRA INTERNATIONAL',
  tagline: 'Enabling Positive Impact',
  address: 'Chaussée de Wavre 1517B, B-1160 Brussels, Belgium',
  phone: '+32 262 06118',
  email: 'info@vectra-intl.com',
  marketplaceUrl: 'https://marketplace.vectra-intl.com',
  /**
   * LMS frontend base URL (e.g. https://training.vectra-intl.com).
   * My Courses: Shopify links to {backend}/api/courses/user/{customerId}/{email};
   * backend redirects to {lmsUrl}/auth/login?jwtToken=<lms-token>.
   */
  get lmsUrl() {
    return getLmsBaseUrl();
  },
  /** My Courses step 1: backend API URL for the redirect (use backend domain, not frontend). */
  get lmsBackendMyCoursesUrl() {
    const apiBase =
      typeof window !== 'undefined'
        ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '')
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiBase}/api/courses/user`;
  },
  /** My Courses step 2: frontend login page (where backend redirects with jwtToken). */
  get lmsAuthLoginUrl() {
    return `${getLmsBaseUrl()}/auth/login`;
  },
  /** Shopify account order detail URL pattern (use with shop ID and order ID) */
  marketplaceOrderUrl: (orderId: string, shopId?: string | null) =>
    shopId
      ? `https://shopify.com/${shopId}/account/orders/${orderId}`
      : `https://marketplace.vectra-intl.com/account/orders/${orderId}`,
  /** Product page on marketplace (use Shopify product handle) */
  marketplaceProductUrl: (handle: string) =>
    `https://marketplace.vectra-intl.com/products/${handle}`,
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
