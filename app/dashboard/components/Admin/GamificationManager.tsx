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
  Gift,
  Stamp,
  ExternalLink,
  Settings,
  X
} from 'lucide-react';
import { getCampaigns, updateCampaign, deleteCampaign, createCampaign } from '@/app/actions/gamification';
import type { GamificationCampaign, CampaignType, StampRallySettings, LoginBonusSettings } from '@/lib/types';
import { CAMPAIGN_TYPE_LABELS } from '@/lib/types';

// サイト全体用のキャンペーンタイプ（管理者専用）
const SITE_WIDE_CAMPAIGN_TYPES: CampaignType[] = ['login_bonus', 'stamp_rally'];

type CampaignTypeOption = {
  type: CampaignType;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const CAMPAIGN_TYPE_OPTIONS: CampaignTypeOption[] = [
  {
    type: 'login_bonus',
    label: 'ログインボーナス',
    description: 'ユーザーが毎日ログインするとポイントを付与',
    icon: <Gift size={24} className="text-blue-500" />,
  },
  {
    type: 'stamp_rally',
    label: 'スタンプラリー',
    description: 'ページ閲覧やコンテンツ作成でスタンプを付与',
    icon: <Stamp size={24} className="text-amber-500" />,
  },
];

export default function GamificationManager() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<GamificationCampaign[]>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedType, setSelectedType] = useState<CampaignType | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<GamificationCampaign | null>(null);
  const [saving, setSaving] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    // ログインボーナス用
    points_per_day: 10,
    // スタンプラリー用
    total_stamps: 5,
    points_per_stamp: 10,
    completion_bonus: 50,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      // サイト全体用のキャンペーンのみ取得（owner_idがnullのもの）
      const data = await getCampaigns();
      // サイト全体用タイプのみフィルタ
      const siteWideCampaigns = data.filter(c => 
        SITE_WIDE_CAMPAIGN_TYPES.includes(c.campaign_type) && !c.owner_id
      );
      setCampaigns(siteWideCampaigns);
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

  const handleSelectType = (type: CampaignType) => {
    setSelectedType(type);
    setShowTypeSelector(false);
    setEditingCampaign(null);
    // デフォルト値をセット
    setFormData({
      title: type === 'login_bonus' ? 'デイリーログインボーナス' : 'スタンプラリーキャンペーン',
      description: '',
      points_per_day: 10,
      total_stamps: 5,
      points_per_stamp: 10,
      completion_bonus: 50,
    });
    setShowEditor(true);
  };

  const handleEdit = (campaign: GamificationCampaign) => {
    setSelectedType(campaign.campaign_type);
    setEditingCampaign(campaign);
    
    const settings = campaign.settings as StampRallySettings | LoginBonusSettings;
    
    setFormData({
      title: campaign.title,
      description: campaign.description || '',
      points_per_day: (settings as LoginBonusSettings).points_per_day || 10,
      total_stamps: (settings as StampRallySettings).total_stamps || 5,
      points_per_stamp: (settings as StampRallySettings).points_per_stamp || 10,
      completion_bonus: (settings as StampRallySettings).completion_bonus || 50,
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!selectedType) return;
    
    setSaving(true);
    try {
      const settings = selectedType === 'login_bonus'
        ? { points_per_day: formData.points_per_day }
        : {
            total_stamps: formData.total_stamps,
            points_per_stamp: formData.points_per_stamp,
            completion_bonus: formData.completion_bonus,
          };

      if (editingCampaign) {
        // 更新
        await updateCampaign(editingCampaign.id, {
          title: formData.title,
          description: formData.description,
          settings,
        });
      } else {
        // 新規作成（owner_idをnullにしてサイト全体用として作成）
        await createCampaign(
          '', // owner_id を空文字にすることでサイト全体用
          formData.title,
          selectedType,
          settings,
          { description: formData.description }
        );
      }
      
      await fetchCampaigns();
      setShowEditor(false);
      setSelectedType(null);
      setEditingCampaign(null);
    } catch (error) {
      console.error('Failed to save campaign:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
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
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ゲーミフィケーション管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            サイト全体に適用するログインボーナスやスタンプラリーを管理します
          </p>
          <p className="text-xs text-red-500 mt-1">
            ※ 管理者専用機能です
          </p>
        </div>
        <button
          onClick={() => setShowTypeSelector(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={16} />
          新規キャンペーン作成
        </button>
      </div>

      {/* ゲームセンターへのリンク */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 className="text-indigo-500" size={24} />
            <div>
              <h3 className="font-bold text-indigo-800">ゲームセンター</h3>
              <p className="text-sm text-indigo-600">
                ガチャ、スロット、スクラッチなどのゲームはゲームセンターで管理されています
              </p>
            </div>
          </div>
          <a
            href="/arcade"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            ゲームセンターを見る
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* キャンペーン一覧 */}
      {campaigns.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
          <Settings size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">サイト全体のキャンペーンがありません</h3>
          <p className="text-gray-500 mb-4">
            「新規キャンペーン作成」からログインボーナスやスタンプラリーを設定してください
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-red-300 transition-colors"
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
                  {/* 設定内容を表示 */}
                  <div className="text-xs text-gray-500 space-y-1">
                    {campaign.campaign_type === 'login_bonus' && (
                      <p>ポイント/日: {(campaign.settings as LoginBonusSettings).points_per_day || 10}pt</p>
                    )}
                    {campaign.campaign_type === 'stamp_rally' && (
                      <>
                        <p>スタンプ数: {(campaign.settings as StampRallySettings).total_stamps || 5}個</p>
                        <p>ポイント/スタンプ: {(campaign.settings as StampRallySettings).points_per_stamp || 10}pt</p>
                        <p>コンプリートボーナス: {(campaign.settings as StampRallySettings).completion_bonus || 0}pt</p>
                      </>
                    )}
                  </div>
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

      {/* キャンペーンタイプ選択モーダル */}
      {showTypeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">キャンペーンタイプを選択</h3>
              <button
                onClick={() => setShowTypeSelector(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {CAMPAIGN_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleSelectType(option.type)}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors text-left"
                >
                  {option.icon}
                  <div>
                    <h4 className="font-bold text-gray-900">{option.label}</h4>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {showEditor && selectedType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCampaign ? 'キャンペーン編集' : '新規キャンペーン作成'}
              </h3>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setSelectedType(null);
                  setEditingCampaign(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 基本情報 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  キャンペーン名
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  説明（任意）
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* ログインボーナス設定 */}
              {selectedType === 'login_bonus' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    1日あたりのポイント
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.points_per_day}
                    onChange={(e) => setFormData({ ...formData, points_per_day: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              )}

              {/* スタンプラリー設定 */}
              {selectedType === 'stamp_rally' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      スタンプ数
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={formData.total_stamps}
                      onChange={(e) => setFormData({ ...formData, total_stamps: parseInt(e.target.value) || 5 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      スタンプ1個あたりのポイント
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.points_per_stamp}
                      onChange={(e) => setFormData({ ...formData, points_per_stamp: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      コンプリートボーナス
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.completion_bonus}
                      onChange={(e) => setFormData({ ...formData, completion_bonus: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditor(false);
                  setSelectedType(null);
                  setEditingCampaign(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={16} />}
                {editingCampaign ? '更新' : '作成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
