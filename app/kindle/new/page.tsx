'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, ArrowLeft, ArrowRight, Lightbulb, Check, Target, List, ChevronRight
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

export default function KindleNewPage() {
  const router = useRouter();
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
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存に失敗しました');
      }
      
      const data = await response.json();
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/kindle" className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">戻る</span>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="text-amber-600" size={24} />
            <span className="font-bold text-gray-900">Kindle執筆システム</span>
          </div>
          <div className="w-20" />
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
