'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, PartyPopper, Wand2, Sparkles, Loader2, Edit3 } from 'lucide-react';
import WizardProgress, { type ProgressStep } from './WizardProgress';
import {
  type EntertainmentForm,
  STYLE_OPTIONS,
  MODE_OPTIONS,
  RESULT_COUNT_OPTIONS,
  applyGeneratedData,
} from '@/lib/entertainment/defaults';

type WizardStep = 'theme' | 'settings' | 'generating';

const QUICK_THEMES = [
  { label: 'どうぶつ占い', emoji: '🐾' },
  { label: '推しキャラ診断', emoji: '💫' },
  { label: '前世タイプ診断', emoji: '🔮' },
  { label: '脳内メーカー', emoji: '🧠' },
  { label: 'ラーメン診断', emoji: '🍜' },
  { label: '恋愛パターン診断', emoji: '💕' },
];

interface Props {
  form: EntertainmentForm;
  setForm: (form: EntertainmentForm | ((prev: EntertainmentForm) => EntertainmentForm)) => void;
  onComplete: () => void;
  onSwitchMode: () => void;
}

export default function EntertainmentWizard({ form, setForm, onComplete, onSwitchMode }: Props) {
  const [step, setStep] = useState<WizardStep>('theme');
  const [theme, setTheme] = useState('');
  const [mode, setMode] = useState<string>('diagnosis');
  const [style, setStyle] = useState<string>('pop');
  const [resultCount, setResultCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!theme.trim()) { alert('テーマを入力してください'); return; }
    setStep('generating');
    setIsGenerating(true);
    setError(null);
    setProgressSteps([
      { label: 'タイトル・説明文を生成', status: 'in_progress' },
      { label: '質問を生成', status: 'pending' },
      { label: `結果${resultCount}タイプを生成`, status: 'pending' },
      { label: '結果画像を生成', status: 'pending' },
    ]);

    try {
      await new Promise((r) => setTimeout(r, 500));
      setProgressSteps((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, status: 'completed' } : i === 1 ? { ...s, status: 'in_progress' } : s))
      );

      const finalMode = theme.includes('占い') ? 'fortune' : mode;
      const res = await fetch('/api/entertainment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'generate',
          quizConcept: { theme, resultCount, style, mode: finalMode },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'クイズ生成に失敗しました');

      setProgressSteps((prev) =>
        prev.map((s, i) => (i <= 1 ? { ...s, status: 'completed' } : i === 2 ? { ...s, status: 'in_progress' } : s))
      );
      await new Promise((r) => setTimeout(r, 300));

      // フォームに反映
      const updated = applyGeneratedData(form, data, style, finalMode);
      setForm(updated);

      setProgressSteps((prev) =>
        prev.map((s, i) => (i <= 2 ? { ...s, status: 'completed' } : { ...s, status: 'in_progress' }))
      );

      // 画像生成を試行
      let imageGenSuccess = false;
      try {
        const imgRes = await fetch('/api/entertainment/generate-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            results: updated.results,
            style: style,
            theme: theme,
          }),
        });
        const imgData = await imgRes.json();
        if (imgRes.ok) {
          if (imgData.images && Object.keys(imgData.images).length > 0) {
            imageGenSuccess = true;
            setForm((prev: EntertainmentForm) => ({
              ...prev,
              results: prev.results.map((r) => ({
                ...r,
                image_url: imgData.images[r.type] || r.image_url,
              })),
              entertainment_meta: {
                ...prev.entertainment_meta,
                resultImages: imgData.images,
              },
            }));
          }
          if (imgData.errors?.length) {
            console.warn('画像生成エラー詳細:', imgData.errors);
          }
        } else {
          console.warn('画像生成API失敗:', imgData);
        }
      } catch (imgErr) {
        console.warn('画像生成エラー:', imgErr);
      }

      if (!imageGenSuccess) {
        setProgressSteps((prev) =>
          prev.map((s, i) =>
            i === 3
              ? { ...s, status: 'completed', label: '画像生成（スキップ — エディタで生成可能）' }
              : { ...s, status: 'completed' }
          )
        );
      }

      setProgressSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      await new Promise((r) => setTimeout(r, 500));

      // エディタモードに遷移
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成に失敗しました');
      setStep('settings');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => step === 'theme' ? onSwitchMode() : setStep('theme')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-pink-500" />
              <h1 className="font-bold text-gray-900">ウィザード</h1>
            </div>
          </div>
          <button
            onClick={onSwitchMode}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Edit3 size={14} /> エディタに切替
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
        )}

        {/* Step 1: テーマ */}
        {step === 'theme' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold mb-3">
                STEP 1 / 2
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">どんな診断を作りますか？</h2>
              <p className="text-sm text-gray-600">テーマを入力するか、下から選んでください</p>
            </div>

            <div>
              <textarea
                className="w-full border-2 border-pink-200 p-4 rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white placeholder:text-gray-400 resize-none"
                rows={2}
                placeholder="例: どうぶつ占い"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {QUICK_THEMES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => { setTheme(t.label); setStep('settings'); }}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 text-left hover:border-pink-400 hover:shadow-md transition-all"
                >
                  <span className="text-2xl mb-2 block">{t.emoji}</span>
                  <span className="font-bold text-sm text-gray-900">{t.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => { if (theme.trim()) setStep('settings'); }}
              disabled={!theme.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 disabled:from-gray-300 disabled:to-gray-300 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              次へ <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Step 2: 設定 */}
        {step === 'settings' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold mb-3">
                STEP 2 / 2
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">設定を選んでください</h2>
              <p className="text-sm text-gray-600">テーマ: 「{theme}」</p>
            </div>

            {/* モード */}
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">モード</label>
              <div className="grid grid-cols-2 gap-3">
                {MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value)}
                    className={`p-4 rounded-xl border-2 font-bold text-base flex items-center justify-center gap-2 transition-all ${
                      mode === opt.value
                        ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* スタイル */}
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">スタイル</label>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStyle(opt.value)}
                    className={`p-4 rounded-xl border-2 font-bold text-base flex items-center justify-center gap-2 transition-all ${
                      style === opt.value
                        ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* タイプ数 */}
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">結果タイプ数</label>
              <div className="grid grid-cols-3 gap-3">
                {RESULT_COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setResultCount(count)}
                    className={`py-4 rounded-xl border-2 font-bold text-base flex items-center justify-center transition-all ${
                      resultCount === count
                        ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-500'
                    }`}
                  >
                    {count}タイプ
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('theme')}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 border border-gray-300"
              >
                <ArrowLeft size={18} /> 戻る
              </button>
              <button
                onClick={handleGenerate}
                className="flex-[2] bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Sparkles size={20} /> 生成する！
              </button>
            </div>
          </div>
        )}

        {/* 生成中 */}
        {step === 'generating' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <WizardProgress steps={progressSteps} />
          </div>
        )}
      </main>
    </div>
  );
}
