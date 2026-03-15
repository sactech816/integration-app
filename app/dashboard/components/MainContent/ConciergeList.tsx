'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Plus,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Trash2,
  Code,
  BarChart3,
  Eye,
  EyeOff,
} from 'lucide-react';

type ConciergeConfig = {
  id: string;
  name: string;
  greeting: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type ConciergeListProps = {
  userId: string;
  isAdmin: boolean;
};

export default function ConciergeList({ userId, isAdmin }: ConciergeListProps) {
  const router = useRouter();
  const [configs, setConfigs] = useState<ConciergeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedEmbed, setCopiedEmbed] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/concierge/configs');
      if (res.ok) {
        const data = await res.json();
        setConfigs(data);
      }
    } catch (error) {
      console.error('コンシェルジュ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadConfigs();
    }
  }, [userId]);

  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}/concierge/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyEmbed = (slug: string, name: string) => {
    const baseUrl = window.location.origin;
    const code = `<!-- AI Concierge by 集客メーカー -->
<script>
(function() {
  var s = document.createElement('script');
  s.src = '${baseUrl}/embed/concierge/loader.js';
  s.async = true;
  s.dataset.conciergeId = '${slug}';
  s.dataset.position = 'bottom-right';
  document.head.appendChild(s);
})();
</script>`;
    navigator.clipboard.writeText(code);
    setCopiedEmbed(slug);
    setTimeout(() => setCopiedEmbed(null), 2000);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/concierge/configs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfigs(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('削除エラー:', error);
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-600" />
            コンシェルジュメーカー
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            AIコンシェルジュを作成して、あなたのサイトに埋め込めます
          </p>
        </div>
        <button
          onClick={() => router.push('/concierge/editor?new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          新規作成
        </button>
      </div>

      {/* コンシェルジュ一覧 */}
      {configs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            コンシェルジュがまだありません
          </h3>
          <p className="text-gray-500 mb-6">
            AIコンシェルジュを作成して、お客様の質問に自動応答しましょう
          </p>
          <button
            onClick={() => router.push('/concierge/editor?new')}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all"
          >
            最初のコンシェルジュを作成
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {configs.map((config) => (
            <div
              key={config.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* 左側: 情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{config.name}</h3>
                    {config.is_published ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                        <Eye className="w-3 h-3" /> 公開中
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                        <EyeOff className="w-3 h-3" /> 非公開
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{config.greeting}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    更新: {new Date(config.updated_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>

                {/* 右側: アクション */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* 編集 */}
                  <button
                    onClick={() => router.push(`/concierge/editor?id=${config.id}`)}
                    className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                    title="編集"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* プレビュー */}
                  <a
                    href={`/concierge/${config.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="プレビュー"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* URLコピー */}
                  <button
                    onClick={() => handleCopyUrl(config.slug)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    title="URLをコピー"
                  >
                    {copiedId === config.slug ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* 埋め込みコードコピー */}
                  <button
                    onClick={() => handleCopyEmbed(config.slug, config.name)}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                    title="埋め込みコードをコピー"
                  >
                    {copiedEmbed === config.slug ? (
                      <Check className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Code className="w-4 h-4" />
                    )}
                  </button>

                  {/* 分析 */}
                  <button
                    onClick={() => router.push(`/concierge/config-analytics?id=${config.id}`)}
                    className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                    title="分析"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>

                  {/* 削除 */}
                  {showDeleteConfirm === config.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(config.id)}
                        disabled={deletingId === config.id}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {deletingId === config.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '削除'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(config.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
