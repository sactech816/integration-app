'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { NEWSLETTER_TEMPLATES } from '@/constants/templates/newsletter';

export default function NewsletterDemoClient() {
  const params = useParams();
  const id = params.id as string;
  const template = NEWSLETTER_TEMPLATES.find((t) => t.id === id);

  const currentIndex = NEWSLETTER_TEMPLATES.findIndex((t) => t.id === id);
  const prev = currentIndex > 0 ? NEWSLETTER_TEMPLATES[currentIndex - 1] : null;
  const next = currentIndex < NEWSLETTER_TEMPLATES.length - 1 ? NEWSLETTER_TEMPLATES[currentIndex + 1] : null;

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">テンプレートが見つかりません</h1>
          <Link href="/demos" className="text-blue-600 hover:underline">デモ一覧に戻る</Link>
        </div>
      </div>
    );
  }

  const fullHtml = template.header_html + template.body_html + template.footer_html;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        setPage={(path: string) => { window.location.href = path === '/' ? '/' : `/${path}`; }}
        user={null}
        onLogout={() => {}}
        setShowAuth={() => {}}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/demos"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          デモ一覧に戻る
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-2xl mb-4">
            <Mail size={32} className="text-violet-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {template.icon} {template.name}
          </h1>
          <p className="text-gray-600 text-lg">{template.description}</p>
          <span className="inline-block mt-3 px-3 py-1 bg-violet-100 text-violet-700 text-sm font-bold rounded-full">
            {template.category === 'basic' ? '基本テンプレート' : '業種別テンプレート'}
          </span>
        </div>

        {/* 件名候補 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-500 mb-3">件名の例</h2>
          <div className="flex flex-wrap gap-2">
            {template.subject_suggestions.map((subject, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg">
                {subject}
              </span>
            ))}
          </div>
        </div>

        {/* メールプレビュー */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-200 px-6 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-sm text-gray-500 font-medium">メールプレビュー</span>
          </div>
          <div
            className="p-0"
            style={{ maxWidth: 640, margin: '0 auto' }}
            dangerouslySetInnerHTML={{ __html: fullHtml }}
          />
        </div>

        {/* ナビゲーション */}
        <div className="flex items-center justify-between mt-8">
          {prev ? (
            <Link
              href={`/newsletter/demo/${prev.id}`}
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 font-bold transition-colors"
            >
              <ChevronLeft size={18} />
              {prev.icon} {prev.name}
            </Link>
          ) : <div />}
          {next ? (
            <Link
              href={`/newsletter/demo/${next.id}`}
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 font-bold transition-colors"
            >
              {next.icon} {next.name}
              <ChevronRight size={18} />
            </Link>
          ) : <div />}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 mb-8">
          <Link
            href="/newsletter/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-violet-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Mail size={22} />
            メルマガを作成する
          </Link>
        </div>
      </div>

      <Footer setPage={(path: string) => { window.location.href = path === '/' ? '/' : `/${path}`; }} />
    </div>
  );
}
