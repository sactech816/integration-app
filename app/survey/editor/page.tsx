"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Survey } from "@/lib/types";
import SurveyEditor from "@/components/survey/SurveyEditor";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("id");

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        setError("データベースに接続されていません");
        setLoading(false);
        return;
      }

      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id, email: user.email });
      }

      // アンケートデータを取得
      if (surveyId) {
        const { data, error: fetchError } = await supabase
          .from("surveys")
          .select("*")
          .eq("id", surveyId)
          .single();

        if (fetchError) {
          setError("アンケートが見つかりません");
        } else {
          setSurvey(data);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [surveyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/survey")}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <SurveyEditor
      onBack={() => router.push("/survey")}
      initialData={survey || undefined}
      user={user}
    />
  );
}

export default function SurveyEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}

