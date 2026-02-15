import React from 'react';
import Link from 'next/link';
import { Eye, ArrowRight } from 'lucide-react';
import { getRelatedContents, RelatedItem } from '@/app/actions/related-content';

const TYPE_LABELS: Record<string, string> = {
  quiz: '診断クイズ',
  profile: 'プロフィールLP',
  business: 'ビジネスLP',
  survey: 'アンケート',
  salesletter: 'セールスレター',
};

const TYPE_PATH: Record<string, string> = {
  quiz: 'quiz',
  profile: 'profile',
  business: 'business',
  survey: 'survey',
  salesletter: 's',
};

const TYPE_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  quiz: { bg: 'bg-indigo-50', text: 'text-indigo-600', gradient: 'from-indigo-500 to-purple-500' },
  profile: { bg: 'bg-emerald-50', text: 'text-emerald-600', gradient: 'from-emerald-400 to-teal-500' },
  business: { bg: 'bg-amber-50', text: 'text-amber-600', gradient: 'from-amber-400 to-orange-500' },
  survey: { bg: 'bg-teal-50', text: 'text-teal-600', gradient: 'from-teal-500 to-cyan-500' },
  salesletter: { bg: 'bg-rose-50', text: 'text-rose-600', gradient: 'from-rose-500 to-pink-500' },
};

interface RelatedContentProps {
  contentType: 'quiz' | 'profile' | 'business' | 'survey' | 'salesletter';
  currentSlug: string;
  limit?: number;
}

export default async function RelatedContent({ contentType, currentSlug, limit = 4 }: RelatedContentProps) {
  const result = await getRelatedContents(contentType, currentSlug, limit);

  if (!result.success || !result.data || result.data.length === 0) {
    return null;
  }

  const items = result.data;
  const label = TYPE_LABELS[contentType] || contentType;
  const portalTab = contentType === 'salesletter' ? 'salesletter' : contentType;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  // 構造化データ - ItemList
  const relatedSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `関連${label}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      url: `${siteUrl}/${TYPE_PATH[item.type]}/${item.slug}`,
    })),
  };

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          他の{label}もチェック
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const colors = TYPE_COLORS[item.type] || TYPE_COLORS.quiz;
            const path = TYPE_PATH[item.type] || item.type;

            return (
              <Link
                key={item.slug}
                href={`/${path}/${item.slug}`}
                className="group flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all bg-white"
              >
                {/* サムネイル */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br ${colors.gradient}`}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{label}</span>
                    </div>
                  )}
                </div>

                {/* テキスト */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                      {item.description}
                    </p>
                  )}
                  {item.views_count !== undefined && item.views_count > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Eye size={10} />
                      {item.views_count.toLocaleString()}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* ポータルへのリンク */}
        <div className="mt-6 text-center">
          <Link
            href={`/portal?tab=${portalTab}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {label}をもっと見る
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
