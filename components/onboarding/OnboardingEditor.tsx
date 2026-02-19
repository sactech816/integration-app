'use client';

import React, { useState } from 'react';
import {
  ArrowLeft, Save, Loader2, Edit3, Eye, Sparkles,
  Palette, Settings, Wand2, Plus, Trash2, ChevronDown,
  ChevronUp, Trophy, Share2, Clock, MousePointer,
  Monitor, Zap, BookOpen, ShoppingCart, HelpCircle, Lightbulb,
  Copy, Layout,
} from 'lucide-react';
import { generateSlug } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import OnboardingModal from '@/components/shared/OnboardingModal';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import OnboardingModalPreview from './OnboardingModalPreview';
import IconSelector from './IconSelector';
import GradientSelector from './GradientSelector';
import type { OnboardingModalPage, OnboardingTriggerType, OnboardingButtonPosition } from '@/lib/types';

// --- テンプレートプリセット ---
const PRESETS: Record<string, {
  title: string;
  pages: OnboardingModalPage[];
  gradient_from: string;
  gradient_to: string;
}> = {
  saas: {
    title: 'サービスへようこそ',
    gradient_from: 'from-blue-500',
    gradient_to: 'to-indigo-600',
    pages: [
      {
        subtitle: '基本機能のご紹介',
        items: [
          { iconName: 'Layout', iconColor: 'blue', title: 'ダッシュボード', description: 'すべての機能はダッシュボードからアクセスできます。' },
          { iconName: 'Settings', iconColor: 'purple', title: '初期設定', description: 'まずはアカウント設定から始めましょう。' },
          { iconName: 'Zap', iconColor: 'amber', title: 'クイックスタート', description: '3分で基本的な使い方をマスターできます。' },
        ],
      },
      {
        subtitle: 'サポート情報',
        items: [
          { iconName: 'BookOpen', iconColor: 'teal', title: 'ヘルプドキュメント', description: '詳しい使い方はヘルプセンターをご覧ください。' },
          { iconName: 'Mail', iconColor: 'green', title: 'お問い合わせ', description: 'ご不明な点はメールでお気軽にどうぞ。' },
        ],
      },
    ],
  },
  ecommerce: {
    title: 'お買い物ガイド',
    gradient_from: 'from-emerald-500',
    gradient_to: 'to-teal-600',
    pages: [
      {
        subtitle: 'ショッピングの流れ',
        items: [
          { iconName: 'Search', iconColor: 'blue', title: '商品を探す', description: 'カテゴリや検索で欲しい商品を見つけましょう。' },
          { iconName: 'ShoppingCart', iconColor: 'green', title: 'カートに追加', description: '気になる商品をカートに入れてまとめて購入できます。' },
          { iconName: 'Shield', iconColor: 'purple', title: '安全な決済', description: 'SSL暗号化で安全にお支払いいただけます。' },
        ],
      },
    ],
  },
  feature_tour: {
    title: '新機能のご紹介',
    gradient_from: 'from-purple-600',
    gradient_to: 'to-pink-600',
    pages: [
      {
        subtitle: '今回のアップデート',
        items: [
          { iconName: 'Sparkles', iconColor: 'purple', title: '新しいデザイン', description: 'UIを一新し、より直感的に操作できるようになりました。' },
          { iconName: 'Zap', iconColor: 'amber', title: 'パフォーマンス改善', description: '読み込み速度が2倍に向上しました。' },
          { iconName: 'Shield', iconColor: 'green', title: 'セキュリティ強化', description: '最新のセキュリティ対策を適用しました。' },
        ],
      },
    ],
  },
  support: {
    title: 'サポートガイド',
    gradient_from: 'from-amber-500',
    gradient_to: 'to-orange-500',
    pages: [
      {
        subtitle: 'お困りですか？',
        items: [
          { iconName: 'HelpCircle', iconColor: 'blue', title: 'よくある質問', description: 'FAQページで解決策が見つかるかもしれません。' },
          { iconName: 'Mail', iconColor: 'green', title: 'メールサポート', description: '24時間以内に返信いたします。' },
          { iconName: 'Phone', iconColor: 'amber', title: '電話サポート', description: '平日10:00〜18:00で対応しています。' },
        ],
      },
    ],
  },
};

// --- Input Components ---
const Input = ({ label, val, onChange, ph }: { label: string; val: string; onChange: (v: string) => void; ph?: string }) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <input
      className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-amber-500 outline-none bg-white placeholder-gray-400 transition-shadow"
      value={val || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={ph}
    />
  </div>
);

const Textarea = ({ label, val, onChange, ph }: { label: string; val: string; onChange: (v: string) => void; ph?: string }) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <textarea
      className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-amber-500 outline-none bg-white placeholder-gray-400 transition-shadow"
      rows={3}
      value={val}
      onChange={(e) => onChange(e.target.value)}
      placeholder={ph}
    />
  </div>
);

// --- セクションコンポーネント ---
const Section = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  badge,
  step,
  stepLabel,
  headerBgColor = 'bg-gray-50',
  headerHoverColor = 'hover:bg-gray-100',
  accentColor = 'bg-amber-100 text-amber-600',
}: {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  step?: number;
  stepLabel?: string;
  headerBgColor?: string;
  headerHoverColor?: string;
  accentColor?: string;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    {step && stepLabel && (
      <div className={`px-5 py-2 ${headerBgColor} border-b border-gray-200/50`}>
        <span className="text-xs font-bold text-gray-600 bg-white/60 px-2 py-0.5 rounded">STEP {step}</span>
        <span className="text-sm text-gray-700 ml-2">{stepLabel}</span>
      </div>
    )}
    <button onClick={onToggle} className={`w-full px-5 py-4 flex items-center justify-between ${headerBgColor} ${headerHoverColor} transition-colors`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOpen ? accentColor : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && <span className="text-xs bg-white/80 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">{badge}</span>}
      </div>
      {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
    </button>
    {isOpen && <div className="p-5 border-t border-gray-100">{children}</div>}
  </div>
);

// --- Color Selector ---
const ICON_COLORS = ['blue', 'purple', 'teal', 'amber', 'green', 'red', 'orange', 'indigo', 'violet', 'rose', 'pink', 'cyan'];

const COLOR_PREVIEW: Record<string, string> = {
  blue: 'bg-blue-500', purple: 'bg-purple-500', teal: 'bg-teal-500', amber: 'bg-amber-500',
  green: 'bg-green-500', red: 'bg-red-500', orange: 'bg-orange-500', indigo: 'bg-indigo-500',
  violet: 'bg-violet-500', rose: 'bg-rose-500', pink: 'bg-pink-500', cyan: 'bg-cyan-500',
};

// --- メインエディタ ---
interface OnboardingEditorProps {
  user: { id: string; email?: string } | null;
  isAdmin?: boolean;
  initialData?: any;
  setPage: (page: string) => void;
  onBack: () => void;
  setShowAuth?: (show: boolean) => void;
}

export default function OnboardingEditor({ user, initialData, setPage, onBack, setShowAuth }: OnboardingEditorProps) {
  // フォーム状態
  const [form, setForm] = useState({
    title: initialData?.title || '新規オンボーディング',
    description: initialData?.description || '',
    pages: (initialData?.pages as OnboardingModalPage[]) || [
      {
        subtitle: 'はじめに',
        items: [
          { iconName: 'Sparkles', iconColor: 'amber', title: '機能紹介', description: 'この機能の使い方をご説明します。' },
          { iconName: 'Layout', iconColor: 'blue', title: '基本操作', description: '基本的な操作方法を学びましょう。' },
        ],
      },
    ],
    gradient_from: initialData?.gradient_from || 'from-amber-500',
    gradient_to: initialData?.gradient_to || 'to-orange-500',
    trigger_type: (initialData?.trigger_type || 'immediate') as OnboardingTriggerType,
    trigger_delay: initialData?.trigger_delay || 3000,
    trigger_scroll_percent: initialData?.trigger_scroll_percent || 50,
    trigger_button_text: initialData?.trigger_button_text || 'ヘルプ',
    trigger_button_position: (initialData?.trigger_button_position || 'bottom-right') as OnboardingButtonPosition,
    show_dont_show_again: initialData?.show_dont_show_again ?? true,
    close_on_overlay_click: initialData?.close_on_overlay_click ?? true,
    auto_close_seconds: initialData?.auto_close_seconds || 0,
    dont_show_text: initialData?.dont_show_text || '次から表示しない',
    next_button_text: initialData?.next_button_text || '次へ',
    back_button_text: initialData?.back_button_text || '戻る',
    start_button_text: initialData?.start_button_text || 'はじめる',
    show_in_portal: initialData?.show_in_portal ?? true,
  });

  // UI状態
  const [openSections, setOpenSections] = useState({
    template: !initialData,
    basic: !!initialData,
    pages: false,
    design: false,
    trigger: false,
    advanced: false,
  });
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(initialData?.id || null);
  const [savedSlug, setSavedSlug] = useState<string>(initialData?.slug || '');
  const [customSlug, setCustomSlug] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [justSavedSlug, setJustSavedSlug] = useState('');

  // オンボーディング
  const { showOnboarding, setShowOnboarding } = useOnboarding('onboarding_editor_onboarding_dismissed', { skip: !!initialData });

  const toggleSection = (key: string) => {
    setOpenSections((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  // テンプレート適用
  const applyPreset = (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setForm((prev) => ({
      ...prev,
      title: preset.title,
      pages: preset.pages,
      gradient_from: preset.gradient_from,
      gradient_to: preset.gradient_to,
    }));
    setOpenSections({ template: false, basic: true, pages: false, design: false, trigger: false, advanced: false });
  };

  // ページ操作
  const addPage = () => {
    setForm((prev) => ({
      ...prev,
      pages: [...prev.pages, { subtitle: '新しいページ', items: [{ iconName: 'Info', iconColor: 'blue', title: '新しい項目', description: '説明文を入力してください。' }] }],
    }));
  };

  const removePage = (pageIndex: number) => {
    if (form.pages.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      pages: prev.pages.filter((_: OnboardingModalPage, i: number) => i !== pageIndex),
    }));
  };

  const updatePage = (pageIndex: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      pages: prev.pages.map((p: OnboardingModalPage, i: number) => (i === pageIndex ? { ...p, [field]: value } : p)),
    }));
  };

  // アイテム操作
  const addItem = (pageIndex: number) => {
    setForm((prev) => ({
      ...prev,
      pages: prev.pages.map((p: OnboardingModalPage, i: number) =>
        i === pageIndex
          ? { ...p, items: [...p.items, { iconName: 'Info', iconColor: 'blue', title: '新しい項目', description: '説明文' }] }
          : p
      ),
    }));
  };

  const removeItem = (pageIndex: number, itemIndex: number) => {
    setForm((prev) => ({
      ...prev,
      pages: prev.pages.map((p: OnboardingModalPage, i: number) =>
        i === pageIndex ? { ...p, items: p.items.filter((_, j) => j !== itemIndex) } : p
      ),
    }));
  };

  const updateItem = (pageIndex: number, itemIndex: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      pages: prev.pages.map((p: OnboardingModalPage, i: number) =>
        i === pageIndex
          ? { ...p, items: p.items.map((item, j) => (j === itemIndex ? { ...item, [field]: value } : item)) }
          : p
      ),
    }));
  };

  // 保存処理
  const handleSave = async () => {
    if (!supabase) {
      alert('データベースに接続されていません');
      return;
    }

    if (customSlug && !/^[a-z0-9-]{3,20}$/.test(customSlug)) {
      alert('カスタムURLの形式が正しくありません（半角英数字・ハイフン、3〜20文字）');
      return;
    }

    if (form.pages.length === 0) {
      alert('ページを1つ以上追加してください');
      return;
    }

    const existingId = savedId || (initialData?.id || null);

    if (existingId && !user) {
      if (confirm('編集・更新にはログインが必要です。ログイン画面を開きますか？')) {
        setShowAuth?.(true);
      }
      return;
    }

    setIsSaving(true);

    try {
      const updateData: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        pages: form.pages,
        gradient_from: form.gradient_from,
        gradient_to: form.gradient_to,
        trigger_type: form.trigger_type,
        trigger_delay: form.trigger_delay,
        trigger_scroll_percent: form.trigger_scroll_percent,
        trigger_button_text: form.trigger_button_text,
        trigger_button_position: form.trigger_button_position,
        show_dont_show_again: form.show_dont_show_again,
        close_on_overlay_click: form.close_on_overlay_click,
        auto_close_seconds: form.auto_close_seconds,
        dont_show_text: form.dont_show_text,
        next_button_text: form.next_button_text,
        back_button_text: form.back_button_text,
        start_button_text: form.start_button_text,
        show_in_portal: form.show_in_portal,
      };

      let result;

      if (existingId) {
        const { data, error } = await supabase
          .from('onboarding_modals')
          .update(updateData)
          .eq('id', existingId)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        let attempts = 0;
        const maxAttempts = 5;
        let insertError: any = null;

        while (attempts < maxAttempts) {
          const newSlug = customSlug || generateSlug();
          const insertData = {
            ...updateData,
            slug: newSlug,
            user_id: user?.id || null,
          };

          const { data, error } = await supabase
            .from('onboarding_modals')
            .insert(insertData)
            .select()
            .single();

          if (error?.code === '23505' && error?.message?.includes('slug') && !customSlug) {
            attempts++;
            continue;
          }

          insertError = error;
          result = data;
          break;
        }

        if (attempts >= maxAttempts) {
          throw new Error('ユニークなURLの生成に失敗しました。もう一度お試しください。');
        }
        if (insertError) throw insertError;
        if (customSlug) setCustomSlug('');
      }

      if (result) {
        const wasNewCreation = !existingId;
        setSavedId(result.id);
        setSavedSlug(result.slug);

        // ゲストコンテンツ保存
        if (!user && wasNewCreation) {
          try {
            const stored = JSON.parse(localStorage.getItem('guest_content') || '[]');
            stored.push({ table: 'onboarding_modals', id: result.id });
            localStorage.setItem('guest_content', JSON.stringify(stored));
          } catch {}
        }

        // ISRキャッシュ無効化
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `/onboarding/${result.slug}` }),
        }).catch(() => {});

        if (wasNewCreation) {
          setJustSavedSlug(result.slug);
          setShowDonationModal(true);
        } else {
          alert('保存しました！');
        }
      }
    } catch (error: any) {
      console.error('保存エラー:', error);
      if (error.code === '23505' && error.message?.includes('slug')) {
        alert('このカスタムURLは既に使用されています。別のURLを指定してください。');
      } else {
        alert('保存に失敗しました: ' + (error.message || '不明なエラー'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = (slug: string) => {
    const url = `${window.location.origin}/onboarding/${slug}`;
    navigator.clipboard.writeText(url);
    alert(`公開URLをコピーしました！\n\n${url}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      {/* 作成完了モーダル */}
      <CreationCompleteModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        title="オンボーディングモーダル"
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/onboarding/${customSlug || justSavedSlug}`}
        contentTitle={form.title}
        theme="amber"
      />

      {/* ヘッダー */}
      <div className="bg-white border-b px-4 md:px-6 py-4 flex justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700"><ArrowLeft /></button>
          <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
            {initialData ? 'オンボーディング編集' : 'オンボーディング作成'}
          </h2>
          <span className="hidden md:inline text-xs px-2 py-1 rounded font-bold bg-orange-100 text-orange-700">
            モーダル
          </span>
        </div>
        <div className="flex gap-2">
          {(savedSlug || justSavedSlug) && (
            <button onClick={() => setShowDonationModal(true)} className="hidden sm:flex bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:from-amber-600 hover:to-orange-600 whitespace-nowrap transition-all shadow-md text-sm sm:text-base">
              <Trophy size={16} /> <span className="hidden md:inline">作成完了画面</span><span className="md:hidden">完了</span>
            </button>
          )}
          {(savedSlug || initialData?.slug || customSlug) && (
            <button onClick={() => handlePublish(customSlug || savedSlug || initialData?.slug)} className="hidden sm:flex bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 whitespace-nowrap text-sm sm:text-base">
              <Share2 size={16} /> <span className="hidden md:inline">公開URL</span><span className="md:hidden">URL</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-700 shadow-md transition-all whitespace-nowrap"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} <span className="hidden sm:inline">保存</span>
          </button>
        </div>
      </div>

      {/* モバイル用タブバー */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[121px] z-40">
        <div className="flex">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              mobileTab === 'editor' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Edit3 size={18} /> 編集エリア
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              mobileTab === 'preview' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye size={18} /> プレビュー
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左: 編集パネル */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-2xl mx-auto space-y-4">

            {/* STEP 1: テンプレート */}
            <Section
              title="テンプレート"
              icon={Sparkles}
              isOpen={openSections.template}
              onToggle={() => toggleSection('template')}
              step={1}
              stepLabel="テンプレートから作成（任意）"
              headerBgColor="bg-purple-50"
              headerHoverColor="hover:bg-purple-100"
              accentColor="bg-purple-100 text-purple-600"
            >
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => applyPreset('saas')} className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 flex items-center gap-2">
                  <Monitor size={16} /> SaaSウェルカム
                </button>
                <button onClick={() => applyPreset('ecommerce')} className="p-3 rounded-lg border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 flex items-center gap-2">
                  <ShoppingCart size={16} /> ECガイド
                </button>
                <button onClick={() => applyPreset('feature_tour')} className="p-3 rounded-lg border-2 border-purple-200 bg-purple-50 text-purple-700 font-bold text-sm hover:bg-purple-100 flex items-center gap-2">
                  <Sparkles size={16} /> 機能紹介
                </button>
                <button onClick={() => applyPreset('support')} className="p-3 rounded-lg border-2 border-amber-200 bg-amber-50 text-amber-700 font-bold text-sm hover:bg-amber-100 flex items-center gap-2">
                  <HelpCircle size={16} /> サポート
                </button>
              </div>
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
              <Input label="タイトル" val={form.title} onChange={(v) => setForm({ ...form, title: v })} ph="例: サービスへようこそ" />
              <Textarea label="説明文（任意）" val={form.description} onChange={(v) => setForm({ ...form, description: v })} ph="モーダルの概要説明" />
            </Section>

            {/* STEP 3: ページ & アイテム */}
            <Section
              title="ページ & アイテム"
              icon={Layout}
              isOpen={openSections.pages}
              onToggle={() => toggleSection('pages')}
              step={3}
              stepLabel="モーダルの各ページ内容を編集"
              badge={`${form.pages.length}ページ`}
              headerBgColor="bg-green-50"
              headerHoverColor="hover:bg-green-100"
              accentColor="bg-green-100 text-green-600"
            >
              {form.pages.map((page: OnboardingModalPage, pageIndex: number) => (
                <div key={pageIndex} className="mb-6 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  {/* ページヘッダー */}
                  <div className="px-4 py-3 bg-white flex items-center justify-between border-b border-gray-200">
                    <span className="text-sm font-bold text-gray-700">ページ {pageIndex + 1}</span>
                    {form.pages.length > 1 && (
                      <button onClick={() => removePage(pageIndex)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="p-4 space-y-4">
                    <Input label="サブタイトル" val={page.subtitle} onChange={(v) => updatePage(pageIndex, 'subtitle', v)} ph="例: 基本操作を覚えましょう" />

                    {/* アイテム一覧 */}
                    {page.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-500">アイテム {itemIndex + 1}</span>
                          <button onClick={() => removeItem(pageIndex, itemIndex)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* アイコン + カラー */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <IconSelector
                            value={item.iconName}
                            iconColor={item.iconColor}
                            onChange={(v) => updateItem(pageIndex, itemIndex, 'iconName', v)}
                          />
                          <div className="flex gap-1">
                            {ICON_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => updateItem(pageIndex, itemIndex, 'iconColor', color)}
                                className={`w-5 h-5 rounded-full ${COLOR_PREVIEW[color]} transition-all ${
                                  item.iconColor === color ? 'ring-2 ring-offset-1 ring-amber-400 scale-110' : 'hover:scale-110'
                                }`}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>

                        <input
                          className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                          value={item.title}
                          onChange={(e) => updateItem(pageIndex, itemIndex, 'title', e.target.value)}
                          placeholder="項目タイトル"
                        />
                        <textarea
                          className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none resize-none"
                          rows={2}
                          value={item.description}
                          onChange={(e) => updateItem(pageIndex, itemIndex, 'description', e.target.value)}
                          placeholder="説明文"
                        />
                      </div>
                    ))}

                    <button
                      onClick={() => addItem(pageIndex)}
                      className="w-full border-2 border-dashed border-gray-300 text-gray-500 py-2 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> アイテム追加
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addPage}
                className="w-full bg-green-50 border-2 border-dashed border-green-300 text-green-600 py-3 rounded-xl hover:bg-green-100 transition-colors font-bold text-sm flex items-center justify-center gap-2"
              >
                <Plus size={18} /> 新しいページを追加
              </button>
            </Section>

            {/* STEP 4: デザイン */}
            <Section
              title="デザイン"
              icon={Palette}
              isOpen={openSections.design}
              onToggle={() => toggleSection('design')}
              step={4}
              stepLabel="グラデーション・ボタンテキストを設定"
              headerBgColor="bg-pink-50"
              headerHoverColor="hover:bg-pink-100"
              accentColor="bg-pink-100 text-pink-600"
            >
              <GradientSelector
                gradientFrom={form.gradient_from}
                gradientTo={form.gradient_to}
                onChangeFrom={(v) => setForm({ ...form, gradient_from: v })}
                onChangeTo={(v) => setForm({ ...form, gradient_to: v })}
              />

              <div className="mt-6 space-y-3">
                <p className="text-sm font-bold text-gray-700">ボタンテキスト</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">次へボタン</label>
                    <input className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm" value={form.next_button_text} onChange={(e) => setForm({ ...form, next_button_text: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">戻るボタン</label>
                    <input className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm" value={form.back_button_text} onChange={(e) => setForm({ ...form, back_button_text: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">開始ボタン</label>
                    <input className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm" value={form.start_button_text} onChange={(e) => setForm({ ...form, start_button_text: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">非表示チェック</label>
                    <input className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm" value={form.dont_show_text} onChange={(e) => setForm({ ...form, dont_show_text: e.target.value })} />
                  </div>
                </div>
              </div>
            </Section>

            {/* STEP 5: トリガー設定 */}
            <Section
              title="トリガー設定"
              icon={Zap}
              isOpen={openSections.trigger}
              onToggle={() => toggleSection('trigger')}
              step={5}
              stepLabel="モーダルの表示タイミングを設定"
              headerBgColor="bg-amber-50"
              headerHoverColor="hover:bg-amber-100"
              accentColor="bg-amber-100 text-amber-600"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-3">表示タイミング</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'immediate', label: '即時表示', icon: Zap, desc: 'ページ読み込み時' },
                      { value: 'delay', label: '遅延表示', icon: Clock, desc: '指定秒数後' },
                      { value: 'scroll', label: 'スクロール', icon: MousePointer, desc: '指定%スクロール時' },
                      { value: 'click', label: 'ボタンクリック', icon: Lightbulb, desc: 'フローティングボタン' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, trigger_type: opt.value })}
                        className={`p-3 rounded-lg border-2 text-sm font-bold flex flex-col items-center gap-1 transition-all ${
                          form.trigger_type === opt.value ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'
                        }`}
                      >
                        <opt.icon size={20} className={form.trigger_type === opt.value ? 'text-amber-600' : 'text-gray-400'} />
                        {opt.label}
                        <span className="text-xs font-normal text-gray-500">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 条件付きフィールド */}
                {form.trigger_type === 'delay' && (
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">遅延時間（ミリ秒）</label>
                    <input
                      type="number"
                      value={form.trigger_delay}
                      onChange={(e) => setForm({ ...form, trigger_delay: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
                      min={0}
                      step={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">{(form.trigger_delay / 1000).toFixed(1)}秒後に表示</p>
                  </div>
                )}

                {form.trigger_type === 'scroll' && (
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">スクロール率（%）</label>
                    <input
                      type="range"
                      value={form.trigger_scroll_percent}
                      onChange={(e) => setForm({ ...form, trigger_scroll_percent: parseInt(e.target.value) })}
                      className="w-full"
                      min={10}
                      max={100}
                      step={5}
                    />
                    <p className="text-xs text-gray-500 mt-1">{form.trigger_scroll_percent}% スクロールで表示</p>
                  </div>
                )}

                {form.trigger_type === 'click' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-2">ボタンテキスト</label>
                      <input value={form.trigger_button_text} onChange={(e) => setForm({ ...form, trigger_button_text: e.target.value })} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-2">ボタン位置</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setForm({ ...form, trigger_button_position: pos })}
                            className={`px-3 py-2 rounded-lg text-sm font-bold border ${
                              form.trigger_button_position === pos ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            {pos === 'bottom-right' && '右下'}
                            {pos === 'bottom-left' && '左下'}
                            {pos === 'top-right' && '右上'}
                            {pos === 'top-left' && '左上'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 動作設定 */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.show_dont_show_again}
                      onChange={(e) => setForm({ ...form, show_dont_show_again: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-amber-500"
                    />
                    <span className="text-sm text-gray-700">「次から表示しない」チェックボックスを表示</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.close_on_overlay_click}
                      onChange={(e) => setForm({ ...form, close_on_overlay_click: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-amber-500"
                    />
                    <span className="text-sm text-gray-700">背景クリックで閉じる</span>
                  </label>
                </div>
              </div>
            </Section>

            {/* STEP 6: 詳細設定 */}
            <Section
              title="詳細設定"
              icon={Settings}
              isOpen={openSections.advanced}
              onToggle={() => toggleSection('advanced')}
              step={6}
              stepLabel="カスタムURL・その他"
              headerBgColor="bg-gray-50"
              headerHoverColor="hover:bg-gray-100"
              accentColor="bg-gray-200 text-gray-600"
            >
              {!savedId && !initialData?.id && (
                <div className="mb-4">
                  <label className="text-sm font-bold text-gray-900 block mb-2">カスタムURL（任意）</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">/onboarding/</span>
                    <input
                      className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="my-onboarding"
                      maxLength={20}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">半角英数字・ハイフン、3〜20文字。空欄の場合は自動生成されます。</p>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.show_in_portal}
                  onChange={(e) => setForm({ ...form, show_in_portal: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-amber-500"
                />
                <span className="text-sm text-gray-700">ポータルサイトに掲載する</span>
              </label>
            </Section>
          </div>
        </div>

        {/* 右: プレビュー */}
        <div className={`lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] bg-gray-800 flex items-center justify-center p-4 md:p-8 overflow-y-auto ${
          mobileTab === 'editor' ? 'hidden lg:flex' : 'flex w-full'
        }`}>
          {/* ブラウザ風フレーム */}
          <div className="w-full max-w-lg">
            <div className="bg-gray-700 rounded-t-xl px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-gray-600 rounded px-3 py-1 text-xs text-gray-300 truncate">
                {typeof window !== 'undefined' ? window.location.origin : ''}/onboarding/{savedSlug || customSlug || 'preview'}
              </div>
            </div>
            <div className="bg-gray-100 rounded-b-xl p-4">
              <OnboardingModalPreview
                title={form.title}
                pages={form.pages}
                gradientFrom={form.gradient_from}
                gradientTo={form.gradient_to}
                showDontShowAgain={form.show_dont_show_again}
                dontShowText={form.dont_show_text}
                nextButtonText={form.next_button_text}
                backButtonText={form.back_button_text}
                startButtonText={form.start_button_text}
              />
            </div>
          </div>
        </div>
        {/* 右側スペーサー（デスクトップ） */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50" />
      </div>

      {/* 初回ガイド */}
      {showOnboarding && (
        <OnboardingModal
          storageKey="onboarding_editor_onboarding_dismissed"
          title="オンボーディングモーダルメーカーの使い方"
          gradientFrom="from-amber-500"
          gradientTo="to-orange-500"
          pages={[
            {
              subtitle: 'エディタの基本',
              items: [
                { icon: Layout, iconColor: 'blue', title: '左 = 設定 / 右 = ライブプレビュー', description: '左パネルで設定を変更すると、右のプレビューにリアルタイム反映されます。' },
                { icon: Sparkles, iconColor: 'purple', title: 'テンプレートで簡単スタート', description: 'SaaSやECなど、用途別のテンプレートからすぐに始められます。' },
                { icon: Palette, iconColor: 'pink', title: 'デザインカスタマイズ', description: 'グラデーション、ボタンテキスト、アイコンを自由に変更できます。' },
              ],
            },
            {
              subtitle: '埋め込み・共有',
              items: [
                { icon: Zap, iconColor: 'amber', title: 'トリガー設定', description: '即時表示、遅延、スクロール、ボタンクリックから選べます。' },
                { icon: Share2, iconColor: 'green', title: '外部サイトに埋め込み', description: '保存後、iframe や JSスニペットで他サイトに埋め込めます。' },
              ],
            },
          ]}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
