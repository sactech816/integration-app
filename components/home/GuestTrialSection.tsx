'use client';

import {
  ArrowRight,
  Fingerprint,
  Star,
  CalendarCheck,
  ShoppingBag,
  Sparkles,
  BookOpen,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

const GUEST_DIAGNOSES = [
  { name: '性格診断（Big Five）', href: '/bigfive', icon: Fingerprint, color: 'bg-purple-50 text-purple-600', desc: 'あなたの性格タイプを科学的に分析' },
  { name: '生年月日占い', href: '/fortune', icon: Star, color: 'bg-amber-50 text-amber-600', desc: '九星気学・数秘術・四柱推命で総合鑑定' },
  { name: '才能マネタイズ診断', href: '/diagnosis/monetize', icon: Sparkles, color: 'bg-pink-50 text-pink-600', desc: 'あなたの才能を活かした収益化の方法' },
  { name: '補助金診断', href: '/subsidy', icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-600', desc: '使える補助金・助成金をチェック' },
  { name: 'ネタ発掘診断', href: '/kindle/discovery', icon: BookOpen, color: 'bg-orange-50 text-orange-600', desc: 'コンテンツのテーマを発見' },
];

const GUEST_SERVICES = [
  { name: '出欠メーカー', href: '/attendance', icon: CalendarCheck, color: 'bg-teal-50 text-teal-600', desc: 'イベント出欠に参加' },
  { name: 'スキルマーケット', href: '/marketplace', icon: ShoppingBag, color: 'bg-orange-50 text-orange-600', desc: 'スキルを閲覧' },
  { name: 'ポータル', href: '/portal', icon: Eye, color: 'bg-gray-50 text-gray-600', desc: 'みんなの作品を見る' },
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
            診断を受けて、あなた自身のことを知ってみませんか？
          </p>
        </div>

        {/* 診断を受ける */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">1</span>
            診断を受けてみる
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

        {/* 見る・参加する */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-black">2</span>
            見る・参加する
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GUEST_SERVICES.map((item) => {
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
          <p className="text-sm text-gray-600 mb-2">
            無料登録すると、<span className="font-bold" style={{ color: '#f97316' }}>全35ツール</span>が各1個ずつ作成できます
          </p>
          <Link
            href="/start"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200"
          >
            無料でできること・プラン詳細を見る
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
