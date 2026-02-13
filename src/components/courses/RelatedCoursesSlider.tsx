'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { RelatedCourseCard } from './RelatedCourseCard';
import type { RelatedCourse } from '@/types';

const GAP = 24;

interface RelatedCoursesSliderProps {
  courses: RelatedCourse[];
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

export function RelatedCoursesSlider({ courses }: RelatedCoursesSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { hasOverflow, canScrollLeft, canScrollRight } = useHasOverflow(scrollRef, courses.length);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  if (courses.length === 0) return null;

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
          {courses.map((course) => (
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
