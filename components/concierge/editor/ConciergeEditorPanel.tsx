'use client';

import { useState } from 'react';
import {
  User, MessageSquare, Palette, Settings, BookOpen, Plus, Trash2,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface ConciergeConfig {
  name: string;
  greeting: string;
  personality: string;
  knowledge_text: string;
  faq_items: FAQItem[];
  avatar_style: { type: string; primaryColor: string };
  design: { position: string; bubbleSize: number; headerColor: string; fontFamily: string };
  settings: { dailyLimit: number; maxTokens: number; model: string; allowedTopics: string; blockedTopics: string };
  is_published: boolean;
  [key: string]: any;
}

interface Props {
  config: ConciergeConfig;
  onUpdate: (updates: Partial<ConciergeConfig>) => void;
}

type EditorTab = 'basic' | 'knowledge' | 'design' | 'settings';

const TABS: { id: EditorTab; label: string; icon: any }[] = [
  { id: 'basic', label: '基本設定', icon: User },
  { id: 'knowledge', label: 'ナレッジ', icon: BookOpen },
  { id: 'design', label: 'デザイン', icon: Palette },
  { id: 'settings', label: '設定', icon: Settings },
];

const COLOR_PRESETS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#6366F1',
];

export default function ConciergeEditorPanel({ config, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<EditorTab>('basic');

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div>
      {/* タブ */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-blue-700 shadow-sm'
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
                  config.is_published ? 'bg-blue-500' : 'bg-gray-300'
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

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                よくある質問（FAQ）
              </label>
              <button
                onClick={() => {
                  const newFaq = [...config.faq_items, { question: '', answer: '' }];
                  onUpdate({ faq_items: newFaq });
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium"
              >
                <Plus className="w-3 h-3" />
                追加
              </button>
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
                      <span className="text-xs font-semibold text-gray-500">Q{i + 1}</span>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      ? 'bg-blue-500 text-white shadow-md'
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
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              対応しないトピック
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                埋め込みコード
              </label>
              <div className="bg-gray-900 rounded-xl p-4">
                <code className="text-sm text-green-400 break-all">
                  {`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/concierge.js" data-id="${config.slug}"></script>`}
                </code>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                このコードをサイトの &lt;body&gt; 末尾に貼り付けてください
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
