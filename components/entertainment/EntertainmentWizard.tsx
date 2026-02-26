'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PartyPopper } from 'lucide-react';
import WizardChat, { type ChatMessage, type QuickReplyOption } from './WizardChat';
import WizardProgress, { type ProgressStep } from './WizardProgress';
import EntertainmentPreview from './EntertainmentPreview';
import { supabase, TABLES } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import type { Quiz, QuizQuestion, QuizResult } from '@/lib/types';

type WizardPhase = 'chatting' | 'generating' | 'complete';

interface QuizConcept {
  theme: string;
  resultCount: number;
  style: string;
  mode: 'diagnosis' | 'fortune';
}

export default function EntertainmentWizard() {
  const router = useRouter();
  const [phase, setPhase] = useState<WizardPhase>('chatting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [concept, setConcept] = useState<QuizConcept | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初回表示でAIの挨拶を取得
  const initializeChat = useCallback(async () => {
    if (isInitialized) return;
    setIsInitialized(true);
    setIsLoading(true);
    try {
      const res = await fetch('/api/entertainment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'collect', messages: [] }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'LOGIN_REQUIRED') {
          setError('ログインが必要です。ログインしてから再度お試しください。');
          return;
        }
        throw new Error(data.message || data.error);
      }
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: data.reply,
        options: data.options || [],
        timestamp: new Date(),
      };
      setMessages([aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '初期化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // 初回表示
  useState(() => {
    initializeChat();
  });

  const sendMessage = async (text: string) => {
    setError(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // AI側のメッセージ履歴を構築（roleをuser/assistantに変換）
      const apiMessages = newMessages.map((m) => ({
        role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      }));

      const res = await fetch('/api/entertainment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'collect', messages: apiMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: data.reply,
        options: data.options || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // コンセプトが決まったらgenerate phaseへ
      if (data.conceptReady && data.extractedConcept) {
        setConcept(data.extractedConcept);
        // 少し待ってから生成開始
        setTimeout(() => {
          startGeneration(data.extractedConcept);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (option: QuickReplyOption) => {
    sendMessage(option.value || option.label);
  };

  const startGeneration = async (quizConcept: QuizConcept) => {
    setPhase('generating');
    setProgressSteps([
      { label: 'タイトル・説明文を生成', status: 'in_progress' },
      { label: `質問5問を生成`, status: 'pending' },
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
            // 結果にimage_urlを設定
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
      setPhase('chatting');
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

      // ISRリバリデーション
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
    // クイズエディタに遷移（データをクエリパラメータ経由では渡せないので、localStorageに一時保存）
    localStorage.setItem('entertainment_draft', JSON.stringify(generatedQuiz));
    router.push('/quiz/editor?from=entertainment');
  };

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

        {phase === 'chatting' && (
          <WizardChat
            messages={messages}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={sendMessage}
            onQuickReply={handleQuickReply}
            isLoading={isLoading}
            disabled={!!concept}
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
