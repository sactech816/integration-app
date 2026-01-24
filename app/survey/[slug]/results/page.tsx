"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Survey, SurveyResultData } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Loader2,
  Users,
  BarChart3,
  Star,
  ClipboardList,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// グラフ用のカラーパレット
const COLORS = [
  "#0d9488", // teal-600
  "#06b6d4", // cyan-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#10b981", // emerald-500
  "#6366f1", // indigo-500
  "#ec4899", // pink-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
];

export default function SurveyResultsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [results, setResults] = useState<SurveyResultData[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase || !slug) {
        setError("データを取得できません");
        setLoading(false);
        return;
      }

      try {
        // アンケート情報を取得
        const { data: surveyData, error: surveyError } = await supabase
          .from("surveys")
          .select("*")
          .eq("slug", slug)
          .single();

        if (surveyError || !surveyData) {
          setError("アンケートが見つかりません");
          setLoading(false);
          return;
        }

        setSurvey(surveyData);

        // 結果を取得
        const res = await fetch(`/api/survey-results?survey_id=${surveyData.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "結果の取得に失敗しました");
        }

        setResults(data.results || []);
        setTotalResponses(data.total_responses || 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {error || "アンケートが見つかりません"}
          </h1>
          <p className="text-gray-500 mb-6">
            URLが正しいかご確認ください。
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors"
          >
            <ArrowLeft size={18} />
            トップページへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
                <p className="text-purple-200 text-sm">アンケート結果</p>
              </div>
              <Link
                href={`/survey/${slug}`}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <ExternalLink size={16} />
                回答する
              </Link>
            </div>
          </div>

          {/* 統計サマリー */}
          <div className="p-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                  <Users size={24} />
                  <span className="text-3xl font-bold">{totalResponses}</span>
                </div>
                <p className="text-sm text-gray-600">総回答数</p>
              </div>
              <div className="w-px h-16 bg-gray-200" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                  <BarChart3 size={24} />
                  <span className="text-3xl font-bold">{survey.questions?.length || 0}</span>
                </div>
                <p className="text-sm text-gray-600">質問数</p>
              </div>
            </div>
          </div>
        </div>

        {/* 結果グラフ */}
        {results.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <BarChart3 size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              まだ回答がありません
            </h2>
            <p className="text-gray-500 mb-6">
              このアンケートにはまだ回答が集まっていません。
            </p>
            <Link
              href={`/survey/${slug}`}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              <ExternalLink size={18} />
              アンケートに回答する
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result, index) => (
              <ResultCard key={result.question_id} result={result} index={index} />
            ))}
          </div>
        )}

        {/* フッター */}
        <div className="mt-8 text-center">
          <Link
            href={`/survey/${slug}`}
            className="text-purple-600 hover:text-purple-700 font-bold text-sm"
          >
            このアンケートに回答する →
          </Link>
        </div>
      </div>
    </div>
  );
}

// 個別の結果カード
function ResultCard({ result, index }: { result: SurveyResultData; index: number }) {
  // グラフ用データを作成
  const chartData = Object.entries(result.counts).map(([key, count], i) => ({
    name: key,
    count,
    percentage: result.total > 0 ? Math.round((count / result.total) * 100) : 0,
    fill: COLORS[i % COLORS.length],
  }));

  // 評価式の場合はソート
  if (result.question_type === "rating") {
    chartData.sort((a, b) => Number(a.name) - Number(b.name));
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 質問ヘッダー */}
      <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800 flex items-start gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-700 rounded-full text-sm flex-shrink-0 font-bold">
            {index + 1}
          </span>
          <span>{result.question_text}</span>
        </h3>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 ml-9">
          <span>{result.total} 件の回答</span>
          {result.question_type === "rating" && result.average !== undefined && (
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              <Star size={14} className="fill-amber-400" />
              平均 {result.average}
            </span>
          )}
        </div>
      </div>

      {/* グラフ */}
      <div className="p-5">
        {result.total === 0 ? (
          <p className="text-center text-gray-400 py-4">回答がありません</p>
        ) : (
          <>
            {/* 棒グラフ */}
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, "dataMax"]} tickFormatter={(v) => `${v}`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, _name, props) => {
                      const percentage = (props.payload as { percentage?: number })?.percentage ?? 0;
                      return [`${value} 票 (${percentage}%)`, "回答数"];
                    }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* テキストでの表示（補足） */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {chartData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="truncate text-gray-700">{item.name}</span>
                  <span className="ml-auto font-bold text-gray-900">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
