'use client';

import { useState, useRef } from 'react';
import {
  User, MessageSquare, Palette, Settings, BookOpen, Plus, Trash2, Sparkles, ShieldCheck, Upload, ImageIcon,
  Phone, Mail, ExternalLink, Clock, Globe, Loader2, X, ChevronDown, ChevronUp, Tag,
} from 'lucide-react';
import ConciergeEmbedCodeGenerator from './ConciergeEmbedCodeGenerator';
import ConciergeAvatar from '../ConciergeAvatar';
import { AVATAR_PRESETS, normalizeAvatarStyle } from '../types';
import type { AvatarType, AvatarShape, CustomImageShape } from '../types';
import { supabase } from '@/lib/supabase';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface SitePage {
  url: string;
  title: string;
  description?: string;
}

interface ConciergeConfig {
  name: string;
  greeting: string;
  personality: string;
  knowledge_text: string;
  faq_items: FAQItem[];
  site_pages?: SitePage[];
  avatar_style: { type: string; primaryColor: string; shape?: string; aspectRatio?: number; customImageUrl?: string; customImageShape?: string };
  design: { position: string; bubbleSize: number; headerColor: string; fontFamily: string };
  settings: {
    dailyLimit: number; maxTokens: number; model: string;
    allowedTopics: string; blockedTopics: string;
    outOfScopeResponse: string; uncertainResponse: string;
    requireAccuracyTopics: string; prohibitedBehaviors: string;
    escalationMessage: string;
    contactFormUrl?: string;
    contactPhone?: string;
    contactEmail?: string;
    contactBusinessHours?: string;
  };
  is_published: boolean;
  [key: string]: any;
}

interface Props {
  config: ConciergeConfig;
  onUpdate: (updates: Partial<ConciergeConfig>) => void;
  onOpenAISetup?: () => void;
}

type EditorTab = 'basic' | 'knowledge' | 'guardrails' | 'design' | 'settings';

const TABS: { id: EditorTab; label: string; icon: any }[] = [
  { id: 'basic', label: '基本設定', icon: User },
  { id: 'knowledge', label: 'ナレッジ', icon: BookOpen },
  { id: 'guardrails', label: '回答制御', icon: ShieldCheck },
  { id: 'design', label: 'デザイン', icon: Palette },
  { id: 'settings', label: '設定', icon: Settings },
];

const COLOR_PRESETS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#6366F1',
];

const FAQ_CATEGORIES = ['一般', 'サービス', '料金', '技術', 'サポート', 'その他'];

export default function ConciergeEditorPanel({ config, onUpdate, onOpenAISetup }: Props) {
  const [activeTab, setActiveTab] = useState<EditorTab>('basic');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // サイトマップインポート状態
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [importingSitemap, setImportingSitemap] = useState(false);
  const [sitemapError, setSitemapError] = useState('');

  // FAQ AI生成状態
  const [generatingFaq, setGeneratingFaq] = useState(false);

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";

  // FAQのカテゴリ一覧を取得（設定済み + デフォルト）
  const usedCategories = [...new Set([
    ...FAQ_CATEGORIES,
    ...config.faq_items.map(f => f.category).filter(Boolean) as string[],
  ])];

  /** サイトマップ読み込み */
  const handleImportSitemap = async () => {
    if (!sitemapUrl.trim()) return;
    setImportingSitemap(true);
    setSitemapError('');

    try {
      const res = await fetch('/api/concierge/import-sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sitemapUrl: sitemapUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const existingPages = config.site_pages || [];
      const existingUrls = new Set(existingPages.map(p => p.url));
      const newPages = (data.pages as SitePage[]).filter(p => !existingUrls.has(p.url));

      onUpdate({ site_pages: [...existingPages, ...newPages] });
      setSitemapUrl('');
      alert(`${newPages.length}ページの情報を読み込みました（合計${existingPages.length + newPages.length}ページ）`);
    } catch (err: any) {
      setSitemapError(err.message || '読み込みに失敗しました');
    } finally {
      setImportingSitemap(false);
    }
  };

  /** AIでFAQを自動生成（ナレッジテキストから） */
  const handleGenerateFaq = async () => {
    if (!config.knowledge_text?.trim()) {
      alert('先にナレッジを入力してください。ナレッジの内容からFAQを自動生成します。');
      return;
    }
    setGeneratingFaq(true);

    try {
      const res = await fetch('/api/concierge/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessDescription: config.knowledge_text,
          generateType: 'faq',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newFaqs: FAQItem[] = (data.faq_items || data || []).map((f: any) => ({
        question: f.question,
        answer: f.answer,
        category: f.category || '一般',
      }));

      if (newFaqs.length > 0) {
        onUpdate({ faq_items: [...config.faq_items, ...newFaqs] });
        alert(`${newFaqs.length}件のFAQを生成しました`);
      }
    } catch (err: any) {
      alert(`FAQ生成エラー: ${err.message}`);
    } finally {
      setGeneratingFaq(false);
    }
  };

  return (
    <div>
      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* 基本設定 */}
      {activeTab === 'basic' && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              コンシェルジュ名
            </label>
            <input
              type="text"
              value={config.name}
              onChange={e => onUpdate({ name: e.target.value })}
              placeholder="例: サポートくん、AIアシスタント"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              挨拶メッセージ
            </label>
            <textarea
              value={config.greeting}
              onChange={e => onUpdate({ greeting: e.target.value })}
              placeholder="最初に表示されるメッセージ"
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              性格・口調
            </label>
            <textarea
              value={config.personality}
              onChange={e => onUpdate({ personality: e.target.value })}
              placeholder="例: 親切で明るい性格。敬語（ですます調）で話す。専門用語は避けてわかりやすく説明する。"
              rows={4}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">
              AIの性格や話し方を自由に設定できます
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              公開状態
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpdate({ is_published: !config.is_published })}
                className={`relative w-12 h-7 rounded-full transition-all ${
                  config.is_published ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${
                  config.is_published ? 'left-[22px]' : 'left-0.5'
                }`} />
              </button>
              <span className="text-sm text-gray-600">
                {config.is_published ? '公開中' : '非公開'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ナレッジ */}
      {activeTab === 'knowledge' && (
        <div className="space-y-5">
          {/* AI生成ボタン */}
          {onOpenAISetup && (
            <button
              onClick={onOpenAISetup}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 text-teal-700 rounded-xl hover:border-teal-400 hover:shadow-md transition-all font-semibold text-sm"
            >
              <Sparkles className="w-4 h-4" />
              AIでナレッジ・FAQを自動生成する
            </button>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ナレッジ（知識ベース）
            </label>
            <textarea
              value={config.knowledge_text}
              onChange={e => onUpdate({ knowledge_text: e.target.value })}
              placeholder="コンシェルジュが回答に使う情報を入力してください。&#10;&#10;例:&#10;・営業時間: 10:00-18:00（土日祝休み）&#10;・サービス内容: Webデザイン、ロゴ制作、名刺デザイン&#10;・料金: ロゴ制作 ¥50,000〜、名刺 ¥10,000〜"
              rows={10}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">
              ここに書いた内容をもとにAIが回答します
            </p>
          </div>

          {/* サイトマップ読み込み */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
            <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              サイトマップからページ情報を読み込む
            </h4>
            <p className="text-xs text-indigo-600 mb-3">
              サイトマップURL（例: https://example.com/sitemap.xml）を入力すると、各ページのタイトル・説明を自動取得してAIの知識に追加します。
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={sitemapUrl}
                onChange={e => setSitemapUrl(e.target.value)}
                placeholder="https://example.com/sitemap.xml"
                className="flex-1 px-3 py-2.5 border border-indigo-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={handleImportSitemap}
                disabled={importingSitemap || !sitemapUrl.trim()}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
              >
                {importingSitemap ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    読込中
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    読み込む
                  </>
                )}
              </button>
            </div>
            {sitemapError && (
              <p className="text-xs text-red-600 mt-2">{sitemapError}</p>
            )}

            {/* 読み込み済みページ一覧 */}
            {config.site_pages && config.site_pages.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-700">
                    読み込み済み: {config.site_pages.length}ページ
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('読み込んだページ情報をすべて削除しますか？')) {
                        onUpdate({ site_pages: [] });
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    すべて削除
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {config.site_pages.map((page, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-1.5 text-xs border border-indigo-100">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{page.title}</p>
                        <p className="text-gray-400 truncate">{page.url}</p>
                      </div>
                      <button
                        onClick={() => {
                          const newPages = config.site_pages!.filter((_, idx) => idx !== i);
                          onUpdate({ site_pages: newPages });
                        }}
                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                よくある質問（FAQ）
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateFaq}
                  disabled={generatingFaq}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all font-medium disabled:opacity-50"
                >
                  {generatingFaq ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  AI生成
                </button>
                <button
                  onClick={() => {
                    const newFaq = [...config.faq_items, { question: '', answer: '', category: '一般' }];
                    onUpdate({ faq_items: newFaq });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-all font-medium"
                >
                  <Plus className="w-3 h-3" />
                  追加
                </button>
              </div>
            </div>
            {config.faq_items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                FAQを追加すると、AIがより正確に回答できます
              </p>
            ) : (
              <div className="space-y-3">
                {config.faq_items.map((faq, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">Q{i + 1}</span>
                        {/* カテゴリ選択 */}
                        <select
                          value={faq.category || '一般'}
                          onChange={e => {
                            const newFaq = [...config.faq_items];
                            newFaq[i] = { ...newFaq[i], category: e.target.value };
                            onUpdate({ faq_items: newFaq });
                          }}
                          className="px-2 py-0.5 text-[10px] rounded-md border border-gray-300 text-gray-600 bg-white focus:ring-1 focus:ring-teal-500"
                        >
                          {usedCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          const newFaq = config.faq_items.filter((_, idx) => idx !== i);
                          onUpdate({ faq_items: newFaq });
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={e => {
                        const newFaq = [...config.faq_items];
                        newFaq[i] = { ...newFaq[i], question: e.target.value };
                        onUpdate({ faq_items: newFaq });
                      }}
                      placeholder="質問"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 mb-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={e => {
                        const newFaq = [...config.faq_items];
                        newFaq[i] = { ...newFaq[i], answer: e.target.value };
                        onUpdate({ faq_items: newFaq });
                      }}
                      placeholder="回答"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* デザイン */}
      {activeTab === 'design' && (
        <div className="space-y-5">
          {/* アバタータイプ選択 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              アバタータイプ
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_PRESETS.map(preset => {
                const isSelected = normalizeAvatarStyle(config.avatar_style).type === preset.type;
                return (
                  <button
                    key={preset.type}
                    onClick={() => onUpdate({
                      avatar_style: { ...config.avatar_style, type: preset.type },
                    })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                      isSelected ? 'border-teal-500 bg-teal-50 shadow-md scale-105' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <ConciergeAvatar
                      state="idle"
                      size={40}
                      avatarStyle={{ ...config.avatar_style, type: preset.type }}
                    />
                    <span className="text-[10px] font-medium text-gray-700">{preset.label}</span>
                  </button>
                );
              })}
              {/* カスタム画像 */}
              <button
                onClick={() => {
                  onUpdate({ avatar_style: { ...config.avatar_style, type: 'custom' } });
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  normalizeAvatarStyle(config.avatar_style).type === 'custom' ? 'border-teal-500 bg-teal-50 shadow-md scale-105' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {config.avatar_style.customImageUrl ? (
                  <ConciergeAvatar
                    state="idle"
                    size={40}
                    avatarStyle={{ ...config.avatar_style, type: 'custom' }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <span className="text-[10px] font-medium text-gray-700">カスタム</span>
              </button>
            </div>
          </div>

          {/* カスタム画像アップロード（type=custom時のみ） */}
          {normalizeAvatarStyle(config.avatar_style).type === 'custom' && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                アバター画像
              </label>
              {config.avatar_style.customImageUrl && (
                <div className="flex justify-center">
                  <ConciergeAvatar
                    state="idle"
                    size={80}
                    avatarStyle={config.avatar_style}
                  />
                </div>
              )}
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !supabase) return;
                  if (file.size > 2 * 1024 * 1024) {
                    alert('ファイルサイズは2MB以下にしてください');
                    return;
                  }
                  setUploadingAvatar(true);
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    const ext = file.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
                    const filePath = `concierge/${user?.id || 'anonymous'}/${fileName}`;
                    const { error: uploadError } = await supabase.storage
                      .from('profile-uploads')
                      .upload(filePath, file);
                    if (uploadError) throw uploadError;
                    const { data } = supabase.storage
                      .from('profile-uploads')
                      .getPublicUrl(filePath);
                    onUpdate({
                      avatar_style: { ...config.avatar_style, type: 'custom', customImageUrl: data.publicUrl },
                    });
                  } catch (err) {
                    console.error('アバター画像アップロードエラー:', err);
                    alert('画像のアップロードに失敗しました');
                  } finally {
                    setUploadingAvatar(false);
                  }
                }}
              />
              <button
                onClick={() => avatarFileRef.current?.click()}
                disabled={uploadingAvatar}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploadingAvatar ? 'アップロード中...' : '画像を選択（2MB以下）'}
              </button>

              {/* 切り抜き形 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">切り抜き形</label>
                <div className="flex gap-2">
                  {([
                    { value: 'circle', label: '丸' },
                    { value: 'rounded', label: '角丸' },
                    { value: 'square', label: '四角' },
                  ] as { value: CustomImageShape; label: string }[]).map(s => (
                    <button
                      key={s.value}
                      onClick={() => onUpdate({
                        avatar_style: { ...config.avatar_style, customImageShape: s.value },
                      })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        (config.avatar_style.customImageShape || 'circle') === s.value
                          ? 'bg-teal-500 text-white shadow-sm'
                          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 形状セレクタ（プリセットアバター時のみ） */}
          {normalizeAvatarStyle(config.avatar_style).type !== 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                顔の形
              </label>
              <div className="flex gap-2">
                {([
                  { value: 'circle', label: '丸' },
                  { value: 'rounded', label: '角丸四角' },
                  { value: 'egg', label: 'たまご型' },
                ] as { value: AvatarShape; label: string }[]).map(s => (
                  <button
                    key={s.value}
                    onClick={() => onUpdate({
                      avatar_style: { ...config.avatar_style, shape: s.value },
                    })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      (config.avatar_style.shape || 'circle') === s.value
                        ? 'bg-teal-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 縦横比スライダー */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              縦横比
            </label>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">横長</span>
              <input
                type="range"
                min="0.85"
                max="1.15"
                step="0.01"
                value={config.avatar_style.aspectRatio ?? 1.0}
                onChange={e => onUpdate({
                  avatar_style: { ...config.avatar_style, aspectRatio: parseFloat(e.target.value) },
                })}
                className="flex-1"
              />
              <span className="text-xs text-gray-500">縦長</span>
              <span className="text-xs text-gray-600 w-8 text-right">{(config.avatar_style.aspectRatio ?? 1.0).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              テーマカラー
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map(color => (
                <button
                  key={color}
                  onClick={() => onUpdate({
                    avatar_style: { ...config.avatar_style, primaryColor: color },
                    design: { ...config.design, headerColor: color },
                  })}
                  className={`w-10 h-10 rounded-xl border-2 transition-all ${
                    config.avatar_style.primaryColor === color
                      ? 'border-gray-800 scale-110 shadow-md'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">カスタム:</span>
              <input
                type="color"
                value={config.avatar_style.primaryColor}
                onChange={e => onUpdate({
                  avatar_style: { ...config.avatar_style, primaryColor: e.target.value },
                  design: { ...config.design, headerColor: e.target.value },
                })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              バブルサイズ
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="44"
                max="72"
                value={config.design.bubbleSize}
                onChange={e => onUpdate({
                  design: { ...config.design, bubbleSize: parseInt(e.target.value) },
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-10 text-right">{config.design.bubbleSize}px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              表示位置
            </label>
            <div className="flex gap-2">
              {[
                { value: 'bottom-right', label: '右下' },
                { value: 'bottom-left', label: '左下' },
              ].map(pos => (
                <button
                  key={pos.value}
                  onClick={() => onUpdate({
                    design: { ...config.design, position: pos.value },
                  })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    config.design.position === pos.value
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 回答制御 */}
      {activeTab === 'guardrails' && (
        <div className="space-y-5">
          {/* 説明 */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <p className="text-sm text-teal-800">
              AIの回答品質を管理する設定です。あらかじめ適切な初期値が入っています。必要に応じて修正してください。
            </p>
          </div>

          {/* 対応範囲 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">1</span>
              対応範囲
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  対応するトピック
                </label>
                <textarea
                  value={config.settings.allowedTopics}
                  onChange={e => onUpdate({
                    settings: { ...config.settings, allowedTopics: e.target.value },
                  })}
                  placeholder="例: 商品・サービスについて、料金プラン、営業時間、お問い合わせ方法"
                  rows={3}
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 mt-1">
                  AIが回答してよいトピック。空欄の場合はナレッジに基づくすべての質問に対応します
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  対応しないトピック（NGキーワード）
                </label>
                <textarea
                  value={config.settings.blockedTopics}
                  onChange={e => onUpdate({
                    settings: { ...config.settings, blockedTopics: e.target.value },
                  })}
                  placeholder="例: 競合他社の情報、政治・宗教の話題、個人情報"
                  rows={3}
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 mt-1">
                  これらのトピックに関する質問にはAIが回答を拒否します
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  対応範囲外の質問への回答テンプレート
                </label>
                <textarea
                  value={config.settings.outOfScopeResponse}
                  onChange={e => onUpdate({
                    settings: { ...config.settings, outOfScopeResponse: e.target.value },
                  })}
                  placeholder="例: 申し訳ございませんが、そちらのご質問には対応しておりません。"
                  rows={3}
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 mt-1">
                  NGトピックや無関係な質問を受けた時にAIが使う定型文
                </p>
              </div>
            </div>
          </div>

          {/* 回答の正確性 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">2</span>
              回答の正確性
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  正確性が必要なトピック
                </label>
                <textarea
                  value={config.settings.requireAccuracyTopics}
                  onChange={e => onUpdate({
                    settings: { ...config.settings, requireAccuracyTopics: e.target.value },
                  })}
                  placeholder="例: 料金・価格、契約条件、返品ポリシー"
                  rows={3}
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 mt-1">
                  これらのトピックではAIがナレッジに明記された内容のみ回答し、不明な場合は確認を促します
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  確信が持てない場合の注意書き
                </label>
                <textarea
                  value={config.settings.uncertainResponse}
                  onChange={e => onUpdate({
                    settings: { ...config.settings, uncertainResponse: e.target.value },
                  })}
                  placeholder="例: ※こちらは参考情報です。正確な内容はお問い合わせください。"
                  rows={2}
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 mt-1">
                  ナレッジに明確な情報がない場合、AIがこの注意書きを回答に付けます
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  人間への引き継ぎメッセージ
                </label>
                <textarea
                  value={config.settings.escalationMessage}
                  onChange={e => onUpdate({
                    settings: { ...config.settings, escalationMessage: e.target.value },
                  })}
                  placeholder="例: こちらの件は直接お問い合わせください。"
                  rows={2}
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 mt-1">
                  AIが回答できない複雑な質問を受けた時に、人間対応を案内する定型文
                </p>
              </div>
            </div>
          </div>

          {/* お問い合わせ先設定 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
              お問い合わせ先
            </h4>
            <p className="text-xs text-blue-600 mb-4">
              設定すると、AIが対応できない質問の場合に自動でお問い合わせカードを表示します。少なくとも1つ入力してください。
            </p>

            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                  お問い合わせフォームURL
                </label>
                <input
                  type="url"
                  value={config.settings.contactFormUrl || ''}
                  onChange={e => onUpdate({
                    settings: { ...config.settings, contactFormUrl: e.target.value },
                  })}
                  placeholder="https://example.com/contact"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  電話番号
                </label>
                <input
                  type="tel"
                  value={config.settings.contactPhone || ''}
                  onChange={e => onUpdate({
                    settings: { ...config.settings, contactPhone: e.target.value },
                  })}
                  placeholder="03-1234-5678"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={config.settings.contactEmail || ''}
                  onChange={e => onUpdate({
                    settings: { ...config.settings, contactEmail: e.target.value },
                  })}
                  placeholder="support@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  営業時間
                </label>
                <input
                  type="text"
                  value={config.settings.contactBusinessHours || ''}
                  onChange={e => onUpdate({
                    settings: { ...config.settings, contactBusinessHours: e.target.value },
                  })}
                  placeholder="平日 10:00-18:00（土日祝休み）"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* 禁止行動 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">4</span>
              AIの禁止行動
            </h4>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                AIが絶対にしてはいけないこと
              </label>
              <textarea
                value={config.settings.prohibitedBehaviors}
                onChange={e => onUpdate({
                  settings: { ...config.settings, prohibitedBehaviors: e.target.value },
                })}
                placeholder="例: 虚偽の情報を断定的に伝えること、個人情報を聞き出すこと"
                rows={4}
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">
                カンマ区切りで記述。AIはこれらの行動を絶対に行いません
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 設定 */}
      {activeTab === 'settings' && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              1日あたりのメッセージ上限
            </label>
            <input
              type="number"
              value={config.settings.dailyLimit}
              onChange={e => onUpdate({
                settings: { ...config.settings, dailyLimit: parseInt(e.target.value) || 50 },
              })}
              min={1}
              max={500}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">
              訪問者1人あたりの1日の質問回数制限
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              AIモデル
            </label>
            <select
              value={config.settings.model}
              onChange={e => onUpdate({
                settings: { ...config.settings, model: e.target.value },
              })}
              className={inputClass}
            >
              <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5（高速・低コスト）</option>
              <option value="gpt-4o-mini">GPT-4o mini（高速・低コスト）</option>
            </select>
          </div>

          {/* 埋め込みコード */}
          {config.slug && (
            <ConciergeEmbedCodeGenerator
              slug={config.slug}
              name={config.name}
            />
          )}
        </div>
      )}
    </div>
  );
}
