'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, ChevronDown, ChevronRight, Check, Clock, FileText,
  Loader2, AlertCircle, Edit3, BarChart3, Eye, EyeOff, X
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  order_index: number;
  is_completed: boolean;
  content_length: number;
  content: string;
}

interface Chapter {
  id: string;
  title: string;
  order_index: number;
  sections: Section[];
  total_sections: number;
  completed_sections: number;
}

interface BookWithProgress {
  id: string;
  title: string;
  subtitle: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  chapters: Chapter[];
  total_sections: number;
  completed_sections: number;
  progress_percentage: number;
}

interface AgencyProgressViewProps {
  agencyId: string;
  accessToken: string;
  selectedUserId?: string;
  onSelectUser?: (userId: string) => void;
  onFeedback?: (userId: string, bookId: string, sectionId?: string) => void;
}

export default function AgencyProgressView({
  agencyId,
  accessToken,
  selectedUserId,
  onFeedback,
}: AgencyProgressViewProps) {
  const [books, setBooks] = useState<BookWithProgress[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [viewingSection, setViewingSection] = useState<Section | null>(null);
  const [viewingSectionMeta, setViewingSectionMeta] = useState<{ bookTitle: string; chapterTitle: string } | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!selectedUserId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/kdl/agency/progress?user_id=${selectedUserId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (!response.ok) throw new Error('進捗データの取得に失敗しました');
      const data = await response.json();
      setBooks(data.books || []);
      setUserEmail(data.user_email || '');
      // 最初の書籍を自動展開
      if (data.books?.length > 0) {
        setExpandedBooks(new Set([data.books[0].id]));
      }
    } catch (err: any) {
      setError(err.message || '進捗データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUserId, accessToken]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const toggleBook = (bookId: string) => {
    setExpandedBooks(prev => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-orange-400';
  };

  const handleViewContent = (section: Section, bookTitle: string, chapterTitle: string) => {
    setViewingSection(section);
    setViewingSectionMeta({ bookTitle, chapterTitle });
  };

  if (!selectedUserId) {
    return (
      <div className="bg-gray-50 rounded-xl p-12 text-center">
        <BarChart3 className="text-gray-300 mx-auto mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-700 mb-2">ユーザーを選択してください</h3>
        <p className="text-gray-500">担当ユーザー一覧からユーザーを選択すると、進捗が表示されます</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="text-red-400 mx-auto mb-2" size={32} />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // 全体統計
  const totalSections = books.reduce((sum, b) => sum + b.total_sections, 0);
  const completedSections = books.reduce((sum, b) => sum + b.completed_sections, 0);
  const overallProgress = totalSections > 0
    ? Math.round((completedSections / totalSections) * 1000) / 10
    : 0;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {userEmail} の進捗管理
        </h2>
        <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
          <span><BookOpen size={14} className="inline mr-1" />{books.length}冊</span>
          <span><FileText size={14} className="inline mr-1" />{completedSections}/{totalSections}節完了</span>
          <span className="font-bold text-blue-600">{overallProgress}%</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-3 mt-3">
          <div
            className={`h-3 rounded-full transition-all ${getProgressColor(overallProgress)}`}
            style={{ width: `${Math.min(overallProgress, 100)}%` }}
          />
        </div>
      </div>

      {books.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <BookOpen className="text-gray-300 mx-auto mb-3" size={40} />
          <p className="text-gray-500">まだ書籍がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {books.map(book => (
            <div key={book.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* 書籍ヘッダー */}
              <button
                onClick={() => toggleBook(book.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${
                    book.progress_percentage >= 100 ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    <BookOpen size={18} className={
                      book.progress_percentage >= 100 ? 'text-green-600' : 'text-amber-600'
                    } />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-bold text-gray-900 truncate">{book.title}</p>
                    {book.subtitle && (
                      <p className="text-xs text-gray-500 truncate">{book.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm">
                    <span className="font-bold text-gray-700">{book.progress_percentage}%</span>
                    <span className="text-gray-600 ml-1 text-xs">
                      ({book.completed_sections}/{book.total_sections})
                    </span>
                  </div>
                  {expandedBooks.has(book.id) ? (
                    <ChevronDown size={18} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* 章一覧 */}
              {expandedBooks.has(book.id) && (
                <div className="border-t border-gray-100">
                  {book.chapters.length === 0 ? (
                    <p className="text-gray-500 text-sm p-4">章がありません</p>
                  ) : (
                    book.chapters.map(chapter => (
                      <div key={chapter.id} className="border-b border-gray-50 last:border-b-0">
                        {/* 章ヘッダー */}
                        <button
                          onClick={() => toggleChapter(chapter.id)}
                          className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {expandedChapters.has(chapter.id) ? (
                              <ChevronDown size={14} className="text-gray-400" />
                            ) : (
                              <ChevronRight size={14} className="text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {chapter.title}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">
                            {chapter.completed_sections}/{chapter.total_sections}節
                          </span>
                        </button>

                        {/* 節一覧 */}
                        {expandedChapters.has(chapter.id) && (
                          <div className="pl-10 pr-4 pb-2 space-y-1">
                            {chapter.sections.map(section => (
                              <div
                                key={section.id}
                                className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {section.is_completed ? (
                                    <Check size={14} className="text-green-500 shrink-0" />
                                  ) : (
                                    <Clock size={14} className="text-gray-300 shrink-0" />
                                  )}
                                  <span className={`text-sm truncate ${
                                    section.is_completed ? 'text-gray-700' : 'text-gray-600'
                                  }`}>
                                    {section.title || `節 ${section.order_index + 1}`}
                                  </span>
                                  {section.content_length > 0 && (
                                    <span className="text-[10px] text-gray-500 shrink-0">
                                      ({section.content_length}文字)
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {section.content_length > 0 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewContent(section, book.title, chapter.title);
                                      }}
                                      className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                      title="本文を閲覧"
                                    >
                                      <Eye size={14} />
                                    </button>
                                  )}
                                  {onFeedback && section.is_completed && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onFeedback(selectedUserId!, book.id, section.id);
                                      }}
                                      className="p-1 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded transition-colors"
                                      title="フィードバック"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 本文閲覧モーダル */}
      {viewingSection && viewingSectionMeta && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* モーダルヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {viewingSection.title || `節 ${viewingSection.order_index + 1}`}
                  </h3>
                  <p className="text-sm text-gray-600 truncate mt-0.5">
                    {viewingSectionMeta.bookTitle} / {viewingSectionMeta.chapterTitle}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="text-xs text-gray-500">{viewingSection.content_length}文字</span>
                  {viewingSection.is_completed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <Check size={12} />完了
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <Clock size={12} />執筆中
                    </span>
                  )}
                  <button
                    onClick={() => { setViewingSection(null); setViewingSectionMeta(null); }}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* 本文 */}
            <div className="flex-1 overflow-y-auto p-6">
              {viewingSection.content ? (
                <div
                  className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: viewingSection.content }}
                />
              ) : (
                <div className="text-center py-12">
                  <EyeOff className="text-gray-300 mx-auto mb-3" size={40} />
                  <p className="text-gray-500">まだ内容がありません</p>
                </div>
              )}
            </div>

            {/* モーダルフッター */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <p className="text-xs text-gray-500">閲覧専用 - {userEmail}</p>
              <div className="flex items-center gap-2">
                {onFeedback && viewingSection.is_completed && (
                  <button
                    onClick={() => {
                      const sectionId = viewingSection.id;
                      const bookId = books.find(b =>
                        b.chapters.some(c => c.sections.some(s => s.id === sectionId))
                      )?.id;
                      if (bookId) {
                        setViewingSection(null);
                        setViewingSectionMeta(null);
                        onFeedback(selectedUserId!, bookId, sectionId);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
                  >
                    <Edit3 size={14} />
                    フィードバック
                  </button>
                )}
                <button
                  onClick={() => { setViewingSection(null); setViewingSectionMeta(null); }}
                  className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
