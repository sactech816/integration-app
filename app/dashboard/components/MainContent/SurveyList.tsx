'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Plus,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Trash2,
  BarChart2,
  CalendarDays,
  Code,
  Lock,
  Heart,
  CheckSquare,
  Square,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Survey } from '@/lib/types';
import SurveyResultsView from './SurveyResultsView';

// 表示モード
type ViewMode = 'list' | 'results';

type SurveyListProps = {
  userId: string;
  isAdmin: boolean;
  userEmail?: string;
  isUnlocked?: boolean;
};

export default function SurveyList({ userId, isAdmin, userEmail, isUnlocked = false }: SurveyListProps) {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  
  // 表示モード管理
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  // 一括選択機能
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadSurveys = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const query = isAdmin
        ? supabase.from('surveys').select('*').order('created_at', { ascending: false })
        : supabase.from('surveys').select('*').eq('user_id', userId).order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setSurveys(data || []);
    } catch (error) {
      console.error('アンケート取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    if (userId) {
      loadSurveys();
    }
  }, [userId, loadSurveys]);

  const handleCopyUrl = (slug: string, id: number) => {
    const url = `${window.location.origin}/survey/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!supabase) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('surveys').delete().eq('id', id);
      if (error) throw error;
      setSurveys((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleDuplicate = async (survey: Survey) => {
    if (!supabase) return;

    setDuplicatingId(survey.id);
    try {
      const { data, error } = await supabase
        .from('surveys')
        .insert({
          title: `${survey.title} (コピー)`,
          description: survey.description,
          questions: survey.questions,
          slug: `${survey.slug}-copy-${Date.now()}`,
          user_id: userId,
          show_results_after_submission: survey.show_results_after_submission,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSurveys((prev) => [data, ...prev]);
      }
    } catch (error) {
      console.error('複製エラー:', error);
      alert('複製に失敗しました');
    } finally {
      setDuplicatingId(null);
    }
  };

  // 選択モード切り替え
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedIds(new Set());
  };

  // アイテム選択/解除
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 全選択/全解除
  const toggleSelectAll = () => {
    if (selectedIds.size === surveys.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(surveys.map((s) => s.id)));
    }
  };

  // 一括削除
  const handleBulkDelete = async () => {
    if (!supabase || selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size}件のアンケートを削除しますか？この操作は取り消せません。`)) return;

    setBulkDeleting(true);
    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .in('id', Array.from(selectedIds));
      
      if (error) throw error;
      // ローカルstate更新（診断クイズと同じパターン）
      setSurveys((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (error) {
      console.error('一括削除エラー:', error);
      alert('一括削除に失敗しました');
    } finally {
      setBulkDeleting(false);
    }
  };

  // 新規作成（別ページに遷移）
  const handleCreateNew = () => {
    router.push('/survey/new');
  };

  // 編集（別ページに遷移）
  const handleEdit = (survey: Survey) => {
    router.push(`/survey/editor?id=${survey.slug}`);
  };

  // 結果表示
  const handleViewResults = (survey: Survey) => {
    setSelectedSurvey(survey);
    setViewMode('results');
  };

  // 一覧に戻る
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSurvey(null);
    loadSurveys();
  };

  // ローディング表示
  if (loading && viewMode === 'list') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  // 結果表示
  if (viewMode === 'results' && selectedSurvey) {
    return (
      <SurveyResultsView
        survey={selectedSurvey}
        onBack={handleBackToList}
      />
    );
  }

  // 一覧表示
  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-teal-600 pl-4 flex items-center gap-2">
          <ClipboardList size={20} className="text-teal-600" />
          {isAdmin ? '全アンケートメーカーリスト（管理者）' : '作成したアンケートメーカーリスト'}
          {isAdmin && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {surveys.length > 0 && (
            <>
              <span className="text-sm text-gray-500">全 {surveys.length} 件</span>
              <button
                onClick={toggleSelectMode}
                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${
                  selectMode
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectMode ? <CheckSquare size={16} /> : <Square size={16} />}
                {selectMode ? '選択中' : '選択'}
              </button>
            </>
          )}
          <button
            onClick={handleCreateNew}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus size={16} /> 新規作成
          </button>
        </div>
      </div>

      {/* 選択モードのアクションバー */}
      {selectMode && surveys.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectAll}
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
            >
              {selectedIds.size === surveys.length ? '全て解除' : '全て選択'}
            </button>
            <span className="text-sm text-indigo-600">
              {selectedIds.size}件選択中
            </span>
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0 || bulkDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {bulkDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            一括削除
          </button>
        </div>
      )}

      {/* アンケート一覧 */}
      {surveys.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">まだアンケートを作成していません</p>
          <button
            onClick={handleCreateNew}
            className="bg-teal-600 text-white px-6 py-2 rounded-full font-bold hover:bg-teal-700"
          >
            新規作成する
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {surveys.map((survey) => {
            const isVotingMode = survey.show_results_after_submission;
            
            return (
              <div
                key={survey.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                  selectMode && selectedIds.has(survey.id)
                    ? 'border-indigo-500 ring-2 ring-indigo-200'
                    : 'border-gray-200'
                }`}
              >
                {/* カードヘッダー */}
                <div
                  className={`bg-gradient-to-r from-teal-500 to-cyan-500 p-4 h-32 flex items-start justify-between ${
                    selectMode ? 'cursor-pointer' : ''
                  }`}
                  onClick={selectMode ? () => toggleSelect(survey.id) : undefined}
                >
                  {selectMode ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(survey.id);
                      }}
                      className="p-1 bg-white/90 rounded"
                    >
                      {selectedIds.has(survey.id) ? (
                        <CheckSquare size={20} className="text-indigo-600" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </button>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full font-bold bg-white/20 text-white">
                      {survey.questions?.length || 0} 問
                    </span>
                  )}
                  {isVotingMode && (
                    <span className="text-xs px-2 py-1 rounded-full font-bold bg-purple-100 text-purple-700">
                      投票モード
                    </span>
                  )}
                </div>

                {/* カードコンテンツ */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{survey.title}</h3>
                  {survey.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{survey.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} />
                      {survey.created_at ? new Date(survey.created_at).toLocaleDateString('ja-JP') : '-'}
                    </span>
                  </div>

                  {/* URL表示とコピー */}
                  <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/survey/${survey.slug}`}
                        readOnly
                        className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 truncate"
                      />
                      <button
                        onClick={() => handleCopyUrl(survey.slug, survey.id)}
                        className="text-indigo-600 hover:text-indigo-700 p-1"
                      >
                        {copiedId === survey.id ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {!selectMode && (
                    <>
                      {/* 編集・複製ボタン */}
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => handleEdit(survey)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Edit size={14} /> 編集
                        </button>
                        <button
                          onClick={() => handleDuplicate(survey)}
                          disabled={duplicatingId === survey.id}
                          className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {duplicatingId === survey.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Copy size={14} />
                          )}
                          複製
                        </button>
                      </div>

                      {/* 埋め込み・削除ボタン */}
                      <div className="flex gap-2 mb-3">
                        <button
                          className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors ${
                            isUnlocked
                              ? 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!isUnlocked}
                        >
                          {isUnlocked ? <Code size={14} /> : <Lock size={14} />} 埋め込み
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(survey.id)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Trash2 size={14} /> 削除
                        </button>
                      </div>

                      {/* プレビューボタン */}
                      <button
                        onClick={() => window.open(`/survey/${survey.slug}`, '_blank')}
                        className="w-full bg-green-500 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-green-600 flex items-center justify-center gap-1 transition-colors"
                      >
                        <ExternalLink size={14} /> プレビュー
                      </button>

                      {/* 結果を見るボタン - 投票モードの時のみ有効 */}
                      <button
                        onClick={() => handleViewResults(survey)}
                        disabled={!isVotingMode}
                        className={`w-full mt-3 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors ${
                          isVotingMode
                            ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <BarChart2 size={14} /> 結果を見る
                      </button>
                      {!isVotingMode && (
                        <p className="text-[10px] text-gray-400 text-center mt-1">
                          投票モードがアクティブのとき確認できます
                        </p>
                      )}

                      {/* Pro機能アンロック - 未解除時のみ表示 */}
                      {!isUnlocked && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-lg font-bold text-xs hover:from-orange-600 hover:to-amber-600 flex items-center justify-center gap-1 transition-all shadow-sm"
                          >
                            <Heart size={14} />
                            Pro機能を開放（開発支援）
                          </button>
                          <p className="text-[10px] text-gray-400 text-center mt-1.5">
                            埋め込み機能などが利用可能に
                          </p>
                        </div>
                      )}

                      {/* 削除確認 */}
                      {showDeleteConfirm === survey.id && (
                        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                          <p className="text-sm text-red-800 mb-3">
                            「{survey.title}」を削除しますか？この操作は取り消せません。
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(survey.id)}
                              disabled={deletingId === survey.id}
                              className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-xs disabled:opacity-50"
                            >
                              {deletingId === survey.id ? (
                                <Loader2 size={14} className="animate-spin mx-auto" />
                              ) : (
                                '削除する'
                              )}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="flex-1 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-xs"
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
