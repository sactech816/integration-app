'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  BookOpen, ArrowLeft, ArrowRight, Lightbulb, Check, Target, List, ChevronRight, FileText, Trash2, HelpCircle, PlayCircle
} from 'lucide-react';
import Link from 'next/link';

// Import types and components from wizard
import {
  WizardState,
  TitleSuggestion,
  SubtitleSuggestion,
  TargetSuggestion,
  cleanTarget,
  cleanChapters,
} from '@/components/kindle/wizard';

import { Step1Theme } from '@/components/kindle/wizard/Step1Theme';
import { Step2Subtitle } from '@/components/kindle/wizard/Step2Subtitle';
import { Step3Target } from '@/components/kindle/wizard/Step3Target';
import { Step4TOC } from '@/components/kindle/wizard/Step4TOC';
import AuthModal from '@/components/shared/AuthModal';
import { supabase } from '@/lib/supabase';

// localStorageのキー
const STORAGE_KEY = 'kindle-wizard-draft';

// 保存するデータの型
interface SavedDraft {
  currentStep: number;
  state: WizardState;
  titleSuggestions: TitleSuggestion[];
  subtitleSuggestions: SubtitleSuggestion[];
  relatedKeywords: { set1: string[]; set2: string[] };
  targetSuggestions: TargetSuggestion[];
  savedAt: string;
}

// ローディングフォールバック
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <BookOpen className="text-amber-600 mx-auto mb-4 animate-pulse" size={48} />
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}

export default function KindleNewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KindleNewPageContent />
    </Suspense>
  );
}

function KindleNewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // デモモード判定
  const isDemo = searchParams.get('mode') === 'demo';
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<WizardState>({
    theme: '',
    selectedTitle: '',
    subtitle: '',
    selectedTarget: null,
    chapters: [],
  });
  
  // Step1用の状態
  const [titleSuggestions, setTitleSuggestions] = useState<TitleSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // Step2用の状態
  const [subtitleSuggestions, setSubtitleSuggestions] = useState<SubtitleSuggestion[]>([]);
  const [relatedKeywords, setRelatedKeywords] = useState<{ set1: string[]; set2: string[] }>({ set1: [], set2: [] });
  const [isGeneratingSubtitle, setIsGeneratingSubtitle] = useState(false);
  const [subtitleError, setSubtitleError] = useState('');
  
  // Step3用の状態
  const [targetSuggestions, setTargetSuggestions] = useState<TargetSuggestion[]>([]);
  const [isGeneratingTarget, setIsGeneratingTarget] = useState(false);
  const [targetError, setTargetError] = useState('');
  
  // Step4用の状態（保存）
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // 認証モーダル用の状態
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // 下書き復元の確認モーダル
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<SavedDraft | null>(null);

  // localStorageから下書きを復元（初回のみ）
  useEffect(() => {
    if (isInitialized) return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft: SavedDraft = JSON.parse(saved);
        // 24時間以内の下書きのみ復元対象
        const savedTime = new Date(draft.savedAt).getTime();
        const now = Date.now();
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && draft.state.theme) {
          setPendingDraft(draft);
          setShowRestoreModal(true);
        }
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  // 状態が変わるたびにlocalStorageに保存
  useEffect(() => {
    if (!isInitialized) return;
    
    // 何も入力されていない場合は保存しない
    if (!state.theme && !state.selectedTitle) return;
    
    const draft: SavedDraft = {
      currentStep,
      state,
      titleSuggestions,
      subtitleSuggestions,
      relatedKeywords,
      targetSuggestions,
      savedAt: new Date().toISOString(),
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  }, [isInitialized, currentStep, state, titleSuggestions, subtitleSuggestions, relatedKeywords, targetSuggestions]);

  // 下書きを復元する
  const restoreDraft = () => {
    if (!pendingDraft) return;
    
    setCurrentStep(pendingDraft.currentStep);
    setState(pendingDraft.state);
    setTitleSuggestions(pendingDraft.titleSuggestions);
    setSubtitleSuggestions(pendingDraft.subtitleSuggestions);
    setRelatedKeywords(pendingDraft.relatedKeywords);
    setTargetSuggestions(pendingDraft.targetSuggestions);
    
    setShowRestoreModal(false);
    setPendingDraft(null);
  };

  // 下書きを破棄して新規作成
  const discardDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowRestoreModal(false);
    setPendingDraft(null);
  };

  // localStorageをクリア（保存成功時に呼ぶ）
  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
  };
  
  // ユーザーの認証状態を監視
  useEffect(() => {
    if (!supabase) return;
    
    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // ログイン成功時にモーダルを閉じて保存を再試行
      if (session?.user && showAuthModal) {
        setShowAuthModal(false);
        setSaveError(''); // エラーをクリア
      }
    });

    return () => subscription.unsubscribe();
  }, [showAuthModal]);

  const steps = [
    { number: 1, title: 'テーマ・タイトル', icon: Lightbulb },
    { number: 2, title: 'サブタイトル', icon: BookOpen },
    { number: 3, title: 'ターゲット設定', icon: Target },
    { number: 4, title: '目次生成', icon: List },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return state.selectedTitle.trim() !== '';
      case 2:
        return true; // サブタイトルは任意
      case 3:
        return state.selectedTarget !== null;
      case 4:
        return state.chapters.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 本を保存して執筆画面へ遷移
  const handleSaveAndNavigate = async () => {
    // ログインチェック
    if (!user) {
      setSaveError('ログインが必要です。ログインしてから再度お試しください。');
      return;
    }
    
    setIsSaving(true);
    setSaveError('');
    
    try {
      const response = await fetch('/api/kdl/create-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.selectedTitle,
          subtitle: state.subtitle,
          target: cleanTarget(state.selectedTarget),
          chapters: cleanChapters(state.chapters),
          tocPatternId: state.tocPatternId, // 目次パターンIDを送信
          userId: user.id, // ユーザーIDをクライアントから渡す
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存に失敗しました');
      }
      
      const data = await response.json();
      
      // 保存成功時にlocalStorageをクリア
      clearDraft();
      
      router.push(`/kindle/${data.bookId}`);
    } catch (err: any) {
      setSaveError(err.message || '保存中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Theme
            state={state}
            setState={setState}
            titleSuggestions={titleSuggestions}
            setTitleSuggestions={setTitleSuggestions}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            error={error}
            setError={setError}
            isDemo={isDemo}
          />
        );
      case 2:
        return (
          <Step2Subtitle
            state={state}
            setState={setState}
            subtitleSuggestions={subtitleSuggestions}
            setSubtitleSuggestions={setSubtitleSuggestions}
            relatedKeywords={relatedKeywords}
            setRelatedKeywords={setRelatedKeywords}
            isGeneratingSubtitle={isGeneratingSubtitle}
            setIsGeneratingSubtitle={setIsGeneratingSubtitle}
            subtitleError={subtitleError}
            setSubtitleError={setSubtitleError}
            isDemo={isDemo}
          />
        );
      case 3:
        return (
          <Step3Target
            state={state}
            setState={setState}
            targetSuggestions={targetSuggestions}
            setTargetSuggestions={setTargetSuggestions}
            isGeneratingTarget={isGeneratingTarget}
            setIsGeneratingTarget={setIsGeneratingTarget}
            targetError={targetError}
            setTargetError={setTargetError}
            isDemo={isDemo}
          />
        );
      case 4:
        return (
          <Step4TOC
            state={state}
            setState={setState}
            onSave={handleSaveAndNavigate}
            isSaving={isSaving}
            saveError={saveError}
            onLoginRequired={() => setShowAuthModal(true)}
            isDemo={isDemo}
          />
        );
      default:
        return null;
    }
  };

  // 下書きの保存時刻をフォーマット
  const formatSavedTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* 下書き復元確認モーダル */}
      {showRestoreModal && pendingDraft && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-lg">
                <FileText className="text-amber-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">下書きが見つかりました</h2>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="font-bold text-gray-900 mb-1">
                {pendingDraft.state.selectedTitle || pendingDraft.state.theme || '無題'}
              </p>
              <p className="text-sm text-gray-600">
                ステップ {pendingDraft.currentStep} / 4 まで進んでいます
              </p>
              <p className="text-xs text-gray-500 mt-2">
                保存日時: {formatSavedTime(pendingDraft.savedAt)}
              </p>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              前回の作業を続けますか？
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={discardDraft}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Trash2 size={18} />
                新規作成
              </button>
              <button
                onClick={restoreDraft}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
              >
                <FileText size={18} />
                続きから
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 認証モーダル */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        setUser={setUser}
      />
      
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href={isDemo ? "/kindle/lp" : "/kindle"} 
            className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">{isDemo ? 'LPに戻る' : '戻る'}</span>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="text-amber-600" size={24} />
            <div>
              <span className="font-bold text-gray-900">キンドルダイレクトライト</span>
              <span className="text-xs text-gray-500 ml-1">KDL</span>
            </div>
            {isDemo && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                <PlayCircle size={12} />
                デモ
              </span>
            )}
          </div>
          <Link 
            href="/kindle/guide" 
            target="_blank"
            className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            <HelpCircle size={16} />
            <span>📖 まずお読みください</span>
          </Link>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="bg-white border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <button
                  onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                  disabled={step.number > currentStep}
                  className={`flex flex-col items-center gap-2 transition-all ${
                    step.number <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    step.number === currentStep
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-110'
                      : step.number < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.number < currentStep ? (
                      <Check size={20} />
                    ) : (
                      <step.icon size={20} />
                    )}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    step.number === currentStep ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ - Step4では幅を広げる */}
      <main className={`mx-auto px-4 py-8 transition-all ${currentStep === 4 ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <div className={`bg-white rounded-2xl shadow-xl border border-amber-100 ${currentStep === 4 ? 'p-4 sm:p-6' : 'p-6 sm:p-8'}`}>
          {renderStep()}
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              currentStep === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-white hover:shadow-md'
            }`}
          >
            <ArrowLeft size={20} />
            戻る
          </button>

          <span className="text-sm text-gray-500">
            ステップ {currentStep} / {steps.length}
          </span>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                canProceed()
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              次へ
              <ChevronRight size={20} />
            </button>
          ) : (
            <div className="w-24" />
          )}
        </div>
      </main>
    </div>
  );
}
