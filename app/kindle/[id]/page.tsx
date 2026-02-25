'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { EditorLayout } from '@/components/kindle/editor';

interface Section {
  id: string;
  title: string;
  order_index: number;
  content: string;
}

interface Chapter {
  id: string;
  title: string;
  summary: string | null;
  order_index: number;
  sections: Section[];
}

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  status?: string;
}

interface TargetProfile {
  profile?: string;
  merits?: string[];
  benefits?: string[];
  usp?: string;
}

type LoadingState = 'loading' | 'loaded' | 'error' | 'not-found';

function KindleEditorPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = params.id as string;
  
  // admin_keyパラメータを取得（存在する場合はリンクに引き継ぐ）
  const adminKey = searchParams.get('admin_key');
  const adminKeyParam = adminKey ? `?admin_key=${adminKey}` : '';
  // openLP=trueパラメータ: LP編集モーダルを自動で開く
  const autoOpenLP = searchParams.get('openLP') === 'true';

  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string>('');
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [targetProfile, setTargetProfile] = useState<TargetProfile | undefined>(undefined);
  const [tocPatternId, setTocPatternId] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // ユーザーIDを取得
  useEffect(() => {
    const fetchUser = async () => {
      if (!isSupabaseConfigured() || !supabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        }
      } catch (err) {
        console.error('Failed to get user session:', err);
      }
    };
    fetchUser();
  }, []);

  // データ取得
  const fetchBookData = useCallback(async () => {
    if (!bookId) return;

    // デモモードの場合
    if (bookId.startsWith('demo-book-') || !isSupabaseConfigured()) {
      // デモデータを生成
      const demoBook: Book = {
        id: bookId,
        title: 'デモ用サンプル書籍',
        subtitle: 'Kindle執筆システムの使い方',
      };
      
      const demoChapters: Chapter[] = [
        {
          id: 'demo-ch-1',
          title: '第1章　はじめに',
          summary: 'この本の概要と目的',
          order_index: 0,
          sections: [
            { id: 'demo-sec-1-1', title: 'この本の目的', order_index: 0, content: '<p>この本では、Kindle執筆システムの使い方を学びます。</p>' },
            { id: 'demo-sec-1-2', title: '対象読者', order_index: 1, content: '' },
            { id: 'demo-sec-1-3', title: '本書の構成', order_index: 2, content: '' },
          ],
        },
        {
          id: 'demo-ch-2',
          title: '第2章　基本操作',
          summary: 'システムの基本的な使い方',
          order_index: 1,
          sections: [
            { id: 'demo-sec-2-1', title: '目次の作成', order_index: 0, content: '' },
            { id: 'demo-sec-2-2', title: '章と節の管理', order_index: 1, content: '' },
            { id: 'demo-sec-2-3', title: '執筆エディタの使い方', order_index: 2, content: '' },
          ],
        },
        {
          id: 'demo-ch-3',
          title: '第3章　応用テクニック',
          summary: 'より効率的な執筆のために',
          order_index: 2,
          sections: [
            { id: 'demo-sec-3-1', title: '効率的な執筆フロー', order_index: 0, content: '' },
            { id: 'demo-sec-3-2', title: 'AIアシスタントの活用', order_index: 1, content: '' },
            { id: 'demo-sec-3-3', title: 'まとめ', order_index: 2, content: '' },
          ],
        },
      ];

      // デモ用ターゲットプロファイル
      const demoTarget: TargetProfile = {
        profile: 'Kindle出版を始めたい初心者〜中級者',
        merits: ['効率的な執筆方法が学べる', 'AIを活用した執筆ができる'],
        benefits: ['本の執筆時間を大幅に短縮できる', '出版の夢を実現できる'],
        usp: 'AI支援による革新的な執筆体験',
      };

      setBook(demoBook);
      setChapters(demoChapters);
      setTargetProfile(demoTarget);
      setTocPatternId('basic'); // デモ用デフォルトパターン
      setLoadingState('loaded');
      return;
    }

    if (!supabase) {
      setError('Supabaseの設定が見つかりません');
      setLoadingState('error');
      return;
    }

    try {
      setLoadingState('loading');
      setError('');

      // 1. 本の情報を取得（まず基本カラムのみで取得）
      const { data: bookData, error: bookError } = await supabase
        .from('kdl_books')
        .select('id, title, subtitle, status')
        .eq('id', bookId)
        .single();

      if (bookError) {
        if (bookError.code === 'PGRST116') {
          setLoadingState('not-found');
          return;
        }
        throw new Error('本の取得に失敗しました: ' + bookError.message);
      }

      if (!bookData) {
        setLoadingState('not-found');
        return;
      }
      
      // target_infoとtoc_pattern_idを別途取得を試みる（カラムがない場合はスキップ）
      let targetInfoData: any = null;
      let patternIdData: string | null = null;
      
      // エラーが発生してもスキップする（カラムが存在しない場合がある）
      const { data: extraData, error: extraError } = await supabase
        .from('kdl_books')
        .select('target_info, toc_pattern_id')
        .eq('id', bookId)
        .single();
      
      if (!extraError && extraData) {
        if (extraData.target_info) {
          targetInfoData = extraData.target_info;
        }
        if (extraData.toc_pattern_id) {
          patternIdData = extraData.toc_pattern_id;
        }
      }
      // extraErrorがあってもログのみで処理を続行

      // 2. 章を取得
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('kdl_chapters')
        .select('id, title, summary, order_index')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true });

      if (chaptersError) {
        throw new Error('章の取得に失敗しました: ' + chaptersError.message);
      }

      // 3. 節を取得
      const chapterIds = chaptersData?.map(ch => ch.id) || [];
      let sectionsData: any[] = [];

      if (chapterIds.length > 0) {
        const { data: sections, error: sectionsError } = await supabase
          .from('kdl_sections')
          .select('id, chapter_id, title, content, order_index')
          .in('chapter_id', chapterIds)
          .order('order_index', { ascending: true });

        if (sectionsError) {
          throw new Error('節の取得に失敗しました: ' + sectionsError.message);
        }

        sectionsData = sections || [];
      }

      // 4. 階層構造に組み立て
      const chaptersWithSections: Chapter[] = (chaptersData || []).map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        summary: chapter.summary,
        order_index: chapter.order_index,
        sections: sectionsData
          .filter(section => section.chapter_id === chapter.id)
          .map(section => ({
            id: section.id,
            title: section.title,
            order_index: section.order_index,
            content: section.content || '',
          })),
      }));

      // ターゲットプロファイルを構築（target_infoがJSONで保存されている場合）
      let fetchedTarget: TargetProfile | undefined;
      if (targetInfoData) {
        fetchedTarget = {
          profile: targetInfoData.profile || undefined,
          merits: targetInfoData.merits || undefined,
          benefits: targetInfoData.benefits || undefined,
          usp: targetInfoData.usp || undefined,
        };
      }

      setBook(bookData);
      setChapters(chaptersWithSections);
      setTargetProfile(fetchedTarget);
      setTocPatternId(patternIdData || undefined);
      setLoadingState('loaded');

    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'データの取得に失敗しました');
      setLoadingState('error');
    }
  }, [bookId]);

  useEffect(() => {
    fetchBookData();
  }, [fetchBookData]);

  // 節の内容を更新
  const handleUpdateSectionContent = useCallback(async (sectionId: string, content: string) => {
    // デモモードの場合はローカルのみ更新
    if (bookId.startsWith('demo-book-') || !isSupabaseConfigured() || !supabase) {
      console.log('Demo mode: content saved locally');
      return;
    }

    const { error } = await supabase
      .from('kdl_sections')
      .update({ 
        content, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', sectionId);

    if (error) {
      console.error('Update error:', error);
      throw new Error('保存に失敗しました: ' + error.message);
    }
  }, [bookId]);

  // 構成変更後の再取得（コールバック用）
  const handleStructureChange = useCallback(async () => {
    await fetchBookData();
  }, [fetchBookData]);

  // 書籍ステータスを更新
  const handleUpdateBookStatus = useCallback(async (status: string) => {
    // デモモードの場合はスキップ
    if (bookId.startsWith('demo-book-') || !isSupabaseConfigured() || !supabase) {
      console.log('Demo mode: status update skipped');
      return;
    }

    const { error } = await supabase
      .from('kdl_books')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', bookId);

    if (error) {
      console.error('Status update error:', error);
      throw new Error('ステータスの更新に失敗しました: ' + error.message);
    }

    // ローカルの状態も更新
    if (book) {
      setBook({ ...book, status });
    }
  }, [bookId, book]);

  // ローディング画面
  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-amber-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 見つからない画面
  if (loadingState === 'not-found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
            <BookOpen className="text-gray-300 mx-auto mb-4" size={64} />
            <h1 className="text-xl font-bold text-gray-900 mb-2">本が見つかりません</h1>
            <p className="text-gray-600 mb-6">
              指定されたIDの本が存在しないか、削除された可能性があります。
            </p>
            <Link
              href={`/kindle${adminKeyParam}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
            >
              <ArrowLeft size={20} />
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // エラー画面
  if (loadingState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <AlertCircle className="text-red-400 mx-auto mb-4" size={64} />
            <h1 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={fetchBookData}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
              >
                <RefreshCw size={20} />
                再試行
              </button>
              <Link
                href={`/kindle${adminKeyParam}`}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-all"
              >
                <ArrowLeft size={20} />
                一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // メインのエディタ画面
  if (!book || chapters.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
            <BookOpen className="text-gray-300 mx-auto mb-4" size={64} />
            <h1 className="text-xl font-bold text-gray-900 mb-2">目次がありません</h1>
            <p className="text-gray-600 mb-6">
              この本にはまだ章や節が設定されていません。
            </p>
            <Link
              href={`/kindle${adminKeyParam}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
            >
              <ArrowLeft size={20} />
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EditorLayout
      book={book}
      chapters={chapters}
      targetProfile={targetProfile}
      tocPatternId={tocPatternId}
      onUpdateSectionContent={handleUpdateSectionContent}
      onStructureChange={handleStructureChange}
      onUpdateBookStatus={handleUpdateBookStatus}
      adminKeyParam={adminKeyParam}
      userId={userId}
      autoOpenLP={autoOpenLP}
    />
  );
}

// エクスポートするページコンポーネント（Suspenseでラップ）
export default function KindleEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-amber-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    }>
      <KindleEditorPageContent />
    </Suspense>
  );
}
