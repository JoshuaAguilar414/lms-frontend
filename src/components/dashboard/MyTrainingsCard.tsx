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
  const lineItem = e.orderData?.lineItems?.edges?.[0]?.node;
  const product = lineItem?.variant?.product;
  const total = Math.max(1, course?.totalLessons ?? 1);
  const pct = e.progress?.progress ?? 0;
  const current = Math.min(total, Math.round((pct / 100) * total));
  const completed = e.progress?.completed ?? false;
  const progressStr = `${current}/${total}`;
  let action: 'get_started' | 'resume' | 'view_certificate' = 'get_started';
  if (completed) action = 'view_certificate';
  else if (current > 0) action = 'resume';

  return {
    id: course?._id ?? e.shopifyProductId ?? e._id,
    title: course?.title ?? lineItem?.title ?? product?.title ?? 'Course',
    progress: progressStr,
    thumbnail:
      e.shopifyProductImage ??
      product?.featuredImage?.url ??
      course?.thumbnail ??
      course?.image ??
      PLACEHOLDER_IMAGE,
    action,
    scormUrl: course?.scormUrl,
    admissionId: course?.admissionId,
  };
}

function dedupeTrainingsByCourse(items: TrainingItemType[]): TrainingItemType[] {
  const deduped = new Map<string, TrainingItemType>();
  for (const item of items) {
    if (!deduped.has(item.id)) {
      deduped.set(item.id, item);
      continue;
    }
    const existing = deduped.get(item.id);
    if (!existing) continue;
    const [existingCurrent, existingTotal] = existing.progress.split('/').map((v) => Number(v) || 0);
    const [nextCurrent, nextTotal] = item.progress.split('/').map((v) => Number(v) || 0);
    const existingPct = existingTotal > 0 ? existingCurrent / existingTotal : 0;
    const nextPct = nextTotal > 0 ? nextCurrent / nextTotal : 0;
    if (nextPct > existingPct) deduped.set(item.id, item);
  }
  return Array.from(deduped.values());
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
    api.orders
      .list()
      .then((data) => {
        if (!cancelled) {
          setTrainings(dedupeTrainingsByCourse((data || []).map(enrollmentToTrainingItem)));
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
        <h2 className="font-poppins text-xl font-bold text-[#00263d]">My Progresses</h2>
      </div>

      {loading && (
        <div className="py-8 text-center text-gray-500">Loading progresses…</div>
      )}

      {error && (
        <div className="py-8 text-center text-red-600">{error}</div>
      )}

      {noAuth && !loading && (
        <div className="px-6 py-12 text-center text-gray-600">
          Sign in via Shopify to see your progresses.
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
        <div className="py-8 text-center text-gray-500">No progresses yet.</div>
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
