"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

// ログイン済みの場合はダッシュボードにリダイレクト
// 未ログインの場合も新規作成ページにアクセス可能
export default function SurveyListPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) {
        // Supabaseがない場合は新規作成ページへ
        router.replace("/survey/new");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // ログイン済みの場合はダッシュボードのアンケートビューにリダイレクト
        router.replace("/dashboard?view=survey");
      } else {
        // 未ログインの場合は新規作成ページへ
        router.replace("/survey/new");
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}
