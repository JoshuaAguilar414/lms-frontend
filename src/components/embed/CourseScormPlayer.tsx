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
        const enrollments = await api.enrollments.list();
        if (cancelled) return;
        const matched = enrollments.find((o) => {
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
      const dataObj = (obj.data as Record<string, unknown> | undefined) ?? {};
      const payloadObj = (obj.payload as Record<string, unknown> | undefined) ?? {};
      const candidates: unknown[] = [
        obj.progress,
        obj.percentage,
        obj.percent,
        obj.score,
        obj.rawScore,
        obj['cmi.core.score.raw'],
        obj['cmi.score.raw'],
        obj['cmi.score.scaled'],
        obj.lessonProgress,
        obj.completion,
        dataObj.progress,
        dataObj.percentage,
        dataObj.score,
        dataObj.rawScore,
        dataObj['cmi.core.score.raw'],
        dataObj['cmi.score.raw'],
        dataObj['cmi.score.scaled'],
        payloadObj.progress,
        payloadObj.percentage,
        payloadObj.score,
        payloadObj.rawScore,
        payloadObj['cmi.core.score.raw'],
        payloadObj['cmi.score.raw'],
        payloadObj['cmi.score.scaled'],
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
          obj['cmi.core.lesson_status'] ??
          obj['cmi.completion_status'] ??
          dataObj.completionStatus ??
          dataObj.lessonStatus ??
          dataObj['cmi.core.lesson_status'] ??
          dataObj['cmi.completion_status'] ??
          payloadObj.completionStatus ??
          payloadObj.lessonStatus ??
          payloadObj['cmi.core.lesson_status'] ??
          payloadObj['cmi.completion_status'] ??
          ''
      ).toLowerCase();
      if (completionStatus.includes('completed') || completionStatus.includes('passed')) {
        latestCompleted = true;
      }

      if (latestProgress >= 100) latestCompleted = true;

      const lessonLocation = String(
        obj.lessonLocation ??
          obj.lesson_location ??
          obj['cmi.core.lesson_location'] ??
          obj['cmi.location'] ??
          dataObj.lessonLocation ??
          dataObj.lesson_location ??
          dataObj['cmi.core.lesson_location'] ??
          dataObj['cmi.location'] ??
          payloadObj.lessonLocation ??
          payloadObj.lesson_location ??
          payloadObj['cmi.core.lesson_location'] ??
          payloadObj['cmi.location'] ??
          ''
      ).trim();
      if (lessonLocation) latestLessonLocation = lessonLocation;

      const suspendData = String(
        obj.suspendData ??
          obj.suspend_data ??
          obj['cmi.suspend_data'] ??
          dataObj.suspendData ??
          dataObj.suspend_data ??
          dataObj['cmi.suspend_data'] ??
          payloadObj.suspendData ??
          payloadObj.suspend_data ??
          payloadObj['cmi.suspend_data'] ??
          ''
      ).trim();
      if (suspendData) latestSuspendData = suspendData;

      // Common SCORM SetValue event shape: { key/name/element, value }
      const scormKey = String(
        obj.key ?? obj.name ?? obj.element ?? dataObj.key ?? payloadObj.key ?? ''
      ).trim();
      const scormValueRaw =
        obj.value ?? obj.val ?? dataObj.value ?? dataObj.val ?? payloadObj.value ?? payloadObj.val;
      const scormValue =
        typeof scormValueRaw === 'string' || typeof scormValueRaw === 'number'
          ? String(scormValueRaw).trim()
          : '';
      if (scormKey && scormValue) {
        if (scormKey === 'cmi.core.lesson_location' || scormKey === 'cmi.location') {
          latestLessonLocation = scormValue;
        }
        if (scormKey === 'cmi.suspend_data') {
          latestSuspendData = scormValue;
        }
        if (
          scormKey === 'cmi.core.score.raw' ||
          scormKey === 'cmi.score.raw' ||
          scormKey === 'cmi.score.scaled'
        ) {
          const parsed = parsePercent(scormValue);
          if (parsed != null) {
            latestProgress = Math.max(latestProgress, parsed);
            hasProgress = true;
          }
        }
        if (
          scormKey === 'cmi.core.lesson_status' ||
          scormKey === 'cmi.completion_status' ||
          scormKey === 'cmi.success_status'
        ) {
          const s = scormValue.toLowerCase();
          if (s.includes('completed') || s.includes('passed')) latestCompleted = true;
        }
      }
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

    const onRuntimeEvent = (event: Event) => {
      const custom = event as CustomEvent<Record<string, unknown>>;
      if (!custom.detail) return;
      updateProgressFromUnknown(custom.detail);
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
    window.addEventListener('lms-scorm-runtime', onRuntimeEvent as EventListener);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      if (saveTimer) clearTimeout(saveTimer);
      clearInterval(periodicSave);
      window.removeEventListener('message', onMessage);
      window.removeEventListener('lms-scorm-runtime', onRuntimeEvent as EventListener);
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
    window.dispatchEvent(
      new CustomEvent('lms-scorm-runtime', {
        detail: {
          progress: data.progress,
          completionStatus: data.completionStatus,
          successStatus: data.successStatus,
          lessonLocation: data.lessonLocation,
          suspendData: data.suspendData,
        },
      })
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
