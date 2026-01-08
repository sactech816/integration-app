'use server';

import { 
  updateMissionProgress, 
  getAdminGamificationSetting,
  acquireStamp,
  getCampaigns,
} from '@/app/actions/gamification';
import { MissionType, GamificationCampaign, StampRallySettings } from '@/lib/types';

/**
 * ゲーミフィケーションイベントタイプ
 */
export type GamificationEventType = 
  | 'login'             // ログイン
  | 'quiz_play'         // クイズプレイ
  | 'quiz_create'       // クイズ作成
  | 'quiz_complete'     // クイズ完了
  | 'profile_view'      // プロフィール閲覧
  | 'profile_create'    // プロフィール作成
  | 'business_create'   // ビジネスLP作成
  | 'gacha_play'        // ガチャプレイ
  | 'share'             // SNSシェア
  | 'stamp_get'         // スタンプ獲得
  | 'survey_create'     // アンケート作成
  | 'survey_answer';    // アンケート回答

/**
 * イベントとミッションタイプのマッピング
 */
const EVENT_TO_MISSION_TYPE: Partial<Record<GamificationEventType, MissionType>> = {
  login: 'login',
  quiz_play: 'quiz_play',
  quiz_create: 'quiz_create',
  profile_view: 'profile_view',
  profile_create: 'profile_create',
  gacha_play: 'gacha_play',
  share: 'share',
  stamp_get: 'stamp_get',
  survey_answer: 'survey_answer',
};

/**
 * イベントとスタンプラリートリガーのマッピング
 */
const EVENT_TO_STAMP_TRIGGER: Record<GamificationEventType, string> = {
  login: 'first_login',
  quiz_play: 'quiz_play',
  quiz_create: 'quiz_create',
  quiz_complete: 'quiz_complete',
  profile_view: 'profile_view',
  profile_create: 'profile_create',
  business_create: 'business_create',
  gacha_play: 'gacha_play',
  share: 'share',
  stamp_get: 'stamp_get',
  survey_create: 'survey_create',
  survey_answer: 'survey_answer',
};

/**
 * ゲーミフィケーションイベント発火結果
 */
export interface TriggerEventResult {
  success: boolean;
  missionUpdated: boolean;
  missionCompleted: boolean;
  stampAcquired: boolean;
  pointsEarned: number;
  errors: string[];
}

/**
 * ゲーミフィケーションイベントを発火する
 * 
 * このメソッドは以下を自動的に処理します：
 * 1. デイリーミッションの進捗更新
 * 2. スタンプラリーのスタンプ付与（該当するトリガーがある場合）
 * 
 * @param userId ユーザーID（必須）
 * @param eventType イベントタイプ
 * @param data 追加データ（オプション）
 */
export async function triggerGamificationEvent(
  userId: string,
  eventType: GamificationEventType,
  data?: {
    contentId?: string;
    contentTitle?: string;
    count?: number;
  }
): Promise<TriggerEventResult> {
  const result: TriggerEventResult = {
    success: false,
    missionUpdated: false,
    missionCompleted: false,
    stampAcquired: false,
    pointsEarned: 0,
    errors: [],
  };

  if (!userId) {
    result.errors.push('userId is required');
    return result;
  }

  try {
    // 1. デイリーミッションの進捗を更新
    const missionType = EVENT_TO_MISSION_TYPE[eventType];
    if (missionType) {
      try {
        // 管理者設定でミッション機能が有効か確認
        const missionSettings = await getAdminGamificationSetting('daily_missions');
        if (missionSettings?.enabled !== false) {
          const missionResults = await updateMissionProgress(
            userId, 
            missionType, 
            data?.count || 1
          );
          
          if (missionResults.length > 0) {
            result.missionUpdated = true;
            for (const mr of missionResults) {
              if (mr.newly_completed) {
                result.missionCompleted = true;
              }
            }
          }
        }
      } catch (error) {
        console.error('[Gamification Events] Mission update error:', error);
        result.errors.push('Mission update failed');
      }
    }

    // 2. スタンプラリーのスタンプ付与
    try {
      const stampRallySettings = await getAdminGamificationSetting('stamp_rally_events');
      if (stampRallySettings?.enabled !== false) {
        const stampTrigger = EVENT_TO_STAMP_TRIGGER[eventType];
        if (stampTrigger) {
          // アクティブなスタンプラリーキャンペーンを取得
          const campaigns = await getCampaigns(userId);
          const activeStampRallies = campaigns.filter(
            c => c.campaign_type === 'stamp_rally' && c.status === 'active'
          );

          for (const campaign of activeStampRallies) {
            const settings = campaign.settings as StampRallySettings;
            const stampIds = settings.stamp_ids || [];
            
            // このキャンペーンで該当するトリガーのスタンプを探す
            // ※将来的にはスタンプごとにトリガー設定を持たせる
            // 現在は順番にスタンプを付与
            const stampResult = await checkAndAcquireNextStamp(
              userId,
              campaign,
              stampTrigger
            );
            
            if (stampResult.acquired) {
              result.stampAcquired = true;
              result.pointsEarned += stampResult.pointsEarned;
            }
          }
        }
      }
    } catch (error) {
      console.error('[Gamification Events] Stamp rally error:', error);
      result.errors.push('Stamp rally update failed');
    }

    result.success = result.errors.length === 0;
  } catch (error) {
    console.error('[Gamification Events] Trigger event error:', error);
    result.errors.push('Unknown error');
  }

  return result;
}

/**
 * 次のスタンプを取得できるかチェックして取得
 */
async function checkAndAcquireNextStamp(
  userId: string,
  campaign: GamificationCampaign,
  trigger: string
): Promise<{ acquired: boolean; pointsEarned: number }> {
  try {
    const settings = campaign.settings as StampRallySettings;
    const totalStamps = settings.total_stamps || 10;
    
    // 現在のスタンプ数を確認するため、次のスタンプインデックスを計算
    // ※実際のスタンプ数はacquireStamp内でチェックされる
    // ここでは単純に次のスタンプを試みる
    const stampId = `${trigger}_${Date.now()}`;
    
    const result = await acquireStamp(
      campaign.id,
      stampId,
      0, // インデックスはacquireStamp内で正しく計算される
      userId
    );
    
    if (result.success) {
      return { 
        acquired: true, 
        pointsEarned: settings.points_per_stamp || 1 
      };
    }
    
    return { acquired: false, pointsEarned: 0 };
  } catch (error) {
    console.error('[Gamification Events] Acquire stamp error:', error);
    return { acquired: false, pointsEarned: 0 };
  }
}

/**
 * 複数イベントを一括で発火
 */
export async function triggerMultipleEvents(
  userId: string,
  events: Array<{
    type: GamificationEventType;
    data?: { contentId?: string; contentTitle?: string; count?: number };
  }>
): Promise<TriggerEventResult[]> {
  const results: TriggerEventResult[] = [];
  
  for (const event of events) {
    const result = await triggerGamificationEvent(userId, event.type, event.data);
    results.push(result);
  }
  
  return results;
}



