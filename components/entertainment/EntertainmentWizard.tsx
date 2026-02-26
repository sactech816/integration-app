'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PartyPopper, Wand2 } from 'lucide-react';
import WizardChat, { type ChatMessage, type QuickReplyOption } from './WizardChat';
import WizardProgress, { type ProgressStep } from './WizardProgress';
import EntertainmentPreview from './EntertainmentPreview';
import { supabase, TABLES } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import type { Quiz, QuizQuestion, QuizResult } from '@/lib/types';

type WizardPhase = 'step_theme' | 'step_types' | 'step_style' | 'step_confirm' | 'generating' | 'complete';

interface QuizConcept {
  theme: string;
  resultCount: number;
  style: string;
  mode: 'diagnosis' | 'fortune';
}

const STYLE_OPTIONS: QuickReplyOption[] = [
  { label: 'かわいい系', value: 'cute', emoji: '🐱' },
  { label: 'クール系', value: 'cool', emoji: '🐺' },
  { label: 'ポップ系', value: 'pop', emoji: '🎉' },
  { label: 'ビビッド系', value: 'vibrant', emoji: '🌈' },
];

const TYPE_COUNT_OPTIONS: QuickReplyOption[] = [
  { label: '4タイプ', value: '4', emoji: '🎯' },
  { label: '6タイプ', value: '6', emoji: '🎲' },
  { label: '3タイプ', value: '3', emoji: '✨' },
];

export default function EntertainmentWizard() {
  const router = useRouter();
  const [phase, setPhase] = useState<WizardPhase>('step_theme');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'ai-init',
      role: 'ai',
      content: 'こんにちは！✨ エンタメ診断メーカーへようこそ！\n\nどんな診断を作りたいですか？テーマを教えてください！\n\n例：「どうぶつ占い」「推しキャラ診断」「前世タイプ診断」「脳内メーカー」',
      options: [
        { label: 'どうぶつ占い', value: 'どうぶつ占い', emoji: '🐾' },
        { label: '推しキャラ診断', value: '推しキャラ診断', emoji: '💫' },
        { label: '前世診断', value: '前世タイプ診断', emoji: '🔮' },
        { label: '脳内メーカー', value: '脳内メーカー', emoji: '🧠' },
      ],
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [concept, setConcept] = useState<Partial<QuizConcept>>({});
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addAiMessage = (content: string, options?: QuickReplyOption[]) => {
    const msg: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'ai',
      content,
      options,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
  };

  const addUserMessage = (text: string) => {
    const msg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
  };

  const handleSend = (text: string) => {
    setInputValue('');
    processStep(text);
  };

  const handleQuickReply = (option: QuickReplyOption) => {
    processStep(option.value || option.label, option.label);
  };

  const processStep = (value: string, displayText?: string) => {
    addUserMessage(displayText || value);

    switch (phase) {
      case 'step_theme':
        handleThemeStep(value);
        break;
      case 'step_types':
        handleTypesStep(value);
        break;
      case 'step_style':
        handleStyleStep(value);
        break;
      case 'step_confirm':
        handleConfirmStep(value);
        break;
    }
  };

  const handleThemeStep = (theme: string) => {
    setConcept((prev) => ({ ...prev, theme }));

    // テーマに「占い」が含まれていたらmodeをfortuneに自動設定
    const mode = theme.includes('占い') ? 'fortune' : 'diagnosis';
    setConcept((prev) => ({ ...prev, theme, mode }));

    setTimeout(() => {
      addAiMessage(
        `「${theme}」いいですね！🎉\n\n結果は何タイプにしますか？`,
        TYPE_COUNT_OPTIONS
      );
      setPhase('step_types');
    }, 400);
  };

  const handleTypesStep = (value: string) => {
    const count = parseInt(value) || 4;
    setConcept((prev) => ({ ...prev, resultCount: count }));

    setTimeout(() => {
      addAiMessage(
        `${count}タイプですね！👍\n\n最後に、診断のテイスト（雰囲気）を選んでください！`,
        STYLE_OPTIONS
      );
      setPhase('step_style');
    }, 400);
  };

  const handleStyleStep = (value: string) => {
    const style = ['cute', 'cool', 'pop', 'vibrant'].includes(value) ? value : 'pop';
    const styleLabels: Record<string, string> = { cute: 'かわいい系', cool: 'クール系', pop: 'ポップ系', vibrant: 'ビビッド系' };

    setConcept((prev) => ({ ...prev, style }));

    const finalConcept = { ...concept, style } as QuizConcept;

    setTimeout(() => {
      addAiMessage(
        `準備OKです！🚀\n\n📋 テーマ：${finalConcept.theme}\n🎯 結果：${finalConcept.resultCount}タイプ\n🎨 テイスト：${styleLabels[style]}\n\nこの内容で診断を作成しますか？`,
        [
          { label: '作成する！', value: 'yes', emoji: '✨' },
          { label: 'やり直す', value: 'no', emoji: '🔄' },
        ]
      );
      setPhase('step_confirm');
    }, 400);
  };

  const handleConfirmStep = (value: string) => {
    if (value === 'no' || value.includes('やり直')) {
      // リセット
      setConcept({});
      setMessages([
        {
          id: `ai-reset-${Date.now()}`,
          role: 'ai',
          content: 'もう一度最初からやりましょう！✨\n\nどんな診断を作りたいですか？テーマを教えてください！',
          options: [
            { label: 'どうぶつ占い', value: 'どうぶつ占い', emoji: '🐾' },
            { label: '推しキャラ診断', value: '推しキャラ診断', emoji: '💫' },
            { label: '前世診断', value: '前世タイプ診断', emoji: '🔮' },
            { label: '脳内メーカー', value: '脳内メーカー', emoji: '🧠' },
          ],
          timestamp: new Date(),
        },
      ]);
      setPhase('step_theme');
      return;
    }

    const finalConcept: QuizConcept = {
      theme: concept.theme || '',
      resultCount: concept.resultCount || 4,
      style: concept.style || 'pop',
      mode: concept.mode || 'diagnosis',
    };

    setTimeout(() => {
      startGeneration(finalConcept);
    }, 500);
  };

  const startGeneration = async (quizConcept: QuizConcept) => {
    setPhase('generating');
    setProgressSteps([
      { label: 'タイトル・説明文を生成', status: 'in_progress' },
      { label: '質問5問を生成', status: 'pending' },
      { label: `結果${quizConcept.resultCount}タイプを生成`, status: 'pending' },
      { label: '結果画像を生成', status: 'pending' },
    ]);

    try {
      // プログレス演出
      await new Promise((r) => setTimeout(r, 800));
      setProgressSteps((prev) =>
        prev.map((s, i) =>
          i === 0 ? { ...s, status: 'completed' } : i === 1 ? { ...s, status: 'in_progress' } : s
        )
      );

      const res = await fetch('/api/entertainment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'generate', quizConcept }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'クイズ生成に失敗しました');

      setProgressSteps((prev) =>
        prev.map((s, i) =>
          i <= 1 ? { ...s, status: 'completed' } : i === 2 ? { ...s, status: 'in_progress' } : s
        )
      );
      await new Promise((r) => setTimeout(r, 500));

      // クイズデータを構築
      const quizData = data.quiz;
      const questions: QuizQuestion[] = quizData.questions.map(
        (q: { text: string; options: { label: string; score: Record<string, number> }[] }, idx: number) => ({
          id: `q-${idx}`,
          text: q.text,
          options: q.options.map((opt: { label: string; score: Record<string, number> }) => ({
            text: opt.label,
            score: opt.score,
          })),
        })
      );

      const results: QuizResult[] = quizData.results.map(
        (r: { type: string; title: string; description: string }) => ({
          type: r.type,
          title: r.title,
          description: r.description,
        })
      );

      const quiz: Quiz = {
        id: 0,
        slug: '',
        title: quizData.title,
        description: quizData.description,
        category: 'Entertainment',
        color: 'bg-pink-500',
        questions,
        results,
        layout: 'pop',
        mode: quizConcept.mode,
        theme: quizConcept.style === 'cute' ? 'kawaii' : quizConcept.style === 'cool' ? 'galaxy' : 'vibrant',
        quiz_type: 'entertainment',
        entertainment_meta: {
          shareTemplate: data.shareTemplate || `わたしは「{{result_title}}」タイプでした！\n${quizData.title}\n#エンタメ診断`,
          ogStyle: quizConcept.style as 'vibrant' | 'cute' | 'cool' | 'pop',
          conversationLog: messages.map((m) => ({ role: m.role, content: m.content })),
        },
      };

      setProgressSteps((prev) =>
        prev.map((s, i) => (i <= 2 ? { ...s, status: 'completed' } : { ...s, status: 'in_progress' }))
      );

      // 画像生成を試行
      try {
        const imgRes = await fetch('/api/entertainment/generate-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            results: results,
            style: quizConcept.style,
            theme: quizConcept.theme,
          }),
        });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          if (imgData.images) {
            quiz.entertainment_meta = {
              ...quiz.entertainment_meta,
              resultImages: imgData.images,
            };
            quiz.results = quiz.results.map((r) => ({
              ...r,
              image_url: imgData.images[r.type] || undefined,
            }));
          }
        }
      } catch (imgErr) {
        console.warn('画像生成をスキップ:', imgErr);
      }

      setProgressSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      setGeneratedQuiz(quiz);
      setPhase('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'クイズ生成に失敗しました');
      setPhase('step_theme');
    }
  };

  const handlePublish = async () => {
    if (!generatedQuiz || !supabase) return;
    setIsPublishing(true);
    setError(null);

    try {
      const slug = generateSlug();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || null;

      const { data, error: dbError } = await supabase
        .from(TABLES.QUIZZES)
        .insert({
          slug,
          title: generatedQuiz.title,
          description: generatedQuiz.description,
          category: generatedQuiz.category,
          color: generatedQuiz.color,
          questions: generatedQuiz.questions,
          results: generatedQuiz.results,
          layout: generatedQuiz.layout,
          mode: generatedQuiz.mode,
          theme: generatedQuiz.theme,
          quiz_type: 'entertainment',
          entertainment_meta: generatedQuiz.entertainment_meta,
          user_id: userId,
          show_in_portal: true,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      try {
        await fetch(`/api/revalidate?path=/entertainment/${slug}`);
      } catch {}

      router.push(`/entertainment/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '公開に失敗しました');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = () => {
    if (!generatedQuiz) return;
    localStorage.setItem('entertainment_draft', JSON.stringify(generatedQuiz));
    router.push('/quiz/editor?from=entertainment');
  };

  const isChatPhase = phase === 'step_theme' || phase === 'step_types' || phase === 'step_style' || phase === 'step_confirm';

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <PartyPopper className="w-6 h-6 text-pink-500" />
            <h1 className="font-bold text-gray-900">エンタメ診断メーカー</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-lg mx-auto" style={{ height: 'calc(100vh - 57px)' }}>
        {error && (
          <div className="mx-4 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {isChatPhase && (
          <WizardChat
            messages={messages}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSend}
            onQuickReply={handleQuickReply}
            isLoading={isLoading}
          />
        )}

        {phase === 'generating' && (
          <div className="flex items-center justify-center h-full">
            <WizardProgress steps={progressSteps} />
          </div>
        )}

        {phase === 'complete' && generatedQuiz && (
          <div className="py-6 space-y-4">
            <div className="text-center px-4">
              <h2 className="text-2xl font-bold text-gray-900">完成しました！ 🎉</h2>
              <p className="text-sm text-gray-600 mt-1">
                内容を確認して公開しましょう
              </p>
            </div>
            <EntertainmentPreview
              quiz={generatedQuiz}
              onPublish={handlePublish}
              onEdit={handleEdit}
              isPublishing={isPublishing}
            />
          </div>
        )}
      </main>
    </div>
  );
}
