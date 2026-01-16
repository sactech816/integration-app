import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <Link href="/" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
        <Home size={16} />
        ホーム
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={16} className="text-gray-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-900 transition-colors">
              {item.name}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold">{item.name}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[], baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        ...(item.href && { item: `${baseUrl}${item.href}` }),
      })),
    ],
  };
}
