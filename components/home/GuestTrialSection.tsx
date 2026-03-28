'use client';

import {
  ArrowRight,
  Fingerprint,
  Star,
  CalendarCheck,
  ShoppingBag,
  UserCircle,
  Building2,
  Video,
  Globe,
  Image,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const GUEST_DIAGNOSES = [
  { name: '性格診断（Big Five）', href: '/bigfive', icon: Fingerprint, color: 'bg-purple-50 text-purple-600', desc: 'あなたの性格タイプを科学的に分析' },
  { name: '生年月日占い', href: '/fortune', icon: Star, color: 'bg-amber-50 text-amber-600', desc: '九星気学・数秘術・四柱推命で総合鑑定' },
  { name: '才能マネタイズ診断', href: '/diagnosis/monetize', icon: Sparkles, color: 'bg-pink-50 text-pink-600', desc: 'あなたの才能を活かした収益化の方法' },
  { name: '補助金診断', href: '/subsidy', icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-600', desc: '使える補助金・助成金をチェック' },
];

const GUEST_CREATORS = [
  { name: 'プロフィールLP', href: '/profile', icon: UserCircle, color: 'bg-blue-50 text-blue-600', desc: '自己紹介ページを作成' },
  { name: 'ビジネスLP', href: '/business', icon: Building2, color: 'bg-indigo-50 text-indigo-600', desc: 'サービス紹介ページを作成' },
  { name: 'ウェビナーLP', href: '/webinar', icon: Video, color: 'bg-rose-50 text-rose-600', desc: 'セミナー募集ページを作成' },
  { name: 'サムネイルメーカー', href: '/thumbnail/editor', icon: Image, color: 'bg-cyan-50 text-cyan-600', desc: 'テンプレートから簡単作成' },
];

const GUEST_UNLIMITED = [
  { name: '出欠メーカー', href: '/attendance', icon: CalendarCheck, color: 'bg-teal-50 text-teal-600', desc: 'イベント出欠管理' },
  { name: 'スキルマーケット', href: '/marketplace', icon: ShoppingBag, color: 'bg-orange-50 text-orange-600', desc: 'スキルを出品・閲覧' },
  { name: 'ホームページ', href: '/site/editor', icon: Globe, color: 'bg-gray-50 text-gray-600', desc: 'マイサイトを作成' },
];

export default function GuestTrialSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-blue-50/50 to-white border-b" style={{ borderColor: '#ffedd5' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full mb-4 border border-blue-200">
            <Fingerprint size={16} />
            <span className="font-bold text-sm">登録なし・完全無料</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: '#5d4037' }}>
            まずは体験してみてください
          </h2>
          <p className="text-gray-600 text-sm max-w-lg mx-auto">
            アカウント登録なしで今すぐ使えます。<br />
            診断を受けたり、ページを作ったり、気軽にお試しください。
          </p>
        </div>

        {/* 診断を受ける */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">1</span>
            診断を受けてみる
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {GUEST_DIAGNOSES.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="group flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* ページを作る */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">2</span>
            ページを作ってみる<span className="text-xs font-normal text-gray-400">（各1個）</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {GUEST_CREATORS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="group flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* いつでも使える */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-black">3</span>
            いつでも無制限
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GUEST_UNLIMITED.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="group flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* もっと見る → /start */}
        <div className="text-center space-y-3">
          <Link
            href="/start"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200"
          >
            無料でできること・プラン詳細を見る
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-gray-400">
            無料登録すると全35ツールが各1個ずつ使えます
          </p>
        </div>
      </div>
    </section>
  );
}
