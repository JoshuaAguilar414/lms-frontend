'use client';

import { useEffect, useState } from 'react';
import { ScormEmbed } from '@/components/embed/ScormEmbed';
import { api, getStoredToken } from '@/lib/api';
import type { ScormLearnerInfo } from '@/components/embed/scormLearnerPrefill';

function learnerFromProfile(me: {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}): ScormLearnerInfo | null {
  const fromParts = [me.firstName, me.lastName].filter(Boolean).join(' ').trim();
  const email = me.email?.trim();
  if (!email) return null;
  const name =
    me.name?.trim() || fromParts || email.split('@')[0] || 'Learner';
  return { name, email };
}

export function CourseScormPlayer({
  src,
  title,
  courseId,
  minHeight = 900,
}: {
  src: string;
  title: string;
  courseId: string;
  minHeight?: number;
}) {
  const [learner, setLearner] = useState<ScormLearnerInfo | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!getStoredToken()) {
        if (!cancelled) setLearner(null);
        return;
      }
      try {
        const me = await api.auth.me();
        if (cancelled) return;
        setLearner(learnerFromProfile(me));
      } catch {
        if (!cancelled) setLearner(null);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) setEnrollmentId(null);
        return;
      }
      try {
        const orders = await api.orders.list();
        if (cancelled) return;
        const matched = orders.find((o) => {
          const currentCourseId = o.courseId?._id;
          const currentShopifyProductId = o.courseId?.shopifyProductId || o.shopifyProductId;
          return currentCourseId === courseId || currentShopifyProductId === courseId;
        });
        setEnrollmentId(matched?._id ?? null);
      } catch {
        if (!cancelled) setEnrollmentId(null);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token || !enrollmentId) return;

    let latestProgress = 0;
    let latestCompleted = false;
    let hasProgress = false;

    const parsePercent = (value: unknown): number | null => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.max(0, Math.min(100, value));
      }
      if (typeof value === 'string') {
        const numeric = Number(value.replace('%', '').trim());
        if (Number.isFinite(numeric)) return Math.max(0, Math.min(100, numeric));
      }
      return null;
    };

    const updateProgressFromUnknown = (source: unknown) => {
      if (!source || typeof source !== 'object') return;
      const obj = source as Record<string, unknown>;
      const candidates: unknown[] = [
        obj.progress,
        obj.percentage,
        obj.percent,
        obj.score,
        obj.rawScore,
        obj.lessonProgress,
        obj.completion,
        (obj.data as Record<string, unknown> | undefined)?.progress,
        (obj.data as Record<string, unknown> | undefined)?.percentage,
        (obj.payload as Record<string, unknown> | undefined)?.progress,
        (obj.payload as Record<string, unknown> | undefined)?.percentage,
      ];
      for (const candidate of candidates) {
        const parsed = parsePercent(candidate);
        if (parsed != null) {
          latestProgress = Math.max(latestProgress, parsed);
          hasProgress = true;
          break;
        }
      }

      const completionStatus = String(
        obj.completionStatus ??
          obj.lessonStatus ??
          (obj.data as Record<string, unknown> | undefined)?.completionStatus ??
          (obj.payload as Record<string, unknown> | undefined)?.completionStatus ??
          ''
      ).toLowerCase();
      if (completionStatus.includes('completed') || completionStatus.includes('passed')) {
        latestCompleted = true;
      }

      if (latestProgress >= 100) latestCompleted = true;
    };

    const persist = async (keepalive = false) => {
      if (!hasProgress) return;
      try {
        await api.progress.upsert(
          {
            enrollmentId,
            progress: latestProgress,
            completed: latestCompleted,
            scormData: {
              source: 'scorm-close-save',
              capturedAt: new Date().toISOString(),
            },
          },
          { keepalive }
        );
      } catch {
        // Ignore to avoid blocking page close.
      }
    };

    const onMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          updateProgressFromUnknown(parsed);
        } catch {
          return;
        }
        return;
      }
      updateProgressFromUnknown(event.data);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void persist(true);
      }
    };

    const onBeforeUnload = () => {
      void persist(true);
    };

    window.addEventListener('message', onMessage);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
      void persist();
    };
  }, [enrollmentId]);

  return <ScormEmbed src={src} title={title} minHeight={minHeight} learner={learner} />;
}
