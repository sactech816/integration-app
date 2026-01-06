"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Survey } from "@/lib/types";
import {
  Plus,
  ClipboardList,
  Edit3,
  Trash2,
  ExternalLink,
  Copy,
  Loader2,
} from "lucide-react";

export default function SurveyListPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({ id: user.id });

        // ユーザーのアンケート一覧を取得
        const { data } = await supabase
          .from("surveys")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data) {
          setSurveys(data);
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("このアンケートを削除しますか？")) return;
    if (!supabase) return;

    const { error } = await supabase.from("surveys").delete().eq("id", id);

    if (!error) {
      setSurveys((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert("削除に失敗しました");
    }
  };

  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}/survey/${slug}`;
    navigator.clipboard.writeText(url);
    alert("URLをコピーしました！");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 rounded-xl">
              <ClipboardList className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">アンケート管理</h1>
              <p className="text-sm text-gray-500">アンケートの作成・編集・管理</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/survey/new")}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold py-3 px-6 rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">新規作成</span>
          </button>
        </div>

        {/* ログインしていない場合 */}
        {!user && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              ログインが必要です
            </h2>
            <p className="text-gray-500 mb-6">
              アンケートを作成・管理するにはログインしてください。
            </p>
            <button
              onClick={() => router.push("/survey/new")}
              className="bg-teal-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-teal-700 transition-colors"
            >
              ログインせずに作成を試す
            </button>
          </div>
        )}

        {/* アンケート一覧 */}
        {user && surveys.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              アンケートがありません
            </h2>
            <p className="text-gray-500 mb-6">
              「新規作成」ボタンから最初のアンケートを作成しましょう。
            </p>
            <button
              onClick={() => router.push("/survey/new")}
              className="bg-teal-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-teal-700 transition-colors"
            >
              アンケートを作成
            </button>
          </div>
        )}

        {user && surveys.length > 0 && (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 truncate">
                      {survey.title}
                    </h3>
                    {survey.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {survey.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>質問数: {survey.questions?.length || 0}</span>
                      <span>
                        作成日:{" "}
                        {new Date(survey.created_at || "").toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopyUrl(survey.slug)}
                      className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="URLをコピー"
                    >
                      <Copy size={18} />
                    </button>
                    <a
                      href={`/survey/${survey.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="プレビュー"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <button
                      onClick={() => router.push(`/survey/editor?id=${survey.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="編集"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(survey.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>
    </main>
  );
}
