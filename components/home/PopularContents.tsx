'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, Eye, ArrowRight, TrendingUp, LayoutGrid } from 'lucide-react';

interface PopularContent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: 'quiz' | 'profile' | 'business';
  views_count: number;
}

export default function PopularContents() {
  const [popularContents, setPopularContents] = useState<PopularContent[]>([]);

  useEffect(() => {
    const fetchPopular = async () => {
      if (!supabase) return;
      try {
        const { data: quizzes } = await supabase
          .from('quizzes')
          .select('id, slug, title, description, views_count')
          .eq('show_in_portal', true)
          .order('views_count', { ascending: false, nullsFirst: false })
          .limit(5);
        if (quizzes) {
          setPopularContents(
            quizzes.map((q) => ({
              ...q,
              type: 'quiz' as const,
              views_count: q.views_count || 0,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch popular contents:', error);
      }
    };
    fetchPopular();
  }, []);

  if (popularContents.length === 0) return null;

  return (
    <section className="py-16" style={{ backgroundColor: '#fffbf0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-full mb-4"
            style={{ backgroundColor: '#f97316' }}
          >
            <TrendingUp size={20} />
            <span className="font-bold">人気コンテンツ</span>
          </div>
          <h2 className="text-3xl font-black mb-4" style={{ color: '#5d4037' }}>
            みんなが楽しんでいる診断クイズ
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularContents.slice(0, 3).map((content, index) => (
            <a
              key={content.id}
              href={`/${content.type}/${content.slug}`}
              className="group rounded-3xl border-2 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: 'white', borderColor: '#ffedd5' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                      : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                        : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Eye size={16} />
                  <span className="font-bold">{content.views_count.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#f97316' }}
                >
                  <Sparkles size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2" style={{ color: '#5d4037' }}>
                    {content.title}
                  </h3>
                  {content.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{content.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center pt-4 border-t" style={{ borderColor: '#ffedd5' }}>
                <span className="text-sm font-bold flex items-center gap-1" style={{ color: '#f97316' }}>
                  診断を受ける
                  <ArrowRight size={16} />
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="/portal?tab=quiz"
            className="inline-flex items-center gap-2 bg-white font-bold px-6 py-3 rounded-full border-2 transition-all"
            style={{ color: '#f97316', borderColor: '#f97316' }}
          >
            <LayoutGrid size={20} />
            もっと見る
          </a>
        </div>
      </div>
    </section>
  );
}
