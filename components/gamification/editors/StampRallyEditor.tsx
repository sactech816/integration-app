'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  GamificationCampaign, 
  StampRallySettings, 
  StampTrigger,
  StampTriggerType,
  STAMP_PAGE_OPTIONS,
  STAMP_CONTENT_OPTIONS,
  STAMP_TRIGGER_TYPE_LABELS
} from '@/lib/types';
import EditorLayout from '../shared/EditorLayout';
import PhoneMockup from '../shared/PhoneMockup';
import StampRallyPreview from '../previews/StampRallyPreview';
import {
  Stamp,
  ChevronDown,
  ChevronUp,
  Settings,
  Gift,
  Trophy,
  Share2,
  Copy,
  X,
  QrCode,
  Target,
  Trash2,
  Plus,
} from 'lucide-react';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import OnboardingModal from '@/components/shared/OnboardingModal';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

interface StampRallyEditorProps {
  user: User | null;
  initialData?: GamificationCampaign | null;
  onBack: () => void;
  setShowAuth: (show: boolean) => void;
}

interface StampRallyFormData {
  title: string;
  description: string;
  total_stamps: number;
  points_per_stamp: number;
  completion_bonus: number;
  stamp_labels: string[];
  triggers: StampTrigger[];
}

// 折りたたみセクション
const Section = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  badge,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    <button
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOpen ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
    </button>
    {isOpen && <div className="p-5 border-t border-gray-100">{children}</div>}
  </div>
);

export default function StampRallyEditor({ user, initialData, onBack, setShowAuth }: StampRallyEditorProps) {
  const router = useRouter();
  const { showOnboarding, setShowOnboarding } = useOnboarding('gamification_stamprally_onboarding_dismissed', { skip: !!initialData });
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(initialData?.id || null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // セクション開閉状態
  const [openSections, setOpenSections] = useState({
    basic: true,
    stamps: true,
    triggers: true,
    rewards: false,
  });

  // フォーム状態
  const [form, setForm] = useState<StampRallyFormData>(() => {
    if (initialData) {
      const settings = initialData.settings as StampRallySettings;
      return {
        title: initialData.title || '',
        description: initialData.description || '',
        total_stamps: settings?.total_stamps || 10,
        points_per_stamp: settings?.points_per_stamp || 1,
        completion_bonus: settings?.completion_bonus || 10,
        stamp_labels: settings?.stamp_ids || [],
        triggers: settings?.triggers || [],
      };
    }
    return {
      title: 'スタンプラリー',
      description: 'スタンプを集めて特典をゲット！',
      total_stamps: 10,
      points_per_stamp: 1,
      completion_bonus: 10,
      stamp_labels: Array.from({ length: 10 }, (_, i) => `スタンプ${i + 1}`),
      triggers: [],
    };
  });

  // スタンプ数が変更されたらラベルも更新
  useEffect(() => {
    if (form.stamp_labels.length !== form.total_stamps) {
      const newLabels = Array.from({ length: form.total_stamps }, (_, i) => 
        form.stamp_labels[i] || `スタンプ${i + 1}`
      );
      setForm(prev => ({ ...prev, stamp_labels: newLabels }));
    }
  }, [form.total_stamps]);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  // トリガー追加
  const handleAddTrigger = () => {
    const newTrigger: StampTrigger = {
      id: `trigger_${Date.now()}`,
      type: 'page_view',
      target: '/faq',
      stamp_index: form.triggers.length,
      name: `スタンプ${form.triggers.length + 1}`,
    };
    setForm(prev => ({
      ...prev,
      triggers: [...prev.triggers, newTrigger],
    }));
  };

  // トリガー更新
  const handleUpdateTrigger = (index: number, updates: Partial<StampTrigger>) => {
    setForm(prev => {
      const newTriggers = [...prev.triggers];
      newTriggers[index] = { ...newTriggers[index], ...updates };
      return { ...prev, triggers: newTriggers };
    });
  };

  // トリガー削除
  const handleRemoveTrigger = (index: number) => {
    setForm(prev => {
      const newTriggers = prev.triggers.filter((_, i) => i !== index);
      // stamp_indexを再設定
      newTriggers.forEach((t, i) => {
        t.stamp_index = i;
        t.name = `スタンプ${i + 1}`;
      });
      return { ...prev, triggers: newTriggers };
    });
  };

  // 保存処理
  const handleSave = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!supabase) {
      alert('データベース接続エラー');
      return;
    }

    setIsSaving(true);

    try {
      const campaignData = {
        owner_id: user.id,
        title: form.title,
        description: form.description,
        campaign_type: 'stamp_rally',
        status: 'active',
        settings: {
          total_stamps: form.total_stamps,
          points_per_stamp: form.points_per_stamp,
          completion_bonus: form.completion_bonus,
          stamp_ids: form.stamp_labels.map((_, i) => `stamp_${i + 1}`),
          triggers: form.triggers,
        },
      };

      let campaignId = savedId;

      if (savedId) {
        await supabase
          .from('gamification_campaigns')
          .update(campaignData)
          .eq('id', savedId);
      } else {
        const { data, error } = await supabase
          .from('gamification_campaigns')
          .insert(campaignData)
          .select()
          .single();

        if (error) throw error;
        campaignId = data.id;
        setSavedId(data.id);
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Save error:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // 左パネル（編集フォーム）
  const leftPanel = (
    <>
      {/* 基本設定 */}
      <Section
        title="基本設定"
        icon={Settings}
        isOpen={openSections.basic}
        onToggle={() => toggleSection('basic')}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">タイトル</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="スタンプラリーのタイトル"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">説明文</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              rows={3}
              placeholder="スタンプラリーの説明"
            />
          </div>
        </div>
      </Section>

      {/* スタンプ設定 */}
      <Section
        title="スタンプ設定"
        icon={Stamp}
        isOpen={openSections.stamps}
        onToggle={() => toggleSection('stamps')}
        badge={`${form.total_stamps}個`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">スタンプの数</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={form.total_stamps}
                onChange={e => {
                  setForm(prev => ({ ...prev, total_stamps: parseInt(e.target.value) }));
                  resetPreview();
                }}
                min={3}
                max={20}
                className="flex-1"
              />
              <span className="w-12 text-center font-bold text-lg text-gray-900">{form.total_stamps}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">1スタンプあたりのポイント</label>
            <input
              type="number"
              value={form.points_per_stamp}
              onChange={e => setForm(prev => ({ ...prev, points_per_stamp: parseInt(e.target.value) || 0 }))}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              min={0}
            />
          </div>

          {/* スタンプグリッドプレビュー */}
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-sm font-bold text-amber-700 mb-3">スタンプカードプレビュー</p>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: form.total_stamps }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-white border-2 border-dashed border-amber-300 flex items-center justify-center text-amber-400 text-xs font-bold"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* スタンプ取得条件 */}
      <Section
        title="スタンプ取得条件"
        icon={Target}
        isOpen={openSections.triggers}
        onToggle={() => toggleSection('triggers')}
        badge={form.triggers.length > 0 ? `${form.triggers.length}件` : undefined}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              ユーザーがどのアクションでスタンプを取得できるか設定します
            </p>
            <button
              type="button"
              onClick={handleAddTrigger}
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 font-bold"
            >
              <Plus size={14} />
              条件を追加
            </button>
          </div>

          {form.triggers.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Target size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                条件を追加すると、ユーザーがその条件を満たした時にスタンプを取得できます
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {form.triggers.map((trigger, index) => {
                const isCustomPageView = trigger.type === 'page_view' && 
                  !STAMP_PAGE_OPTIONS.find(p => p.value === trigger.target && p.value !== 'custom');
                const isCustomContent = trigger.type === 'content_create' && 
                  !STAMP_CONTENT_OPTIONS.find(c => c.value === trigger.target && c.value !== 'custom');
                const needsUrlInput = trigger.type === 'quiz_play' || trigger.type === 'share' || isCustomPageView || isCustomContent;

                return (
                  <div key={trigger.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-amber-500 text-white rounded-full text-sm flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-bold text-gray-900 flex-1">スタンプ {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrigger(index)}
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* トリガータイプ選択 */}
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">取得条件</label>
                        <select
                          value={trigger.type}
                          onChange={(e) => {
                            const newType = e.target.value as StampTriggerType;
                            const defaultTarget = newType === 'page_view' ? '/faq' : 
                                                 newType === 'content_create' ? 'quiz' : '';
                            handleUpdateTrigger(index, { type: newType, target: defaultTarget });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-amber-500"
                        >
                          {Object.entries(STAMP_TRIGGER_TYPE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      {/* ページ閲覧の選択 */}
                      {trigger.type === 'page_view' && (
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">対象ページ</label>
                          <select
                            value={STAMP_PAGE_OPTIONS.find(p => p.value === trigger.target) ? trigger.target : 'custom'}
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                handleUpdateTrigger(index, { target: '' });
                              } else {
                                handleUpdateTrigger(index, { target: e.target.value });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-amber-500"
                          >
                            {STAMP_PAGE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* コンテンツ作成の選択 */}
                      {trigger.type === 'content_create' && (
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">作成コンテンツ</label>
                          <select
                            value={STAMP_CONTENT_OPTIONS.find(c => c.value === trigger.target) ? trigger.target : 'custom'}
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                handleUpdateTrigger(index, { target: '' });
                              } else {
                                handleUpdateTrigger(index, { target: e.target.value });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-amber-500"
                          >
                            {STAMP_CONTENT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* カスタムURL入力 */}
                      {needsUrlInput && (
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">
                            {trigger.type === 'quiz_play' ? 'クイズURL' :
                             trigger.type === 'share' ? 'シェア対象URL' :
                             'カスタムURL'}
                          </label>
                          <input
                            type="text"
                            value={trigger.target || ''}
                            onChange={(e) => handleUpdateTrigger(index, { target: e.target.value })}
                            placeholder={
                              trigger.type === 'quiz_play' ? '例: /quiz/xxx または https://...' :
                              trigger.type === 'share' ? '例: https://twitter.com/...' :
                              '例: /custom-page'
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <p className="font-bold mb-1">取得条件の種類:</p>
            <ul className="space-y-0.5">
              <li>• <strong>ページ閲覧</strong>: 指定ページを閲覧するとスタンプ取得</li>
              <li>• <strong>コンテンツ作成</strong>: 診断クイズやLPを作成するとスタンプ取得</li>
              <li>• <strong>クイズプレイ</strong>: 指定クイズをプレイするとスタンプ取得</li>
              <li>• <strong>SNSシェア</strong>: 指定URLをシェアするとスタンプ取得</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 特典設定 */}
      <Section
        title="コンプリート特典"
        icon={Gift}
        isOpen={openSections.rewards}
        onToggle={() => toggleSection('rewards')}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">コンプリートボーナスポイント</label>
            <input
              type="number"
              value={form.completion_bonus}
              onChange={e => setForm(prev => ({ ...prev, completion_bonus: parseInt(e.target.value) || 0 }))}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              min={0}
            />
            <p className="text-xs text-gray-500 mt-1">
              全スタンプを集めると追加で {form.completion_bonus} ポイントがもらえます
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-bold text-green-700 mb-2">獲得ポイントシミュレーション</p>
            <div className="text-sm text-green-600 space-y-1">
              <p>・スタンプ獲得: {form.points_per_stamp} pt × {form.total_stamps} = {form.points_per_stamp * form.total_stamps} pt</p>
              <p>・コンプリートボーナス: {form.completion_bonus} pt</p>
              <p className="font-bold pt-2 border-t border-green-200">
                合計: {form.points_per_stamp * form.total_stamps + form.completion_bonus} pt
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 保存ボタン */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-700 transition-all shadow-md text-lg disabled:opacity-50"
        >
          {savedId ? '更新して保存' : '保存して公開'}
        </button>
      </div>
    </>
  );

  // 右パネル（プレビュー）
  const rightPanel = (
    <PhoneMockup title="スタンプラリープレビュー" onReset={resetPreview}>
      <StampRallyPreview
        key={previewKey}
        title={form.title}
        description={form.description}
        totalStamps={form.total_stamps}
        pointsPerStamp={form.points_per_stamp}
        completionBonus={form.completion_bonus}
        isTestMode={true}
      />
    </PhoneMockup>
  );

  return (
    <>
      <EditorLayout
        title={savedId ? 'スタンプラリーを編集' : 'スタンプラリーを作成'}
        subtitle="リアルタイムプレビュー"
        onBack={onBack}
        onSave={handleSave}
        isSaving={isSaving}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        savedId={savedId}
      />

      {/* 保存成功モーダル */}
      <CreationCompleteModal
        isOpen={showSuccessModal && !!savedId}
        onClose={() => setShowSuccessModal(false)}
        title="スタンプラリー"
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/stamp-rally/${savedId}`}
        contentTitle={`${form.title || 'スタンプラリー'}に参加しよう！`}
        theme="amber"
      />

      {/* はじめかたガイド */}
      {showOnboarding && (
        <OnboardingModal
          storageKey="gamification_stamprally_onboarding_dismissed"
          title="スタンプラリーの設定"
          pages={[{
            subtitle: '基本的な操作をご紹介します',
            items: [
              { icon: Stamp, iconColor: 'amber', title: 'スタンプの設定', description: 'スタンプの総数やラベルを設定します。各スタンプにはトリガー条件（QRスキャン・ページ閲覧など）を設定できます。' },
              { icon: Gift, iconColor: 'purple', title: 'コンプリート報酬', description: '全スタンプ収集時のボーナスポイントを設定できます。各スタンプごとのポイントも個別に設定可能です。' },
              { icon: Target, iconColor: 'blue', title: 'トリガー設定', description: '各スタンプの取得条件を設定します。QRコード、特定ページ閲覧、特定コンテンツ利用など複数の条件に対応しています。' },
              { icon: Share2, iconColor: 'green', title: '共有とQRコード', description: '保存後、参加者向けURLやQRコードを生成できます。' },
            ],
          }]}
          gradientFrom="from-amber-500"
          gradientTo="to-orange-500"
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
}




