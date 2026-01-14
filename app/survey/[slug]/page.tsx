import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Survey } from "@/lib/types";
import SurveyPlayer from "@/components/survey/SurveyPlayer";

// サーバーサイドでSupabaseクライアントを作成
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// メタデータ生成
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { title: "アンケート" };
  }

  const { data: survey } = await supabase
    .from("surveys")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!survey) {
    return { title: "アンケートが見つかりません" };
  }

  return {
    title: survey.title,
    description: survey.description || `${survey.title}へのご回答をお願いします`,
    openGraph: {
      title: survey.title,
      description: survey.description || `${survey.title}へのご回答をお願いします`,
      type: "website",
    },
  };
}

export default async function SurveyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getSupabaseClient();

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <p className="text-red-600">データベースに接続されていません</p>
        </div>
      </div>
    );
  }

  const { data: survey, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !survey) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-10 px-4">
      <SurveyPlayer survey={survey as Survey} />
    </main>
  );
}





















