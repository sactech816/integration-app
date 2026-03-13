'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import ConciergeEditorPanel from '@/components/concierge/editor/ConciergeEditorPanel';
import ConciergePreview from '@/components/concierge/editor/ConciergePreview';
import ConciergeTemplateSelector from '@/components/concierge/editor/ConciergeTemplateSelector';
import ConciergeAISetupPanel from '@/components/concierge/editor/ConciergeAISetupPanel';
import { Loader2, Save } from 'lucide-react';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import type { ConciergeTemplate } from '@/lib/concierge/templates';

interface ConciergeConfig {
  id?: string;
  name: string;
  greeting: string;
  personality: string;
  knowledge_text: string;
  faq_items: { question: string; answer: string }[];
  avatar_style: {
    type: string;
    primaryColor: string;
  };
  design: {
    position: string;
    bubbleSize: number;
    headerColor: string;
    fontFamily: string;
  };
  settings: {
    dailyLimit: number;
    maxTokens: number;
    model: string;
    allowedTopics: string;
    blockedTopics: string;
  };
  is_published: boolean;
  slug?: string;
}

const DEFAULT_CONFIG: ConciergeConfig = {
  name: 'アシスタント',
  greeting: 'こんにちは！何かお手伝いできることはありますか？',
  personality: '親切で丁寧、ですます調で話す',
  knowledge_text: '',
  faq_items: [],
  avatar_style: { type: 'default', primaryColor: '#3B82F6' },
  design: { position: 'bottom-right', bubbleSize: 56, headerColor: '#3B82F6', fontFamily: 'system' },
  settings: { dailyLimit: 50, maxTokens: 512, model: 'claude-haiku-4-5-20251001', allowedTopics: '', blockedTopics: '' },
  is_published: false,
};

function ConciergeEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('id');
  const isNew = searchParams.get('new') !== null;

  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setUser(null);
    router.push('/');
  };
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<ConciergeConfig>(DEFAULT_CONFIG);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isNewCreation, setIsNewCreation] = useState(!editId || isNew);

  // ステップ管理: 新規作成時はテンプレート選択から
  const [step, setStep] = useState<'template' | 'ai-setup' | 'editor'>(
    isNew && !editId ? 'template' : 'editor'
  );

  // AI設定モーダル（エディタ内から開く用）
  const [showAIModal, setShowAIModal] = useState(false);

  // モバイルタブ
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Auth
  useEffect(() => {
    if (!supabase) { setIsLoading(false); return; }
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (!session?.user) { setIsLoading(false); return; }

      if (editId && !isNew) {
        try {
          const res = await fetch(`/api/concierge/configs?id=${editId}`);
          if (res.ok) {
            const data = await res.json();
            setConfig(data);
          }
        } catch { /* ignore */ }
      }
      setIsLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, [editId, isNew]);

  const updateConfig = useCallback((updates: Partial<ConciergeConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSelectTemplate = useCallback((template: ConciergeTemplate | null) => {
    if (template) {
      setConfig(prev => ({
        ...prev,
        name: template.config.name,
        greeting: template.config.greeting,
        personality: template.config.personality,
        knowledge_text: template.config.knowledge_text,
        faq_items: template.config.faq_items,
      }));
    }
    setStep('editor');
  }, []);

  const handleAIGenerated = useCallback((generated: Partial<ConciergeConfig>) => {
    setConfig(prev => ({ ...prev, ...generated }));
    setStep('editor');
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const method = config.id ? 'PUT' : 'POST';
      const res = await fetch('/api/concierge/configs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error('保存に失敗しました');

      const saved = await res.json();
      setConfig(saved);

      if (!config.id) {
        // 新規作成 → URLを更新
        router.replace(`/concierge/editor?id=${saved.id}`);
        setIsNewCreation(false);
        setShowCompleteModal(true);
      } else {
        alert('更新しました！');
      }
    } catch (err: any) {
      alert(err.message || '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  }, [config, router]);

  if (isLoading) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <p className="text-gray-600">ログインが必要です</p>
          <button
            onClick={() => setShowAuth(true)}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl shadow-md hover:bg-teal-600 transition-all font-semibold"
          >
            ログイン
          </button>
        </div>
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          setUser={setUser}
          defaultTab="login"
        />
      </>
    );
  }

  // テンプレート選択ステップ
  if (step === 'template') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <div className="pt-8 pb-16 px-4">
          <ConciergeTemplateSelector
            onSelectTemplate={handleSelectTemplate}
            onSelectAI={() => setStep('ai-setup')}
          />
        </div>
      </div>
    );
  }

  // AI設定ステップ
  if (step === 'ai-setup') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <div className="pt-8 pb-16 px-4 max-w-3xl mx-auto">
          <ConciergeAISetupPanel
            onApply={handleAIGenerated}
            onBack={() => setStep('template')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      {/* エディタヘッダー */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">
              コンシェルジュメーカー
            </h1>
            {config.id && (
              <span className="text-xs text-gray-400">ID: {config.slug}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {config.id && config.slug && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/concierge/${config.slug}`
                  );
                  alert('URLをコピーしました');
                }}
                className="px-3 py-2 text-sm bg-green-50 border border-green-200 text-green-700 rounded-xl hover:bg-green-100 transition-all font-medium"
              >
                公開URLをコピー
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-xl shadow-md hover:bg-teal-700 transition-all font-semibold disabled:opacity-50 min-h-[44px] text-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '保存中...' : config.id ? '更新' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden sticky top-[121px] z-30 bg-white border-b border-gray-200">
        <div className="flex">
          {(['editor', 'preview'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                mobileTab === tab
                  ? 'text-teal-600 border-b-2 border-teal-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'editor' ? '編集' : 'プレビュー'}
            </button>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-screen-2xl mx-auto flex">
        {/* 左: エディタ */}
        <div className={`w-full lg:w-1/2 p-4 lg:p-6 pb-32 ${mobileTab !== 'editor' ? 'hidden lg:block' : ''}`}>
          <ConciergeEditorPanel
            config={config}
            onUpdate={updateConfig}
            onOpenAISetup={() => setShowAIModal(true)}
          />

          {/* sticky保存ボタン */}
          <div className="sticky bottom-4 mt-6 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-lg disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? '保存中...' : config.id ? '更新して保存' : '保存して公開'}
            </button>
          </div>
        </div>

        {/* 右: プレビュー */}
        <div className={`w-full lg:w-1/2 ${mobileTab !== 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)]">
            <ConciergePreview config={config} />
          </div>
        </div>
      </div>

      {/* AI設定モーダル */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 p-6">
            <ConciergeAISetupPanel
              onApply={(generated) => {
                updateConfig(generated);
                setShowAIModal(false);
              }}
              onBack={() => setShowAIModal(false)}
            />
          </div>
        </div>
      )}

      {/* 作成完了モーダル */}
      <CreationCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="コンシェルジュ"
        publicUrl={typeof window !== 'undefined' && config.slug ? `${window.location.origin}/concierge/${config.slug}` : ''}
        contentTitle={config.name}
        theme="teal"
      />
    </div>
  );
}

export default function ConciergeEditorPage() {
  return (
    <>
      <div className="pt-16">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        }>
          <ConciergeEditorContent />
        </Suspense>
      </div>
    </>
  );
}
