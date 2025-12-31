'use client';

import { saveAnalytics } from '@/app/actions/analytics';

export function LinkClickTracker({ profileId, url }: { profileId: string; url: string }) {
  const handleClick = () => {
    if (profileId) {
      saveAnalytics(profileId, 'click', { url });
    }
  };

  return { handleClick };
}

