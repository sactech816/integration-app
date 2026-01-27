import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PLAN_AI_PRESETS } from '@/lib/ai-provider';
import type { PlanTier } from '@/lib/subscription';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

/**
 * GET: プラン別AI設定取得
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planTier = searchParams.get('planTier') as PlanTier;

    if (!planTier) {
      return NextResponse.json({ error: 'planTier is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // プリセット情報を取得（データベースが無くても返す）
    const presets = PLAN_AI_PRESETS[planTier];
    
    if (!presets) {
      return NextResponse.json({ error: `Invalid plan tier: ${planTier}` }, { status: 400 });
    }

    // データベースから設定取得
    const { data, error } = await supabase
      .from('admin_ai_settings')
      .select('*')
      .eq('plan_tier', planTier)
      .single();

    // テーブルが存在しない場合もプリセット情報は返す
    if (error && error.code === '42P01') { // テーブルが存在しない
      console.warn('admin_ai_settings table does not exist. Please run supabase_admin_ai_settings.sql');
      return NextResponse.json({
        planTier,
        selectedPreset: 'presetB', // デフォルト
        presets: {
          presetA: {
            name: presets.presetA.name,
            description: presets.presetA.description,
            outline: {
              model: presets.presetA.outline.model,
              provider: presets.presetA.outline.provider,
              cost: presets.presetA.outline.cost,
            },
            writing: {
              model: presets.presetA.writing.model,
              provider: presets.presetA.writing.provider,
              cost: presets.presetA.writing.cost,
            },
          },
          presetB: {
            name: presets.presetB.name,
            description: presets.presetB.description,
            outline: {
              model: presets.presetB.outline.model,
              provider: presets.presetB.outline.provider,
              cost: presets.presetB.outline.cost,
            },
            writing: {
              model: presets.presetB.writing.model,
              provider: presets.presetB.writing.provider,
              cost: presets.presetB.writing.cost,
            },
          },
        },
        customOutlineModel: null,
        customWritingModel: null,
        requiresMigration: true, // マイグレーション必要フラグ
      });
    }

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Failed to fetch AI settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json({
      planTier,
      selectedPreset: data?.selected_preset || 'presetB',
      presets: {
        presetA: {
          name: presets.presetA.name,
          description: presets.presetA.description,
          outline: {
            model: presets.presetA.outline.model,
            provider: presets.presetA.outline.provider,
            cost: presets.presetA.outline.cost,
          },
          writing: {
            model: presets.presetA.writing.model,
            provider: presets.presetA.writing.provider,
            cost: presets.presetA.writing.cost,
          },
        },
        presetB: {
          name: presets.presetB.name,
          description: presets.presetB.description,
          outline: {
            model: presets.presetB.outline.model,
            provider: presets.presetB.outline.provider,
            cost: presets.presetB.outline.cost,
          },
          writing: {
            model: presets.presetB.writing.model,
            provider: presets.presetB.writing.provider,
            cost: presets.presetB.writing.cost,
          },
        },
      },
      customOutlineModel: data?.custom_outline_model || null,
      customWritingModel: data?.custom_writing_model || null,
      feature_limits: data?.feature_limits || {
        profile: 5,
        business: 5,
        quiz: 5,
        total: null
      },
      requiresMigration: false,
    });
  } catch (error: any) {
    console.error('GET admin AI settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST: プラン別AI設定更新（管理者のみ）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planTier, selectedPreset, customOutlineModel, customWritingModel, featureLimits, userId } = body;

    if (!planTier || !selectedPreset) {
      return NextResponse.json(
        { error: 'planTier and selectedPreset are required' },
        { status: 400 }
      );
    }

    if (!['presetA', 'presetB', 'custom'].includes(selectedPreset)) {
      return NextResponse.json(
        { error: 'selectedPreset must be presetA, presetB, or custom' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // RPC関数で更新
    const { data, error } = await supabase.rpc('update_ai_setting', {
      p_plan_tier: planTier,
      p_selected_preset: selectedPreset,
      p_custom_outline_model: customOutlineModel || null,
      p_custom_writing_model: customWritingModel || null,
      p_updated_by: userId || null,
    });

    if (error) {
      console.error('Failed to update AI settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings: ' + error.message },
        { status: 500 }
      );
    }

    // feature_limitsがある場合は別途更新
    if (featureLimits) {
      const { error: limitsError } = await supabase
        .from('admin_ai_settings')
        .update({ feature_limits: featureLimits })
        .eq('plan_tier', planTier);

      if (limitsError) {
        console.error('Failed to update feature limits:', limitsError);
        // エラーがあってもAI設定は保存されているので警告のみ
        return NextResponse.json({
          success: true,
          warning: 'AI設定は保存されましたが、使用制限の保存に失敗しました。',
          message: 'AI設定を更新しました（使用制限の保存は失敗）',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'AI設定を更新しました',
    });
  } catch (error: any) {
    console.error('POST admin AI settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

