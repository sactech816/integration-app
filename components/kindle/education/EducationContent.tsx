'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Play, FileText, BookOpen, Loader2, 
  Clock, Eye, ChevronRight, Filter, CheckCircle, Star
} from 'lucide-react';

interface EducationItem {
  id: string;
  title: string;
  description: string;
  content_type: 'article' | 'video' | 'tutorial' | 'faq';
  category: string;
  category_label: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_premium: boolean;
  view_count: number;
  created_at: string;
  progress?: {
    is_completed: boolean;
    progress_percent: number;
  };
}

interface EducationContentProps {
  userId?: string;
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: '初級', color: 'bg-green-100 text-green-700' },
  intermediate: { label: '中級', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: '上級', color: 'bg-red-100 text-red-700' },
};

const CONTENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <FileText size={16} />,
  video: <Play size={16} />,
  tutorial: <BookOpen size={16} />,
  faq: <GraduationCap size={16} />,
};

export default function EducationContent({ userId }: EducationContentProps) {
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<EducationItem[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedContent, setSelectedContent] = useState<EducationItem | null>(null);
  const [contentBody, setContentBody] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    fetchContents();
  }, [userId, selectedCategory]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`/api/kdl/education?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setContents(data.contents || []);
      setCategories(data.categories || {});
    } catch (error) {
      console.error('Failed to fetch education contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = async (content: EducationItem) => {
    try {
      setLoadingContent(true);
      setSelectedContent(content);

      const params = new URLSearchParams({ id: content.id });
      if (userId) params.append('userId', userId);

      const response = await fetch(`/api/kdl/education?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setContentBody(data.content?.body || '');
    } catch (error) {
      console.error('Failed to fetch content detail:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleBack = () => {
    setSelectedContent(null);
    setContentBody('');
  };

  // 詳細ビュー
  if (selectedContent) {
    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            ← 一覧に戻る
          </button>
        </div>

        {/* コンテンツ詳細 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* サムネイル */}
          {selectedContent.thumbnail_url && (
            <div className="h-48 bg-gray-200 overflow-hidden">
              <img 
                src={selectedContent.thumbnail_url} 
                alt={selectedContent.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            {/* メタ情報 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">
                {selectedContent.category_label}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${DIFFICULTY_LABELS[selectedContent.difficulty]?.color}`}>
                {DIFFICULTY_LABELS[selectedContent.difficulty]?.label}
              </span>
              {selectedContent.duration_minutes && (
                <span className="flex items-center gap-1 text-gray-500 text-xs">
                  <Clock size={12} />
                  {selectedContent.duration_minutes}分
                </span>
              )}
              {selectedContent.is_premium && (
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <Star size={12} />
                  プレミアム
                </span>
              )}
            </div>

            {/* タイトル */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedContent.title}</h1>
            <p className="text-gray-600 mb-6">{selectedContent.description}</p>

            {/* 本文 */}
            {loadingContent ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-amber-600" size={32} />
              </div>
            ) : (
              <div 
                className="prose prose-amber max-w-none"
                dangerouslySetInnerHTML={{ __html: contentBody.replace(/\n/g, '<br />') }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // 一覧ビュー
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap size={32} />
          <h2 className="text-2xl font-bold">教育コンテンツ</h2>
        </div>
        <p className="text-amber-100">
          Kindle執筆に役立つ記事・動画・チュートリアルを学びましょう
        </p>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={18} className="text-gray-400" />
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          すべて
        </button>
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === key
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* コンテンツ一覧 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-600" size={48} />
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <GraduationCap className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">コンテンツがありません</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contents.map((content) => (
            <button
              key={content.id}
              onClick={() => handleContentClick(content)}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all text-left"
            >
              {/* サムネイル */}
              <div className="h-32 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center relative">
                {content.thumbnail_url ? (
                  <img 
                    src={content.thumbnail_url} 
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-amber-400">
                    {CONTENT_TYPE_ICONS[content.content_type]}
                  </span>
                )}
                {/* 完了バッジ */}
                {content.progress?.is_completed && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>

              <div className="p-4">
                {/* メタ情報 */}
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">
                    {content.category_label}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${DIFFICULTY_LABELS[content.difficulty]?.color}`}>
                    {DIFFICULTY_LABELS[content.difficulty]?.label}
                  </span>
                </div>

                {/* タイトル */}
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{content.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{content.description}</p>

                {/* フッター */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    {content.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {content.duration_minutes}分
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {content.view_count}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-amber-500" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
