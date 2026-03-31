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
  const [resumeState, setResumeState] = useState<{
    lessonLocation?: string;
    suspendData?: string;
  } | null>(null);

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
    let lastSavedProgress = 0;
    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    let latestLessonLocation = '';
    let latestSuspendData = '';

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

      const lessonLocation = String(
        obj.lessonLocation ??
          obj.lesson_location ??
          (obj.data as Record<string, unknown> | undefined)?.lessonLocation ??
          (obj.payload as Record<string, unknown> | undefined)?.lessonLocation ??
          ''
      ).trim();
      if (lessonLocation) latestLessonLocation = lessonLocation;

      const suspendData = String(
        obj.suspendData ??
          obj.suspend_data ??
          (obj.data as Record<string, unknown> | undefined)?.suspendData ??
          (obj.payload as Record<string, unknown> | undefined)?.suspendData ??
          ''
      ).trim();
      if (suspendData) latestSuspendData = suspendData;
    };

    const persist = async (keepalive = false) => {
      const hasBookmark = Boolean(latestLessonLocation || latestSuspendData);
      if (!hasProgress && !hasBookmark) return;
      // Skip duplicate network writes when progress has not moved.
      if (!latestCompleted && latestProgress <= lastSavedProgress && !hasBookmark) return;
      try {
        await api.progress.upsert(
          {
            enrollmentId,
            progress: latestProgress,
            completed: latestCompleted,
            scormData: {
              source: 'scorm-step-save',
              capturedAt: new Date().toISOString(),
              lessonLocation: latestLessonLocation || undefined,
              suspendData: latestSuspendData || undefined,
            },
          },
          { keepalive }
        );
        lastSavedProgress = Math.max(lastSavedProgress, latestProgress);
      } catch {
        // Ignore to avoid blocking page close.
      }
    };

    const scheduleStepSave = () => {
      if (saveTimer) clearTimeout(saveTimer);
      // Debounce writes while user is actively learning.
      saveTimer = setTimeout(() => {
        void persist(false);
      }, 1200);
    };

    const onMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          updateProgressFromUnknown(parsed);
          scheduleStepSave();
        } catch {
          return;
        }
        return;
      }
      updateProgressFromUnknown(event.data);
      scheduleStepSave();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void persist(true);
      }
    };

    const onBeforeUnload = () => {
      void persist(true);
    };

    const periodicSave = setInterval(() => {
      void persist(false);
    }, 15000);

    window.addEventListener('message', onMessage);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      if (saveTimer) clearTimeout(saveTimer);
      clearInterval(periodicSave);
      window.removeEventListener('message', onMessage);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
      void persist();
    };
  }, [enrollmentId]);

  useEffect(() => {
    let cancelled = false;
    if (!enrollmentId || !getStoredToken()) {
      setResumeState(null);
      return;
    }

    const run = async () => {
      try {
        const progress = await api.progress.get(enrollmentId);
        if (cancelled) return;
        const data = (progress.scormData ?? {}) as Record<string, unknown>;
        const lessonLocation =
          typeof data.lessonLocation === 'string' ? data.lessonLocation : undefined;
        const suspendData = typeof data.suspendData === 'string' ? data.suspendData : undefined;
        setResumeState({ lessonLocation, suspendData });
      } catch {
        if (!cancelled) setResumeState(null);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [enrollmentId]);

  const handleRuntimeData = (data: {
    progress?: number;
    lessonLocation?: string;
    suspendData?: string;
    completionStatus?: string;
    successStatus?: string;
  }) => {
    // Reuse the same message ingestion path as SCORM player events.
    window.postMessage(
      {
        progress: data.progress,
        completionStatus: data.completionStatus,
        successStatus: data.successStatus,
        lessonLocation: data.lessonLocation,
        suspendData: data.suspendData,
      },
      window.location.origin
    );
  };

  return (
    <ScormEmbed
      src={src}
      title={title}
      minHeight={minHeight}
      learner={learner}
      resumeState={resumeState}
      onRuntimeData={handleRuntimeData}
    />
  );
}
