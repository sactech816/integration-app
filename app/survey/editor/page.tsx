"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Survey } from "@/lib/types";
import SurveyEditor from "@/components/survey/SurveyEditor";
import Header from "@/components/shared/Header";
import AuthModal from "@/components/shared/AuthModal";
import { Loader2 } from "lucide-react";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("id");

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      if (!supabase) {
        setError("データベースに接続されていません");
        setLoading(false);
        return;
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      });
      subscription = sub;

      // ユーザー情報を取得
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
      }

      // アンケートデータを取得
      if (surveyId) {
        const { data, error: fetchError } = await supabase
          .from("surveys")
          .select("*")
          .eq("slug", surveyId)
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

    return () => {
      subscription?.unsubscribe();
    };
  }, [surveyId]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    router.push(page.startsWith('/') ? page : `/${page}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header
          setPage={navigateTo}
          user={user}
          onLogout={handleLogout}
          setShowAuth={setShowAuth}
        />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <Loader2 className="animate-spin text-teal-600" size={48} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header
          setPage={navigateTo}
          user={user}
          onLogout={handleLogout}
          setShowAuth={setShowAuth}
        />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/dashboard?view=survey")}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700"
            >
              一覧に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        onNavigate={navigateTo}
      />

      <SurveyEditor
        onBack={() => router.push("/dashboard?view=survey")}
        initialData={survey || undefined}
        user={user}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}

export default function SurveyEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <Loader2 className="animate-spin text-teal-600" size={48} />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}

