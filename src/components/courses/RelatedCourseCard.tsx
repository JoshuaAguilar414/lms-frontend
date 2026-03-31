import Link from 'next/link';
import Image from 'next/image';
import type { RelatedCourse } from '@/types';

interface RelatedCourseCardProps {
  course: RelatedCourse;
}

export function RelatedCourseCard({ course }: RelatedCourseCardProps) {
  return (
    <article className="flex h-full min-w-[280px] max-w-[320px] flex-shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-hidden px-4 pt-4">
        <Image
          src={course.thumbnail}
          alt=""
          width={320}
          height={200}
          className="w-full rounded-lg object-cover"
          sizes="(max-width: 400px) 280px, 320px"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 pt-3">
        <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900">
          {course.title}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500">
          {course.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-900">{course.price}</span>
          <Link
            href={course.href}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
