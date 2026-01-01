'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Plus, Loader2, Edit3, Trash2, Calendar, FileText 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  chapters_count?: number;
  sections_count?: number;
}

export default function KindleListPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        // デモデータ
        setBooks([
          {
            id: 'demo-book-1',
            title: 'サンプル書籍',
            subtitle: 'Kindle執筆システムのデモ',
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            chapters_count: 3,
            sections_count: 9,
          },
        ]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('kdl_books')
          .select('id, title, subtitle, status, created_at, updated_at')
          .order('updated_at', { ascending: false });

        if (fetchError) throw fetchError;
        setBooks(data || []);
      } catch (err: any) {
        setError(err.message || '書籍の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (bookId: string) => {
    if (!confirm('この書籍を削除しますか？')) return;

    if (!isSupabaseConfigured() || !supabase) {
      setBooks(prev => prev.filter(b => b.id !== bookId));
      return;
    }

    try {
      // 節を削除
      const { data: chapters } = await supabase
        .from('kdl_chapters')
        .select('id')
        .eq('book_id', bookId);

      if (chapters && chapters.length > 0) {
        const chapterIds = chapters.map(c => c.id);
        await supabase.from('kdl_sections').delete().in('chapter_id', chapterIds);
      }

      // 章を削除
      await supabase.from('kdl_chapters').delete().eq('book_id', bookId);

      // 本を削除
      await supabase.from('kdl_books').delete().eq('id', bookId);

      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (err: any) {
      alert('削除に失敗しました: ' + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-amber-600" size={28} />
            <span className="font-bold text-xl text-gray-900">Kindle執筆システム</span>
          </div>
          <Link
            href="/kindle/new"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg"
          >
            <Plus size={20} />
            新しい本を作成
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">あなたの書籍</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-amber-500" size={40} />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-12 text-center">
            <BookOpen className="text-gray-300 mx-auto mb-4" size={64} />
            <h2 className="text-xl font-bold text-gray-700 mb-2">まだ書籍がありません</h2>
            <p className="text-gray-500 mb-6">新しい本を作成して執筆を始めましょう</p>
            <Link
              href="/kindle/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
            >
              <Plus size={20} />
              新しい本を作成
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-md border border-amber-100 p-5 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/kindle/${book.id}`}
                      className="block group-hover:text-amber-600 transition-colors"
                    >
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {book.title}
                      </h3>
                      {book.subtitle && (
                        <p className="text-gray-500 text-sm truncate mt-1">
                          {book.subtitle}
                        </p>
                      )}
                    </Link>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(book.updated_at)}
                      </span>
                      {book.chapters_count !== undefined && (
                        <span className="flex items-center gap-1">
                          <FileText size={14} />
                          {book.chapters_count}章
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        book.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {book.status === 'published' ? '公開済み' : '下書き'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/kindle/${book.id}`}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="編集"
                    >
                      <Edit3 size={20} />
                    </Link>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="削除"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

