'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileDown, Loader2, Save, Check, X, AlertCircle, CheckCircle, Info, Sparkles, Copy, Tag, FileText, FolderTree, Lightbulb, BookOpen, Rocket, PlayCircle, Crown, Menu, Plus, Trash2, PenLine, StickyNote, ArrowRightToLine } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import KdlHamburgerMenu, { type EditorActionItem } from '@/components/kindle/shared/KdlHamburgerMenu';
import KdlUsageHeader, { type KdlUsageLimits } from '@/components/kindle/KdlUsageHeader';
import BookLPPreview from '@/components/kindle/lp/BookLPPreview';
import KindleCoverGenerator from '@/components/kindle/cover/KindleCoverGenerator';
import { ChapterSidebar } from './ChapterSidebar';
import { TiptapEditor, TiptapEditorRef } from './TiptapEditor';
import { Home, Image as ImageIcon } from 'lucide-react';

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
  autoOpenLP?: boolean; // LP編集モーダルを自動で開く
  planTier?: string; // プラン制御用（'none' = 無料プラン）
}

// KDL API用の認証ヘッダーを取得
async function getKdlAuthHeaders(): Promise<HeadersInit> {
  const session = await supabase?.auth.getSession();
  const token = session?.data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
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
  autoOpenLP = false,
  planTier,
}) => {
  const isFreePlan = !planTier || planTier === 'none';
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

  // LP生成関連
  const [isLPModalOpen, setIsLPModalOpen] = useState(false);
  const [isGeneratingLP, setIsGeneratingLP] = useState(false);
  const [lpData, setLpData] = useState<any>(null);
  const [lpStatus, setLpStatus] = useState<'draft' | 'published'>('draft');
  const [lpNotGenerated, setLpNotGenerated] = useState(false);
  const [lpThemeColor, setLpThemeColor] = useState<string>('orange');
  const [lpSectionVisibility, setLpSectionVisibility] = useState<any>({});
  const [lpCoverImageUrl, setLpCoverImageUrl] = useState<string | undefined>(undefined);

  // 表紙生成関連
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  // 完成後の次のステップ提案モーダル
  const [showNextStepsModal, setShowNextStepsModal] = useState(false);

  // 文体変換関連
  const [isStyleTransformOpen, setIsStyleTransformOpen] = useState(false);
  const [selectedTargetStyle, setSelectedTargetStyle] = useState<string>('dialogue');
  const [rewriteProgress, setRewriteProgress] = useState<{
    isRunning: boolean;
    currentIndex: number;
    totalCount: number;
    currentSectionTitle: string;
    newBookId: string | null;
  }>({ isRunning: false, currentIndex: 0, totalCount: 0, currentSectionTitle: '', newBookId: null });

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

  // はじめかたガイド（ウィザード形式：3ページ構成）
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDismissForever, setOnboardingDismissForever] = useState(false);
  const [onboardingPage, setOnboardingPage] = useState(0);
  const ONBOARDING_TOTAL_PAGES = 3;

  useEffect(() => {
    if (readOnly) return;
    const dismissed = localStorage.getItem('kdl_onboarding_dismissed');
    if (!dismissed) {
      setShowOnboarding(true);
      setOnboardingPage(0);
    }
  }, [readOnly]);

  const handleDismissOnboarding = () => {
    if (onboardingDismissForever) {
      localStorage.setItem('kdl_onboarding_dismissed', 'true');
    }
    setShowOnboarding(false);
    setOnboardingPage(0);
  };
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
          headers: await getKdlAuthHeaders(),
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
      const response = await fetch(`/api/kdl/section-drafts?section_id=${sectionId}`, {
        headers: await getKdlAuthHeaders(),
      });
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
        headers: await getKdlAuthHeaders(),
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

    // エラーは8秒、その他は3秒後に自動で消す
    const duration = type === 'error' ? 8000 : 3000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
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
      // 本文タブは既存数+2(本文1はメインなので本文2から)、メモはそのまま
      const label = tabType === 'memo' ? `メモ${draftCount > 0 ? draftCount + 1 : ''}` : `本文${draftCount + 2}`;

      const response = await fetch('/api/kdl/section-drafts', {
        method: 'POST',
        headers: await getKdlAuthHeaders(),
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
        headers: await getKdlAuthHeaders(),
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
        headers: await getKdlAuthHeaders(),
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

  // ファイルダウンロード共通処理
  const handleDownloadFile = async (format: 'docx' | 'epub') => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/kdl/download-${format}?book_id=${book.id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'ダウンロードに失敗しました');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title}.${format}`;
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
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `節「${section.title}」の生成に失敗しました`;
          console.error(errorMessage);

          if (response.status === 429) {
            // 使用上限に達した場合はバッチを中止
            showToast('error', errorMessage);
            break;
          }
          // その他のエラーはスキップして次へ
          showToast('error', `「${section.title}」の生成をスキップしました`);
          continue;
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
      setShowNextStepsModal(true);
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
        headers: await getKdlAuthHeaders(),
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
        headers: await getKdlAuthHeaders(),
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
        headers: await getKdlAuthHeaders(),
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
        headers: await getKdlAuthHeaders(),
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
        headers: await getKdlAuthHeaders(),
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
        headers: await getKdlAuthHeaders(),
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
        headers: await getKdlAuthHeaders(),
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
        headers: await getKdlAuthHeaders(),
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
        headers: await getKdlAuthHeaders(),
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

  // ===== LP生成関連ハンドラ =====
  const handleShowLP = useCallback(async () => {
    if (isGeneratingLP) return;

    // キャッシュ済みならモーダルを開くだけ
    if (lpData) {
      setIsLPModalOpen(true);
      return;
    }

    setIsLPModalOpen(true);

    try {
      // まずGETで保存済みLPデータを取得
      const getResponse = await fetch(`/api/kdl/generate-book-lp?book_id=${book.id}`);
      if (getResponse.ok) {
        const data = await getResponse.json();
        setLpData({
          hero: data.hero,
          pain_points: data.pain_points,
          author_profile: data.author_profile,
          benefits: data.benefits,
          key_takeaways: data.key_takeaways,
          target_readers: data.target_readers,
          transformation: data.transformation,
          chapter_summaries: data.chapter_summaries,
          social_proof: data.social_proof,
          bonus: data.bonus,
          faq: data.faq,
          closing_message: data.closing_message,
          cta: data.cta,
        });
        setLpStatus(data.status || 'draft');
        setLpThemeColor(data.theme_color || 'orange');
        setLpSectionVisibility(data.section_visibility || {});
        setLpCoverImageUrl(data.cover_image_url || undefined);
        return;
      }
      // 保存済みがない場合は「LP作成」ボタンを表示（自動生成しない）
      setLpNotGenerated(true);
    } catch (error: any) {
      console.error('Load LP error:', error);
      showToast('error', 'LP情報の取得に失敗しました');
    }
  }, [book.id, isGeneratingLP, lpData]);

  // autoOpenLP: ページ読み込み時に自動でLPモーダルを開く
  useEffect(() => {
    if (autoOpenLP && !isLPModalOpen) {
      handleShowLP();
    }
  }, [autoOpenLP]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerateLP = useCallback(async () => {
    if (isGeneratingLP) return;
    setIsGeneratingLP(true);

    try {
      const response = await fetch('/api/kdl/generate-book-lp', {
        method: 'POST',
        headers: await getKdlAuthHeaders(),
        body: JSON.stringify({ book_id: book.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'LP生成に失敗しました');
      }

      const data = await response.json();
      setLpData(data.lpData);
      setLpStatus('draft');
      setLpNotGenerated(false);
      showToast('success', 'LPを生成しました');
      setUsageRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Generate LP error:', error);
      showToast('error', error.message || 'LP生成に失敗しました');
    } finally {
      setIsGeneratingLP(false);
    }
  }, [book.id, isGeneratingLP, showToast]);

  const handleLPPublishToggle = useCallback(async () => {
    const newStatus = lpStatus === 'published' ? 'draft' : 'published';
    try {
      const response = await fetch('/api/kdl/generate-book-lp', {
        method: 'PUT',
        headers: await getKdlAuthHeaders(),
        body: JSON.stringify({ book_id: book.id, status: newStatus }),
      });
      if (!response.ok) throw new Error('更新に失敗しました');
      setLpStatus(newStatus);
      showToast('success', newStatus === 'published' ? 'LPを公開しました' : 'LPを非公開にしました');
    } catch (error: any) {
      showToast('error', error.message);
    }
  }, [book.id, lpStatus, showToast]);

  const handleLPUpdateField = useCallback(async (updates: any) => {
    try {
      const response = await fetch('/api/kdl/generate-book-lp', {
        method: 'PUT',
        headers: await getKdlAuthHeaders(),
        body: JSON.stringify({ book_id: book.id, ...updates }),
      });
      if (!response.ok) throw new Error('更新に失敗しました');
      // LP本体データの更新（theme_color等のメタデータは除外）
      const dataKeys = ['hero', 'pain_points', 'author_profile', 'benefits', 'key_takeaways',
        'target_readers', 'transformation', 'chapter_summaries', 'social_proof', 'bonus',
        'faq', 'closing_message', 'cta'];
      const lpUpdates: any = {};
      for (const key of dataKeys) {
        if (updates[key] !== undefined) lpUpdates[key] = updates[key];
      }
      if (Object.keys(lpUpdates).length > 0) {
        setLpData((prev: any) => prev ? { ...prev, ...lpUpdates } : prev);
      }
      // メタデータの同期
      if (updates.theme_color !== undefined) setLpThemeColor(updates.theme_color);
      if (updates.section_visibility !== undefined) setLpSectionVisibility(updates.section_visibility);
      if (updates.cover_image_url !== undefined) setLpCoverImageUrl(updates.cover_image_url);
    } catch (error: any) {
      showToast('error', error.message);
    }
  }, [book.id, showToast]);

  // ===== 文体変換関連ハンドラ =====
  const handleBulkRewrite = useCallback(async () => {
    if (rewriteProgress.isRunning || !selectedTargetStyle) return;

    try {
      // 1. ブックコピー＆セクション一覧取得
      const initResponse = await fetch('/api/kdl/rewrite-bulk', {
        method: 'POST',
        headers: await getKdlAuthHeaders(),
        body: JSON.stringify({ book_id: book.id, target_style: selectedTargetStyle }),
      });

      if (!initResponse.ok) {
        const error = await initResponse.json();
        throw new Error(error.error || '文体変換の初期化に失敗しました');
      }

      const initData = await initResponse.json();
      const { newBookId, sections } = initData;

      setIsStyleTransformOpen(false);

      // 2. セクション単位でリライトループ
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        // コンテンツがない場合はスキップ
        if (!section.originalContent || section.originalContent.trim() === '') {
          continue;
        }

        setRewriteProgress({
          isRunning: true,
          currentIndex: i + 1,
          totalCount: sections.length,
          currentSectionTitle: section.title,
          newBookId,
        });

        try {
          const response = await fetch('/api/kdl/rewrite-section', {
            method: 'POST',
            headers: await getKdlAuthHeaders(),
            body: JSON.stringify({
              book_id: newBookId,
              section_id: section.id,
              original_content: section.originalContent,
              target_style: selectedTargetStyle,
              chapter_title: section.chapterTitle,
              section_title: section.title,
              book_title: book.title,
            }),
          });

          if (response.status === 429) {
            const error = await response.json();
            showToast('error', error.error || 'AI使用上限に達しました。残りのセクションは後で個別にリライトできます。');
            break;
          }

          if (!response.ok) {
            console.warn(`Section ${section.title} rewrite failed, skipping`);
          }
        } catch (err) {
          console.warn(`Section ${section.title} rewrite error, skipping`, err);
        }

        // レート制限: 1秒待機
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setRewriteProgress({ isRunning: false, currentIndex: 0, totalCount: 0, currentSectionTitle: '', newBookId: null });
      showToast('success', '文体変換が完了しました！新しい書籍に移動します。');

      // 新しい書籍のエディタに遷移
      router.push(`/kindle/${newBookId}`);
    } catch (error: any) {
      console.error('Bulk rewrite error:', error);
      showToast('error', error.message || '文体変換に失敗しました');
      setRewriteProgress({ isRunning: false, currentIndex: 0, totalCount: 0, currentSectionTitle: '', newBookId: null });
    }
  }, [book.id, book.title, selectedTargetStyle, rewriteProgress.isRunning, showToast, router]);

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
        headers: await getKdlAuthHeaders(),
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
      // NOTE: propsの直接変更だが、親コンポーネントの再レンダリングまで表示を維持するため
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

        {/* ボタン群 + ハンバーガーメニュー（右側） */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!readOnly && (
            <>
              {/* 途中保存ボタン */}
              <button
                onClick={handleIntermediateSave}
                disabled={isSaving}
                title="途中保存"
                className={`flex items-center justify-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium text-sm transition-all ${
                  isSaving
                    ? 'bg-white/20 cursor-not-allowed'
                    : 'bg-white/20 hover:bg-white/30 active:bg-white/40'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                <span className="hidden sm:inline">{isSaving ? '保存中...' : '途中保存'}</span>
              </button>

              {/* 完成ボタン */}
              <button
                onClick={handleMarkComplete}
                disabled={isMarkingComplete || bookStatus === 'completed'}
                title={bookStatus === 'completed' ? '完成済み' : '執筆完了'}
                className={`flex items-center justify-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium text-sm transition-all ${
                  bookStatus === 'completed'
                    ? 'bg-green-500/80 cursor-default'
                    : isMarkingComplete
                    ? 'bg-white/20 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                }`}
              >
                {bookStatus === 'completed' ? (
                  <CheckCircle size={16} />
                ) : isMarkingComplete ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Check size={16} />
                )}
                <span className="hidden sm:inline">
                  {bookStatus === 'completed' ? '完成済み' : isMarkingComplete ? '処理中...' : '完成'}
                </span>
              </button>
            </>
          )}

          {/* ハンバーガーメニュー（右上） */}
          <KdlHamburgerMenu
            adminKey={adminKeyParam.replace('?admin_key=', '') || null}
            buttonClassName="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
            iconColor="text-white"
            editorActions={!readOnly ? [
              {
                id: 'kdp-info',
                label: 'KDP情報（構成AI×1）',
                icon: <Sparkles size={20} />,
                onClick: handleShowKdpInfo,
                disabled: isGeneratingKdp || isLoadingKdp,
                loadingLabel: isGeneratingKdp ? 'KDP情報 生成中...' : 'KDP情報 読込中...',
                locked: isFreePlan,
              },
              {
                id: 'download-word',
                label: 'Word出力',
                icon: <FileDown size={20} />,
                onClick: () => handleDownloadFile('docx'),
                disabled: isDownloading,
                loadingLabel: 'Word 生成中...',
                locked: isFreePlan,
              },
              {
                id: 'download-epub',
                label: 'EPUB出力',
                icon: <BookOpen size={20} />,
                onClick: () => handleDownloadFile('epub'),
                disabled: isDownloading,
                loadingLabel: 'EPUB 生成中...',
                locked: isFreePlan,
              },
              {
                id: 'lp-generate',
                label: 'LP生成（構成AI×1）',
                icon: <Rocket size={20} />,
                onClick: handleShowLP,
                disabled: isGeneratingLP,
                loadingLabel: 'LP 生成中...',
                locked: isFreePlan,
              },
              {
                id: 'generate-cover',
                label: '表紙作成（AI画像生成）',
                icon: <ImageIcon size={20} className="!text-orange-500" />,
                onClick: () => setIsCoverModalOpen(true),
                locked: isFreePlan,
              },
              {
                id: 'style-transform',
                label: '文体変換（執筆AI×節数）',
                icon: <PenLine size={20} />,
                onClick: () => setIsStyleTransformOpen(true),
                disabled: rewriteProgress.isRunning,
                loadingLabel: '文体変換中...',
                locked: isFreePlan,
              },
            ] : undefined}
          />
        </div>
      </div>

      {/* 使用量ヘッダー（ログインユーザー向け） */}
      {userId && !readOnly && (
        <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-1.5">
          <div className="flex items-center justify-end gap-2 max-w-full">
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
                    {draft.tab_type === 'memo' ? <StickyNote size={14} /> : <PenLine size={14} />}
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
                  title="本文タブを追加"
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

      {/* はじめかたガイドウィザード（3ページ構成） */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleDismissOnboarding}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">執筆画面の使い方</h3>
                  <p className="text-white/80 text-sm mt-1">
                    {onboardingPage === 0 && '画面レイアウトと基本操作'}
                    {onboardingPage === 1 && 'タブの使い方とAI執筆'}
                    {onboardingPage === 2 && 'メニューツールと残り回数'}
                  </p>
                </div>
                <span className="text-white/70 text-sm font-medium">{onboardingPage + 1} / {ONBOARDING_TOTAL_PAGES}</span>
              </div>
              {/* ページインジケーター */}
              <div className="flex gap-1.5 mt-3">
                {Array.from({ length: ONBOARDING_TOTAL_PAGES }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full flex-1 transition-colors ${i <= onboardingPage ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            </div>

            {/* ページ1: 画面レイアウトと基本操作 */}
            {onboardingPage === 0 && (
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FolderTree size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">左側 = 目次パネル</p>
                    <p className="text-sm text-gray-600">章・節の構成が一覧表示されます。クリックで執筆する節を選択できます。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <PenLine size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">右側 = 執筆エリア</p>
                    <p className="text-sm text-gray-600">選択した節の本文を編集できます。自動保存機能付きです。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Tag size={16} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">タイトル・サブタイトルの編集</p>
                    <p className="text-sm text-gray-600">目次パネル上部のタイトル・サブタイトル部分をクリックすると、直接編集できます。章名・節名も同様に変更可能です。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Plus size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">章・節の追加・並べ替え</p>
                    <p className="text-sm text-gray-600">目次パネル下部の「+章を追加」ボタンや、各章の「+節を追加」で構成を変更できます。右クリックで移動・削除も可能です。</p>
                  </div>
                </div>
              </div>
            )}

            {/* ページ2: タブの使い方とAI執筆 */}
            {onboardingPage === 1 && (
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">本文タブ</p>
                    <p className="text-sm text-gray-600">メインの執筆用タブです。ここで書いた内容が最終原稿になります。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Copy size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">本文2タブ（下書き）</p>
                    <p className="text-sm text-gray-600">別バージョンの文章を試したいときに使います。本文を書き直す前の比較用や、別のアプローチを試すのに便利です。タブ名はダブルクリックで変更可能。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <StickyNote size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">メモタブ</p>
                    <p className="text-sm text-gray-600">節ごとのメモ書きに使えます。参考情報、アイデア、後で追加したい内容などを書き留めておけます。出力には含まれません。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">AI執筆 &amp; 書き換え</p>
                    <p className="text-sm text-gray-600">ツールバーの「AI執筆」で節を自動生成（1回消費）。テキスト選択後「書き換え」でAIリライト（1回消費）。左サイドバーの <strong>&#9889;</strong> で章を一括AI執筆（節数分消費）。</p>
                  </div>
                </div>
              </div>
            )}

            {/* ページ3: メニューツールと残り回数 */}
            {onboardingPage === 2 && (
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 font-bold text-sm">&#9776;</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">メニュー（右上 &#9776;）</p>
                    <p className="text-sm text-gray-600">
                      <strong>KDP情報</strong> … Amazon登録用のキーワード・説明文を自動生成<br/>
                      <strong>Word/EPUB出力</strong> … 原稿をファイルとしてダウンロード<br/>
                      <strong>LP生成</strong> … 書籍紹介のランディングページを自動作成<br/>
                      <strong>文体変換</strong> … 全体の文体を別スタイルに一括変換
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb size={16} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">ネタ発掘診断</p>
                    <p className="text-sm text-gray-600">メニューからアクセス可能。性格診断をもとにあなたに合った執筆テーマを提案します。新しい書籍のアイデアに困ったときに活用してください。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">残り回数について</p>
                    <p className="text-sm text-gray-600">
                      画面上部に表示される3つの数字は：<br/>
                      <strong>📚</strong> 作成した書籍数 / 上限<br/>
                      <strong>🧠</strong> 構成系AI（タイトル・目次・KDP情報・LP）の今日の残り<br/>
                      <strong>✏️</strong> 執筆系AI（AI執筆・書き換え・一括執筆・文体変換）の今日の残り<br/>
                      毎日0時にリセットされます。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* フッター */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onboardingDismissForever}
                  onChange={(e) => setOnboardingDismissForever(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                />
                <span className="text-sm text-gray-600">次から表示しない</span>
              </label>
              <div className="flex items-center gap-2">
                {onboardingPage > 0 && (
                  <button
                    onClick={() => setOnboardingPage(p => p - 1)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    戻る
                  </button>
                )}
                {onboardingPage < ONBOARDING_TOTAL_PAGES - 1 ? (
                  <button
                    onClick={() => setOnboardingPage(p => p + 1)}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
                  >
                    次へ
                  </button>
                ) : (
                  <button
                    onClick={handleDismissOnboarding}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
                  >
                    はじめる
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KDP情報モーダル */}
      {isKdpModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50 shrink-0">
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
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
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
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
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

      {/* 文体変換モーダル */}
      {isStyleTransformOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <PenLine size={20} className="text-purple-600" />
                文体変換（まるごとリライト）
              </h3>
              <p className="text-sm text-gray-500 mt-1">書籍全体を選択した文体に変換します</p>
            </div>
            <div className="px-6 py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-amber-700 text-sm">
                  元の書籍は変更されません。新しい書籍コピーが作成され、各セクションが順番にリライトされます。
                </p>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-3">変換先の文体を選択:</p>
              <div className="space-y-2">
                {[
                  { id: 'descriptive', name: '説明文（PREP法）', desc: '結論→理由→具体例→まとめの論理的な構成' },
                  { id: 'narrative', name: '物語形式', desc: 'ストーリーテリングで読者を引き込む' },
                  { id: 'dialogue', name: '対話形式', desc: '先生と生徒などの会話で内容を展開' },
                  { id: 'qa', name: 'Q&A形式', desc: '質問と回答で分かりやすく解説' },
                  { id: 'workbook', name: 'ワークブック形式', desc: '解説＋実践ワークの交互配置' },
                ].map(style => (
                  <label
                    key={style.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedTargetStyle === style.id
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="target_style"
                      value={style.id}
                      checked={selectedTargetStyle === style.id}
                      onChange={() => setSelectedTargetStyle(style.id)}
                      className="mt-1 accent-purple-600"
                    />
                    <div>
                      <span className="font-medium text-gray-800 text-sm">{style.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{style.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setIsStyleTransformOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleBulkRewrite}
                className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2"
              >
                <PenLine size={16} />
                変換開始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文体変換中のオーバーレイ */}
      {rewriteProgress.isRunning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
              <div
                className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"
                style={{ animationDuration: '1.5s' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">
                  {rewriteProgress.totalCount > 0
                    ? Math.round((rewriteProgress.currentIndex / rewriteProgress.totalCount) * 100)
                    : 0}%
                </span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">文体変換中...</h3>
            <p className="text-gray-500 text-sm mb-3">
              {rewriteProgress.currentIndex} / {rewriteProgress.totalCount} セクション
            </p>
            <p className="text-gray-600 text-sm font-medium">
              {rewriteProgress.currentSectionTitle}
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${rewriteProgress.totalCount > 0 ? (rewriteProgress.currentIndex / rewriteProgress.totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* LP生成プレビューモーダル */}
      {isLPModalOpen && (
        <BookLPPreview
          bookId={book.id}
          bookTitle={book.title}
          bookSubtitle={book.subtitle || undefined}
          lpData={lpData}
          lpStatus={lpStatus}
          isGenerating={isGeneratingLP}
          themeColor={lpThemeColor as any}
          sectionVisibility={lpSectionVisibility}
          coverImageUrl={lpCoverImageUrl}
          onGenerate={handleGenerateLP}
          onPublishToggle={handleLPPublishToggle}
          onUpdateField={handleLPUpdateField}
          onClose={() => setIsLPModalOpen(false)}
        />
      )}

      {/* 表紙作成モーダル */}
      {/* 完成後の次のステップ提案モーダル */}
      {showNextStepsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-5 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h2 className="text-xl font-bold">執筆完了おめでとうございます！</h2>
              <p className="text-sm text-white/80 mt-1">次のステップで出版を成功させましょう</p>
            </div>

            {/* ステップリスト */}
            <div className="p-6 space-y-3">
              {/* 表紙作成 */}
              <button
                onClick={() => { setShowNextStepsModal(false); setIsCoverModalOpen(true); }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <ImageIcon size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">表紙を作成する</p>
                  <p className="text-xs text-gray-500">AIで魅力的なKindle表紙をデザイン</p>
                </div>
                <ArrowRightToLine size={16} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
              </button>

              {/* Word出力 */}
              <button
                onClick={() => { setShowNextStepsModal(false); /* Word出力は既存のhandleDownloadWord関数を呼ぶ */ }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <FileDown size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Word形式で出力</p>
                  <p className="text-xs text-gray-500">KDP登録用の原稿ファイルを作成</p>
                </div>
                <ArrowRightToLine size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </button>

              {/* 出版準備ガイド */}
              <a
                href="/kindle/publish-guide"
                target="_blank"
                onClick={() => setShowNextStepsModal(false)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Rocket size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">出版準備ガイドを見る</p>
                  <p className="text-xs text-gray-500">KDPへの登録手順を確認</p>
                </div>
                <ArrowRightToLine size={16} className="text-gray-300 group-hover:text-green-500 transition-colors" />
              </a>

              {/* Book LP作成 */}
              <button
                onClick={() => { setShowNextStepsModal(false); setIsLPModalOpen(true); }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">書籍LPを作成する</p>
                  <p className="text-xs text-gray-500">販促用のランディングページで読者を獲得</p>
                </div>
                <ArrowRightToLine size={16} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
              </button>
            </div>

            {/* フッター */}
            <div className="px-6 pb-5">
              <button
                onClick={() => setShowNextStepsModal(false)}
                className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                あとで確認する
              </button>
            </div>
          </div>
        </div>
      )}

      {isCoverModalOpen && userId && (
        <KindleCoverGenerator
          bookId={book.id}
          bookTitle={book.title}
          bookSubtitle={book.subtitle}
          userId={userId}
          onClose={() => setIsCoverModalOpen(false)}
          onCoverGenerated={(imageUrl) => {
            showToast('success', '表紙画像を生成しました');
          }}
        />
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
