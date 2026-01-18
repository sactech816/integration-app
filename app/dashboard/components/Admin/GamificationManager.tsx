'use client';

import React, { useState, useEffect } from 'react';
import { Gamepad2, Plus, Loader2, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { getCampaigns, updateCampaign, deleteCampaign } from '@/app/actions/gamification';
import type { GamificationCampaign, CampaignType } from '@/lib/types';
import { CAMPAIGN_TYPE_LABELS } from '@/lib/types';

export default function GamificationManager() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<GamificationCampaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<GamificationCampaign | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await getCampaigns();
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
    if (!confirm('このキャンペーンを削除しますか？')) return;
    try {
      await deleteCampaign(campaignId);
      await fetchCampaigns();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      alert('キャンペーンの削除に失敗しました');
    }
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
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ゲーミフィケーション管理</h2>
          <p className="text-sm text-gray-500">
            キャンペーン数: <span className="font-bold">{campaigns.length}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCampaign(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          新規キャンペーン作成
        </button>
      </div>

      {/* キャンペーン一覧 */}
      {campaigns.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
          <Gamepad2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">キャンペーンがありません</h3>
          <p className="text-gray-500 mb-4">
            「新規キャンペーン作成」からキャンペーンを作成してください
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-green-300 transition-colors"
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
                    onClick={() => {
                      setEditingCampaign(campaign);
                      setShowForm(true);
                    }}
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

      {/* キャンペーン作成/編集フォーム (簡易版) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingCampaign ? 'キャンペーン編集' : '新規キャンペーン作成'}
            </h3>
            <p className="text-gray-500 mb-4">
              キャンペーンの作成/編集機能は、専用のUIが必要です。
              <br />
              現在は一覧表示とステータス切り替えのみ対応しています。
            </p>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingCampaign(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
