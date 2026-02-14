interface UGCSchemaInput {
  schemaType: string;
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  imageUrl?: string;
  additionalProps?: Record<string, unknown>;
}

export function generateUGCSchema(input: UGCSchemaInput) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  return {
    '@context': 'https://schema.org',
    '@type': input.schemaType,
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.datePublished && { datePublished: input.datePublished }),
    ...(input.dateModified && { dateModified: input.dateModified }),
    ...(input.imageUrl && { image: input.imageUrl }),
    creator: {
      '@type': 'Organization',
      name: '集客メーカー',
      url: siteUrl,
    },
    ...input.additionalProps,
  };
}
