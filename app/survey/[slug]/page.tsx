import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Survey } from "@/lib/types";
import SurveyPlayer from "@/components/survey/SurveyPlayer";
import RelatedContent from "@/components/shared/RelatedContent";
import { generateBreadcrumbSchema } from "@/components/shared/Breadcrumb";
import { shouldHideFooter } from "@/lib/utils/checkCreatorPlanPermission";
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';
import { generateUGCSchema } from '@/lib/seo/generateUGCSchema';

// ISR: 5分キャッシュ + On-Demand Revalidation
export const revalidate = 300;

// サーバーサイドでSupabaseクライアントを作成
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// 静的パラメータ生成（SSG対応）
export async function generateStaticParams() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  try {
    const { data: surveys } = await supabase
      .from("surveys")
      .select("slug")
      .not("slug", "is", null);

    return surveys?.map((survey) => ({
      slug: survey.slug,
    })) || [];
  } catch (error) {
    console.error('Failed to generate static params for surveys:', error);
    return [];
  }
}

// メタデータ生成
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getSupabaseClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
  
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

  return generateUGCMetadata({
    title: survey.title,
    description: survey.description || `${survey.title}へのご回答をお願いします`,
    type: 'survey',
    slug,
  });
}

export default async function SurveyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getSupabaseClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

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

  // 作成者のプラン権限をチェックしてフッター非表示を決定
  const canHideFooter = await shouldHideFooter(survey.settings?.hideFooter, survey.user_id);
  const canHideRelated = await shouldHideFooter(survey.settings?.hideRelatedContent, survey.user_id);
  const surveyWithPermission = {
    ...survey,
    settings: { ...survey.settings, hideFooter: canHideFooter }
  };

  // 構造化データ - Survey
  const surveySchema = generateUGCSchema({
    schemaType: 'Survey',
    name: survey.title,
    description: survey.description || `${survey.title}へのご回答をお願いします`,
    url: `${siteUrl}/survey/${slug}`,
    datePublished: survey.created_at,
    dateModified: survey.updated_at,
  });

  // パンくずリスト構造化データ
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'アンケート', href: '/survey' },
      { name: survey.title },
    ],
    siteUrl
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(surveySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-10 px-4">
        <SurveyPlayer survey={surveyWithPermission as Survey} />
        <RelatedContent contentType="survey" currentSlug={slug} hide={canHideRelated} />
      </main>
    </>
  );
}

























