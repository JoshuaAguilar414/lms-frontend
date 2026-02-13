import { Card } from '@/components/ui';
import { BookIcon } from '@/components/icons';
import { TrainingItem } from './TrainingItem';
import type { TrainingItem as TrainingItemType } from '@/types';

interface MyTrainingsCardProps {
  trainings?: TrainingItemType[];
}

const placeholderImage =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=112&h=112&fit=crop';

const defaultTrainings: TrainingItemType[] = [
  {
    id: '1',
    title: 'Acronyms Used in ESG Area',
    progress: '0/15',
    thumbnail: placeholderImage,
    action: 'get_started',
  },
  {
    id: '2',
    title: 'Protecting Migrant Labor',
    progress: '8/15',
    thumbnail: placeholderImage,
    action: 'resume',
  },
  {
    id: '3',
    title: 'Lorem Ipsum is simply dummy text of the printing',
    progress: '15/15',
    thumbnail: placeholderImage,
    action: 'view_certificate',
  },
];

export function MyTrainingsCard({ trainings = defaultTrainings }: MyTrainingsCardProps = {}) {
  return (
    <Card className="flex flex-col">
      <div className="mb-6 flex items-center gap-2">
        <BookIcon className="h-5 w-5 text-black" />
        <h2 className="font-poppins text-xl font-bold text-[#00263d]">My Courses</h2>
      </div>
      <div className="flex flex-col gap-4">
        {trainings.map((item) => (
          <TrainingItem key={item.id} item={item} />
        ))}
      </div>
    </Card>
  );
}
