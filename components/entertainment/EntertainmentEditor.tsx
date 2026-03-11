'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Edit3, Sparkles, Wand2, MessageSquare, Trophy, Save,
  Loader2, Plus, Trash2, ChevronDown, ChevronUp, RefreshCw, Eye,
  Palette, Share2, Image as ImageIcon, PartyPopper, ArrowRight,
  Upload, Link, Grid3X3, X,
} from 'lucide-react';
import { generateSlug } from '@/lib/utils';
import { supabase, TABLES } from '@/lib/supabase';
import QuizPlayer from '@/components/quiz/QuizPlayer';
import WizardProgress, { type ProgressStep } from './WizardProgress';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import { triggerGamificationEvent } from '@/lib/gamification/events';
import { usePoints } from '@/lib/hooks/usePoints';
import {
  type EntertainmentForm,
  STYLE_OPTIONS,
  MODE_OPTIONS,
  RESULT_COUNT_OPTIONS,
  QUESTION_COUNT_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  THEME_PRESETS,
  STYLE_TO_THEME,
  quizFromForm,
  applyGeneratedData,
  createDefaultForm,
} from '@/lib/entertainment/defaults';

// --- Input / Textarea ---
const Input = ({ label, val, onChange, ph }: { label: string; val: string; onChange: (v: string) => void; ph?: string }) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <input
      className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-pink-500 outline-none bg-white placeholder:text-gray-400 transition-shadow"
      value={val || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={ph}
    />
  </div>
);

const Textarea = ({ label, val, onChange, rows = 3 }: { label: string; val: string; onChange: (v: string) => void; rows?: number }) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <textarea
      className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-pink-500 outline-none bg-white placeholder:text-gray-400 transition-shadow"
      rows={rows}
      value={val}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// --- プリセット画像（フリーイラスト） ---
const PRESET_IMAGES = [
  // 動物系
  { url: 'https://api.dicebear.com/9.x/thumbs/svg?seed=cat&backgroundColor=ffdfbf', label: 'ねこ', category: 'animal' },
  { url: 'https://api.dicebear.com/9.x/thumbs/svg?seed=dog&backgroundColor=c0aede', label: 'いぬ', category: 'animal' },
  { url: 'https://api.dicebear.com/9.x/thumbs/svg?seed=bear&backgroundColor=b6e3f4', label: 'くま', category: 'animal' },
  { url: 'https://api.dicebear.com/9.x/thumbs/svg?seed=rabbit&backgroundColor=ffd5dc', label: 'うさぎ', category: 'animal' },
  { url: 'https://api.dicebear.com/9.x/thumbs/svg?seed=bird&backgroundColor=d1f4d1', label: 'とり', category: 'animal' },
  { url: 'https://api.dicebear.com/9.x/thumbs/svg?seed=fox&backgroundColor=ffe4b5', label: 'きつね', category: 'animal' },
  { url: 'https://api.dicebear.com/9.x/thumbs/svg?seed=panda&backgroundColor=e8e8e8', label: 'パンダ', category: 'animal' },
  { url: 'https://api.dicebear.com/9.x/thumbs/svg?seed=lion&backgroundColor=fff3b0', label: 'ライオン', category: 'animal' },
  // キャラ系
  { url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=happy&backgroundColor=ffdfbf', label: 'ハッピー', category: 'emoji' },
  { url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=cool&backgroundColor=b6e3f4', label: 'クール', category: 'emoji' },
  { url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=love&backgroundColor=ffd5dc', label: 'ラブ', category: 'emoji' },
  { url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=star&backgroundColor=fff3b0', label: 'スター', category: 'emoji' },
  { url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=magic&backgroundColor=c0aede', label: 'マジック', category: 'emoji' },
  { url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=fire&backgroundColor=ffcccc', label: 'ファイヤー', category: 'emoji' },
  { url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=thunder&backgroundColor=fffacd', label: 'サンダー', category: 'emoji' },
  { url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=ocean&backgroundColor=d1f4d1', label: 'オーシャン', category: 'emoji' },
  // アバター系
  { url: 'https://api.dicebear.com/9.x/bottts/svg?seed=robot1&backgroundColor=b6e3f4', label: 'ロボA', category: 'avatar' },
  { url: 'https://api.dicebear.com/9.x/bottts/svg?seed=robot2&backgroundColor=c0aede', label: 'ロボB', category: 'avatar' },
  { url: 'https://api.dicebear.com/9.x/bottts/svg?seed=robot3&backgroundColor=ffdfbf', label: 'ロボC', category: 'avatar' },
  { url: 'https://api.dicebear.com/9.x/bottts/svg?seed=robot4&backgroundColor=ffd5dc', label: 'ロボD', category: 'avatar' },
  { url: 'https://api.dicebear.com/9.x/shapes/svg?seed=shape1&backgroundColor=b6e3f4', label: 'シェイプA', category: 'avatar' },
  { url: 'https://api.dicebear.com/9.x/shapes/svg?seed=shape2&backgroundColor=d1f4d1', label: 'シェイプB', category: 'avatar' },
  { url: 'https://api.dicebear.com/9.x/shapes/svg?seed=shape3&backgroundColor=fff3b0', label: 'シェイプC', category: 'avatar' },
  { url: 'https://api.dicebear.com/9.x/shapes/svg?seed=shape4&backgroundColor=c0aede', label: 'シェイプD', category: 'avatar' },
];

const PRESET_CATEGORIES = [
  { id: 'all', label: 'すべて' },
  { id: 'animal', label: 'どうぶつ' },
  { id: 'emoji', label: '絵文字' },
  { id: 'avatar', label: 'アバター' },
];

// --- Section ---
const Section = ({
  title, icon: Icon, isOpen, onToggle, children, badge, step, stepLabel,
  headerBgColor = 'bg-gray-50', headerHoverColor = 'hover:bg-gray-100', accentColor = 'bg-pink-100 text-pink-600',
}: {
  title: string; icon: any; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
  badge?: string; step?: number; stepLabel?: string;
  headerBgColor?: string; headerHoverColor?: string; accentColor?: string;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    {step && stepLabel && (
      <div className={`px-5 py-2 ${headerBgColor} border-b border-gray-200/50`}>
        <span className="text-xs font-bold text-gray-600 bg-white/60 px-2 py-0.5 rounded">STEP {step}</span>
        <span className="text-sm text-gray-700 ml-2">{stepLabel}</span>
      </div>
    )}
    <button
      onClick={onToggle}
      className={`w-full px-5 py-4 flex items-center justify-between ${headerBgColor} ${headerHoverColor} transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOpen ? accentColor : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-white/80 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">{badge}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
    </button>
    {isOpen && <div className="p-5 border-t border-gray-100">{children}</div>}
  </div>
);

interface EntertainmentEditorProps {
  form: EntertainmentForm;
  setForm: (form: EntertainmentForm | ((prev: EntertainmentForm) => EntertainmentForm)) => void;
  onSwitchMode?: () => void;
  onBack?: () => void;
  user?: { id: string; email?: string } | null;
}

export default function EntertainmentEditor({ form, setForm, onSwitchMode, onBack, user }: EntertainmentEditorProps) {
  const { consumeAndExecute } = usePoints({ userId: user?.id, isPro: false });

  // 左パネルタブ: wizard（AI一括生成） or editor（手動編集）
  const [leftTab, setLeftTab] = useState<'wizard' | 'editor'>('wizard');

  const [openSections, setOpenSections] = useState({
    ai: true,
    basic: false,
    questions: false,
    results: false,
    settings: false,
  });
  const [previewKey, setPreviewKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // AI生成（エディタ内STEP1用）
  const [aiTheme, setAiTheme] = useState('');
  const [aiStyle, setAiStyle] = useState<string>('pop');
  const [aiMode, setAiMode] = useState<string>('diagnosis');
  const [aiResultCount, setAiResultCount] = useState(4);
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // ウィザードステップ
  const [wizardStep, setWizardStep] = useState<'theme' | 'settings' | 'generating'>('theme');
  const [wizardTheme, setWizardTheme] = useState('');
  const [wizardStyle, setWizardStyle] = useState<string>('pop');
  const [wizardMode, setWizardMode] = useState<string>('diagnosis');
  const [wizardResultCount, setWizardResultCount] = useState(4);
  const [wizardQuestionCount, setWizardQuestionCount] = useState(5);
  const [wizardGenerating, setWizardGenerating] = useState(false);
  const [wizardProgressSteps, setWizardProgressSteps] = useState<ProgressStep[]>([]);
  const [wizardError, setWizardError] = useState<string | null>(null);

  // 画像生成
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  // 画像ピッカー状態（結果パターンごと）
  const [imagePickerOpen, setImagePickerOpen] = useState<number | null>(null);
  const [imagePickerTab, setImagePickerTab] = useState<'preset' | 'upload' | 'url'>('preset');
  const [presetCategory, setPresetCategory] = useState('all');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const resetPreview = () => setPreviewKey((k) => k + 1);
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const updateForm = (patch: Partial<EntertainmentForm>) => {
    setForm((prev: EntertainmentForm) => ({ ...prev, ...patch }));
    resetPreview();
  };

  // --- 質問操作 ---
  const addQuestion = () => {
    if (form.questions.length >= 10) { alert('質問は最大10個までです'); return; }
    const score = Object.fromEntries(form.results.map((r) => [r.type, 0]));
    const newQ = {
      text: `質問${form.questions.length + 1}`,
      options: Array.from({ length: 4 }, (_, j) => ({ label: `選択肢${j + 1}`, score: { ...score } })),
    };
    updateForm({ questions: [...form.questions, newQ] });
  };

  const removeQuestion = (idx: number) => {
    if (form.questions.length <= 3) { alert('質問は最低3つ必要です'); return; }
    updateForm({ questions: form.questions.filter((_, i) => i !== idx) });
  };

  const addOption = (qi: number) => {
    if (form.questions[qi].options.length >= 6) return;
    const score = Object.fromEntries(form.results.map((r) => [r.type, 0]));
    const qs = [...form.questions];
    qs[qi] = { ...qs[qi], options: [...qs[qi].options, { label: `選択肢${qs[qi].options.length + 1}`, score }] };
    updateForm({ questions: qs });
  };

  const removeOption = (qi: number, oi: number) => {
    if (form.questions[qi].options.length <= 2) return;
    const qs = [...form.questions];
    qs[qi] = { ...qs[qi], options: qs[qi].options.filter((_, i) => i !== oi) };
    updateForm({ questions: qs });
  };

  // --- 結果操作 ---
  const addResult = () => {
    if (form.results.length >= 10) { alert('結果パターンは最大10個までです'); return; }
    const type = String.fromCharCode(65 + form.results.length);
    updateForm({
      results: [...form.results, { type, title: `結果${type}`, description: `結果${type}の説明文` }],
    });
  };

  const removeResult = (idx: number) => {
    if (form.results.length <= 2) { alert('結果は最低2つ必要です'); return; }
    updateForm({ results: form.results.filter((_, i) => i !== idx) });
  };

  // --- AI一括生成 ---
  const handleAiGenerate = async () => {
    if (!aiTheme.trim()) { alert('テーマを入力してください'); return; }
    setIsGenerating(true);
    setGenerateError(null);
    setProgressSteps([
      { label: 'タイトル・説明文を生成', status: 'in_progress' },
      { label: '質問を生成', status: 'pending' },
      { label: '結果タイプを生成', status: 'pending' },
    ]);

    try {
      await new Promise((r) => setTimeout(r, 500));
      setProgressSteps((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, status: 'completed' } : i === 1 ? { ...s, status: 'in_progress' } : s))
      );

      const mode = aiTheme.includes('占い') ? 'fortune' : aiMode;
      const res = await fetch('/api/entertainment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'generate',
          quizConcept: { theme: aiTheme, resultCount: aiResultCount, questionCount: aiQuestionCount, style: aiStyle, mode },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'クイズ生成に失敗しました');

      setProgressSteps((prev) =>
        prev.map((s, i) => (i <= 1 ? { ...s, status: 'completed' } : { ...s, status: 'in_progress' }))
      );
      await new Promise((r) => setTimeout(r, 300));

      const updated = applyGeneratedData(form, data, aiStyle, mode);
      setForm(updated);

      setProgressSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      await new Promise((r) => setTimeout(r, 500));
      setProgressSteps([]);

      // 成功後にAIセクションを閉じ、基本設定を開く
      setOpenSections({ ai: false, basic: true, questions: true, results: true, settings: false });
      resetPreview();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : '生成に失敗しました');
      setProgressSteps([]);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- 画像生成 ---
  const handleGenerateImages = async () => {
    setIsGeneratingImages(true);
    try {
      const res = await fetch('/api/entertainment/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: form.results,
          style: form.style,
          theme: form.title,
          aspectRatio: form.entertainment_meta.imageAspectRatio || '1:1',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.images && Object.keys(data.images).length > 0) {
          const updatedResults = form.results.map((r) => ({
            ...r,
            image_url: data.images[r.type] || r.image_url,
          }));
          updateForm({
            results: updatedResults,
            entertainment_meta: {
              ...form.entertainment_meta,
              resultImages: data.images,
            },
          });
          if (data.errors?.length) {
            setError(`一部の画像生成に失敗: ${data.errors.join(', ')}`);
          }
        } else {
          setError(`画像生成に失敗しました${data.errors?.length ? ': ' + data.errors[0] : '。もう一度お試しください。'}`);
        }
      } else {
        setError(`画像生成エラー: ${data.error || 'もう一度お試しください'}`);
      }
    } catch (err) {
      setError('画像生成に失敗しました。ネットワークを確認してください。');
      console.warn('画像生成エラー:', err);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // --- 結果パターン画像設定 ---
  const setResultImage = (index: number, url: string) => {
    const rs = [...form.results];
    rs[index] = { ...rs[index], image_url: url };
    const resultImages = { ...form.entertainment_meta.resultImages, [rs[index].type]: url };
    updateForm({
      results: rs,
      entertainment_meta: { ...form.entertainment_meta, resultImages },
    });
  };

  const removeResultImage = (index: number) => {
    const rs = [...form.results];
    const type = rs[index].type;
    rs[index] = { ...rs[index], image_url: undefined };
    const resultImages = { ...form.entertainment_meta.resultImages };
    delete resultImages[type];
    updateForm({
      results: rs,
      entertainment_meta: { ...form.entertainment_meta, resultImages },
    });
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) return alert('データベースに接続されていません');
    if (file.size > 5 * 1024 * 1024) return alert('ファイルサイズは5MB以下にしてください');

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${user?.id || 'anonymous'}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('entertainment-images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('entertainment-images').getPublicUrl(filePath);
      setResultImage(index, data.publicUrl);
      setImagePickerOpen(null);
    } catch (err: any) {
      alert('アップロードエラー: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- ウィザード一括生成（テーマ→設定→生成→画像→エディタ切替） ---
  const QUICK_THEMES = [
    { label: 'どうぶつ占い', emoji: '🐾' },
    { label: '推しキャラ診断', emoji: '💫' },
    { label: '前世タイプ診断', emoji: '🔮' },
    { label: '脳内メーカー', emoji: '🧠' },
    { label: 'ラーメン診断', emoji: '🍜' },
    { label: '恋愛パターン診断', emoji: '💕' },
  ];

  const handleWizardGenerate = async () => {
    if (!wizardTheme.trim()) { alert('テーマを入力してください'); return; }
    setWizardStep('generating');
    setWizardGenerating(true);
    setWizardError(null);
    setWizardProgressSteps([
      { label: 'タイトル・説明文を生成', status: 'in_progress' },
      { label: '質問を生成', status: 'pending' },
      { label: `結果${wizardResultCount}タイプを生成`, status: 'pending' },
      { label: '結果画像を生成', status: 'pending' },
    ]);

    try {
      await new Promise((r) => setTimeout(r, 500));
      setWizardProgressSteps((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, status: 'completed' } : i === 1 ? { ...s, status: 'in_progress' } : s))
      );

      const finalMode = wizardTheme.includes('占い') ? 'fortune' : wizardMode;
      const res = await fetch('/api/entertainment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'generate',
          quizConcept: { theme: wizardTheme, resultCount: wizardResultCount, questionCount: wizardQuestionCount, style: wizardStyle, mode: finalMode },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'クイズ生成に失敗しました');

      setWizardProgressSteps((prev) =>
        prev.map((s, i) => (i <= 1 ? { ...s, status: 'completed' } : i === 2 ? { ...s, status: 'in_progress' } : s))
      );
      await new Promise((r) => setTimeout(r, 300));

      const updated = applyGeneratedData(form, data, wizardStyle, finalMode);
      setForm(updated);

      setWizardProgressSteps((prev) =>
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
            style: wizardStyle,
            theme: wizardTheme,
            aspectRatio: form.entertainment_meta.imageAspectRatio || '1:1',
          }),
        });
        const imgData = await imgRes.json();
        if (imgRes.ok && imgData.images && Object.keys(imgData.images).length > 0) {
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
      } catch (imgErr) {
        console.warn('画像生成エラー:', imgErr);
      }

      if (!imageGenSuccess) {
        setWizardProgressSteps((prev) =>
          prev.map((s, i) =>
            i === 3
              ? { ...s, status: 'completed', label: '画像生成（スキップ — エディタで生成可能）' }
              : { ...s, status: 'completed' }
          )
        );
      }

      setWizardProgressSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      await new Promise((r) => setTimeout(r, 500));

      // エディタタブに自動切替
      setLeftTab('editor');
      setOpenSections({ ai: false, basic: true, questions: true, results: true, settings: false });
      resetPreview();
      setWizardProgressSteps([]);
    } catch (err) {
      setWizardError(err instanceof Error ? err.message : '生成に失敗しました');
      setWizardStep('settings');
    } finally {
      setWizardGenerating(false);
    }
  };

  // --- 保存 ---
  const handleSave = async () => {
    if (!supabase) { alert('データベースに接続されていません'); return; }

    await consumeAndExecute('entertainment_quiz', 'save', async () => {
      setIsSaving(true);
      setError(null);

      try {
        const quizData = quizFromForm(form);
        const insertData: Record<string, unknown> = {
          title: quizData.title,
          description: quizData.description,
          category: quizData.category,
          color: quizData.color,
          questions: quizData.questions,
          results: quizData.results,
          layout: quizData.layout || 'pop',
          mode: quizData.mode || 'diagnosis',
          theme: quizData.theme || 'vibrant',
          quiz_type: 'entertainment',
          entertainment_meta: quizData.entertainment_meta,
          show_in_portal: form.show_in_portal,
        };

        let result;

        if (savedId) {
          const { data, error: dbError } = await supabase
            .from(TABLES.QUIZZES)
            .update(insertData)
            .eq('id', savedId)
            .select();
          if (dbError) throw new Error(dbError.message || 'データベースエラー');
          result = data?.[0];
        } else {
          // 新規作成時: エンタメ診断の作成数制限チェック
          if (user?.id) {
            try {
              const res = await fetch(`/api/makers/subscription-status?userId=${user.id}`);
              const subData = res.ok ? await res.json() : null;
              const isPro = subData?.planTier === 'business' || subData?.planTier === 'premium';
              if (!isPro) {
                const { count } = await supabase
                  .from(TABLES.QUIZZES)
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', user.id)
                  .eq('quiz_type', 'entertainment');
                if ((count || 0) >= 1) {
                  setError('フリープランではエンタメ診断は1つまで作成できます。プロプランにアップグレードすると無制限に作成できます。');
                  setIsSaving(false);
                  return;
                }
              }
            } catch (e) {
              console.warn('制限チェックエラー:', e);
            }
          }

          let attempts = 0;
          let insertError: any = null;
          while (attempts < 5) {
            const slug = generateSlug();
            const { data, error: dbError } = await supabase
              .from(TABLES.QUIZZES)
              .insert({ ...insertData, slug, user_id: user?.id || null })
              .select();
            if (dbError?.code === '23505' && dbError?.message?.includes('slug')) {
              attempts++;
              continue;
            }
            insertError = dbError;
            result = data?.[0];
            break;
          }
          if (attempts >= 5) throw new Error('ユニークなURLの生成に失敗しました');
          if (insertError) throw new Error(insertError.message || 'データベースエラー');
        }

        if (result) {
          const wasNew = !savedId;
          setSavedId(result.id);
          setSavedSlug(result.slug);

          if (!user && wasNew) {
            try {
              const stored = JSON.parse(localStorage.getItem('guest_content') || '[]');
              stored.push({ table: 'quizzes', id: result.id });
              localStorage.setItem('guest_content', JSON.stringify(stored));
            } catch {}
          }

          fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: `/entertainment/${result.slug}` }),
          }).catch(() => {});

          if (wasNew) {
            setShowCompleteModal(true);
            if (user?.id) {
              triggerGamificationEvent(user.id, 'quiz_create', {
                contentId: result.slug,
                contentTitle: result.title,
              });
            }
          } else {
            alert('保存しました！');
          }
        }
      } catch (err: any) {
        if (err.code === '23505' && err.message?.includes('slug')) {
          setError('URLが重複しています。もう一度お試しください。');
        } else {
          setError(err.message || '保存に失敗しました');
        }
      } finally {
        setIsSaving(false);
      }
    });
  };

  const previewQuizData = quizFromForm(form);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      <CreationCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="エンタメ診断"
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/entertainment/${savedSlug}`}
        contentTitle={form.title + 'をやってみよう！'}
        theme="rose"
      />

      {/* ヘッダー */}
      <div className="bg-white border-b px-4 md:px-6 py-4 flex justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onBack ? onBack() : window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-pink-500 hidden sm:block" />
            <h2 className="font-bold text-lg text-gray-900 line-clamp-1">エンタメ診断メーカー</h2>
          </div>
        </div>
        <div className="flex gap-2">
          {savedSlug && (
            <button
              onClick={() => setShowCompleteModal(true)}
              className="hidden sm:flex bg-gradient-to-r from-pink-600 to-purple-600 text-white px-3 py-2 rounded-lg font-bold items-center gap-2 text-sm shadow-md"
            >
              <Trophy size={16} /> <span className="hidden md:inline">完了画面</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-pink-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-pink-700 shadow-md transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span className="hidden sm:inline">保存</span>
          </button>
        </div>
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[121px] z-40">
        <div className="flex">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              mobileTab === 'editor'
                ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Edit3 size={18} /> 編集エリア
          </button>
          <button
            onClick={() => { setMobileTab('preview'); resetPreview(); }}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              mobileTab === 'preview'
                ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye size={18} /> プレビュー
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
      )}

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左側: 編集パネル */}
        <div className={`w-full lg:w-1/2 overflow-y-auto bg-gray-50 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>

          {/* ウィザード/エディタ切り替えタブ */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="flex max-w-2xl mx-auto">
              <button
                onClick={() => setLeftTab('wizard')}
                className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  leftTab === 'wizard'
                    ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Wand2 size={16} /> AIウィザード
              </button>
              <button
                onClick={() => setLeftTab('editor')}
                className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  leftTab === 'editor'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Edit3 size={16} /> エディタ
              </button>
            </div>
          </div>

          {/* === ウィザードタブ === */}
          {leftTab === 'wizard' && (
            <div className="p-4 md:p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {wizardError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{wizardError}</div>
                )}

                {wizardStep === 'theme' && (
                  <>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold mb-3">
                        STEP 1 / 2
                      </div>
                      <h2 className="text-xl font-extrabold text-gray-900 mb-1">どんな診断を作りますか？</h2>
                      <p className="text-sm text-gray-600">テーマを入力するか、下から選んでください</p>
                    </div>

                    <textarea
                      className="w-full border-2 border-pink-200 p-4 rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white placeholder:text-gray-400 resize-none"
                      rows={2}
                      placeholder="例: どうぶつ占い"
                      value={wizardTheme}
                      onChange={(e) => setWizardTheme(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      {QUICK_THEMES.map((t) => (
                        <button
                          key={t.label}
                          onClick={() => { setWizardTheme(t.label); setWizardStep('settings'); }}
                          className="bg-white border-2 border-gray-200 rounded-xl p-3 text-left hover:border-pink-400 hover:shadow-md transition-all"
                        >
                          <span className="text-xl mb-1 block">{t.emoji}</span>
                          <span className="font-bold text-sm text-gray-900">{t.label}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => { if (wizardTheme.trim()) setWizardStep('settings'); }}
                      disabled={!wizardTheme.trim()}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 disabled:from-gray-300 disabled:to-gray-300 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      次へ <ArrowRight size={20} />
                    </button>
                  </>
                )}

                {wizardStep === 'settings' && (
                  <>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold mb-3">
                        STEP 2 / 2
                      </div>
                      <h2 className="text-xl font-extrabold text-gray-900 mb-1">設定を選んでください</h2>
                      <p className="text-sm text-gray-600">テーマ: 「{wizardTheme}」</p>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-2">モード</label>
                      <div className="grid grid-cols-2 gap-3">
                        {MODE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setWizardMode(opt.value)}
                            className={`p-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                              wizardMode === opt.value
                                ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600'
                            }`}
                          >
                            {opt.emoji} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-2">スタイル</label>
                      <div className="grid grid-cols-2 gap-3">
                        {STYLE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setWizardStyle(opt.value)}
                            className={`p-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                              wizardStyle === opt.value
                                ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600'
                            }`}
                          >
                            {opt.emoji} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">結果タイプ数</label>
                        <div className="grid grid-cols-3 gap-2">
                          {RESULT_COUNT_OPTIONS.map((count) => (
                            <button
                              key={count}
                              onClick={() => setWizardResultCount(count)}
                              className={`py-2.5 rounded-lg border-2 font-bold text-sm flex items-center justify-center transition-all ${
                                wizardResultCount === count
                                  ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                                  : 'border-gray-200 bg-white text-gray-500'
                              }`}
                            >
                              {count}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">質問数</label>
                        <div className="grid grid-cols-4 gap-2">
                          {QUESTION_COUNT_OPTIONS.map((count) => (
                            <button
                              key={count}
                              onClick={() => setWizardQuestionCount(count)}
                              className={`py-2.5 rounded-lg border-2 font-bold text-sm flex items-center justify-center transition-all ${
                                wizardQuestionCount === count
                                  ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                                  : 'border-gray-200 bg-white text-gray-500'
                              }`}
                            >
                              {count}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-2">画像サイズ</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ASPECT_RATIO_OPTIONS.map((ar) => (
                          <button
                            key={ar.value}
                            onClick={() => setForm((prev: EntertainmentForm) => ({
                              ...prev,
                              entertainment_meta: { ...prev.entertainment_meta, imageAspectRatio: ar.value },
                            }))}
                            className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                              (form.entertainment_meta.imageAspectRatio || '1:1') === ar.value
                                ? 'border-pink-500 bg-pink-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{ar.icon}</span>
                              <span className="font-bold text-xs text-gray-900">{ar.label}</span>
                            </div>
                            <span className="text-[10px] text-gray-500">{ar.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setWizardStep('theme')}
                        className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 border border-gray-300"
                      >
                        <ArrowLeft size={18} /> 戻る
                      </button>
                      <button
                        onClick={handleWizardGenerate}
                        className="flex-[2] bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        <Sparkles size={20} /> 生成する！
                      </button>
                    </div>
                  </>
                )}

                {wizardStep === 'generating' && (
                  <div className="flex items-center justify-center min-h-[40vh]">
                    <WizardProgress steps={wizardProgressSteps} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === エディタタブ === */}
          {leftTab === 'editor' && (
          <div className="p-4 md:p-6">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* STEP 1: AI生成 */}
            <Section
              title="AI一括生成"
              icon={Sparkles}
              isOpen={openSections.ai}
              onToggle={() => toggleSection('ai')}
              step={1}
              stepLabel="テーマを入力してAIでクイズを自動生成（任意）"
              headerBgColor="bg-pink-50"
              headerHoverColor="hover:bg-pink-100"
              accentColor="bg-pink-100 text-pink-600"
            >
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-900 block mb-2">テーマ</label>
                <textarea
                  className="w-full border-2 border-pink-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none bg-white text-gray-900 placeholder:text-gray-400"
                  rows={2}
                  placeholder="例: どうぶつ占い、推しキャラ診断、脳内メーカー..."
                  value={aiTheme}
                  onChange={(e) => setAiTheme(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-bold text-gray-700 block mb-2">モード</label>
                <div className="grid grid-cols-2 gap-2">
                  {MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAiMode(opt.value)}
                      className={`p-3 rounded-lg border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        aiMode === opt.value
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-bold text-gray-700 block mb-2">スタイル</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAiStyle(opt.value)}
                      className={`p-3 rounded-lg border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        aiStyle === opt.value
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">結果タイプ数</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {RESULT_COUNT_OPTIONS.map((count) => (
                      <button
                        key={count}
                        onClick={() => setAiResultCount(count)}
                        className={`py-2.5 rounded-lg font-bold text-sm border flex items-center justify-center transition-all ${
                          aiResultCount === count
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-gray-200 bg-white text-gray-500'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">質問数</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {QUESTION_COUNT_OPTIONS.map((count) => (
                      <button
                        key={count}
                        onClick={() => setAiQuestionCount(count)}
                        className={`py-2.5 rounded-lg font-bold text-sm border flex items-center justify-center transition-all ${
                          aiQuestionCount === count
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-gray-200 bg-white text-gray-500'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-bold text-gray-700 block mb-2">画像サイズ</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {ASPECT_RATIO_OPTIONS.map((ar) => (
                    <button
                      key={ar.value}
                      onClick={() => updateForm({
                        entertainment_meta: { ...form.entertainment_meta, imageAspectRatio: ar.value },
                      })}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        (form.entertainment_meta.imageAspectRatio || '1:1') === ar.value
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm block">{ar.icon}</span>
                      <span className="font-bold text-[10px] text-gray-900">{ar.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {progressSteps.length > 0 && (
                <div className="mb-4">
                  <WizardProgress steps={progressSteps} />
                </div>
              )}

              {generateError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{generateError}</div>
              )}

              <button
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiTheme.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {isGenerating ? (
                  <><Loader2 className="animate-spin" size={18} /> 生成中...</>
                ) : (
                  <><Sparkles size={18} /> AIで一括生成する</>
                )}
              </button>

              <button
                onClick={() => {
                  const fresh = createDefaultForm(aiResultCount);
                  setForm(fresh);
                  resetPreview();
                }}
                className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition-all border border-gray-300"
              >
                初期値に戻す
              </button>
            </Section>

            {/* STEP 2: 基本設定 */}
            <Section
              title="基本設定"
              icon={Edit3}
              isOpen={openSections.basic}
              onToggle={() => toggleSection('basic')}
              step={2}
              stepLabel="タイトル・説明文を設定"
              headerBgColor="bg-blue-50"
              headerHoverColor="hover:bg-blue-100"
              accentColor="bg-blue-100 text-blue-600"
            >
              <Input
                label="タイトル"
                val={form.title}
                onChange={(v) => updateForm({ title: v })}
                ph="例: どうぶつ占い"
              />
              <Textarea
                label="説明文"
                val={form.description}
                onChange={(v) => updateForm({ description: v })}
              />
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-700 block mb-2">モード</label>
                <div className="grid grid-cols-2 gap-2">
                  {MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateForm({ mode: opt.value })}
                      className={`p-3 rounded-lg border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        form.mode === opt.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* STEP 3: 質問 */}
            <Section
              title="質問"
              icon={MessageSquare}
              isOpen={openSections.questions}
              onToggle={() => toggleSection('questions')}
              badge={`${form.questions.length}問`}
              step={3}
              stepLabel="質問と選択肢を編集"
              headerBgColor="bg-green-50"
              headerHoverColor="hover:bg-green-100"
              accentColor="bg-green-100 text-green-600"
            >
              <div className="space-y-4">
                {form.questions.map((q, qi) => (
                  <div key={qi} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                    <button
                      onClick={() => removeQuestion(qi)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="font-bold text-pink-600 mb-2 text-sm">Q{qi + 1}</div>
                    <input
                      className="w-full border border-gray-300 p-2 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-pink-500 outline-none bg-white mb-3 text-sm"
                      value={q.text}
                      onChange={(e) => {
                        const qs = [...form.questions];
                        qs[qi] = { ...qs[qi], text: e.target.value };
                        updateForm({ questions: qs });
                      }}
                      placeholder="質問文を入力..."
                    />
                    <div className="space-y-2">
                      {q.options.map((o, oi) => (
                        <div key={oi} className="bg-white p-2 rounded border border-gray-200 flex items-center gap-2">
                          <button
                            onClick={() => removeOption(qi, oi)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <input
                            className="flex-grow p-1 outline-none text-sm text-gray-900"
                            value={o.label}
                            onChange={(e) => {
                              const qs = [...form.questions];
                              qs[qi] = {
                                ...qs[qi],
                                options: qs[qi].options.map((opt, j) =>
                                  j === oi ? { ...opt, label: e.target.value } : opt
                                ),
                              };
                              updateForm({ questions: qs });
                            }}
                            placeholder={`選択肢${oi + 1}`}
                          />
                          {form.mode === 'diagnosis' && (
                            <div className="flex gap-1 flex-wrap">
                              {form.results.map((r) => (
                                <div key={r.type} className="flex flex-col items-center">
                                  <span className="text-[10px] text-gray-400 font-bold">{r.type}</span>
                                  <input
                                    type="number"
                                    className="w-10 bg-gray-50 border border-gray-200 text-center text-xs rounded text-gray-900 py-1"
                                    value={o.score[r.type] || 0}
                                    onChange={(e) => {
                                      const qs = [...form.questions];
                                      qs[qi] = {
                                        ...qs[qi],
                                        options: qs[qi].options.map((opt, j) =>
                                          j === oi
                                            ? { ...opt, score: { ...opt.score, [r.type]: parseInt(e.target.value) || 0 } }
                                            : opt
                                        ),
                                      };
                                      updateForm({ questions: qs });
                                    }}
                                    title={`${r.title}(${r.type})のスコア`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(qi)}
                        className="w-full py-1 text-xs text-pink-600 hover:bg-pink-50 rounded flex items-center justify-center gap-1"
                      >
                        <Plus size={12} /> 選択肢追加
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addQuestion}
                  className="w-full py-3 bg-white border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> 質問を追加
                </button>
              </div>
            </Section>

            {/* STEP 4: 結果パターン */}
            <Section
              title="結果パターン"
              icon={Trophy}
              isOpen={openSections.results}
              onToggle={() => toggleSection('results')}
              badge={`${form.results.length}パターン`}
              step={4}
              stepLabel="結果タイプの文章を設定"
              headerBgColor="bg-orange-50"
              headerHoverColor="hover:bg-orange-100"
              accentColor="bg-orange-100 text-orange-600"
            >
              <div className="p-3 rounded-lg mb-4 text-sm font-bold bg-pink-50 text-pink-800">
                {form.mode === 'fortune'
                  ? '🔮 結果はランダムに表示されます'
                  : '🎯 獲得ポイントが多いタイプの結果が表示されます'}
              </div>

              <div className="mb-4">
                <button
                  onClick={handleGenerateImages}
                  disabled={isGeneratingImages}
                  className="w-full bg-purple-50 border border-purple-200 text-purple-700 py-2 rounded-lg font-bold text-sm hover:bg-purple-100 flex items-center justify-center gap-2 transition-all"
                >
                  {isGeneratingImages ? (
                    <><Loader2 className="animate-spin" size={16} /> 画像生成中...</>
                  ) : (
                    <><ImageIcon size={16} /> AI画像を一括生成</>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {form.results.map((r, ri) => (
                  <div key={ri} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                    <button
                      onClick={() => removeResult(ri)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs font-bold inline-block mb-3">
                      パターン {r.type}
                    </div>
                    <Input
                      label="タイトル"
                      val={r.title}
                      onChange={(v) => {
                        const rs = [...form.results];
                        rs[ri] = { ...rs[ri], title: v };
                        updateForm({ results: rs });
                      }}
                    />
                    <Textarea
                      label="説明文"
                      val={r.description}
                      onChange={(v) => {
                        const rs = [...form.results];
                        rs[ri] = { ...rs[ri], description: v };
                        updateForm({ results: rs });
                      }}
                    />

                    {/* 画像セクション */}
                    <div className="mt-2">
                      <label className="text-sm font-bold text-gray-900 block mb-2">画像</label>
                      {r.image_url ? (
                        <div className="relative group">
                          <img src={r.image_url} alt={r.title} className="w-full h-32 object-cover rounded-lg border" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setImagePickerOpen(ri); setImagePickerTab('preset'); setUrlInput(''); }}
                              className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                            >
                              変更
                            </button>
                            <button
                              onClick={() => removeResultImage(ri)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setImagePickerOpen(ri); setImagePickerTab('preset'); setUrlInput(''); }}
                          className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-pink-400 hover:text-pink-500 hover:bg-pink-50/50 transition-all"
                        >
                          <ImageIcon size={20} />
                          <span className="text-xs font-bold">画像を設定</span>
                        </button>
                      )}

                      {/* 画像ピッカーモーダル */}
                      {imagePickerOpen === ri && (
                        <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden">
                          {/* タブ */}
                          <div className="flex border-b border-gray-200">
                            {[
                              { id: 'preset' as const, label: 'フリー画像', icon: Grid3X3 },
                              { id: 'upload' as const, label: 'アップロード', icon: Upload },
                              { id: 'url' as const, label: 'URL入力', icon: Link },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setImagePickerTab(tab.id)}
                                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                  imagePickerTab === tab.id
                                    ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                <tab.icon size={14} />
                                {tab.label}
                              </button>
                            ))}
                            <button
                              onClick={() => setImagePickerOpen(null)}
                              className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="p-3">
                            {/* プリセット画像 */}
                            {imagePickerTab === 'preset' && (
                              <div>
                                <div className="flex gap-1.5 mb-3">
                                  {PRESET_CATEGORIES.map((cat) => (
                                    <button
                                      key={cat.id}
                                      onClick={() => setPresetCategory(cat.id)}
                                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                                        presetCategory === cat.id
                                          ? 'bg-pink-100 text-pink-700'
                                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                      }`}
                                    >
                                      {cat.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                  {PRESET_IMAGES
                                    .filter((img) => presetCategory === 'all' || img.category === presetCategory)
                                    .map((img, i) => (
                                      <button
                                        key={i}
                                        onClick={() => { setResultImage(ri, img.url); setImagePickerOpen(null); }}
                                        className={`relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                                          r.image_url === img.url ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200 hover:border-pink-300'
                                        }`}
                                      >
                                        <img src={img.url} alt={img.label} className="w-full aspect-square object-cover bg-gray-50" />
                                        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] font-bold text-center py-0.5">
                                          {img.label}
                                        </div>
                                      </button>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* アップロード */}
                            {imagePickerTab === 'upload' && (
                              <div className="text-center py-4">
                                <label className="cursor-pointer inline-flex flex-col items-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-400 hover:bg-pink-50/50 transition-all">
                                  {isUploading ? (
                                    <Loader2 className="animate-spin text-pink-500" size={24} />
                                  ) : (
                                    <Upload size={24} className="text-gray-400" />
                                  )}
                                  <span className="text-sm font-bold text-gray-600">
                                    {isUploading ? 'アップロード中...' : 'クリックして画像を選択'}
                                  </span>
                                  <span className="text-xs text-gray-400">JPG, PNG, GIF, WebP（5MB以下）</span>
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(ri, e)}
                                    disabled={isUploading}
                                  />
                                </label>
                              </div>
                            )}

                            {/* URL入力 */}
                            {imagePickerTab === 'url' && (
                              <div className="flex gap-2">
                                <input
                                  className="flex-1 border border-gray-300 p-2.5 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-pink-500 outline-none"
                                  placeholder="https://example.com/image.jpg"
                                  value={urlInput}
                                  onChange={(e) => setUrlInput(e.target.value)}
                                />
                                <button
                                  onClick={() => {
                                    if (urlInput.trim()) {
                                      setResultImage(ri, urlInput.trim());
                                      setUrlInput('');
                                      setImagePickerOpen(null);
                                    }
                                  }}
                                  disabled={!urlInput.trim()}
                                  className="px-4 py-2.5 bg-pink-500 text-white rounded-lg text-sm font-bold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  設定
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addResult}
                  className="w-full py-3 bg-white border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> 結果パターンを追加
                </button>
              </div>
            </Section>

            {/* STEP 5: シェア・設定 */}
            <Section
              title="シェア・デザイン設定"
              icon={Palette}
              isOpen={openSections.settings}
              onToggle={() => toggleSection('settings')}
              step={5}
              stepLabel="シェア・デザイン・公開設定"
              headerBgColor="bg-gray-100"
              headerHoverColor="hover:bg-gray-200"
              accentColor="bg-gray-200 text-gray-600"
            >
              <Textarea
                label="シェアテンプレート"
                val={form.entertainment_meta.shareTemplate || ''}
                onChange={(v) =>
                  updateForm({
                    entertainment_meta: { ...form.entertainment_meta, shareTemplate: v },
                  })
                }
                rows={2}
              />
              <p className="text-xs text-gray-500 -mt-2 mb-4">
                {'{{result_title}}'} = 結果タイトル、{'{{quiz_title}}'} = 診断タイトル
              </p>

              <div className="mb-4">
                <label className="text-sm font-bold text-gray-900 block mb-2">レイアウト</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'pop', label: 'ポップ', icon: Sparkles },
                    { id: 'card', label: 'カード', icon: Edit3 },
                  ].map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => updateForm({ layout: layout.id })}
                      className={`py-3 rounded-lg font-bold text-sm border flex items-center justify-center gap-2 ${
                        form.layout === layout.id
                          ? 'bg-pink-50 border-pink-500 text-pink-700'
                          : 'bg-white border-gray-200 text-gray-500'
                      }`}
                    >
                      <layout.icon size={16} /> {layout.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-bold text-gray-900 block mb-2">画像アスペクト比</label>
                <div className="grid grid-cols-2 gap-2">
                  {ASPECT_RATIO_OPTIONS.map((ar) => (
                    <button
                      key={ar.value}
                      onClick={() => updateForm({
                        entertainment_meta: { ...form.entertainment_meta, imageAspectRatio: ar.value },
                      })}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        (form.entertainment_meta.imageAspectRatio || '1:1') === ar.value
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base">{ar.icon}</span>
                        <span className="font-bold text-sm text-gray-900">{ar.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{ar.desc}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">AI画像生成時のアスペクト比を選択</p>
              </div>

              <div className="mb-4">
                <label className="text-sm font-bold text-gray-900 block mb-2">デザインテーマ</label>
                <div className="grid grid-cols-2 gap-2">
                  {THEME_PRESETS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateForm({ theme: t.id })}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        form.theme === t.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-4 h-4 rounded-full ${t.color}`}></div>
                        <span className="font-bold text-sm">{t.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-bold text-gray-900 block mb-2">ポータル掲載</label>
                <button
                  onClick={() => updateForm({ show_in_portal: !form.show_in_portal })}
                  className={`w-full p-3 rounded-lg border-2 font-bold text-sm transition-all ${
                    form.show_in_portal
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-500'
                  }`}
                >
                  {form.show_in_portal ? '掲載する' : '掲載しない'}
                </button>
              </div>
            </Section>

            {/* 保存ボタン */}
            <div className="sticky bottom-4 z-10">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                {savedId ? '更新して保存' : '保存して公開'}
              </button>
            </div>
          </div>
          </div>
          )}
          {/* === /エディタタブ === */}
        </div>

        {/* 右側: プレビュー */}
        <div
          className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="hidden lg:flex bg-gray-900 px-4 py-3 items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-gray-400 text-sm font-mono">プレビュー</span>
            </div>
            <button
              onClick={resetPreview}
              className="text-gray-400 hover:text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={14} /> リセット
            </button>
          </div>
          <div className="lg:hidden bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <span className="text-white font-bold text-sm">プレビュー</span>
            <button
              onClick={resetPreview}
              className="text-gray-400 hover:text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={14} /> リセット
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
              <QuizPlayer key={previewKey} quiz={previewQuizData} isPreview={true} />
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>
    </div>
  );
}
