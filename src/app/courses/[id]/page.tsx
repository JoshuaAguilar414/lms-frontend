import { notFound } from 'next/navigation';
import { AuthGuard } from '@/components/auth';
import { Card } from '@/components/ui';
import { CourseScormPlayer } from '@/components/embed/CourseScormPlayer';
import { RelatedCoursesSlider } from '@/components/courses/RelatedCoursesSlider';
import type { RelatedCourse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MARKETPLACE_BASE = 'https://marketplace.vectra-intl.com';

function marketplaceProductUrl(handle: string): string {
  return `${MARKETPLACE_BASE}/products/${handle}`;
}

/** Use /uploads/... on the Next host so rewrites proxy to the API (same-origin iframe + asset URLs). */
function scormSrcForApp(scormUrl: string): string {
  if (!/^https?:\/\//i.test(scormUrl)) return scormUrl;
  try {
    const u = new URL(scormUrl);
    if (!u.pathname.startsWith('/uploads/')) return scormUrl;
    const api = new URL(API_BASE.replace(/\/$/, '') + '/');
    const samePort = u.port === api.port || (!u.port && !api.port);
    const local = ['localhost', '127.0.0.1'];
    const sameBackend =
      u.origin === api.origin ||
      (local.includes(u.hostname) && local.includes(api.hostname) && samePort);
    if (sameBackend) return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    /* keep as-is */
  }
  return scormUrl;
}

function buildScormUrl(course: {
  scormUrl?: string | null;
  admissionId?: string | null;
}): string | undefined {
  if (course.scormUrl) return scormSrcForApp(course.scormUrl);
  if (course.admissionId) return `/scorm-player?admissionId=${course.admissionId}`;
  return (
    process.env.NEXT_PUBLIC_SCORM_SAMPLE_URL ||
    '/scorm/index.html'
  );
}

interface ApiCourse {
  _id: string;
  shopifyProductId?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  handle?: string;
  scormUrl?: string;
  admissionId?: string;
  totalLessons?: number;
}

interface MarketplaceRecommendationProduct {
  id?: number | string;
  title?: string;
  handle?: string;
  body_html?: string;
  product_type?: string;
  image?: {
    src?: string;
    alt?: string | null;
  };
  images?: Array<{
    src?: string;
    alt?: string | null;
  }>;
}

async function fetchCourse(id: string): Promise<ApiCourse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/courses/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchCourses(): Promise<ApiCourse[]> {
  try {
    const res = await fetch(`${API_BASE}/api/courses`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function toNumericProductId(input?: string): string | null {
  if (!input) return null;
  const s = input.trim();
  if (/^\d+$/.test(s)) return s;
  const match = s.match(/(\d{6,})/);
  return match?.[1] ?? null;
}

function decodeBasicHtmlEntities(input: string): string {
  return input
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripHtml(input?: string): string {
  if (!input) return '';
  const decoded = decodeBasicHtmlEntities(input);
  // Run strip twice so encoded tags that become real tags are also removed.
  return decoded
    .replace(/<[^>]*>/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchRelatedRecommendations(productId: string): Promise<RelatedCourse[]> {
  try {
    const url = `${MARKETPLACE_BASE}/recommendations/products.json?product_id=${encodeURIComponent(
      productId
    )}&limit=4&intent=related`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: MarketplaceRecommendationProduct[] };
    const products = Array.isArray(data?.products) ? data.products : [];
    return products
      .filter((p) => p.handle && p.title)
      .slice(0, 8)
      .map((p) => ({
        id: String(p.id ?? p.handle),
        title: p.title || 'Course',
        description: stripHtml(p.body_html),
        thumbnail:
          p.image?.src ||
          p.images?.[0]?.src ||
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
        tag: p.product_type || 'Course',
        price: '',
        href: marketplaceProductUrl(String(p.handle)),
      }));
  } catch {
    return [];
  }
}

function coursePagePath(c: ApiCourse): string {
  const segment = c.shopifyProductId?.trim() || c._id;
  return `/courses/${encodeURIComponent(segment)}`;
}

function toRelatedCourse(c: ApiCourse): RelatedCourse {
  return {
    id: c._id,
    title: c.title,
    description: c.description ?? '',
    thumbnail: c.thumbnail ?? 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
    tag: 'Course',
    price: '',
    href: c.handle ? marketplaceProductUrl(c.handle) : coursePagePath(c),
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseProgressPage({ params }: PageProps) {
  const { id } = await params;

  const [course, allCourses] = await Promise.all([
    fetchCourse(id),
    fetchCourses(),
  ]);

  if (!course) notFound();

  const scormUrl = buildScormUrl(course);
  const numericProductId = toNumericProductId(course.shopifyProductId || id);
  const recommendedCourses = numericProductId
    ? await fetchRelatedRecommendations(numericProductId)
    : [];

  const relatedCourses: RelatedCourse[] =
    recommendedCourses.length > 0
      ? recommendedCourses
      : allCourses
          .filter((c) => c._id !== id && c.shopifyProductId !== id)
          .slice(0, 8)
          .map(toRelatedCourse);

  return (
    <AuthGuard>
      <div className="bg-gray-100">
        <div className="mx-auto max-w-screen-2xl px-4 py-3 sm:px-6 lg:px-8">
          {scormUrl ? (
            <Card className="mt-4 p-0 overflow-hidden">
              <CourseScormPlayer
                src={scormUrl}
                title={course.title}
                courseId={id}
                minHeight={900}
              />
            </Card>
          ) : (
            <Card className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Course content</h2>
              <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500">
                <p className="text-center text-sm">
                  No SCORM package URL configured for this course.
                  <br />
                  Set <code className="rounded bg-gray-200 px-1">scormUrl</code> or{' '}
                  <code className="rounded bg-gray-200 px-1">admissionId</code> on the course, or{' '}
                  <code className="rounded bg-gray-200 px-1">NEXT_PUBLIC_SCORM_SAMPLE_URL</code> in .env.
                </p>
              </div>
            </Card>
          )}
          <Card className="mt-4 mb-4 pb-8">
            <RelatedCoursesSlider courses={relatedCourses} />
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
