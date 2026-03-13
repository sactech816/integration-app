'use client';

import React, { useState } from 'react';
import { ArrowLeft, Globe, Sparkles, Loader2, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface GeneratedConfig {
  name?: string;
  greeting?: string;
  personality?: string;
  knowledge_text?: string;
  faq_items?: { question: string; answer: string }[];
}

interface Props {
  onApply: (config: GeneratedConfig) => void;
  onBack: () => void;
}

export default function ConciergeAISetupPanel({ onApply, onBack }: Props) {
  const [sourceUrl, setSourceUrl] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedConfig | null>(null);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({
    name: true,
    greeting: true,
    personality: true,
    knowledge: true,
    faq: true,
  });

  const handleFetchUrl = async () => {
    if (!sourceUrl.trim()) return;
    setIsLoadingUrl(true);
    setError('');

    try {
      const res = await fetch('/api/concierge/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: sourceUrl.trim(),
          businessDescription: '',
          generateType: 'full',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'URLの読み込みに失敗しました');
      }

      const data = await res.json();
      setGenerated(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleGenerate = async () => {
    if (!businessDescription.trim() && !sourceUrl.trim()) {
      setError('ビジネスの説明またはURLを入力してください');
      return;
    }
    setIsGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/concierge/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessDescription: businessDescription.trim(),
          sourceUrl: sourceUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '生成に失敗しました');
      }

      const data = await res.json();
      setGenerated(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAll = () => {
    if (!generated) return;
    onApply(generated);
  };

  const handleApplyField = (field: string) => {
    if (!generated) return;
    const partial: GeneratedConfig = {};
    if (field === 'name' && generated.name) partial.name = generated.name;
    if (field === 'greeting' && generated.greeting) partial.greeting = generated.greeting;
    if (field === 'personality' && generated.personality) partial.personality = generated.personality;
    if (field === 'knowledge' && generated.knowledge_text) partial.knowledge_text = generated.knowledge_text;
    if (field === 'faq' && generated.faq_items) partial.faq_items = generated.faq_items;
    onApply(partial);
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            AIで自動生成
          </h2>
          <p className="text-sm text-gray-600">
            ビジネスの説明やサイトURLから、コンシェルジュの設定を自動生成します
          </p>
        </div>
      </div>

      {!generated ? (
        <div className="space-y-6">
          {/* URL入力 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              サイトURL（オプション）
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://example.com"
                className={inputClass}
              />
              <button
                onClick={handleFetchUrl}
                disabled={!sourceUrl.trim() || isLoadingUrl}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 whitespace-nowrap text-sm font-medium min-w-[100px]"
              >
                {isLoadingUrl ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  '読み込む'
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              サイトの内容を読み取って、ナレッジやFAQを自動生成します
            </p>
          </div>

          {/* テキスト入力 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ビジネスの説明
            </label>
            <textarea
              value={businessDescription}
              onChange={e => setBusinessDescription(e.target.value)}
              placeholder={"事業内容やサービスについて自由に記述してください。\n\n例:\n・コーチング事業を運営しています\n・メニューは個別セッション（月2回）とグループセッション\n・料金は月額19,800円〜\n・ターゲットは30-50代の女性起業家\n・無料相談から入会につなげたい"}
              rows={8}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">
              サービス内容、料金、ターゲット、営業時間など、できるだけ詳しく書くと精度が上がります
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {/* 生成ボタン */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!businessDescription.trim() && !sourceUrl.trim())}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-lg disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AIが生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                AIで自動生成する
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 生成結果プレビュー */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-teal-800 flex items-center gap-2">
              <Check className="w-4 h-4" />
              AIが設定内容を生成しました。確認して適用してください。
            </p>
          </div>

          {/* 各フィールドのプレビュー */}
          {generated.name && (
            <PreviewSection
              title="コンシェルジュ名"
              isOpen={showPreview.name}
              onToggle={() => setShowPreview(prev => ({ ...prev, name: !prev.name }))}
              onApply={() => handleApplyField('name')}
            >
              <p className="text-gray-900">{generated.name}</p>
            </PreviewSection>
          )}

          {generated.greeting && (
            <PreviewSection
              title="挨拶メッセージ"
              isOpen={showPreview.greeting}
              onToggle={() => setShowPreview(prev => ({ ...prev, greeting: !prev.greeting }))}
              onApply={() => handleApplyField('greeting')}
            >
              <p className="text-gray-900">{generated.greeting}</p>
            </PreviewSection>
          )}

          {generated.personality && (
            <PreviewSection
              title="性格・口調"
              isOpen={showPreview.personality}
              onToggle={() => setShowPreview(prev => ({ ...prev, personality: !prev.personality }))}
              onApply={() => handleApplyField('personality')}
            >
              <p className="text-gray-900">{generated.personality}</p>
            </PreviewSection>
          )}

          {generated.knowledge_text && (
            <PreviewSection
              title="ナレッジ"
              isOpen={showPreview.knowledge}
              onToggle={() => setShowPreview(prev => ({ ...prev, knowledge: !prev.knowledge }))}
              onApply={() => handleApplyField('knowledge')}
            >
              <pre className="text-gray-900 text-sm whitespace-pre-wrap font-sans">{generated.knowledge_text}</pre>
            </PreviewSection>
          )}

          {generated.faq_items && generated.faq_items.length > 0 && (
            <PreviewSection
              title={`FAQ（${generated.faq_items.length}件）`}
              isOpen={showPreview.faq}
              onToggle={() => setShowPreview(prev => ({ ...prev, faq: !prev.faq }))}
              onApply={() => handleApplyField('faq')}
            >
              <div className="space-y-3">
                {generated.faq_items.map((faq, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-sm font-medium text-gray-900 mb-1">Q: {faq.question}</p>
                    <p className="text-sm text-gray-600">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </PreviewSection>
          )}

          {/* アクションボタン */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setGenerated(null)}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              やり直す
            </button>
            <button
              onClick={handleApplyAll}
              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Check className="w-5 h-5" />
              すべて適用
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** プレビューセクション */
function PreviewSection({
  title,
  isOpen,
  onToggle,
  onApply,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  onApply: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onApply(); }}
          className="px-3 py-1 text-xs bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors font-medium"
        >
          この項目だけ適用
        </button>
      </div>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
