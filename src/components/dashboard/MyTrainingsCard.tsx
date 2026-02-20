'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { BookIcon } from '@/components/icons';
import { TrainingItem } from './TrainingItem';
import type { TrainingItem as TrainingItemType } from '@/types';
import { api, getStoredToken, type EnrollmentResponse } from '@/lib/api';
import { COMPANY_INFO } from '@/lib/constants';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=112&h=112&fit=crop';

function enrollmentToTrainingItem(e: EnrollmentResponse): TrainingItemType {
  const course = e.courseId;
  const total = Math.max(1, course?.totalLessons ?? 1);
  const pct = e.progress?.progress ?? 0;
  const current = Math.min(total, Math.round((pct / 100) * total));
  const completed = e.progress?.completed ?? false;
  const progressStr = `${current}/${total}`;
  let action: 'get_started' | 'resume' | 'view_certificate' = 'get_started';
  if (completed) action = 'view_certificate';
  else if (current > 0) action = 'resume';

  return {
    id: course?._id ?? e._id,
    title: course?.title ?? 'Course',
    progress: progressStr,
    thumbnail: course?.thumbnail ?? PLACEHOLDER_IMAGE,
    action,
    scormUrl: course?.scormUrl,
    admissionId: course?.admissionId,
  };
}

interface MyTrainingsCardProps {
  trainings?: TrainingItemType[] | null;
}

export function MyTrainingsCard({ trainings: trainingsProp = null }: MyTrainingsCardProps) {
  const [trainings, setTrainings] = useState<TrainingItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trainingsProp != null) {
      setTrainings(Array.isArray(trainingsProp) ? trainingsProp : []);
      setLoading(false);
      setError(null);
      return;
    }
    const token = getStoredToken();
    if (!token) {
      setTrainings([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.enrollments
      .list()
      .then((data) => {
        if (!cancelled) {
          setTrainings((data || []).map(enrollmentToTrainingItem));
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load trainings');
          setTrainings([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trainingsProp]);

  const noAuth = trainingsProp == null && !getStoredToken() && !loading;
  const empty = !loading && !error && trainings.length === 0;

  return (
    <Card className="flex flex-col">
      <div className="mb-6 flex items-center gap-2">
        <BookIcon className="h-5 w-5 text-black" />
        <h2 className="font-poppins text-xl font-bold text-[#00263d]">My Courses</h2>
      </div>

      {loading && (
        <div className="py-8 text-center text-gray-500">Loading courses…</div>
      )}

      {error && (
        <div className="py-8 text-center text-red-600">{error}</div>
      )}

      {noAuth && !loading && (
        <div className="px-6 py-12 text-center text-gray-600">
          Sign in via Shopify to see your courses.
          <br />
          <a
            href={COMPANY_INFO.marketplaceUrl}
            className="mt-2 inline-block text-[#54bd01] hover:underline"
          >
            Go to Marketplace
          </a>
        </div>
      )}

      {!loading && !error && empty && !noAuth && (
        <div className="py-8 text-center text-gray-500">No courses yet.</div>
      )}

      {!loading && !error && trainings.length > 0 && (
        <div className="flex flex-col gap-4">
          {trainings.map((item) => (
            <TrainingItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </Card>
  );
}
