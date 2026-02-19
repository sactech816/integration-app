'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Check } from 'lucide-react';
import { getFeaturedContents, removeFeaturedContent, addFeaturedContent } from '@/app/actions/featured';
import type { FeaturedContent } from '@/app/actions/featured';
import { ServiceType, Block } from '@/lib/types';
import { supabase, TABLES } from '@/lib/supabase';

// コンテンツアイテムの型
type ContentItem = {
  id: string;
  type: ServiceType;
  title: string;
};

// プロフィール/ビジネスLPの名前を取得
const getContentTitle = (content: Block[] | null, settings?: { title?: string; name?: string }, fallbackSlug?: string): string => {
  if (!content || !Array.isArray(content)) {
    return settings?.title || settings?.name || `コンテンツ ${fallbackSlug || ''}`;
  }
  const headerBlock = content.find((b: Block) => b.type === 'header');
  if (headerBlock && headerBlock.type === 'header') {
    return headerBlock.data.name || settings?.title || settings?.name || `コンテンツ ${fallbackSlug || ''}`;
  }
  return settings?.title || settings?.name || `コンテンツ ${fallbackSlug || ''}`;
};

export default function FeaturedManager() {
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<FeaturedContent[]>([]);
  const [selectedType, setSelectedType] = useState<ServiceType>('quiz');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  // 全サービスのコンテンツを保持
  const [allContents, setAllContents] = useState<ContentItem[]>([]);

  useEffect(() => {
    // ピックアップ済みコンテンツと全コンテンツを並列取得
    Promise.all([fetchFeatured(), fetchAllContents()]);
  }, []);

  const fetchFeatured = async () => {
    const result = await getFeaturedContents();
    if (result.success && result.data) {
      setFeatured(result.data);
    }
  };

  // 全サービスのコンテンツを取得
  const fetchAllContents = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const contents: ContentItem[] = [];

    try {
      // 3つのテーブルから並列取得
      const [quizzesResult, profilesResult, businessResult] = await Promise.all([
        supabase.from(TABLES.QUIZZES).select('id, slug, title').order('created_at', { ascending: false }),
        supabase.from(TABLES.PROFILES).select('id, slug, content').order('created_at', { ascending: false }),
        supabase.from(TABLES.BUSINESS_LPS).select('id, slug, content, settings').order('created_at', { ascending: false }),
      ]);

      // 診断クイズ
      if (quizzesResult.data) {
        contents.push(
          ...quizzesResult.data.map((q) => ({
            id: String(q.id),
            type: 'quiz' as ServiceType,
            title: q.title || `クイズ ${q.slug}`,
          }))
        );
      }

      // プロフィールLP
      if (profilesResult.data) {
        contents.push(
          ...profilesResult.data.map((p) => ({
            id: p.id,
            type: 'profile' as ServiceType,
            title: getContentTitle(p.content, undefined, p.slug),
          }))
        );
      }

      // ビジネスLP
      if (businessResult.data) {
        contents.push(
          ...businessResult.data.map((b) => ({
            id: b.id,
            type: 'business' as ServiceType,
            title: getContentTitle(b.content, b.settings, b.slug),
          }))
        );
      }

      setAllContents(contents);
    } catch (error) {
      console.error('コンテンツ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('ピックアップから削除しますか？')) return;
    const result = await removeFeaturedContent(id);
    if (result.success) {
      await fetchFeatured();
    }
  };

  const handleAdd = async () => {
    if (selectedIds.size === 0) return;
    if (featured.length + selectedIds.size > 10) {
      alert('ピックアップは最大10件までです');
      return;
    }

    setAdding(true);
    for (const id of selectedIds) {
      await addFeaturedContent(id, selectedType);
    }
    setSelectedIds(new Set());
    await fetchFeatured();
    setAdding(false);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const getServiceLabel = (type: ServiceType) => {
    const labels: Record<ServiceType, string> = {
      quiz: '診断クイズ',
      profile: 'プロフィールLP',
      business: 'ビジネスLP',
      salesletter: 'セールスレター',
      survey: 'アンケート',
      gamification: 'ゲーミフィケーション',
      attendance: '出欠表',
      booking: '予約',
      onboarding: 'はじめかたガイド',
    };
    return labels[type] || type;
  };

  // 現在のピックアップに登録されているコンテンツのタイトルを取得
  const getFeaturedTitle = (item: FeaturedContent): string => {
    const content = allContents.find(
      (c) => c.id === item.content_id && c.type === item.content_type
    );
    return content?.title || `ID: ${item.content_id}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-orange-600" size={32} />
      </div>
    );
  }

  // 選択中のサービスタイプでフィルタリング
  const availableContents = allContents.filter(c => c.type === selectedType);
  const featuredIds = new Set(featured.filter(f => f.content_type === selectedType).map(f => f.content_id));

  return (
    <div className="space-y-6">
      {/* 現在のピックアップ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">
          現在のピックアップ（{featured.length}/10件）
        </h3>
        {featured.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            まだピックアップされたコンテンツがありません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((item) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-orange-600 font-bold mb-1">
                      {getServiceLabel(item.content_type as ServiceType)}
                    </div>
                    <div className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">
                      {getFeaturedTitle(item)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* コンテンツ追加 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">ピックアップするコンテンツを選択</h3>

        {/* サービスタブ */}
        <div className="flex gap-2 mb-4">
          {(['quiz', 'profile', 'business'] as ServiceType[]).map((type) => {
            const count = allContents.filter(c => c.type === type).length;
            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setSelectedIds(new Set());
                }}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  selectedType === type
                    ? 'bg-orange-50 border-orange-600'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-bold text-sm text-gray-900">{getServiceLabel(type)}</span>
                <span className="ml-1 text-xs text-gray-500">({count})</span>
              </button>
            );
          })}
        </div>

        {/* コンテンツリスト */}
        <div className="max-h-96 overflow-y-auto mb-4 border border-gray-200 rounded-lg">
          {availableContents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              このサービスにはコンテンツがありません
            </div>
          ) : (
            availableContents.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isFeatured = featuredIds.has(item.id);
              
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    isFeatured ? 'opacity-50 bg-gray-50' : ''
                  }`}
                  onClick={() => !isFeatured && toggleSelection(item.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isFeatured}
                    onChange={() => !isFeatured && toggleSelection(item.id)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-gray-900 line-clamp-1">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-600">ID: {item.id}</div>
                  </div>
                  {isFeatured && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
                      登録済み
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 追加ボタン */}
        <button
          onClick={handleAdd}
          disabled={selectedIds.size === 0 || adding}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {adding ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              追加中...
            </>
          ) : (
            <>
              <Check size={16} />
              {selectedIds.size}件をピックアップに追加
            </>
          )}
        </button>
      </div>
    </div>
  );
}
