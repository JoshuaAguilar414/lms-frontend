'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { RelatedCourseCard } from './RelatedCourseCard';
import type { RelatedCourse } from '@/types';

const GAP = 24;

interface RelatedCoursesSliderProps {
  courses: RelatedCourse[];
  productId?: string | null;
}

function useHasOverflow(ref: React.RefObject<HTMLDivElement | null>, itemCount: number) {
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth;
    setHasOverflow(overflow);
    setCanScrollLeft(overflow && el.scrollLeft > 0);
    setCanScrollRight(overflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener('scroll', update);
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, [itemCount]);

  return { hasOverflow, canScrollLeft, canScrollRight };
}

interface MarketplaceRecommendationProduct {
  id?: number | string;
  title?: string;
  handle?: string;
  body_html?: string;
  product_type?: string;
  image?: { src?: string };
  images?: Array<{ src?: string }>;
}

const MARKETPLACE_BASE = 'https://marketplace.vectra-intl.com';

function stripHtml(input?: string): string {
  if (!input) return '';
  return input
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function RelatedCoursesSlider({ courses, productId = null }: RelatedCoursesSliderProps) {
  const [displayCourses, setDisplayCourses] = useState<RelatedCourse[]>(courses);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { hasOverflow, canScrollLeft, canScrollRight } = useHasOverflow(
    scrollRef,
    displayCourses.length
  );

  useEffect(() => {
    setDisplayCourses(courses);
  }, [courses]);

  useEffect(() => {
    let cancelled = false;
    if (!productId) return;

    const url = `${MARKETPLACE_BASE}/recommendations/products.json?product_id=${encodeURIComponent(
      productId
    )}&limit=4&intent=related`;

    const run = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { products?: MarketplaceRecommendationProduct[] };
        const products = Array.isArray(data?.products) ? data.products : [];
        const mapped: RelatedCourse[] = products
          .filter((p) => p.handle && p.title)
          .slice(0, 4)
          .map((p) => ({
            id: String(p.id ?? p.handle),
            title: stripHtml(p.title) || 'Course',
            description: stripHtml(p.body_html),
            thumbnail:
              p.image?.src ||
              p.images?.[0]?.src ||
              'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
            tag: p.product_type || 'Course',
            price: '',
            href: `${MARKETPLACE_BASE}/products/${String(p.handle)}`,
          }));
        if (!cancelled && mapped.length > 0) setDisplayCourses(mapped);
      } catch {
        // keep SSR/fallback courses
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  if (displayCourses.length === 0) return null;

  return (
    <section className="rounded-xl p-0 pt-0">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Related</h2>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex h-[420px] items-stretch gap-6 overflow-x-auto scroll-smooth py-2 scrollbar-hide"
          role="region"
          aria-label="Related courses"
        >
          {displayCourses.map((course) => (
            <RelatedCourseCard key={course.id} course={course} />
          ))}
        </div>
        {hasOverflow && (
          <>
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-colors hover:bg-gray-50 disabled:opacity-40"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-colors hover:bg-gray-50 disabled:opacity-40"
              aria-label="Next"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
