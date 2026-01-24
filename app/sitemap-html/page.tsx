import { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Home, 
  Sparkles, 
  UserCircle, 
  Building2, 
  FileText, 
  Calendar,
  LayoutGrid,
  ExternalLink,
} from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'サイトマップ｜集客メーカー',
  description: '集客メーカーの全ページへのリンク一覧。診断クイズ、アンケート、予約システム、プロフィールLP、ビジネスLPなど、すべてのコンテンツにアクセスできます。',
  alternates: {
    canonical: `${siteUrl}/sitemap-html`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function HtmlSitemapPage() {
  // 公開コンテンツを取得
  let quizzes: any[] = [];
  let surveys: any[] = [];
  let profiles: any[] = [];
  let businessLPs: any[] = [];

  if (supabase) {
    try {
      const [quizzesData, surveysData, profilesData, businessData] = await Promise.all([
        supabase.from('quizzes').select('slug, title').eq('show_in_portal', true).not('slug', 'is', null).order('created_at', { ascending: false }).limit(50),
        supabase.from('surveys').select('slug, title').not('slug', 'is', null).order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('slug, nickname').eq('show_in_portal', true).not('slug', 'is', null).order('created_at', { ascending: false }).limit(20),
        supabase.from('business_projects').select('slug, settings').eq('show_in_portal', true).not('slug', 'is', null).order('created_at', { ascending: false }).limit(20),
      ]);

      quizzes = quizzesData.data || [];
      surveys = surveysData.data || [];
      profiles = profilesData.data || [];
      businessLPs = businessData.data || [];
    } catch (error) {
      console.error('Failed to fetch sitemap data:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            サイトマップ
          </h1>
          <p className="text-lg text-gray-600">
            集客メーカーの全ページへのリンク一覧
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 主要ページ */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Home size={24} className="text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">主要ページ</h2>
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-indigo-600 hover:underline flex items-center gap-2">
                  <ExternalLink size={16} />
                  トップページ
                </Link>
              </li>
              <li>
                <Link href="/portal" className="text-indigo-600 hover:underline flex items-center gap-2">
                  <ExternalLink size={16} />
                  ポータル（作品一覧）
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-indigo-600 hover:underline flex items-center gap-2">
                  <ExternalLink size={16} />
                  ツール一覧
                </Link>
              </li>
              <li>
                <Link href="/howto" className="text-indigo-600 hover:underline flex items-center gap-2">
                  <ExternalLink size={16} />
                  使い方ガイド
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-indigo-600 hover:underline flex items-center gap-2">
                  <ExternalLink size={16} />
                  よくある質問
                </Link>
              </li>
              <li>
                <Link href="/effective-use" className="text-indigo-600 hover:underline flex items-center gap-2">
                  <ExternalLink size={16} />
                  効果的な活用法
                </Link>
              </li>
            </ul>
          </div>

          {/* ツールページ */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid size={24} className="text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900">ツール</h2>
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/quiz/editor" className="text-teal-600 hover:underline flex items-center gap-2">
                  <Sparkles size={16} />
                  診断クイズ作成
                </Link>
              </li>
              <li>
                <Link href="/survey/new" className="text-teal-600 hover:underline flex items-center gap-2">
                  <FileText size={16} />
                  アンケート作成
                </Link>
              </li>
              <li>
                <Link href="/booking/new" className="text-teal-600 hover:underline flex items-center gap-2">
                  <Calendar size={16} />
                  予約システム作成
                </Link>
              </li>
              <li>
                <Link href="/profile/editor" className="text-teal-600 hover:underline flex items-center gap-2">
                  <UserCircle size={16} />
                  プロフィールLP作成
                </Link>
              </li>
              <li>
                <Link href="/business/editor" className="text-teal-600 hover:underline flex items-center gap-2">
                  <Building2 size={16} />
                  ビジネスLP作成
                </Link>
              </li>
            </ul>
          </div>

          {/* 診断クイズ */}
          {quizzes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={24} className="text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">診断クイズ</h2>
              </div>
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {quizzes.map((quiz) => (
                  <li key={quiz.slug}>
                    <Link 
                      href={`/quiz/${quiz.slug}`} 
                      className="text-purple-600 hover:underline flex items-center gap-2 text-sm"
                    >
                      <ExternalLink size={14} />
                      {quiz.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link 
                href="/portal?tab=quiz" 
                className="text-purple-600 hover:underline text-sm font-bold mt-4 inline-block"
              >
                すべての診断クイズを見る →
              </Link>
            </div>
          )}

          {/* アンケート */}
          {surveys.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={24} className="text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-900">アンケート</h2>
              </div>
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {surveys.map((survey) => (
                  <li key={survey.slug}>
                    <Link 
                      href={`/survey/${survey.slug}`} 
                      className="text-teal-600 hover:underline flex items-center gap-2 text-sm"
                    >
                      <ExternalLink size={14} />
                      {survey.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* プロフィールLP */}
          {profiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserCircle size={24} className="text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">プロフィールLP</h2>
              </div>
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {profiles.map((profile) => (
                  <li key={profile.slug}>
                    <Link 
                      href={`/profile/${profile.slug}`} 
                      className="text-emerald-600 hover:underline flex items-center gap-2 text-sm"
                    >
                      <ExternalLink size={14} />
                      {profile.nickname || 'プロフィール'}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link 
                href="/portal?tab=profile" 
                className="text-emerald-600 hover:underline text-sm font-bold mt-4 inline-block"
              >
                すべてのプロフィールを見る →
              </Link>
            </div>
          )}

          {/* ビジネスLP */}
          {businessLPs.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={24} className="text-amber-600" />
                <h2 className="text-2xl font-bold text-gray-900">ビジネスLP</h2>
              </div>
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {businessLPs.map((lp) => (
                  <li key={lp.slug}>
                    <Link 
                      href={`/business/${lp.slug}`} 
                      className="text-amber-600 hover:underline flex items-center gap-2 text-sm"
                    >
                      <ExternalLink size={14} />
                      {lp.settings?.title || 'ビジネスLP'}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link 
                href="/portal?tab=business" 
                className="text-amber-600 hover:underline text-sm font-bold mt-4 inline-block"
              >
                すべてのビジネスLPを見る →
              </Link>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="mt-12 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-indigo-600 hover:underline font-bold"
          >
            <Home size={20} />
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
