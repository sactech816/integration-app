'use client';

import ServiceSelector from '@/components/shared/ServiceSelector';

export default function HomeServiceSelector() {
  return (
    <ServiceSelector
      onSelect={(service) => {
        window.location.href = `/${service}`;
      }}
      variant="cards"
      showDescription={true}
      ctaLabel="詳しく見る"
    />
  );
}
