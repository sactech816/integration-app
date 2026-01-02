'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileDown, Loader2, Save, Check, X, AlertCircle, CheckCircle, Info, Sparkles, Copy, Tag, FileText, FolderTree, Lightbulb, BookOpen, Rocket } from 'lucide-react';
import Link from 'next/link';
import { ChapterSidebar } from './ChapterSidebar';
import { TiptapEditor, TiptapEditorRef } from './TiptapEditor';

// トースト通知の型
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// 確認ダイアログの型
interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

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
}

interface TargetProfile {
  profile?: string;
  merits?: string[];
  benefits?: string[];
  usp?: string;
}

interface BatchWriteProgress {
  isRunning: boolean;
  chapterId: string | null;
  currentIndex: number;
  totalCount: number;
  currentSectionTitle: string;
}

interface KdpInfo {
  keywords: string[];
  description: string;
  categories: string[];
  catch_copy: string;
}

interface EditorLayoutProps {
  book: Book;
  chapters: Chapter[];
  targetProfile?: TargetProfile;
  tocPatternId?: string; // 目次で選択したパターンID（執筆スタイルのデフォルト決定用）
  onUpdateSectionContent: (sectionId: string, content: string) => Promise<void>;
  onStructureChange?: () => Promise<void>;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  book,
  chapters,
  targetProfile,
  tocPatternId,
  onUpdateSectionContent,
  onStructureChange,
}) => {
  // 初期値: 最初の章の最初の節
  const getInitialSectionId = () => {
    for (const chapter of chapters) {
      const sections = chapter.sections || [];
      if (sections.length > 0) {
        return sections[0].id;
      }
    }
    return '';
  };

  const router = useRouter();
  const editorRef = useRef<TiptapEditorRef>(null);
  
  const [activeSectionId, setActiveSectionId] = useState<string>(getInitialSectionId);
  const [chaptersData, setChaptersData] = useState<Chapter[]>(chapters);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingAndBack, setIsSavingAndBack] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null);
  const [batchProgress, setBatchProgress] = useState<BatchWriteProgress>({
    isRunning: false,
    chapterId: null,
    currentIndex: 0,
    totalCount: 0,
    currentSectionTitle: '',
  });
  const [isKdpModalOpen, setIsKdpModalOpen] = useState(false);
  const [isGeneratingKdp, setIsGeneratingKdp] = useState(false);
  const [kdpInfo, setKdpInfo] = useState<KdpInfo | null>(null);
  const [kdpError, setKdpError] = useState<string>('');

  // 現在選択中の節とその章を取得
  const getActiveInfo = useCallback(() => {
    for (const chapter of chaptersData) {
      const sections = chapter.sections || [];
      const section = sections.find(s => s.id === activeSectionId);
      if (section) {
        return { section, chapter };
      }
    }
    return { section: null, chapter: null };
  }, [chaptersData, activeSectionId]);

  const { section: activeSection, chapter: activeChapter } = getActiveInfo();

  // 節の内容を保存
  const handleSave = useCallback(async (sectionId: string, content: string) => {
    await onUpdateSectionContent(sectionId, content);
    
    // ローカルの状態も更新
    setChaptersData(prev => prev.map(chapter => ({
      ...chapter,
      sections: chapter.sections.map(section =>
        section.id === sectionId
          ? { ...section, content }
          : section
      ),
    })));
  }, [onUpdateSectionContent]);

  // 節を選択
  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
  }, []);

  // トースト表示ヘルパー
  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // 3秒後に自動で消す
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // トースト削除
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // 確認ダイアログ表示
  const showConfirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  // Word出力
  const handleDownloadDocx = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/kdl/download-docx?book_id=${book.id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'ダウンロードに失敗しました');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      showToast('error', 'ダウンロードに失敗しました: ' + error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // 章の一括執筆
  const handleBatchWrite = async (chapterId: string) => {
    if (batchProgress.isRunning) return;

    const chapter = chaptersData.find(c => c.id === chapterId);
    if (!chapter) return;

    // 未執筆の節のみをフィルタリング
    const sectionsToWrite = chapter.sections.filter(s => !s.content || s.content.trim() === '');
    
    if (sectionsToWrite.length === 0) {
      showToast('info', 'この章のすべての節は既に執筆済みです。');
      return;
    }

    const confirmed = await showConfirm(
      '章の一括執筆',
      `「${chapter.title}」の未執筆の節（${sectionsToWrite.length}件）をAIで執筆しますか？\n\n` +
      '※ この処理には数分かかる場合があります。\n' +
      '※ 処理中はブラウザを閉じないでください。'
    );

    if (!confirmed) return;

    setBatchProgress({
      isRunning: true,
      chapterId,
      currentIndex: 0,
      totalCount: sectionsToWrite.length,
      currentSectionTitle: sectionsToWrite[0]?.title || '',
    });

    for (let i = 0; i < sectionsToWrite.length; i++) {
      const section = sectionsToWrite[i];
      
      setBatchProgress(prev => ({
        ...prev,
        currentIndex: i + 1,
        currentSectionTitle: section.title,
      }));

      try {
        const response = await fetch('/api/kdl/generate-section', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            book_id: book.id,
            book_title: book.title,
            book_subtitle: book.subtitle,
            chapter_title: chapter.title,
            section_title: section.title,
            target_profile: targetProfile,
          }),
        });

        if (!response.ok) {
          console.error(`節「${section.title}」の生成に失敗しました`);
          continue; // エラーでもスキップして次へ
        }

        const data = await response.json();
        
        if (data.content) {
          // DBに保存
          await onUpdateSectionContent(section.id, data.content);
          
          // ローカルの状態も更新
          setChaptersData(prev => prev.map(ch => ({
            ...ch,
            sections: ch.sections.map(sec =>
              sec.id === section.id
                ? { ...sec, content: data.content }
                : sec
            ),
          })));
        }

        // 次のリクエストまで少し待つ（レート制限対策）
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`節「${section.title}」の生成でエラー:`, error);
        // エラーでもスキップして次へ
      }
    }

    setBatchProgress({
      isRunning: false,
      chapterId: null,
      currentIndex: 0,
      totalCount: 0,
      currentSectionTitle: '',
    });

    showToast('success', '一括執筆が完了しました！');
  };

  // 保存して戻る
  const handleSaveAndBack = async () => {
    if (isSavingAndBack) return;
    
    setIsSavingAndBack(true);
    try {
      // エディタの現在の内容を即座に保存
      if (editorRef.current) {
        await editorRef.current.forceSave();
      }
      
      // トースト表示
      showToast('success', '保存しました！');
      
      // 少し待ってから遷移（トーストを見せるため）
      setTimeout(() => {
        router.push('/kindle');
      }, 800);
      
    } catch (error: any) {
      console.error('Save and back error:', error);
      showToast('error', '保存に失敗しました: ' + error.message);
      setIsSavingAndBack(false);
    }
  };

  // === 構成変更ハンドラー ===

  // 章を追加
  const handleAddChapter = useCallback(async (title: string) => {
    try {
      const response = await fetch('/api/kdl/structure/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chapter',
          bookId: book.id,
          title,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '章の追加に失敗しました');
      }

      const data = await response.json();
      
      // ローカルの状態を更新
      setChaptersData(prev => [
        ...prev,
        {
          id: data.chapter?.id || data.id,
          title,
          summary: null,
          order_index: prev.length,
          sections: [],
        },
      ]);

      showToast('success', '章を追加しました');
      
      // 親コンポーネントに通知（必要であればデータを再取得）
      if (onStructureChange) {
        await onStructureChange();
      }
    } catch (error: any) {
      console.error('Add chapter error:', error);
      showToast('error', error.message);
    }
  }, [book.id, showToast, onStructureChange]);

  // 節を追加
  const handleAddSection = useCallback(async (chapterId: string, title: string) => {
    try {
      const response = await fetch('/api/kdl/structure/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          bookId: book.id,
          chapterId,
          title,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '節の追加に失敗しました');
      }

      const data = await response.json();
      const newSectionId = data.section?.id || data.id;
      
      // ローカルの状態を更新
      setChaptersData(prev => prev.map(ch => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            sections: [
              ...ch.sections,
              {
                id: newSectionId,
                title,
                order_index: ch.sections.length,
                content: '',
              },
            ],
          };
        }
        return ch;
      }));

      // 新しく追加した節を自動的に選択
      if (newSectionId) {
        setActiveSectionId(newSectionId);
      }

      showToast('success', '節を追加しました');
      
      if (onStructureChange) {
        await onStructureChange();
      }
    } catch (error: any) {
      console.error('Add section error:', error);
      showToast('error', error.message);
    }
  }, [book.id, showToast, onStructureChange]);

  // 章のタイトルを変更
  const handleRenameChapter = useCallback(async (chapterId: string, newTitle: string) => {
    try {
      const response = await fetch('/api/kdl/structure/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chapter',
          chapterId,
          title: newTitle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '章のタイトル変更に失敗しました');
      }

      // ローカルの状態を更新
      setChaptersData(prev => prev.map(ch =>
        ch.id === chapterId ? { ...ch, title: newTitle } : ch
      ));

      showToast('success', 'タイトルを変更しました');
    } catch (error: any) {
      console.error('Rename chapter error:', error);
      showToast('error', error.message);
    }
  }, [showToast]);

  // 節のタイトルを変更
  const handleRenameSection = useCallback(async (sectionId: string, newTitle: string) => {
    try {
      const response = await fetch('/api/kdl/structure/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          sectionId,
          title: newTitle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '節のタイトル変更に失敗しました');
      }

      // ローカルの状態を更新
      setChaptersData(prev => prev.map(ch => ({
        ...ch,
        sections: ch.sections.map(sec =>
          sec.id === sectionId ? { ...sec, title: newTitle } : sec
        ),
      })));

      showToast('success', 'タイトルを変更しました');
    } catch (error: any) {
      console.error('Rename section error:', error);
      showToast('error', error.message);
    }
  }, [showToast]);

  // 章を削除
  const handleDeleteChapter = useCallback(async (chapterId: string) => {
    try {
      const response = await fetch('/api/kdl/structure/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chapter',
          chapterId,
          bookId: book.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '章の削除に失敗しました');
      }

      // ローカルの状態を更新
      setChaptersData(prev => {
        const filtered = prev.filter(ch => ch.id !== chapterId);
        // order_indexを振り直す
        return filtered.map((ch, idx) => ({ ...ch, order_index: idx }));
      });

      // 削除した章にアクティブな節があった場合、最初の節に移動
      const deletedChapter = chaptersData.find(ch => ch.id === chapterId);
      if (deletedChapter?.sections.some(s => s.id === activeSectionId)) {
        const remainingChapters = chaptersData.filter(ch => ch.id !== chapterId);
        if (remainingChapters.length > 0 && remainingChapters[0].sections.length > 0) {
          setActiveSectionId(remainingChapters[0].sections[0].id);
        }
      }

      showToast('success', '章を削除しました');
      
      if (onStructureChange) {
        await onStructureChange();
      }
    } catch (error: any) {
      console.error('Delete chapter error:', error);
      showToast('error', error.message);
    }
  }, [book.id, chaptersData, activeSectionId, showToast, onStructureChange]);

  // 節を削除
  const handleDeleteSection = useCallback(async (sectionId: string, chapterId: string) => {
    try {
      const response = await fetch('/api/kdl/structure/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          sectionId,
          chapterId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '節の削除に失敗しました');
      }

      // ローカルの状態を更新
      setChaptersData(prev => prev.map(ch => {
        if (ch.id === chapterId) {
          const filteredSections = ch.sections.filter(sec => sec.id !== sectionId);
          return {
            ...ch,
            sections: filteredSections.map((sec, idx) => ({ ...sec, order_index: idx })),
          };
        }
        return ch;
      }));

      // 削除した節がアクティブだった場合、別の節に移動
      if (sectionId === activeSectionId) {
        const chapter = chaptersData.find(ch => ch.id === chapterId);
        if (chapter) {
          const remainingSections = chapter.sections.filter(s => s.id !== sectionId);
          if (remainingSections.length > 0) {
            setActiveSectionId(remainingSections[0].id);
          } else {
            // 他の章の最初の節に移動
            for (const ch of chaptersData) {
              if (ch.id !== chapterId && ch.sections.length > 0) {
                setActiveSectionId(ch.sections[0].id);
                break;
              }
            }
          }
        }
      }

      showToast('success', '節を削除しました');
      
      if (onStructureChange) {
        await onStructureChange();
      }
    } catch (error: any) {
      console.error('Delete section error:', error);
      showToast('error', error.message);
    }
  }, [chaptersData, activeSectionId, showToast, onStructureChange]);

  // 章を移動
  const handleMoveChapter = useCallback(async (chapterId: string, direction: 'up' | 'down') => {
    const chapterIndex = chaptersData.findIndex(ch => ch.id === chapterId);
    if (chapterIndex === -1) return;
    
    if (direction === 'up' && chapterIndex === 0) {
      showToast('info', 'これ以上上に移動できません');
      return;
    }
    if (direction === 'down' && chapterIndex === chaptersData.length - 1) {
      showToast('info', 'これ以上下に移動できません');
      return;
    }

    try {
      const response = await fetch('/api/kdl/structure/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chapter',
          chapterId,
          bookId: book.id,
          direction,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '章の移動に失敗しました');
      }

      // ローカルの状態を更新（入れ替え）
      setChaptersData(prev => {
        const newChapters = [...prev];
        const targetIndex = direction === 'up' ? chapterIndex - 1 : chapterIndex + 1;
        [newChapters[chapterIndex], newChapters[targetIndex]] = 
          [newChapters[targetIndex], newChapters[chapterIndex]];
        // order_indexを更新
        return newChapters.map((ch, idx) => ({ ...ch, order_index: idx }));
      });

      showToast('success', '章を移動しました');
    } catch (error: any) {
      console.error('Move chapter error:', error);
      showToast('error', error.message);
    }
  }, [book.id, chaptersData, showToast]);

  // 節を移動
  const handleMoveSection = useCallback(async (sectionId: string, chapterId: string, direction: 'up' | 'down') => {
    const chapter = chaptersData.find(ch => ch.id === chapterId);
    if (!chapter) return;
    
    const sectionIndex = chapter.sections.findIndex(sec => sec.id === sectionId);
    if (sectionIndex === -1) return;
    
    if (direction === 'up' && sectionIndex === 0) {
      showToast('info', 'これ以上上に移動できません');
      return;
    }
    if (direction === 'down' && sectionIndex === chapter.sections.length - 1) {
      showToast('info', 'これ以上下に移動できません');
      return;
    }

    try {
      const response = await fetch('/api/kdl/structure/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          sectionId,
          chapterId,
          direction,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '節の移動に失敗しました');
      }

      // ローカルの状態を更新（入れ替え）
      setChaptersData(prev => prev.map(ch => {
        if (ch.id === chapterId) {
          const newSections = [...ch.sections];
          const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
          [newSections[sectionIndex], newSections[targetIndex]] = 
            [newSections[targetIndex], newSections[sectionIndex]];
          // order_indexを更新
          return {
            ...ch,
            sections: newSections.map((sec, idx) => ({ ...sec, order_index: idx })),
          };
        }
        return ch;
      }));

      showToast('success', '節を移動しました');
    } catch (error: any) {
      console.error('Move section error:', error);
      showToast('error', error.message);
    }
  }, [chaptersData, showToast]);

  // KDP情報生成
  const handleGenerateKdpInfo = useCallback(async () => {
    if (isGeneratingKdp) return;
    
    setIsGeneratingKdp(true);
    setKdpError('');
    setKdpInfo(null);
    setIsKdpModalOpen(true);

    try {
      const response = await fetch('/api/kdl/generate-kdp-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: book.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'KDP情報の生成に失敗しました');
      }

      const data: KdpInfo = await response.json();
      setKdpInfo(data);
    } catch (error: any) {
      console.error('Generate KDP info error:', error);
      setKdpError(error.message || 'KDP情報の生成に失敗しました');
    } finally {
      setIsGeneratingKdp(false);
    }
  }, [book.id, isGeneratingKdp]);

  // テキストをクリップボードにコピー
  const handleCopyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('success', `${label}をコピーしました`);
    }).catch(() => {
      showToast('error', 'コピーに失敗しました');
    });
  }, [showToast]);

  // 構成変更ハンドラーをまとめたオブジェクト
  const structureHandlers = {
    onAddChapter: handleAddChapter,
    onAddSection: handleAddSection,
    onRenameChapter: handleRenameChapter,
    onRenameSection: handleRenameSection,
    onDeleteChapter: handleDeleteChapter,
    onDeleteSection: handleDeleteSection,
    onMoveChapter: handleMoveChapter,
    onMoveSection: handleMoveSection,
  };

  if (!activeSection) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-2">節が見つかりません</p>
          <p className="text-sm text-gray-400">目次から節を選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/kindle"
            className="flex items-center gap-1 text-white/90 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            <span>一覧に戻る</span>
          </Link>
          <div className="text-white/30">|</div>
          <h1 className="font-bold text-sm truncate max-w-xs">{book.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/kindle/guide"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all bg-white/20 hover:bg-white/30 active:bg-white/40"
          >
            <BookOpen size={16} />
            <span className="hidden lg:inline">📖 まずお読みください</span>
            <span className="lg:hidden">📖</span>
          </Link>
          
          <Link
            href="/kindle/publish-guide"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all bg-white/20 hover:bg-white/30 active:bg-white/40"
          >
            <Rocket size={16} />
            <span className="hidden lg:inline">🚀 出版準備ガイド</span>
            <span className="lg:hidden">🚀</span>
          </Link>
          
          <button
            onClick={handleGenerateKdpInfo}
            disabled={isGeneratingKdp}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isGeneratingKdp
                ? 'bg-white/20 cursor-not-allowed'
                : 'bg-white/20 hover:bg-white/30 active:bg-white/40'
            }`}
          >
            {isGeneratingKdp ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>✨ KDP情報生成</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDownloadDocx}
            disabled={isDownloading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isDownloading
                ? 'bg-white/20 cursor-not-allowed'
                : 'bg-white/20 hover:bg-white/30 active:bg-white/40'
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <FileDown size={16} />
                <span>📥 Word出力</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleSaveAndBack}
            disabled={isSavingAndBack}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isSavingAndBack
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-white text-amber-600 hover:bg-amber-50 active:bg-amber-100'
            }`}
          >
            {isSavingAndBack ? (
              <>
                <Check size={16} className="text-white" />
                <span className="text-white">保存しました</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>💾 保存して戻る</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左サイドバー: 目次 */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 overflow-hidden">
          <ChapterSidebar
            chapters={chaptersData}
            activeSectionId={activeSectionId}
            onSectionClick={handleSectionClick}
            bookTitle={book.title}
            bookSubtitle={book.subtitle}
            onBatchWrite={handleBatchWrite}
            batchProgress={batchProgress}
            structureHandlers={structureHandlers}
          />
        </div>

        {/* 右メイン: エディタ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TiptapEditor
            ref={editorRef}
            key={activeSectionId}
            initialContent={activeSection.content}
            sectionId={activeSectionId}
            sectionTitle={activeSection.title || '無題の節'}
            chapterTitle={activeChapter?.title || '無題の章'}
            bookInfo={book}
            targetProfile={targetProfile}
            tocPatternId={tocPatternId}
            onSave={handleSave}
          />
        </div>
      </div>

      {/* トースト通知 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg animate-fade-in ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            <span className="font-medium">{toast.message}</span>
            <button 
              onClick={() => dismissToast(toast.id)}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* 確認ダイアログ */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              {confirmDialog.title}
            </h3>
            <p className="text-gray-600 mb-6 whitespace-pre-line">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={confirmDialog.onCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-colors"
              >
                実行する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KDP情報モーダル */}
      {isKdpModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">KDP登録情報</h2>
                  <p className="text-sm text-gray-500">Amazon Kindle Direct Publishing用</p>
                </div>
              </div>
              <button
                onClick={() => setIsKdpModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isGeneratingKdp ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
                    <div 
                      className="absolute inset-0 border-4 border-amber-500 rounded-full animate-spin"
                      style={{ borderRightColor: 'transparent', borderTopColor: 'transparent' }}
                    ></div>
                  </div>
                  <p className="text-gray-600 font-medium">AIがKDP情報を生成中...</p>
                  <p className="text-sm text-gray-400 mt-2">本の内容を分析しています</p>
                </div>
              ) : kdpError ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="text-red-400 mb-4" size={48} />
                  <p className="text-red-600 font-medium mb-4">{kdpError}</p>
                  <button
                    onClick={handleGenerateKdpInfo}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                  >
                    再試行
                  </button>
                </div>
              ) : kdpInfo ? (
                <div className="space-y-6">
                  {/* キャッチコピー */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="text-amber-500" size={18} />
                        <h3 className="font-bold text-gray-900">キャッチコピー</h3>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(kdpInfo.catch_copy, 'キャッチコピー')}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        <Copy size={14} />
                        コピー
                      </button>
                    </div>
                    <p className="text-lg font-medium text-gray-800">{kdpInfo.catch_copy}</p>
                  </div>

                  {/* キーワード */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Tag className="text-amber-500" size={18} />
                        <h3 className="font-bold text-gray-900">キーワード（7個）</h3>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(kdpInfo.keywords.join(', '), 'キーワード')}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        <Copy size={14} />
                        すべてコピー
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {kdpInfo.keywords.map((keyword, index) => (
                        <button
                          key={index}
                          onClick={() => handleCopyToClipboard(keyword, `キーワード${index + 1}`)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors border border-gray-200"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* カテゴリー */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FolderTree className="text-amber-500" size={18} />
                        <h3 className="font-bold text-gray-900">推奨カテゴリー</h3>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(kdpInfo.categories.join('\n'), 'カテゴリー')}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        <Copy size={14} />
                        コピー
                      </button>
                    </div>
                    <div className="space-y-2">
                      {kdpInfo.categories.map((category, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200"
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 紹介文 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="text-amber-500" size={18} />
                        <h3 className="font-bold text-gray-900">商品紹介文</h3>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(kdpInfo.description, '紹介文')}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        <Copy size={14} />
                        コピー
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div 
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: kdpInfo.description }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      ※ HTMLタグ付きでコピーされます。KDPの紹介文欄に直接貼り付けてください。
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* モーダルフッター */}
            {kdpInfo && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    💡 各項目をクリックしてコピーできます
                  </p>
                  <button
                    onClick={() => setIsKdpModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 一括執筆中のオーバーレイ */}
      {batchProgress.isRunning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-amber-500 rounded-full animate-spin"
                style={{ borderRightColor: 'transparent', borderTopColor: 'transparent' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-amber-600">
                  {batchProgress.currentIndex}/{batchProgress.totalCount}
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              AIが執筆中です...
            </h3>
            <p className="text-gray-600 mb-4">
              「{batchProgress.currentSectionTitle}」を執筆しています
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(batchProgress.currentIndex / batchProgress.totalCount) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">
              ⚠️ ブラウザを閉じないでください
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorLayout;
