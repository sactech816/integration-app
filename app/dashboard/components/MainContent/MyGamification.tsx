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
  AlertCircle,
  Copy,
  Check,
  CalendarDays,
  Heart,
  Code,
} from 'lucide-react';
import { getCampaigns, updateCampaign, deleteCampaign } from '@/app/actions/gamification';
import type { GamificationCampaign, CampaignType } from '@/lib/types';
import { CAMPAIGN_TYPE_LABELS } from '@/lib/types';
import { 
  PlanTier, 
  MakersPlanTier,
  MAKERS_GAMIFICATION_LIMITS,
} from '@/lib/subscription';

// 集客メーカー用のゲーム作成数制限を使用
const getGamificationLimitForMakers = (planTier: PlanTier): number => {
  let makersPlan: MakersPlanTier;
  
  if (planTier === 'none') {
    makersPlan = 'free';
  } else {
    makersPlan = 'pro';
  }
  
  const limit = MAKERS_GAMIFICATION_LIMITS[makersPlan];
  return limit === -1 ? 999 : limit;
};

type MyGamificationProps = {
  userId: string;
  planTier: PlanTier;
};

export default function MyGamification({ userId, planTier }: MyGamificationProps) {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<GamificationCampaign[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const limit = getGamificationLimitForMakers(planTier);
  const isLimitReached = limit === 0 || campaigns.length >= limit;
  const isPaidUser = planTier !== 'none';
  const canCreate = limit > 0;

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

  const handleCopyUrl = (campaignId: string) => {
    // TODO: 実際のゲームURLを設定
    const url = `${window.location.origin}/game/${campaignId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(campaignId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (campaign: GamificationCampaign) => {
    setTogglingId(campaign.id);
    try {
      const newStatus = campaign.status === 'active' ? 'inactive' : 'active';
      await updateCampaign(campaign.id, { status: newStatus });
      await fetchCampaigns();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('ステータスの更新に失敗しました');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (campaignId: string) => {
    setDeletingId(campaignId);
    try {
      await deleteCampaign(campaignId);
      await fetchCampaigns();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      alert('ゲームの削除に失敗しました');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleDuplicate = async (campaign: GamificationCampaign) => {
    // TODO: 複製APIを実装
    alert('複製機能は現在準備中です');
  };

  const handleCreateNew = () => {
    if (!canCreate) {
      alert('ゲーム作成機能を利用するには、有料プランへのアップグレードが必要です。');
      return;
    }
    if (isLimitReached) {
      alert(`現在のプランでは${limit}件までしか作成できません。\nアップグレードをご検討ください。`);
      return;
    }
    window.location.href = '/gamification/new';
  };

  const handleEdit = (campaign: GamificationCampaign) => {
    window.location.href = `/gamification/editor?type=${campaign.campaign_type}&id=${campaign.id}`;
  };

  const getCampaignTypeLabel = (type: CampaignType) => {
    return CAMPAIGN_TYPE_LABELS[type] || type;
  };

  const getCampaignTypeColor = (type: CampaignType) => {
    const colors: Record<CampaignType, { badge: string; gradient: string }> = {
      stamp_rally: { badge: 'bg-amber-100 text-amber-700', gradient: 'from-amber-500 to-orange-500' },
      login_bonus: { badge: 'bg-blue-100 text-blue-700', gradient: 'from-blue-500 to-indigo-500' },
      gacha: { badge: 'bg-purple-100 text-purple-700', gradient: 'from-purple-500 to-pink-500' },
      scratch: { badge: 'bg-pink-100 text-pink-700', gradient: 'from-pink-500 to-rose-500' },
      fukubiki: { badge: 'bg-green-100 text-green-700', gradient: 'from-green-500 to-emerald-500' },
      slot: { badge: 'bg-orange-100 text-orange-700', gradient: 'from-orange-500 to-red-500' },
    };
    return colors[type] || { badge: 'bg-gray-100 text-gray-700', gradient: 'from-gray-500 to-gray-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 border-l-4 border-purple-600 pl-4 flex items-center gap-2">
            <Gamepad2 size={20} className="text-purple-600" />
            ゲーミフィケーション
          </h2>
          <p className="text-sm text-gray-500 mt-2 ml-5">
            ガチャ、スロット、スクラッチなどのゲームを作成
          </p>
          <div className="flex items-center gap-2 mt-2 ml-5">
            {canCreate ? (
              <span className="text-sm text-gray-600">
                作成数: <span className="font-bold">{campaigns.length}</span> / {limit}件
              </span>
            ) : (
              <span className="text-sm text-gray-600">
                作成数: <span className="font-bold">{campaigns.length}</span>件
              </span>
            )}
            {!canCreate && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-bold">
                有料プラン限定
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleCreateNew}
          disabled={!canCreate || isLimitReached}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            !canCreate || isLimitReached
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {!canCreate || isLimitReached ? <Lock size={16} /> : <Plus size={16} />}
          新規作成
        </button>
      </div>

      {/* 無料ユーザー向けアップグレード案内 */}
      {!canCreate && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Crown className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-bold text-purple-800">有料プランで利用可能</h3>
              <p className="text-sm text-purple-700 mt-1">
                ゲーム作成機能は有料プラン（プロプラン）でご利用いただけます。
              </p>
              <button
                onClick={() => window.location.href = '/dashboard?view=settings'}
                className="mt-3 text-sm font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
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
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <Gamepad2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">まだゲームを作成していません</p>
          {canCreate && (
            <button
              onClick={handleCreateNew}
              className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold hover:bg-purple-700"
            >
              新規作成する
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const typeColors = getCampaignTypeColor(campaign.campaign_type);
            
            return (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* カードヘッダー */}
                <div className={`bg-gradient-to-r ${typeColors.gradient} p-4 h-32 flex items-start justify-between`}>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${typeColors.badge}`}>
                    {getCampaignTypeLabel(campaign.campaign_type)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    campaign.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {campaign.status === 'active' ? '有効' : '無効'}
                  </span>
                </div>

                {/* カードコンテンツ */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{campaign.title}</h3>
                  {campaign.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{campaign.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} />
                      {new Date(campaign.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>

                  {/* URL表示とコピー */}
                  <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/game/${campaign.id}`}
                        readOnly
                        className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 truncate"
                      />
                      <button
                        onClick={() => handleCopyUrl(campaign.id)}
                        className="text-indigo-600 hover:text-indigo-700 p-1"
                      >
                        {copiedId === campaign.id ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 編集・複製ボタン */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => handleEdit(campaign)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit size={14} /> 編集
                    </button>
                    <button
                      onClick={() => handleDuplicate(campaign)}
                      className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Copy size={14} /> 複製
                    </button>
                  </div>

                  {/* 埋め込み・削除ボタン */}
                  <div className="flex gap-2 mb-3">
                    <button
                      className="flex-1 bg-gray-100 text-gray-400 cursor-not-allowed py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      disabled
                    >
                      <Lock size={14} /> 埋め込み
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(campaign.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash2 size={14} /> 削除
                    </button>
                  </div>

                  {/* プレビューボタン */}
                  <button
                    onClick={() => window.open(`/game/${campaign.id}`, '_blank')}
                    className="w-full bg-green-500 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-green-600 flex items-center justify-center gap-1 transition-colors"
                  >
                    <ExternalLink size={14} /> プレビュー
                  </button>

                  {/* ステータス切り替えボタン */}
                  <button
                    onClick={() => handleToggleStatus(campaign)}
                    disabled={togglingId === campaign.id}
                    className={`w-full mt-3 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors ${
                      campaign.status === 'active'
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {togglingId === campaign.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : campaign.status === 'active' ? (
                      <>
                        <PowerOff size={14} /> 無効化する
                      </>
                    ) : (
                      <>
                        <Power size={14} /> 有効化する
                      </>
                    )}
                  </button>

                  {/* Pro機能アンロック */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-lg font-bold text-xs hover:from-orange-600 hover:to-amber-600 flex items-center justify-center gap-1 transition-all shadow-sm"
                    >
                      <Heart size={14} />
                      Pro機能を開放（開発支援）
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-1.5">
                      埋め込み機能などが利用可能に
                    </p>
                  </div>

                  {/* 削除確認 */}
                  {showDeleteConfirm === campaign.id && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                      <p className="text-sm text-red-800 mb-3">
                        「{campaign.title}」を削除しますか？この操作は取り消せません。
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          disabled={deletingId === campaign.id}
                          className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-xs disabled:opacity-50"
                        >
                          {deletingId === campaign.id ? (
                            <Loader2 size={14} className="animate-spin mx-auto" />
                          ) : (
                            '削除する'
                          )}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="flex-1 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-xs"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 使い方ヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
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
