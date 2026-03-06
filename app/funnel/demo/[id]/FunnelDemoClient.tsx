'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowDown, GitBranch, ChevronLeft, ChevronRight,
  Globe, Mail, HelpCircle, Calendar, ShoppingBag, FileText, CheckCircle, Video,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { FUNNEL_TEMPLATES } from '@/constants/templates/funnel';

const stepTypeConfig: Record<string, { icon: typeof Globe; label: string; color: string; bg: string }> = {
  business_lp: { icon: Globe, label: 'ビジネスLP', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  profile_lp: { icon: Globe, label: 'プロフィールLP', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  newsletter: { icon: Mail, label: 'メルマガ登録', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
  quiz: { icon: HelpCircle, label: '診断クイズ', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  booking: { icon: Calendar, label: '予約', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  order_form: { icon: ShoppingBag, label: '申し込みフォーム', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  salesletter: { icon: FileText, label: 'セールスレター', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  webinar: { icon: Video, label: 'ウェビナーLP', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
  thank_you: { icon: CheckCircle, label: '完了ページ', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
};

export default function FunnelDemoClient() {
  const params = useParams();
  const id = params.id as string;
  const template = FUNNEL_TEMPLATES.find((t) => t.id === id);

  const currentIndex = FUNNEL_TEMPLATES.findIndex((t) => t.id === id);
  const prev = currentIndex > 0 ? FUNNEL_TEMPLATES[currentIndex - 1] : null;
  const next = currentIndex < FUNNEL_TEMPLATES.length - 1 ? FUNNEL_TEMPLATES[currentIndex + 1] : null;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        setPage={(path: string) => { window.location.href = path === '/' ? '/' : `/${path}`; }}
        user={null}
        onLogout={() => {}}
        setShowAuth={() => {}}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/demos"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          デモ一覧に戻る
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-2xl mb-4">
            <GitBranch size={32} className="text-pink-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {template.emoji} {template.name}
          </h1>
          <p className="text-gray-600 text-lg mb-3">{template.description}</p>
          <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-sm font-bold rounded-full">
            {template.badge}
          </span>
        </div>

        {/* ファネルフロー */}
        <div className="space-y-0">
          {template.steps.map((step, i) => {
            const config = stepTypeConfig[step.stepType] || stepTypeConfig.business_lp;
            const StepIcon = config.icon;
            const isLast = i === template.steps.length - 1;

            return (
              <div key={i}>
                <div className={`bg-white rounded-2xl border-2 ${config.bg} p-6 shadow-md`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-white rounded-xl shadow flex items-center justify-center">
                        <span className="text-sm font-black text-gray-400">{i + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StepIcon size={18} className={config.color} />
                        <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{step.name}</h3>
                      {step.contentRef?.message && (
                        <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{step.contentRef.message}</p>
                      )}
                    </div>
                    {step.ctaLabel && (
                      <div className="flex-shrink-0">
                        <span className="inline-block px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 shadow-sm">
                          {step.ctaLabel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {!isLast && (
                  <div className="flex justify-center py-2">
                    <ArrowDown size={24} className="text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ナビゲーション */}
        <div className="flex items-center justify-between mt-10">
          {prev ? (
            <Link
              href={`/funnel/demo/${prev.id}`}
              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-800 font-bold transition-colors"
            >
              <ChevronLeft size={18} />
              {prev.emoji} {prev.name}
            </Link>
          ) : <div />}
          {next ? (
            <Link
              href={`/funnel/demo/${next.id}`}
              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-800 font-bold transition-colors"
            >
              {next.emoji} {next.name}
              <ChevronRight size={18} />
            </Link>
          ) : <div />}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 mb-8">
          <Link
            href="/funnel/editor"
            className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-pink-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <GitBranch size={22} />
            ファネルを作成する
          </Link>
        </div>
      </div>

      <Footer setPage={(path: string) => { window.location.href = path === '/' ? '/' : `/${path}`; }} />
    </div>
  );
}
