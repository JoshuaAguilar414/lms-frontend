import type { TrainingItem as TrainingItemType } from '@/types';

function parseProgress(progress: string): { current: number; total: number } {
  const match = progress.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return { current: 0, total: 1 };
  return { current: parseInt(match[1], 10), total: Math.max(1, parseInt(match[2], 10)) };
}

interface CourseProgressDetailProps {
  course: TrainingItemType;
}

export function CourseProgressDetail({ course }: CourseProgressDetailProps) {
  const { current, total } = parseProgress(course.progress);
  const progressPercent = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const isCompleted = current >= total && total > 0;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">{course.title}</h1>
      <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
        <span>Progress</span>
        <span>
          {current} / {total} {isCompleted && '(Completed)'}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${progressPercent}%`, backgroundColor: '#54bd01' }}
        />
      </div>
    </div>
  );
}
