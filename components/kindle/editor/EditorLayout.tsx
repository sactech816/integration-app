'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileDown, Loader2, Save, Check, X, AlertCircle, CheckCircle, Info, Sparkles, Copy, Tag, FileText, FolderTree, Lightbulb, BookOpen, Rocket, PlayCircle, Crown, Menu, Plus, Trash2, PenLine, StickyNote, ArrowRightToLine } from 'lucide-react';
import Link from 'next/link';
import KdlHamburgerMenu from '@/components/kindle/shared/KdlHamburgerMenu';
import KdlUsageHeader, { type KdlUsageLimits } from '@/components/kindle/KdlUsageHeader';
import { ChapterSidebar } from './ChapterSidebar';
import { TiptapEditor, TiptapEditorRef } from './TiptapEditor';
import { Home } from 'lucide-react';

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
  status?: string;
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

interface SectionDraft {
  id: string;
  section_id: string;
  book_id: string;
  label: string;
  content: string;
  tab_type: 'draft' | 'memo';
  order_index: number;
}

type ActiveTab = { type: 'main' } | { type: 'draft'; draftId: string };

interface EditorLayoutProps {
  book: Book;
  chapters: Chapter[];
  targetProfile?: TargetProfile;
  tocPatternId?: string; // 目次で選択したパターンID（執筆スタイルのデフォルト決定用）
  onUpdateSectionContent: (sectionId: string, content: string) => Promise<void>;
  onStructureChange?: () => Promise<void>;
  onUpdateBookStatus?: (status: string) => Promise<void>; // 書籍ステータス更新
  readOnly?: boolean; // 閲覧専用モード（デモ用）
  adminKeyParam?: string; // admin_keyパラメータ（リンクに引き継ぐ用）
  userId?: string; // 使用量表示用
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  book,
  chapters,
  targetProfile,
  tocPatternId,
  onUpdateSectionContent,
  onStructureChange,
  onUpdateBookStatus,
  readOnly = false,
  adminKeyParam = '',
  userId,
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

  // propsのchaptersが更新されたらローカル状態も同期する
  React.useEffect(() => {
    setChaptersData(chapters);
  }, [chapters]);
  const [isDownloading, setIsDownloading] = useState(false);
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
  const [isLoadingKdp, setIsLoadingKdp] = useState(false);
  const [kdpInfo, setKdpInfo] = useState<KdpInfo | null>(null);
  const [kdpError, setKdpError] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // スマホ用サイドバー表示状態

  // タブ（ドラフト）管理
  const [activeTab, setActiveTab] = useState<ActiveTab>({ type: 'main' });
  const [drafts, setDrafts] = useState<SectionDraft[]>([]);
  const [isDraftsLoading, setIsDraftsLoading] = useState(false);
  const draftEditorRef = useRef<TiptapEditorRef>(null);
  const [isAddingDraft, setIsAddingDraft] = useState(false);
  const [editingDraftLabel, setEditingDraftLabel] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState('');

  // KDL使用量制限
  const [usageLimits, setUsageLimits] = useState<KdlUsageLimits | null>(null);
  const [usageRefreshTrigger, setUsageRefreshTrigger] = useState(0);
  const [isSaving, setIsSaving] = useState(false); // 途中保存中
  const [isMarkingComplete, setIsMarkingComplete] = useState(false); // 完成マーク中
  const [bookStatus, setBookStatus] = useState(book.status || 'draft'); // 書籍ステータス

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
    setActiveTab({ type: 'main' }); // セクション変更時は本文タブに戻る
  }, []);

  // 初期タブ（本文2 + メモ）を自動作成
  const createDefaultDrafts = useCallback(async (sectionId: string): Promise<SectionDraft[]> => {
    const defaults: { label: string; tab_type: 'draft' | 'memo' }[] = [
      { label: '本文2', tab_type: 'draft' },
      { label: 'メモ', tab_type: 'memo' },
    ];

    const created: SectionDraft[] = [];
    for (const d of defaults) {
      try {
        const response = await fetch('/api/kdl/section-drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section_id: sectionId,
            book_id: book.id,
            label: d.label,
            content: '',
            tab_type: d.tab_type,
          }),
        });
        if (response.ok) {
          created.push(await response.json());
        }
      } catch {
        // 作成失敗しても続行
      }
    }
    return created;
  }, [book.id]);

  // ドラフト一覧を取得（なければ自動作成）
  const fetchDrafts = useCallback(async (sectionId: string) => {
    setIsDraftsLoading(true);
    try {
      const response = await fetch(`/api/kdl/section-drafts?section_id=${sectionId}`);
      if (response.ok) {
        const data = await response.json();
        const existing = data.drafts || [];

        if (existing.length === 0 && !readOnly) {
          // 初回: デフォルトタブを自動作成
          const defaults = await createDefaultDrafts(sectionId);
          setDrafts(defaults);
        } else {
          setDrafts(existing);
        }
      } else {
        setDrafts([]);
      }
    } catch {
      setDrafts([]);
    } finally {
      setIsDraftsLoading(false);
    }
  }, [createDefaultDrafts, readOnly]);

  // セクション変更時にドラフトを読み込む
  useEffect(() => {
    if (activeSectionId) {
      fetchDrafts(activeSectionId);
    }
  }, [activeSectionId, fetchDrafts]);

  // ドラフトの内容を保存
  const handleSaveDraft = useCallback(async (draftId: string, content: string) => {
    try {
      await fetch('/api/kdl/section-drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draftId, content }),
      });
      // ローカル状態も更新
      setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, content } : d));
    } catch (error: any) {
      console.error('Save draft error:', error);
      throw new Error('ドラフトの保存に失敗しました');
    }
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

  // 新しいドラフトタブを追加
  const handleAddDraft = useCallback(async (tabType: 'draft' | 'memo', initialContent?: string) => {
    if (isAddingDraft || !activeSectionId) return;
    setIsAddingDraft(true);
    try {
      const draftCount = drafts.filter(d => d.tab_type === tabType).length;
      const label = tabType === 'memo' ? 'メモ' : `AI案${draftCount + 1}`;

      const response = await fetch('/api/kdl/section-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: activeSectionId,
          book_id: book.id,
          label,
          content: initialContent || '',
          tab_type: tabType,
        }),
      });

      if (!response.ok) {
        throw new Error('タブの追加に失敗しました');
      }

      const newDraft: SectionDraft = await response.json();
      setDrafts(prev => [...prev, newDraft]);
      setActiveTab({ type: 'draft', draftId: newDraft.id });
      showToast('success', `「${label}」タブを追加しました`);
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setIsAddingDraft(false);
    }
  }, [activeSectionId, book.id, drafts, isAddingDraft, showToast]);

  // ドラフトタブを削除
  const handleDeleteDraft = useCallback(async (draftId: string) => {
    try {
      const response = await fetch(`/api/kdl/section-drafts?id=${draftId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('タブの削除に失敗しました');
      }

      setDrafts(prev => prev.filter(d => d.id !== draftId));
      if (activeTab.type === 'draft' && activeTab.draftId === draftId) {
        setActiveTab({ type: 'main' });
      }
      showToast('success', 'タブを削除しました');
    } catch (error: any) {
      showToast('error', error.message);
    }
  }, [activeTab, showToast]);

  // ドラフトの内容を本文に採用
  const handleAdoptDraft = useCallback(async (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (!draft || !activeSectionId) return;

    // 現在のドラフトを保存してから採用
    if (draftEditorRef.current) {
      await draftEditorRef.current.forceSave();
    }

    // 本文に書き込み
    await handleSave(activeSectionId, draft.content);
    setActiveTab({ type: 'main' });
    showToast('success', `「${draft.label}」の内容を本文に採用しました`);
  }, [drafts, activeSectionId, handleSave, showToast]);

  // ドラフトのラベルを更新
  const handleRenameDraft = useCallback(async (draftId: string, newLabel: string) => {
    try {
      await fetch('/api/kdl/section-drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draftId, label: newLabel }),
      });
      setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, label: newLabel } : d));
      setEditingDraftLabel(null);
    } catch (error: any) {
      showToast('error', 'ラベルの変更に失敗しました');
    }
  }, [showToast]);

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

  // 途中保存（画面に留まる）
  const handleIntermediateSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // エディタの現在の内容を即座に保存
      if (editorRef.current) {
        await editorRef.current.forceSave();
      }
      
      // ステータスを'writing'に更新（まだdraftの場合）
      if (bookStatus === 'draft' && onUpdateBookStatus) {
        await onUpdateBookStatus('writing');
        setBookStatus('writing');
      }
      
      showToast('success', '保存しました！');
    } catch (error: any) {
      console.error('Intermediate save error:', error);
      showToast('error', '保存に失敗しました: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 完成マーク
  const handleMarkComplete = async () => {
    if (isMarkingComplete) return;
    
    // 確認ダイアログ
    const confirmed = await showConfirm(
      '執筆完了にしますか？',
      'この書籍を「完成」としてマークします。\n\n' +
      '完成後も編集は可能です。\n' +
      '出版準備が整ったらWord出力してKDPに登録しましょう。'
    );
    
    if (!confirmed) return;
    
    setIsMarkingComplete(true);
    try {
      // まず現在の内容を保存
      if (editorRef.current) {
        await editorRef.current.forceSave();
      }
      
      // ステータスを'completed'に更新
      if (onUpdateBookStatus) {
        await onUpdateBookStatus('completed');
        setBookStatus('completed');
      }
      
      showToast('success', '🎉 執筆完了！おめでとうございます！');
    } catch (error: any) {
      console.error('Mark complete error:', error);
      showToast('error', '完了処理に失敗しました: ' + error.message);
    } finally {
      setIsMarkingComplete(false);
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
  // KDP情報を表示（保存済みがあればそれを使い、なければ生成）
  const handleShowKdpInfo = useCallback(async () => {
    if (isGeneratingKdp || isLoadingKdp) return;

    // 既にキャッシュ済みならモーダルを開くだけ
    if (kdpInfo) {
      setIsKdpModalOpen(true);
      return;
    }

    setIsLoadingKdp(true);
    setKdpError('');
    setIsKdpModalOpen(true);

    try {
      // まずGETで保存済みKDP情報を取得
      const getResponse = await fetch(`/api/kdl/generate-kdp-info?book_id=${book.id}`);

      if (getResponse.ok) {
        const data: KdpInfo = await getResponse.json();
        setKdpInfo(data);
        setIsLoadingKdp(false);
        return;
      }

      // 保存済みがなければAI生成
      setIsLoadingKdp(false);
      await handleRegenerateKdpInfo();
    } catch (error: any) {
      console.error('Load KDP info error:', error);
      setKdpError(error.message || 'KDP情報の取得に失敗しました');
      setIsLoadingKdp(false);
    }
  }, [book.id, isGeneratingKdp, isLoadingKdp, kdpInfo]);

  // KDP情報を再生成（常にAI APIを呼ぶ）
  const handleRegenerateKdpInfo = useCallback(async () => {
    if (isGeneratingKdp) return;

    setIsGeneratingKdp(true);
    setKdpError('');

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

  // 書籍情報を更新
  const handleUpdateBookInfo = useCallback(async (title: string, subtitle: string | null) => {
    try {
      const response = await fetch('/api/kdl/update-book', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          title,
          subtitle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '書籍情報の更新に失敗しました');
      }

      // ローカルの状態を更新
      book.title = title;
      book.subtitle = subtitle;

      showToast('success', '書籍情報を更新しました');
    } catch (error: any) {
      console.error('Update book info error:', error);
      showToast('error', error.message);
    }
  }, [book, showToast]);

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
      {/* デモモードバナー */}
      {readOnly && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <PlayCircle size={18} className="flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-sm sm:text-base block sm:inline">デモモード（閲覧専用）</span>
              <span className="text-xs sm:text-sm opacity-90 block sm:inline sm:ml-2 mt-1 sm:mt-0">製品版では編集・AI執筆・Word出力などが可能です</span>
            </div>
          </div>
          <Link
            href="/kindle/lp#pricing"
            className="flex items-center gap-2 bg-white text-indigo-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-indigo-50 transition-colors w-full sm:w-auto justify-center sm:justify-start flex-shrink-0"
          >
            <Crown size={14} className="sm:w-4 sm:h-4" />
            <span>製品版を使う</span>
          </Link>
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md relative z-30">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* ハンバーガーメニュー（KDL共通ナビゲーション） */}
          <KdlHamburgerMenu 
            adminKey={adminKeyParam.replace('?admin_key=', '') || null}
            buttonClassName="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
            iconColor="text-white"
          />

          {/* スマホ用サイドバートグルボタン（目次表示用） */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
            title="目次を表示"
          >
            <BookOpen size={20} />
          </button>
          
          <h1 className="font-bold text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs">{book.title}</h1>
          {readOnly && (
            <div className="flex items-center gap-1 bg-blue-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
              <PlayCircle size={12} />
              <span className="hidden sm:inline">デモ</span>
            </div>
          )}
        </div>
        
        {/* デスクトップ用ボタン群 */}
        <div className="hidden lg:flex items-center gap-2">
          {!readOnly && (
            <>
              {/* 途中保存ボタン */}
              <button
                onClick={handleIntermediateSave}
                disabled={isSaving}
                title="途中保存"
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                  isSaving
                    ? 'bg-white/20 cursor-not-allowed'
                    : 'bg-white/20 hover:bg-white/30 active:bg-white/40'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>途中保存</span>
                  </>
                )}
              </button>
              
              {/* 完成ボタン */}
              <button
                onClick={handleMarkComplete}
                disabled={isMarkingComplete || bookStatus === 'completed'}
                title={bookStatus === 'completed' ? '完成済み' : '執筆完了'}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                  bookStatus === 'completed'
                    ? 'bg-green-500/80 cursor-default'
                    : isMarkingComplete
                    ? 'bg-white/20 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                }`}
              >
                {bookStatus === 'completed' ? (
                  <>
                    <CheckCircle size={16} />
                    <span>完成済み</span>
                  </>
                ) : isMarkingComplete ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>処理中...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>完成</span>
                  </>
                )}
              </button>
              
              <div className="w-px h-6 bg-white/30" />
              
              <button
                onClick={handleShowKdpInfo}
                disabled={isGeneratingKdp || isLoadingKdp}
                title="KDP情報"
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                  isGeneratingKdp || isLoadingKdp
                    ? 'bg-white/20 cursor-not-allowed'
                    : 'bg-white/20 hover:bg-white/30 active:bg-white/40'
                }`}
              >
                {isGeneratingKdp || isLoadingKdp ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>{isGeneratingKdp ? '生成中...' : '読込中...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>KDP情報</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleDownloadDocx}
                disabled={isDownloading}
                title="Word出力"
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
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
                    <span>Word出力</span>
                  </>
                )}
              </button>
              
              <div className="w-px h-6 bg-white/30" />
              
              {/* まずお読みください */}
              <Link
                href="/kindle/guide"
                target="_blank"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all bg-white/20 hover:bg-white/30 active:bg-white/40"
              >
                <FileText size={16} />
                <span>まずお読みください</span>
              </Link>
            </>
          )}
        </div>
        
        {/* タブレット・スマホ用ボタン群（コンパクト） */}
        <div className="lg:hidden flex items-center gap-1">
          {!readOnly && (
            <>
              {/* 途中保存ボタン */}
              <button
                onClick={handleIntermediateSave}
                disabled={isSaving}
                title="途中保存"
                className={`flex items-center justify-center p-2 rounded-lg font-medium text-sm transition-all ${
                  isSaving
                    ? 'bg-white/20 cursor-not-allowed'
                    : 'bg-white/20 hover:bg-white/30 active:bg-white/40'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
              </button>
              
              {/* 完成ボタン */}
              <button
                onClick={handleMarkComplete}
                disabled={isMarkingComplete || bookStatus === 'completed'}
                title={bookStatus === 'completed' ? '完成済み' : '執筆完了'}
                className={`flex items-center justify-center p-2 rounded-lg font-medium text-sm transition-all ${
                  bookStatus === 'completed'
                    ? 'bg-green-500/80 cursor-default'
                    : isMarkingComplete
                    ? 'bg-white/20 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                }`}
              >
                {bookStatus === 'completed' ? (
                  <CheckCircle size={18} />
                ) : isMarkingComplete ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Check size={18} />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 使用量ヘッダー（ログインユーザー向け） */}
      {userId && !readOnly && (
        <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-1.5">
          <div className="flex items-center justify-between max-w-full">
            <span className="text-xs text-gray-500">残り回数</span>
            <KdlUsageHeader
              userId={userId}
              onLimitsChange={setUsageLimits}
              refreshTrigger={usageRefreshTrigger}
            />
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* スマホ用サイドバーオーバーレイ */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* 左サイドバー: 目次 */}
        <div className={`
          fixed lg:static
          top-0 left-0 h-full
          w-[85vw] max-w-[320px] lg:w-80
          flex-shrink-0 border-r border-gray-200 overflow-hidden
          bg-white z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <ChapterSidebar
            chapters={chaptersData}
            activeSectionId={activeSectionId}
            onSectionClick={(sectionId) => {
              handleSectionClick(sectionId);
              setIsSidebarOpen(false); // スマホで節を選択したらサイドバーを閉じる
            }}
            bookTitle={book.title}
            bookSubtitle={book.subtitle}
            bookId={book.id}
            onUpdateBookInfo={readOnly ? undefined : handleUpdateBookInfo}
            onBatchWrite={readOnly ? undefined : handleBatchWrite}
            batchProgress={batchProgress}
            structureHandlers={readOnly ? undefined : structureHandlers}
            readOnly={readOnly}
            onCloseSidebar={() => setIsSidebarOpen(false)} // サイドバーを閉じる関数を渡す
          />
        </div>

        {/* 右メイン: タブ + エディタ */}
        <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
          {/* タブバー */}
          <div className="flex items-center border-b border-gray-200 bg-gray-50 px-2 gap-0.5 overflow-x-auto shrink-0">
            {/* 本文タブ */}
            <button
              onClick={() => {
                // ドラフトタブから離れる前に保存
                if (activeTab.type === 'draft' && draftEditorRef.current) {
                  draftEditorRef.current.forceSave();
                }
                setActiveTab({ type: 'main' });
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab.type === 'main'
                  ? 'border-amber-500 text-amber-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <PenLine size={14} />
              本文
            </button>

            {/* ドラフト・メモタブ */}
            {drafts.map(draft => (
              <div key={draft.id} className="flex items-center group relative">
                {editingDraftLabel === draft.id ? (
                  <input
                    type="text"
                    value={editingLabelValue}
                    onChange={(e) => setEditingLabelValue(e.target.value)}
                    onBlur={() => {
                      if (editingLabelValue.trim()) {
                        handleRenameDraft(draft.id, editingLabelValue.trim());
                      } else {
                        setEditingDraftLabel(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editingLabelValue.trim()) {
                        handleRenameDraft(draft.id, editingLabelValue.trim());
                      } else if (e.key === 'Escape') {
                        setEditingDraftLabel(null);
                      }
                    }}
                    className="w-20 px-2 py-1.5 text-sm border border-amber-400 rounded outline-none bg-white"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => {
                      // 前のタブを保存
                      if (activeTab.type === 'main' && editorRef.current) {
                        editorRef.current.forceSave();
                      } else if (activeTab.type === 'draft' && draftEditorRef.current) {
                        draftEditorRef.current.forceSave();
                      }
                      setActiveTab({ type: 'draft', draftId: draft.id });
                    }}
                    onDoubleClick={() => {
                      setEditingDraftLabel(draft.id);
                      setEditingLabelValue(draft.label);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab.type === 'draft' && activeTab.draftId === draft.id
                        ? 'border-amber-500 text-amber-700 bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {draft.tab_type === 'memo' ? <StickyNote size={14} /> : <Sparkles size={14} />}
                    {draft.label}
                  </button>
                )}
                {/* 閉じるボタン（ホバー時に表示） */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDraft(draft.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition-all -ml-1 mr-1"
                  title="タブを削除"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* タブ追加ボタン */}
            {!readOnly && (
              <div className="relative flex items-center ml-1">
                <button
                  onClick={() => handleAddDraft('draft')}
                  disabled={isAddingDraft}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                  title="AI案タブを追加"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => handleAddDraft('memo')}
                  disabled={isAddingDraft}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="メモタブを追加"
                >
                  <StickyNote size={14} />
                </button>
              </div>
            )}

            {/* ドラフトタブ選択時: 本文に採用ボタン */}
            {activeTab.type === 'draft' && !readOnly && (
              <button
                onClick={() => handleAdoptDraft(activeTab.draftId)}
                className="flex items-center gap-1.5 ml-auto px-3 py-1.5 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors whitespace-nowrap mr-2"
                title="この内容を本文に採用"
              >
                <ArrowRightToLine size={14} />
                本文に採用
              </button>
            )}
          </div>

          {/* エディタ本体 */}
          {activeTab.type === 'main' ? (
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
              readOnly={readOnly}
            />
          ) : (() => {
            const activeDraft = drafts.find(d => d.id === (activeTab as { type: 'draft'; draftId: string }).draftId);
            if (!activeDraft) return null;
            return (
              <TiptapEditor
                ref={draftEditorRef}
                key={`draft-${activeDraft.id}`}
                initialContent={activeDraft.content}
                sectionId={activeDraft.id}
                sectionTitle={`${activeSection.title || '無題の節'} - ${activeDraft.label}`}
                chapterTitle={activeChapter?.title || '無題の章'}
                bookInfo={book}
                targetProfile={targetProfile}
                tocPatternId={tocPatternId}
                onSave={(draftId, content) => handleSaveDraft(draftId, content)}
                readOnly={readOnly}
              />
            );
          })()}
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
              {(isGeneratingKdp || isLoadingKdp) ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
                    <div 
                      className="absolute inset-0 border-4 border-amber-500 rounded-full animate-spin"
                      style={{ borderRightColor: 'transparent', borderTopColor: 'transparent' }}
                    ></div>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {isGeneratingKdp ? 'AIがKDP情報を生成中...' : 'KDP情報を読み込み中...'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {isGeneratingKdp ? '本の内容を分析しています' : '保存済みデータを取得しています'}
                  </p>
                </div>
              ) : kdpError ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="text-red-400 mb-4" size={48} />
                  <p className="text-red-600 font-medium mb-4">{kdpError}</p>
                  <button
                    onClick={handleRegenerateKdpInfo}
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
                    各項目をクリックしてコピーできます
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRegenerateKdpInfo}
                      disabled={isGeneratingKdp}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isGeneratingKdp
                          ? 'bg-amber-200 text-amber-500 cursor-not-allowed'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
                    >
                      {isGeneratingKdp ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      再生成
                    </button>
                    <button
                      onClick={() => setIsKdpModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                    >
                      閉じる
                    </button>
                  </div>
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
