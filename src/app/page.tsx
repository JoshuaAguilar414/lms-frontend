import { AuthGuard } from '@/components/auth';
import { MyTrainingsCard, OtherProductsCard } from '@/components/dashboard';
import { MOCK_SCORM_COURSES } from '@/data/mockScormCourses';
import type { TrainingItem } from '@/types';

const mockTrainings: TrainingItem[] = MOCK_SCORM_COURSES.map((c) => ({
  id: c.id,
  title: c.title,
  progress: '0/1',
  thumbnail: c.thumbnail,
  action: 'get_started',
  scormUrl: c.scormUrl,
}));

/** When true, dashboard and mock SCORM course pages are shown without login (for testing). */
const isDemoScorm = process.env.NEXT_PUBLIC_DEMO_SCORM === 'true';

export default function DashboardPage() {
  const content = (
    <div className="bg-gray-100">
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[7.5fr_2.5fr]">
          <MyTrainingsCard trainings={mockTrainings} />
          <OtherProductsCard />
        </div>
      </div>
    </div>
  );
  return isDemoScorm ? content : <AuthGuard>{content}</AuthGuard>;
}
