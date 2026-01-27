import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Survey } from "@/lib/types";
import SurveyPlayer from "@/components/survey/SurveyPlayer";
import { generateBreadcrumbSchema } from "@/components/shared/Breadcrumb";
import { shouldHideFooter } from "@/lib/utils/checkCreatorPlanPermission";

// 動的レンダリングを強制（常に最新のデータを取得）
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  const title = survey.title;
  const description = survey.description || `${survey.title}へのご回答をお願いします`;
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&type=survey`;

  return {
    title,
    description,
    keywords: [
      'アンケート',
      'アンケート作成',
      '無料アンケートツール',
      'Googleフォーム代替',
      'オンラインアンケート',
      'アンケート調査',
      '投票',
      'フィードバック収集',
    ],
    alternates: {
      canonical: `${siteUrl}/survey/${slug}`,
    },
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      url: `${siteUrl}/survey/${slug}`,
      siteName: '集客メーカー',
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@syukaku_maker',
    },
  };
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
  const surveyWithPermission = {
    ...survey,
    settings: { ...survey.settings, hideFooter: canHideFooter }
  };

  // 構造化データ - Survey
  const surveySchema = {
    '@context': 'https://schema.org',
    '@type': 'Survey',
    name: survey.title,
    description: survey.description || `${survey.title}へのご回答をお願いします`,
    url: `${siteUrl}/survey/${slug}`,
    creator: {
      '@type': 'Organization',
      name: '集客メーカー',
      url: siteUrl,
    },
  };

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
      </main>
    </>
  );
}

























