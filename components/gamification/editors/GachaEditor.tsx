'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { GamificationCampaign, GachaPrize, GachaSettings } from '@/lib/types';
import { validatePrizeProbabilities, autoAdjustProbabilities } from '@/lib/gamification/mockGacha';
import EditorLayout from '../shared/EditorLayout';
import PhoneMockup from '../shared/PhoneMockup';
import GachaPreview from '../previews/GachaPreview';
import {
  Gift,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Sparkles,
  Settings,
  Palette,
  AlertCircle,
  Trophy,
  Share2,
  Copy,
  X,
} from 'lucide-react';

interface GachaEditorProps {
  user: User | null;
  initialData?: GamificationCampaign | null;
  onBack: () => void;
  setShowAuth: (show: boolean) => void;
}

interface GachaPrizeForm {
  id: string;
  name: string;
  description: string;
  image_url: string;
  probability: number;
  is_winning: boolean;
  stock: number | null;
  display_order: number;
}

interface GachaFormData {
  title: string;
  description: string;
  animation_type: 'capsule' | 'roulette' | 'omikuji';
  cost_per_play: number;
  prizes: GachaPrizeForm[];
  theme_color: string;
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
        <div className={`p-2 rounded-lg ${isOpen ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
    </button>
    {isOpen && <div className="p-5 border-t border-gray-100">{children}</div>}
  </div>
);

export default function GachaEditor({ user, initialData, onBack, setShowAuth }: GachaEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(initialData?.id || null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // セクション開閉状態
  const [openSections, setOpenSections] = useState({
    basic: true,
    animation: false,
    prizes: true,
    advanced: false,
  });

  // フォーム状態
  const [form, setForm] = useState<GachaFormData>(() => {
    if (initialData) {
      const settings = initialData.settings as GachaSettings;
      return {
        title: initialData.title || '',
        description: initialData.description || '',
        animation_type: (initialData.animation_type as GachaFormData['animation_type']) || 'capsule',
        cost_per_play: settings?.cost_per_play || 10,
        prizes: [],
        theme_color: '#8B5CF6',
      };
    }
    return {
      title: '新しいガチャ',
      description: 'ポイントを使ってガチャを回そう！',
      animation_type: 'capsule',
      cost_per_play: 10,
      prizes: [
        { id: '1', name: '特賞', description: '豪華景品！', image_url: '', probability: 5, is_winning: true, stock: null, display_order: 0 },
        { id: '2', name: '1等', description: '素敵な景品', image_url: '', probability: 15, is_winning: true, stock: null, display_order: 1 },
        { id: '3', name: '2等', description: '参加賞', image_url: '', probability: 30, is_winning: false, stock: null, display_order: 2 },
        { id: '4', name: 'ハズレ', description: 'また挑戦してね！', image_url: '', probability: 50, is_winning: false, stock: null, display_order: 3 },
      ],
      theme_color: '#8B5CF6',
    };
  });

  // 初期データがある場合、景品を読み込む
  useEffect(() => {
    const loadPrizes = async () => {
      if (initialData?.id && supabase) {
        const { data: prizes } = await supabase
          .from('gacha_prizes')
          .select('*')
          .eq('campaign_id', initialData.id)
          .order('display_order');

        if (prizes && prizes.length > 0) {
          setForm(prev => ({
            ...prev,
            prizes: prizes.map(p => ({
              id: p.id,
              name: p.name,
              description: p.description || '',
              image_url: p.image_url || '',
              probability: p.probability,
              is_winning: p.is_winning,
              stock: p.stock,
              display_order: p.display_order,
            })),
          }));
        }
      }
    };
    loadPrizes();
  }, [initialData]);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  // 景品を追加
  const addPrize = () => {
    const newId = `new_${Date.now()}`;
    setForm(prev => ({
      ...prev,
      prizes: [
        ...prev.prizes,
        {
          id: newId,
          name: '新しい景品',
          description: '',
          image_url: '',
          probability: 0,
          is_winning: false,
          stock: null,
          display_order: prev.prizes.length,
        },
      ],
    }));
  };

  // 景品を削除
  const removePrize = (id: string) => {
    setForm(prev => ({
      ...prev,
      prizes: prev.prizes.filter(p => p.id !== id),
    }));
  };

  // 景品を更新
  const updatePrize = (id: string, updates: Partial<GachaPrizeForm>) => {
    setForm(prev => ({
      ...prev,
      prizes: prev.prizes.map(p => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  // 確率を自動調整
  const handleAutoAdjust = () => {
    const adjusted = autoAdjustProbabilities(form.prizes as GachaPrize[]);
    setForm(prev => ({ ...prev, prizes: adjusted as GachaPrizeForm[] }));
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

    // バリデーション
    const validation = validatePrizeProbabilities(form.prizes as GachaPrize[]);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    setIsSaving(true);

    try {
      const campaignData = {
        owner_id: user.id,
        title: form.title,
        description: form.description,
        campaign_type: 'gacha',
        status: 'active',
        animation_type: form.animation_type,
        settings: {
          cost_per_play: form.cost_per_play,
        },
      };

      let campaignId = savedId;

      if (savedId) {
        // 更新
        await supabase
          .from('gamification_campaigns')
          .update(campaignData)
          .eq('id', savedId);
      } else {
        // 新規作成
        const { data, error } = await supabase
          .from('gamification_campaigns')
          .insert(campaignData)
          .select()
          .single();

        if (error) throw error;
        campaignId = data.id;
        setSavedId(data.id);
      }

      // 既存の景品を削除
      await supabase
        .from('gacha_prizes')
        .delete()
        .eq('campaign_id', campaignId);

      // 景品を保存
      const prizesData = form.prizes.map((prize, index) => ({
        campaign_id: campaignId,
        name: prize.name,
        description: prize.description || null,
        image_url: prize.image_url || null,
        probability: prize.probability,
        is_winning: prize.is_winning,
        stock: prize.stock,
        display_order: index,
      }));

      await supabase.from('gacha_prizes').insert(prizesData);

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Save error:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // 確率チェック
  const probabilityValidation = validatePrizeProbabilities(form.prizes as GachaPrize[]);

  // プレビュー用のデータを構築
  const previewPrizes: GachaPrize[] = form.prizes.map((p, i) => ({
    id: p.id,
    campaign_id: savedId || 'preview',
    name: p.name,
    description: p.description,
    image_url: p.image_url,
    probability: p.probability,
    is_winning: p.is_winning,
    stock: p.stock,
    won_count: 0,
    display_order: i,
  }));

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
              className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="ガチャのタイトル"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">説明文</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-purple-500 outline-none"
              rows={3}
              placeholder="ガチャの説明"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">1回あたりの消費ポイント</label>
            <input
              type="number"
              value={form.cost_per_play}
              onChange={e => setForm(prev => ({ ...prev, cost_per_play: parseInt(e.target.value) || 0 }))}
              className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-purple-500 outline-none"
              min={0}
            />
          </div>
        </div>
      </Section>

      {/* アニメーション設定 */}
      <Section
        title="アニメーション"
        icon={Sparkles}
        isOpen={openSections.animation}
        onToggle={() => toggleSection('animation')}
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'capsule', label: 'カプセル', emoji: '🎰' },
            { id: 'roulette', label: 'ルーレット', emoji: '🎡' },
            { id: 'omikuji', label: 'おみくじ', emoji: '🎋' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => {
                setForm(prev => ({ ...prev, animation_type: type.id as GachaFormData['animation_type'] }));
                resetPreview();
              }}
              className={`
                p-4 rounded-xl border-2 text-center transition-all
                ${form.animation_type === type.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'}
              `}
            >
              <div className="text-3xl mb-2">{type.emoji}</div>
              <div className={`text-sm font-bold ${form.animation_type === type.id ? 'text-purple-700' : 'text-gray-600'}`}>
                {type.label}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* 景品設定 */}
      <Section
        title="景品設定"
        icon={Gift}
        isOpen={openSections.prizes}
        onToggle={() => toggleSection('prizes')}
        badge={`${form.prizes.length}件`}
      >
        {/* 確率バリデーション */}
        <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
          probabilityValidation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {probabilityValidation.isValid ? (
              <Sparkles size={16} className="text-green-600" />
            ) : (
              <AlertCircle size={16} className="text-red-600" />
            )}
            <span className={`text-sm font-medium ${probabilityValidation.isValid ? 'text-green-700' : 'text-red-700'}`}>
              確率合計: {probabilityValidation.total.toFixed(1)}%
            </span>
          </div>
          {!probabilityValidation.isValid && (
            <button
              onClick={handleAutoAdjust}
              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
            >
              自動調整
            </button>
          )}
        </div>

        {/* 景品リスト */}
        <div className="space-y-3">
          {form.prizes.map((prize, index) => (
            <div
              key={prize.id}
              className={`p-4 rounded-xl border-2 ${
                prize.is_winning ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 画像プレビュー */}
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {prize.image_url ? (
                    <img src={prize.image_url} alt={prize.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-gray-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  {/* 景品名 */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={prize.name}
                      onChange={e => updatePrize(prize.id, { name: e.target.value })}
                      className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm font-bold"
                      placeholder="景品名"
                    />
                    <button
                      onClick={() => removePrize(prize.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* 確率・当たりフラグ */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">確率</label>
                      <input
                        type="number"
                        value={prize.probability}
                        onChange={e => updatePrize(prize.id, { probability: parseFloat(e.target.value) || 0 })}
                        className="w-20 border border-gray-300 px-2 py-1 rounded text-sm text-center"
                        min={0}
                        max={100}
                        step={0.1}
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prize.is_winning}
                        onChange={e => updatePrize(prize.id, { is_winning: e.target.checked })}
                        className="w-4 h-4 text-yellow-500 rounded"
                      />
                      <span className="text-xs font-medium text-yellow-700">当たり</span>
                    </label>
                  </div>

                  {/* 画像URL */}
                  <input
                    type="text"
                    value={prize.image_url}
                    onChange={e => updatePrize(prize.id, { image_url: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-1 rounded text-xs text-gray-600"
                    placeholder="画像URL（任意）"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 景品追加ボタン */}
        <button
          onClick={addPrize}
          className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          景品を追加
        </button>
      </Section>

      {/* 保存ボタン（下部固定） */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving || !probabilityValidation.isValid}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all shadow-md text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savedId ? '更新して保存' : '保存して公開'}
        </button>
      </div>
    </>
  );

  // 右パネル（プレビュー）
  const rightPanel = (
    <PhoneMockup title="ガチャプレビュー" onReset={resetPreview}>
      <GachaPreview
        key={previewKey}
        title={form.title}
        description={form.description}
        animationType={form.animation_type}
        costPerPlay={form.cost_per_play}
        prizes={previewPrizes}
        isTestMode={true}
      />
    </PhoneMockup>
  );

  return (
    <>
      <EditorLayout
        title={savedId ? 'ガチャを編集' : 'ガチャを作成'}
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
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-6 flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Trophy size={24} /> ガチャを{savedId ? '更新' : '作成'}しました！
                </h3>
              </div>
              <button onClick={() => setShowSuccessModal(false)} className="text-white hover:bg-white/20 p-2 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-700 mb-2">公開URL</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/gacha/${savedId}`}
                    readOnly
                    className="flex-1 text-xs bg-white border border-purple-300 p-2 rounded-lg text-gray-900 font-bold"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/gacha/${savedId}`);
                      alert('URLをコピーしました！');
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => window.open(`/gacha/${savedId}`, '_blank')}
                className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Share2 size={18} /> ガチャページを開く
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


