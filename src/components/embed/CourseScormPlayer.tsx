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
  minHeight = 900,
}: {
  src: string;
  title: string;
  minHeight?: number;
}) {
  const [learner, setLearner] = useState<ScormLearnerInfo | null>(null);

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

  return <ScormEmbed src={src} title={title} minHeight={minHeight} learner={learner} />;
}
