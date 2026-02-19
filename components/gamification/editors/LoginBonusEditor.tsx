'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { GamificationCampaign, LoginBonusSettings } from '@/lib/types';
import EditorLayout from '../shared/EditorLayout';
import PhoneMockup from '../shared/PhoneMockup';
import LoginBonusPreview from '../previews/LoginBonusPreview';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Settings,
  Gift,
  Trophy,
  Share2,
  Copy,
  X,
  Sparkles,
} from 'lucide-react';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import OnboardingModal from '@/components/shared/OnboardingModal';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

interface LoginBonusEditorProps {
  user: User | null;
  initialData?: GamificationCampaign | null;
  onBack: () => void;
  setShowAuth: (show: boolean) => void;
}

interface LoginBonusFormData {
  title: string;
  description: string;
  points_per_day: number;
  streak_bonus_days: number;
  streak_bonus_points: number;
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
        <div className={`p-2 rounded-lg ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
    </button>
    {isOpen && <div className="p-5 border-t border-gray-100">{children}</div>}
  </div>
);

export default function LoginBonusEditor({ user, initialData, onBack, setShowAuth }: LoginBonusEditorProps) {
  const router = useRouter();
  const { showOnboarding, setShowOnboarding } = useOnboarding('gamification_loginbonus_onboarding_dismissed', { skip: !!initialData });
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(initialData?.id || null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // セクション開閉状態
  const [openSections, setOpenSections] = useState({
    basic: true,
    points: true,
    streak: false,
  });

  // フォーム状態
  const [form, setForm] = useState<LoginBonusFormData>(() => {
    if (initialData) {
      const settings = initialData.settings as LoginBonusSettings;
      return {
        title: initialData.title || '',
        description: initialData.description || '',
        points_per_day: settings?.points_per_day || 10,
        streak_bonus_days: 7,
        streak_bonus_points: 50,
      };
    }
    return {
      title: 'ログインボーナス',
      description: '毎日ログインしてポイントをゲット！',
      points_per_day: 10,
      streak_bonus_days: 7,
      streak_bonus_points: 50,
    };
  });

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
        campaign_type: 'login_bonus',
        status: 'active',
        settings: {
          points_per_day: form.points_per_day,
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
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="ログインボーナスのタイトル"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">説明文</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="ログインボーナスの説明"
            />
          </div>
        </div>
      </Section>

      {/* ポイント設定 */}
      <Section
        title="ポイント設定"
        icon={Gift}
        isOpen={openSections.points}
        onToggle={() => toggleSection('points')}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">1日あたりのポイント</label>
            <input
              type="number"
              value={form.points_per_day}
              onChange={e => {
                setForm(prev => ({ ...prev, points_per_day: parseInt(e.target.value) || 0 }));
                resetPreview();
              }}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              min={1}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-bold text-blue-700 mb-2">ポイント獲得シミュレーション</p>
            <div className="text-sm text-blue-600 space-y-1">
              <p>・1週間: {form.points_per_day * 7} pt</p>
              <p>・1ヶ月（30日）: {form.points_per_day * 30} pt</p>
              <p>・1年: {form.points_per_day * 365} pt</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 連続ログイン設定（将来拡張用） */}
      <Section
        title="連続ログインボーナス"
        icon={Sparkles}
        isOpen={openSections.streak}
        onToggle={() => toggleSection('streak')}
        badge="近日公開"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              連続ログインボーナス機能は近日公開予定です。
              <br />
              7日連続でボーナスポイントがもらえる機能などを追加予定！
            </p>
          </div>
        </div>
      </Section>

      {/* 保存ボタン */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md text-lg disabled:opacity-50"
        >
          {savedId ? '更新して保存' : '保存して公開'}
        </button>
      </div>
    </>
  );

  // 右パネル（プレビュー）
  const rightPanel = (
    <PhoneMockup title="ログインボーナスプレビュー" onReset={resetPreview}>
      <LoginBonusPreview
        key={previewKey}
        title={form.title}
        description={form.description}
        pointsPerDay={form.points_per_day}
        isTestMode={true}
      />
    </PhoneMockup>
  );

  return (
    <>
      <EditorLayout
        title={savedId ? 'ログインボーナスを編集' : 'ログインボーナスを作成'}
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
        title="ログインボーナス"
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/login-bonus/${savedId}`}
        contentTitle={`${form.title || 'ログインボーナス'}をチェックしよう！`}
        theme="blue"
      />

      {/* はじめかたガイド */}
      {showOnboarding && (
        <OnboardingModal
          storageKey="gamification_loginbonus_onboarding_dismissed"
          title="ログインボーナスの設定"
          pages={[{
            subtitle: '基本的な操作をご紹介します',
            items: [
              { icon: Calendar, iconColor: 'blue', title: '基本設定', description: 'タイトルと説明を設定します。ユーザーが毎日ログインするたびにポイントが貯まります。' },
              { icon: Gift, iconColor: 'amber', title: 'ポイント設定', description: '1日あたりの獲得ポイントを設定します。連続ログインボーナスの日数と追加ポイントも設定可能です。' },
              { icon: Sparkles, iconColor: 'purple', title: '連続ログインボーナス', description: '設定した日数連続でログインすると、ボーナスポイントが付与されます。リピート率向上に効果的です。' },
            ],
          }]}
          gradientFrom="from-blue-500"
          gradientTo="to-cyan-500"
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
}




