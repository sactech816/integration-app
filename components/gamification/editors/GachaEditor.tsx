'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { GamificationCampaign, GachaPrize, GachaSettings, CampaignType } from '@/lib/types';
import { validatePrizeProbabilities, autoAdjustProbabilities } from '@/lib/gamification/mockGacha';
import EditorLayout from '../shared/EditorLayout';
import PhoneMockup from '../shared/PhoneMockup';
import GamePreview from '../previews/GamePreview';
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
  CreditCard,
  Zap,
} from 'lucide-react';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import OnboardingModal from '@/components/shared/OnboardingModal';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import { usePoints } from '@/lib/hooks/usePoints';

// ゲームタイプ設定
type GameType = 'gacha' | 'scratch' | 'fukubiki' | 'slot';

interface GameTypeConfig {
  title: string;
  defaultTitle: string;
  defaultDescription: string;
  urlPath: string;
  color: string;
  icon: React.ElementType;
  animationOptions?: { id: string; label: string; emoji: string }[];
}

const GAME_TYPE_CONFIGS: Record<GameType, GameTypeConfig> = {
  gacha: {
    title: 'ガチャ',
    defaultTitle: '新しいガチャ',
    defaultDescription: 'ポイントを使ってガチャを回そう！',
    urlPath: 'gacha',
    color: 'purple',
    icon: Gift,
    animationOptions: [
      { id: 'capsule', label: 'カプセル', emoji: '🎰' },
      { id: 'roulette', label: 'ルーレット', emoji: '🎡' },
      { id: 'omikuji', label: 'おみくじ', emoji: '🎋' },
    ],
  },
  scratch: {
    title: 'スクラッチ',
    defaultTitle: '新しいスクラッチ',
    defaultDescription: '削って当たりを狙おう！',
    urlPath: 'scratch',
    color: 'amber',
    icon: CreditCard,
  },
  fukubiki: {
    title: '福引',
    defaultTitle: '新しい福引',
    defaultDescription: 'ガラガラ回して当てよう！',
    urlPath: 'fukubiki',
    color: 'pink',
    icon: Sparkles,
  },
  slot: {
    title: 'スロット',
    defaultTitle: '新しいスロット',
    defaultDescription: '揃えて大当たり！',
    urlPath: 'slot',
    color: 'red',
    icon: Zap,
  },
};

interface GachaEditorProps {
  user: User | null;
  initialData?: GamificationCampaign | null;
  onBack: () => void;
  setShowAuth: (show: boolean) => void;
  gameType?: GameType;
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
  point_reward?: number; // ポイント報酬（当選時に付与）
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
  colorClass = 'bg-purple-100 text-purple-600',
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  colorClass?: string;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    <button
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOpen ? colorClass : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>{badge}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
    </button>
    {isOpen && <div className="p-5 border-t border-gray-100">{children}</div>}
  </div>
);

// デフォルトの景品（ポイント報酬付き）
const getDefaultPrizes = (gameType: GameType): GachaPrizeForm[] => {
  switch (gameType) {
    case 'slot':
      return [
        { id: '1', name: 'ジャックポット', description: '200pt獲得！', image_url: '', probability: 2, is_winning: true, stock: null, display_order: 0, point_reward: 200 },
        { id: '2', name: '大当たり', description: '100pt獲得！', image_url: '', probability: 5, is_winning: true, stock: null, display_order: 1, point_reward: 100 },
        { id: '3', name: '中当たり', description: '50pt獲得！', image_url: '', probability: 10, is_winning: true, stock: null, display_order: 2, point_reward: 50 },
        { id: '4', name: '小当たり', description: '20pt獲得！', image_url: '', probability: 20, is_winning: true, stock: null, display_order: 3, point_reward: 20 },
        { id: '5', name: 'ハズレ', description: 'また挑戦してね！', image_url: '', probability: 63, is_winning: false, stock: null, display_order: 4, point_reward: 0 },
      ];
    case 'scratch':
      return [
        { id: '1', name: '大当たり', description: '100pt獲得！', image_url: '', probability: 3, is_winning: true, stock: null, display_order: 0, point_reward: 100 },
        { id: '2', name: '中当たり', description: '50pt獲得！', image_url: '', probability: 10, is_winning: true, stock: null, display_order: 1, point_reward: 50 },
        { id: '3', name: '小当たり', description: '30pt獲得！', image_url: '', probability: 20, is_winning: true, stock: null, display_order: 2, point_reward: 30 },
        { id: '4', name: 'ハズレ', description: 'また挑戦してね！', image_url: '', probability: 67, is_winning: false, stock: null, display_order: 3, point_reward: 0 },
      ];
    case 'fukubiki':
      return [
        { id: '1', name: '特賞（金玉）', description: '150pt獲得！', image_url: '', probability: 2, is_winning: true, stock: null, display_order: 0, point_reward: 150 },
        { id: '2', name: '1等（赤玉）', description: '80pt獲得！', image_url: '', probability: 8, is_winning: true, stock: null, display_order: 1, point_reward: 80 },
        { id: '3', name: '2等（青玉）', description: '40pt獲得！', image_url: '', probability: 15, is_winning: true, stock: null, display_order: 2, point_reward: 40 },
        { id: '4', name: '3等（緑玉）', description: '20pt獲得！', image_url: '', probability: 25, is_winning: true, stock: null, display_order: 3, point_reward: 20 },
        { id: '5', name: 'ハズレ（白玉）', description: 'また挑戦してね！', image_url: '', probability: 50, is_winning: false, stock: null, display_order: 4, point_reward: 0 },
      ];
    case 'gacha':
    default:
      return [
        { id: '1', name: 'SSR（超レア）', description: '500pt獲得！', image_url: '', probability: 1, is_winning: true, stock: null, display_order: 0, point_reward: 500 },
        { id: '2', name: 'SR（激レア）', description: '100pt獲得！', image_url: '', probability: 5, is_winning: true, stock: null, display_order: 1, point_reward: 100 },
        { id: '3', name: 'R（レア）', description: '30pt獲得！', image_url: '', probability: 15, is_winning: true, stock: null, display_order: 2, point_reward: 30 },
        { id: '4', name: 'N（ノーマル）', description: '10pt獲得！', image_url: '', probability: 30, is_winning: false, stock: null, display_order: 3, point_reward: 10 },
        { id: '5', name: 'ハズレ', description: 'また挑戦してね！', image_url: '', probability: 49, is_winning: false, stock: null, display_order: 4, point_reward: 0 },
      ];
  }
};

export default function GachaEditor({ user, initialData, onBack, setShowAuth, gameType = 'gacha' }: GachaEditorProps) {
  const router = useRouter();
  const { showOnboarding, setShowOnboarding } = useOnboarding('gamification_gacha_onboarding_dismissed', { skip: !!initialData });
  const { consumeAndExecute } = usePoints({ userId: user?.id, isPro: false });
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(initialData?.id || null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const config = GAME_TYPE_CONFIGS[gameType];
  const colorClass = `bg-${config.color}-100 text-${config.color}-600`;
  const gradientClass = `from-${config.color}-600 to-${config.color}-700`;

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
      title: config.defaultTitle,
      description: config.defaultDescription,
      animation_type: 'capsule',
      cost_per_play: 10,
      prizes: getDefaultPrizes(gameType),
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
              point_reward: p.point_reward || 0,
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
          point_reward: 0,
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

    await consumeAndExecute('gamification', 'save', async () => {
      setIsSaving(true);

      try {
        const campaignData = {
          owner_id: user.id,
          title: form.title,
          description: form.description,
          campaign_type: gameType as CampaignType,
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
            .select();

          if (error) throw new Error(error.message || 'データベースエラー');
          const savedData = data?.[0];
          if (!savedData) throw new Error('データの取得に失敗しました');
          campaignId = savedData.id;
          setSavedId(savedData.id);
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
          point_reward: prize.point_reward || 0,
        }));

        await supabase.from('gacha_prizes').insert(prizesData);

        setShowSuccessModal(true);
      } catch (error) {
        console.error('Save error:', error);
        alert('保存に失敗しました');
      } finally {
        setIsSaving(false);
      }
    });
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
        colorClass={`bg-${config.color}-100 text-${config.color}-600`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">タイトル</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white font-bold focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder={`${config.title}のタイトル`}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">説明文</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              rows={3}
              placeholder={`${config.title}の説明`}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">1回あたりの消費ポイント</label>
            <input
              type="number"
              value={form.cost_per_play}
              onChange={e => setForm(prev => ({ ...prev, cost_per_play: parseInt(e.target.value) || 0 }))}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white font-bold focus:ring-2 focus:ring-purple-500 outline-none"
              min={0}
            />
          </div>
        </div>
      </Section>

      {/* アニメーション設定（ガチャのみ） */}
      {config.animationOptions && (
        <Section
          title="アニメーション"
          icon={Sparkles}
          isOpen={openSections.animation}
          onToggle={() => toggleSection('animation')}
          colorClass={`bg-${config.color}-100 text-${config.color}-600`}
        >
          <div className="grid grid-cols-3 gap-3">
            {config.animationOptions.map(type => (
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
      )}

      {/* 景品設定 */}
      <Section
        title="景品設定（ポイント報酬）"
        icon={Gift}
        isOpen={openSections.prizes}
        onToggle={() => toggleSection('prizes')}
        badge={`${form.prizes.length}件`}
        colorClass={`bg-${config.color}-100 text-${config.color}-600`}
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

                  {/* 確率・当たりフラグ・ポイント報酬 */}
                  <div className="flex items-center gap-3 flex-wrap">
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
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">報酬</label>
                      <input
                        type="number"
                        value={prize.point_reward || 0}
                        onChange={e => updatePrize(prize.id, { point_reward: parseInt(e.target.value) || 0 })}
                        className="w-20 border border-gray-300 px-2 py-1 rounded text-sm text-center"
                        min={0}
                      />
                      <span className="text-xs text-gray-500">pt</span>
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
          className={`w-full bg-gradient-to-r from-${config.color}-600 to-${config.color}-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {savedId ? '更新して保存' : '保存して公開'}
        </button>
      </div>
    </>
  );

  // 右パネル（プレビュー）
  const rightPanel = (
    <PhoneMockup title={`${config.title}プレビュー`} onReset={resetPreview}>
      <GamePreview
        key={previewKey}
        gameType={gameType}
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
        title={savedId ? `${config.title}を編集` : `${config.title}を作成`}
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
        title={config.title}
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/${config.urlPath}/${savedId}`}
        contentTitle={`${form.title || config.title}で遊んでみよう！`}
        theme="purple"
      />

      {/* はじめかたガイド */}
      {showOnboarding && (
        <OnboardingModal
          storageKey="gamification_gacha_onboarding_dismissed"
          title={`${config.title}エディタの使い方`}
          pages={[
            {
              subtitle: '基本的な操作をご紹介します',
              items: [
                { icon: Settings, iconColor: 'blue', title: '左 = 設定パネル / 右 = スマホプレビュー', description: '左側で景品や設定を編集し、右側のスマホ型プレビューでリアルタイム確認できます。' },
                { icon: Gift, iconColor: 'purple', title: '景品の設定', description: '「景品設定」セクションで景品名・説明・画像・当選確率・在庫を設定します。当たり/ハズレも指定できます。' },
                { icon: AlertCircle, iconColor: 'amber', title: '確率の自動調整', description: '全景品の確率合計が100%になるよう自動調整機能があります。手動で微調整も可能です。' },
                { icon: Sparkles, iconColor: 'teal', title: 'アニメーション選択', description: 'カプセル・ルーレット・おみくじの3種類のアニメーションから選べます。ゲームタイプに合わせて変更可能です。' },
              ],
            },
            {
              subtitle: '公開と運用',
              items: [
                { icon: Palette, iconColor: 'purple', title: 'テーマカラー設定', description: '景品画面のテーマカラーを変更できます。ブランドに合わせたカスタマイズが可能です。' },
                { icon: CreditCard, iconColor: 'amber', title: 'プレイコスト設定', description: '1回あたりのプレイに必要なポイント数を設定します。ポイント制でリピートを促進します。' },
                { icon: Share2, iconColor: 'green', title: '共有方法', description: '保存後、URLをコピーして共有できます。QRコードでの配布にも対応しています。' },
              ],
            },
          ]}
          gradientFrom="from-purple-500"
          gradientTo="to-pink-500"
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
}
