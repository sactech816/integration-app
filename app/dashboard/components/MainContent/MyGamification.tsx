'use client';

import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Plus, 
  Loader2, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  ExternalLink,
  Lock,
  Crown,
  AlertCircle
} from 'lucide-react';
import { getCampaigns, updateCampaign, deleteCampaign } from '@/app/actions/gamification';
import type { GamificationCampaign, CampaignType } from '@/lib/types';
import { CAMPAIGN_TYPE_LABELS } from '@/lib/types';
import { PlanTier } from '@/lib/subscription';

// ゲーム作成数制限
export const GAMIFICATION_LIMITS: Record<PlanTier, number> = {
  none: 1,        // 無料: 1件まで
  lite: 3,        // ライト: 3件まで
  standard: 5,    // スタンダード: 5件まで
  pro: 10,        // プロ: 10件まで
  business: 50,   // ビジネス: 50件まで
  enterprise: 999, // エンタープライズ: 無制限
};

type MyGamificationProps = {
  userId: string;
  planTier: PlanTier;
};

export default function MyGamification({ userId, planTier }: MyGamificationProps) {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<GamificationCampaign[]>([]);

  const limit = GAMIFICATION_LIMITS[planTier] || 1;
  const isLimitReached = campaigns.length >= limit;
  const isPaidUser = planTier !== 'none';

  useEffect(() => {
    fetchCampaigns();
  }, [userId]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await getCampaigns(userId);
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (campaign: GamificationCampaign) => {
    try {
      const newStatus = campaign.status === 'active' ? 'inactive' : 'active';
      await updateCampaign(campaign.id, { status: newStatus });
      await fetchCampaigns();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm('このゲームを削除しますか？')) return;
    try {
      await deleteCampaign(campaignId);
      await fetchCampaigns();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      alert('ゲームの削除に失敗しました');
    }
  };

  const handleCreateNew = () => {
    if (isLimitReached) {
      alert(`現在のプランでは${limit}件までしか作成できません。\nアップグレードをご検討ください。`);
      return;
    }
    // 新規作成ページへ遷移
    window.location.href = '/gamification/new';
  };

  const handleEdit = (campaign: GamificationCampaign) => {
    // 編集ページへ遷移
    window.location.href = `/gamification/editor?type=${campaign.campaign_type}&id=${campaign.id}`;
  };

  const getCampaignTypeLabel = (type: CampaignType) => {
    return CAMPAIGN_TYPE_LABELS[type] || type;
  };

  const getCampaignTypeColor = (type: CampaignType) => {
    const colors: Record<CampaignType, string> = {
      stamp_rally: 'bg-amber-100 text-amber-700',
      login_bonus: 'bg-blue-100 text-blue-700',
      gacha: 'bg-purple-100 text-purple-700',
      scratch: 'bg-pink-100 text-pink-700',
      fukubiki: 'bg-green-100 text-green-700',
      slot: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ゲーム作成</h2>
          <p className="text-sm text-gray-500 mt-1">
            ガチャ、スロット、スクラッチなどのゲームを作成して、あなたのサイトや顧客に提供できます
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600">
              作成数: <span className="font-bold">{campaigns.length}</span> / {limit}件
            </span>
            {!isPaidUser && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">
                無料プラン
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleCreateNew}
          disabled={isLimitReached}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isLimitReached
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isLimitReached ? <Lock size={16} /> : <Plus size={16} />}
          新規ゲーム作成
        </button>
      </div>

      {/* 制限到達時のアップグレード案内 */}
      {isLimitReached && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Crown className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-bold text-amber-800">作成上限に達しました</h3>
              <p className="text-sm text-amber-700 mt-1">
                現在のプランでは{limit}件までゲームを作成できます。
                より多くのゲームを作成するには、プランをアップグレードしてください。
              </p>
              <button
                onClick={() => window.location.href = '/dashboard?view=settings'}
                className="mt-3 text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                プランを確認する
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ゲーム一覧 */}
      {campaigns.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
          <Gamepad2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">ゲームがありません</h3>
          <p className="text-gray-500 mb-4">
            「新規ゲーム作成」からゲームを作成してください
          </p>
          <div className="text-sm text-gray-400">
            作成したゲームは埋め込みコードで外部サイトに設置できます
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{campaign.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold ${getCampaignTypeColor(campaign.campaign_type)}`}
                    >
                      {getCampaignTypeLabel(campaign.campaign_type)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold ${
                        campaign.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {campaign.status === 'active' ? '有効' : '無効'}
                    </span>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    作成日: {new Date(campaign.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(campaign)}
                    className={`p-2 rounded-lg transition-colors ${
                      campaign.status === 'active'
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                    title={campaign.status === 'active' ? '無効化' : '有効化'}
                  >
                    {campaign.status === 'active' ? <PowerOff size={18} /> : <Power size={18} />}
                  </button>
                  <button
                    onClick={() => handleEdit(campaign)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                    title="編集"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 使い方ヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-blue-800">ゲームの活用方法</h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• 作成したゲームは埋め込みコードで外部サイトに設置できます</li>
              <li>• 顧客向けのキャンペーンやプロモーションに活用できます</li>
              <li>• ポイント付与で顧客のエンゲージメントを高められます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
