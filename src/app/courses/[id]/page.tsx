import { notFound } from 'next/navigation';
import { Card } from '@/components/ui';
import { ScormEmbed } from '@/components/embed/ScormEmbed';
import { RelatedCoursesSlider } from '@/components/courses/RelatedCoursesSlider';
import type { TrainingItem as TrainingItemType, RelatedCourse } from '@/types';

// Helper function to build SCORM URL
function buildScormUrl(course: TrainingItemType): string | undefined {
  // If scormUrl is provided, use it directly
  if (course.scormUrl) {
    return course.scormUrl;
  }
  // If admissionId is provided, use SCORM player endpoint
  if (course.admissionId) {
    return `/scorm-player?admissionId=${course.admissionId}`;
  }
  // Fallback to local SCORM package
  return (
    process.env.NEXT_PUBLIC_SCORM_SAMPLE_URL ||
    '/scorm/index.html'
  );
}

// In a real app this would come from API/database by id
const COURSES_BY_ID: Record<string, TrainingItemType> = {
  '1': {
    id: '1',
    title: 'What ESG Really Means: Breaking Down the Basics',
    progress: '0/15',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=112&h=112&fit=crop',
    action: 'get_started',
    scormUrl: '/scorm/index.html',
  },
  '2': {
    id: '2',
    title: 'Protecting Migrant Labor',
    progress: '8/15',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=112&h=112&fit=crop',
    action: 'resume',
    scormUrl: 'https://training.vectra-intl.com/lms-backend/Protecting Migrant Labor_Certificate Course (1)',
  },
  '3': {
    id: '3',
    title: 'Lorem Ipsum is simply dummy text of the printing',
    progress: '15/15',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=112&h=112&fit=crop',
    action: 'view_certificate',
    scormUrl: 'https://training.vectra-intl.com/lms-backend/Protecting Migrant Labor_Certificate Course (1)',
  },
};

const RELATED_COURSES: RelatedCourse[] = [
  {
    id: 'r1',
    title: '3 Steps to Identify ESG Risks',
    description: 'Score suppliers, track actions, export documentation.',
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop',
    tag: 'Tool',
    price: '£5.00',
    href: 'https://marketplace.vectra-intl.com/products/how-to-report-forced-labor-in-agriculture',
  },
  {
    id: 'r2',
    title: 'A Boardroom Debate - Which ESG Initiative Should You Prioritize?',
    description: 'Score suppliers, track actions, export documentation.',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop',
    tag: 'Tool',
    price: '£5.00',
    href: 'https://marketplace.vectra-intl.com/products/how-to-report-forced-labor-in-agriculture',
  },
  {
    id: 'r3',
    title: 'Acronyms Used in ESG Area - Introduction',
    description: 'Score suppliers, track actions, export documentation.',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
    tag: 'Tool',
    price: '£0.00',
    href: 'https://marketplace.vectra-intl.com/products/how-to-report-forced-labor-in-agriculture',
  },
  {
    id: 'r4',
    title: 'Protecting Migrant Labor',
    description: 'Score suppliers, track actions, export documentation.',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
    tag: 'Tool',
    price: '£5.00',
    href: 'https://marketplace.vectra-intl.com/products/how-to-report-forced-labor-in-agriculture',
  },
  {
    id: 'r5',
    title: 'What ESG Really Means: Breaking Down the Basics',
    description: 'Score suppliers, track actions, export documentation.',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
    tag: 'Tool',
    price: '£5.00',
    href: 'https://marketplace.vectra-intl.com/products/how-to-report-forced-labor-in-agriculture',
  },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseProgressPage({ params }: PageProps) {
  const { id } = await params;
  const course = COURSES_BY_ID[id];
  if (!course) notFound();

  const scormUrl = buildScormUrl(course);

  return (
    <div className="bg-gray-100">
      <div className="mx-auto max-w-screen-2xl px-4 py-3 sm:px-6 lg:px-8">
        {scormUrl ? (
          <Card className="mt-4 p-0 overflow-hidden">
            <ScormEmbed
              src={scormUrl}
              title={course.title}
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
                Set <code className="rounded bg-gray-200 px-1">scormUrl</code> on the course or{' '}
                <code className="rounded bg-gray-200 px-1">NEXT_PUBLIC_SCORM_SAMPLE_URL</code> in .env to embed content.
              </p>
            </div>
          </Card>
        )}
        <Card className="mt-4 mb-4 pb-8">
          <RelatedCoursesSlider courses={RELATED_COURSES} />
        </Card>
      </div>
    </div>
  );
}
