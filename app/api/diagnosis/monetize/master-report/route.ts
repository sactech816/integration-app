import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getProviderFromAdminSettings, generateWithFallback } from '@/lib/ai-provider';

export async function POST(request: Request) {
  try {
    const { diagnosisId } = await request.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    // 診断結果を取得
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );

    const { data: diagnosis, error: fetchError } = await serviceSupabase
      .from('monetize_diagnoses')
      .select('*')
      .eq('id', diagnosisId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !diagnosis) {
      return NextResponse.json({ error: '診断結果が見つかりません' }, { status: 404 });
    }

    // 既に総括レポートがある場合はそのまま返す
    if (diagnosis.master_report) {
      return NextResponse.json({ masterReport: diagnosis.master_report });
    }

    // 各分野の提案サマリーを整形
    const kindleSummary = (diagnosis.kindle_results || []).map((r: any) => r.theme).join('、');
    const courseSummary = (diagnosis.course_results || []).map((r: any) => r.courseName).join('、');
    const consultingSummary = (diagnosis.consulting_results || []).map((r: any) => r.menuName).join('、');
    const snsSummary = (diagnosis.sns_results || []).map((r: any) => r.themeName).join('、');
    const digitalSummary = (diagnosis.digital_results || []).map((r: any) => r.productName).join('、');

    const systemPrompt = `＃目的：
ユーザーの才能マネタイズ診断結果をもとに、5分野を横断した収益化ロードマップ（総括レポート）を作成してください。

＃あなたの役割：
才能マネタイズの戦略コンサルタント。5つの収益化分野を俯瞰し、最も効果的な実行順序と分野間の連携戦略を提案するプロフェッショナル。

＃出力形式（JSON）：
{
  "executiveSummary": "あなたの才能と5分野の診断結果を踏まえた総括（200-300文字）。どの分野に最も可能性があるか、全体の方向性を示す。",
  "recommendedOrder": ["最初に取り組むべき分野", "2番目", "3番目", "4番目", "5番目"],
  "orderReason": "この順序を推奨する理由（200文字）",
  "synergyMap": [
    { "from": "分野A", "to": "分野B", "strategy": "AからBへどう連携させるか（具体的に）" },
    { "from": "分野B", "to": "分野C", "strategy": "BからCへどう連携させるか" }
  ],
  "thirtyDayPlan": [
    { "week": "Week 1", "action": "具体的なアクション", "field": "対応分野" },
    { "week": "Week 2", "action": "具体的なアクション", "field": "対応分野" },
    { "week": "Week 3", "action": "具体的なアクション", "field": "対応分野" },
    { "week": "Week 4", "action": "具体的なアクション", "field": "対応分野" }
  ],
  "ninetyDayMilestones": [
    "30日後の目標（具体的な数値含む）",
    "60日後の目標",
    "90日後の目標"
  ],
  "yearlyVision": "1年後に実現できる理想の状態（100文字）"
}

＃条件：
- synergyMapは4-6個の連携を提案
- thirtyDayPlanは4-6ステップ
- 全て日本語
- 具体的で実行可能なアクションを提案
- JSON以外のテキストは出力しないこと`;

    const userMessage = `＃ユーザーの才能分析：
タイプ: ${diagnosis.analysis?.authorType || '不明'}
概要: ${diagnosis.analysis?.summary || ''}

＃各分野の提案テーマ：
【Kindle出版】${kindleSummary}
【オンライン講座】${courseSummary}
【コンサル・コーチング】${consultingSummary}
【SNS発信】${snsSummary}
【デジタル商品】${digitalSummary}`;

    const planTier = 'free';
    const aiSettings = await getProviderFromAdminSettings('kdl', planTier, 'outline');

    const aiRequest = {
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userMessage },
      ],
      responseFormat: 'json' as const,
      temperature: 0.7,
    };

    const response = await generateWithFallback(
      aiSettings.provider,
      aiSettings.backupProvider,
      aiRequest,
      {
        service: 'monetize_diagnosis',
        phase: 'master_report',
        model: aiSettings.model,
        backupModel: aiSettings.backupModel,
      }
    );

    const content = response.content;
    if (!content) {
      throw new Error('AIからの応答が空です');
    }

    const masterReport = JSON.parse(content);

    // DB保存
    await serviceSupabase
      .from('monetize_diagnoses')
      .update({ master_report: masterReport })
      .eq('id', diagnosisId);

    return NextResponse.json({ masterReport });

  } catch (error: any) {
    console.error('Master report generation error:', error);
    return NextResponse.json(
      { error: error.message || '総括レポート生成でエラーが発生しました' },
      { status: 500 }
    );
  }
}
