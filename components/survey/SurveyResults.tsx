"use client";

import { useState, useEffect } from "react";
import { SurveyResultData } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, Users, BarChart3, Star } from "lucide-react";

interface SurveyResultsProps {
  surveyId: number;
  thankYouMessage?: string;
}

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

export default function SurveyResults({ surveyId, thankYouMessage }: SurveyResultsProps) {
  const [results, setResults] = useState<SurveyResultData[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/survey-results?survey_id=${surveyId}`);
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

    fetchResults();
  }, [surveyId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600 mb-4" />
        <p className="text-gray-600">結果を集計中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {thankYouMessage || "ご回答ありがとうございました！"}
        </h2>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          <Users size={18} />
          <span>現在 <strong className="text-teal-600">{totalResponses}</strong> 件の回答</span>
        </p>
      </div>

      {/* 結果グラフ */}
      {results.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>まだ集計可能な回答がありません</p>
        </div>
      ) : (
        <div className="space-y-8">
          {results.map((result, index) => (
            <ResultCard key={result.question_id} result={result} index={index} />
          ))}
        </div>
      )}
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
          <span className="inline-flex items-center justify-center w-6 h-6 bg-teal-100 text-teal-700 rounded-full text-sm flex-shrink-0">
            {index + 1}
          </span>
          <span>{result.question_text}</span>
        </h3>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${value} 票 (${props.payload.percentage}%)`,
                      "回答数",
                    ]}
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
              {chartData.map((item, i) => (
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


