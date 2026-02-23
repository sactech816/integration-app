'use client';

import ServiceSelector from '@/components/shared/ServiceSelector';

export default function HomeServiceSelector() {
  return (
    <ServiceSelector
      onSelect={(service) => {
        window.location.href = `/${service}/editor`;
      }}
      variant="cards"
      showDescription={true}
    />
  );
}
