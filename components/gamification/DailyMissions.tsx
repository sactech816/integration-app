'use client';

import React, { useState, useEffect } from 'react';
import {
  getTodayMissionsProgress,
  claimMissionReward,
  checkAllMissionsBonus,
  claimAllMissionsBonus,
} from '@/app/actions/gamification';
import { MissionProgressWithDetails, AllMissionsBonusCheck, MISSION_TYPE_LABELS } from '@/lib/types';
import {
  Target,
  Check,
  Gift,
  Loader2,
  Sparkles,
  Calendar,
  MessageSquare,
  Share2,
  Stamp,
  Gamepad2,
  Eye,
  Edit3,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyMissionsProps {
  userId: string;
  onPointsEarned?: (points: number) => void;
  compact?: boolean;
}

// ミッションタイプに対応するアイコン
const MISSION_ICONS: Record<string, React.ReactNode> = {
  login: <Calendar className="w-5 h-5" />,
  quiz_play: <Gamepad2 className="w-5 h-5" />,
  quiz_create: <Edit3 className="w-5 h-5" />,
  profile_view: <Eye className="w-5 h-5" />,
  profile_create: <Edit3 className="w-5 h-5" />,
  gacha_play: <Gift className="w-5 h-5" />,
  share: <Share2 className="w-5 h-5" />,
  stamp_get: <Stamp className="w-5 h-5" />,
  survey_answer: <MessageSquare className="w-5 h-5" />,
};

export default function DailyMissions({ userId, onPointsEarned, compact = false }: DailyMissionsProps) {
  const [missions, setMissions] = useState<MissionProgressWithDetails[]>([]);
  const [bonusCheck, setBonusCheck] = useState<AllMissionsBonusCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimingBonus, setClaimingBonus] = useState(false);

  // ミッションデータを読み込み
  useEffect(() => {
    async function loadMissions() {
      if (!userId) return;
      
      try {
        const [missionsData, bonusData] = await Promise.all([
          getTodayMissionsProgress(userId),
          checkAllMissionsBonus(userId),
        ]);
        
        setMissions(missionsData);
        setBonusCheck(bonusData);
      } catch (error) {
        console.error('Error loading missions:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMissions();
  }, [userId]);

  // ミッション報酬を受け取る
  const handleClaimReward = async (missionId: string) => {
    setClaimingId(missionId);
    
    try {
      const result = await claimMissionReward(userId, missionId);
      
      if (result.success) {
        // 紙吹雪
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
        
        // ミッションリストを更新
        setMissions(prev => 
          prev.map(m => 
            m.mission_id === missionId 
              ? { ...m, reward_claimed: true }
              : m
          )
        );
        
        // ボーナス状態を再チェック
        const bonusData = await checkAllMissionsBonus(userId);
        setBonusCheck(bonusData);
        
        // コールバック
        if (onPointsEarned) {
          onPointsEarned(result.points_granted);
        }
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaimingId(null);
    }
  };

  // 全達成ボーナスを受け取る
  const handleClaimAllBonus = async () => {
    setClaimingBonus(true);
    
    try {
      const result = await claimAllMissionsBonus(userId);
      
      if (result.success) {
        // 派手な紙吹雪
        const duration = 2000;
        const end = Date.now() + duration;
        
        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFD700', '#FFA500', '#FF6347'],
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FFD700', '#FFA500', '#FF6347'],
          });
          
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        
        frame();
        
        // ボーナス状態を更新
        setBonusCheck(prev => prev ? { ...prev, bonus_available: false } : null);
        
        // コールバック
        if (onPointsEarned) {
          onPointsEarned(result.points_granted);
        }
      }
    } catch (error) {
      console.error('Error claiming all missions bonus:', error);
    } finally {
      setClaimingBonus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>ミッションがありません</p>
      </div>
    );
  }

  const completedCount = missions.filter(m => m.completed && m.reward_claimed).length;
  const totalCount = missions.length;

  return (
    <div className={compact ? '' : 'bg-white rounded-xl border border-gray-200 overflow-hidden'}>
      {/* ヘッダー */}
      <div className={`${compact ? 'mb-4' : 'p-4 border-b border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            今日のミッション
          </h3>
          <span className="text-sm text-gray-500">
            {completedCount}/{totalCount} 達成
          </span>
        </div>
        
        {/* プログレスバー */}
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* ミッションリスト */}
      <div className={compact ? 'space-y-3' : 'p-4 space-y-3'}>
        {missions.map((mission) => (
          <div
            key={mission.mission_id}
            className={`
              flex items-center gap-3 p-3 rounded-xl transition-all
              ${mission.completed && mission.reward_claimed
                ? 'bg-gray-50 opacity-60'
                : mission.completed
                ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200'
                : 'bg-gray-50'}
            `}
          >
            {/* アイコン */}
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
              ${mission.completed 
                ? 'bg-teal-100 text-teal-600' 
                : 'bg-gray-200 text-gray-500'}
            `}>
              {mission.completed && mission.reward_claimed ? (
                <Check className="w-5 h-5" />
              ) : (
                MISSION_ICONS[mission.mission_type] || <Target className="w-5 h-5" />
              )}
            </div>

            {/* ミッション情報 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${mission.completed && mission.reward_claimed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {mission.title}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">
                  {mission.current_count}/{mission.target_count}
                </span>
                <span className="text-xs text-teal-600 font-medium">
                  +{mission.reward_points}pt
                </span>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex-shrink-0">
              {mission.completed && !mission.reward_claimed ? (
                <button
                  onClick={() => handleClaimReward(mission.mission_id)}
                  disabled={claimingId === mission.mission_id}
                  className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1"
                >
                  {claimingId === mission.mission_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      受取
                    </>
                  )}
                </button>
              ) : mission.reward_claimed ? (
                <span className="text-xs text-gray-400 px-2">受取済み</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* 全達成ボーナス */}
      {bonusCheck && (
        <div className={`${compact ? 'mt-4' : 'p-4 border-t border-gray-100'}`}>
          <div className={`
            p-4 rounded-xl
            ${bonusCheck.all_completed && bonusCheck.bonus_available
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
              : bonusCheck.all_completed
              ? 'bg-gray-100 text-gray-500'
              : 'bg-gray-50 text-gray-600'}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className={`w-6 h-6 ${bonusCheck.all_completed && bonusCheck.bonus_available ? 'text-yellow-100' : ''}`} />
                <div>
                  <p className="font-bold">全達成ボーナス</p>
                  <p className="text-sm opacity-80">
                    +{bonusCheck.bonus_points}pt
                  </p>
                </div>
              </div>
              
              {bonusCheck.all_completed && bonusCheck.bonus_available ? (
                <button
                  onClick={handleClaimAllBonus}
                  disabled={claimingBonus}
                  className="px-4 py-2 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {claimingBonus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      受け取る
                    </>
                  )}
                </button>
              ) : bonusCheck.all_completed ? (
                <span className="text-sm">受取済み</span>
              ) : (
                <span className="text-sm">全ミッション達成で獲得</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}













