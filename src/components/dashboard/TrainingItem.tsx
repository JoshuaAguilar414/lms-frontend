import Image from 'next/image';
import Link from 'next/link';
import type { TrainingItem as TrainingItemType } from '@/types';

interface TrainingItemProps {
  item: TrainingItemType;
}

function parseProgress(progress: string): { current: number; total: number } {
  const match = progress.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return { current: 0, total: 1 };
  return { current: parseInt(match[1], 10), total: Math.max(1, parseInt(match[2], 10)) };
}

type ItemState = 'not_started' | 'in_progress' | 'completed';

function getState(item: TrainingItemType): ItemState {
  const { current, total } = parseProgress(item.progress);
  if (current >= total && total > 0) return 'completed';
  if (current > 0) return 'in_progress';
  return 'not_started';
}

const solidButtonClass =
  'rounded-[10px] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90';
const outlineButtonClass =
  'rounded-[10px] border-2 border-[#54bd01] bg-white px-4 py-2 text-sm font-medium text-[#54bd01] transition-colors hover:bg-[#54bd01]/5';
const completedPillClass =
  'rounded-[10px] border-2 border-[#54bd01] bg-[#D4EDDA] px-3 py-1.5 text-sm font-medium text-[#54bd01]';

export function TrainingItem({ item }: TrainingItemProps) {
  const state = getState(item);
  const { current, total } = parseProgress(item.progress);
  const progressPercent = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className="flex min-h-[100px] flex-col overflow-hidden rounded-[10px] border border-gray-200 bg-white sm:flex-row sm:items-stretch">
      <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-t-[10px] bg-gray-100 sm:h-auto sm:w-36 sm:rounded-l-[10px] sm:rounded-tr-none">
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 144px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-5 py-4 sm:py-5">
        <h3 className="text-base font-normal text-gray-900">{item.title}</h3>
        <div className="min-h-[52px] space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>
              {current}/{total}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${progressPercent}%`, backgroundColor: '#54bd01' }}
            />
          </div>
        </div>
      </div>
      <div className="flex min-h-[44px] w-full flex-shrink-0 flex-wrap items-center gap-2 border-t border-gray-100 p-3 sm:min-h-[40px] sm:w-[280px] sm:flex-shrink-0 sm:border-t-0 sm:border-l sm:border-l-gray-100 sm:py-4 sm:pl-3 sm:pr-4">
        {state === 'not_started' && (
          <Link
            href={`/courses/${item.id}`}
            className={solidButtonClass}
            style={{ backgroundColor: '#54bd01' }}
          >
            Start Learning
          </Link>
        )}
        {state === 'in_progress' && (
          <Link
            href={`/courses/${item.id}`}
            className={solidButtonClass}
            style={{ backgroundColor: '#54bd01' }}
          >
            Continue Learning
          </Link>
        )}
        {state === 'completed' && (
          <>
            <Link
              href={`/courses/${item.id}`}
              className={completedPillClass + ' cursor-pointer transition-opacity hover:opacity-90'}
            >
              Completed
            </Link>
            <button type="button" className={outlineButtonClass}>
              View Certificate
            </button>
          </>
        )}
      </div>
    </div>
  );
}
