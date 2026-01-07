'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { GamificationCampaign, StampRallySettings } from '@/lib/types';
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
} from 'lucide-react';

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
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(initialData?.id || null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // セクション開閉状態
  const [openSections, setOpenSections] = useState({
    basic: true,
    stamps: true,
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
      };
    }
    return {
      title: 'スタンプラリー',
      description: 'スタンプを集めて特典をゲット！',
      total_stamps: 10,
      points_per_stamp: 1,
      completion_bonus: 10,
      stamp_labels: Array.from({ length: 10 }, (_, i) => `スタンプ${i + 1}`),
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
              className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="スタンプラリーのタイトル"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">説明文</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-amber-500 outline-none"
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
              className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-amber-500 outline-none"
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
              className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-amber-500 outline-none"
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
      {showSuccessModal && savedId && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-fade-in">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-6 flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Trophy size={24} /> スタンプラリーを{savedId ? '更新' : '作成'}しました！
                </h3>
              </div>
              <button onClick={() => setShowSuccessModal(false)} className="text-white hover:bg-white/20 p-2 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-700 mb-2">公開URL</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/stamp-rally/${savedId}`}
                    readOnly
                    className="flex-1 text-xs bg-white border border-amber-300 p-2 rounded-lg text-gray-900 font-bold"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/stamp-rally/${savedId}`);
                      alert('URLをコピーしました！');
                    }}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-700"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* QRコード生成のヒント */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <QrCode size={18} />
                  <span className="font-bold text-sm">スタンプ用QRコード</span>
                </div>
                <p className="text-xs text-gray-500">
                  各スタンプポイントにQRコードを設置し、お客様がスキャンするとスタンプがゲットできます。
                  QRコードは管理画面から生成できます。
                </p>
              </div>

              <button
                onClick={() => window.open(`/stamp-rally/${savedId}`, '_blank')}
                className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-700 flex items-center justify-center gap-2"
              >
                <Share2 size={18} /> スタンプラリーページを開く
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


