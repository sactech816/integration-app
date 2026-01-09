import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SurveyQuestion, SurveyResultData } from '@/lib/types';

// サーバーサイドSupabaseクライアント
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('survey_id');

    if (!surveyId) {
      return NextResponse.json(
        { error: 'survey_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // アンケート情報を取得（投票モードかどうか確認）
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, questions, show_results_after_submission')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // 投票モードがOFFの場合は結果を返さない
    if (!survey.show_results_after_submission) {
      return NextResponse.json(
        { error: 'Results not available for this survey' },
        { status: 403 }
      );
    }

    // 全回答を取得
    const { data: responses, error: responsesError } = await supabase
      .from('survey_responses')
      .select('answers')
      .eq('survey_id', surveyId);

    if (responsesError) {
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      );
    }

    // 質問ごとに集計
    const questions = survey.questions as SurveyQuestion[];
    const results: SurveyResultData[] = questions
      .filter((q) => q.type !== 'text') // 自由記述は集計対象外
      .map((question) => {
        const counts: Record<string, number> = {};
        let total = 0;
        let sum = 0;

        // 選択肢の初期化
        if (question.type === 'choice' && question.options) {
          question.options.forEach((opt) => {
            counts[opt] = 0;
          });
        } else if (question.type === 'rating') {
          const maxRating = question.maxRating || 5;
          for (let i = 1; i <= maxRating; i++) {
            counts[String(i)] = 0;
          }
        }

        // 回答を集計
        responses?.forEach((response) => {
          const answer = response.answers?.[question.id];
          if (answer !== undefined && answer !== null && answer !== '') {
            const key = String(answer);
            counts[key] = (counts[key] || 0) + 1;
            total++;

            // 評価式の場合は合計も計算
            if (question.type === 'rating' && typeof answer === 'number') {
              sum += answer;
            }
          }
        });

        const result: SurveyResultData = {
          question_id: question.id,
          question_text: question.text,
          question_type: question.type,
          counts,
          total,
        };

        // 選択肢情報を追加
        if (question.type === 'choice' && question.options) {
          result.options = question.options;
        }

        // 評価式の場合は平均を計算
        if (question.type === 'rating' && total > 0) {
          result.average = Math.round((sum / total) * 10) / 10;
        }

        return result;
      });

    return NextResponse.json({
      success: true,
      total_responses: responses?.length || 0,
      results,
    });
  } catch (error) {
    console.error('Survey results error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






