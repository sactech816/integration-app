'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Star, Brain, Lightbulb, ShoppingBag,
  UserCircle, TrendingUp, Calendar, ClipboardList, BookOpen,
  MousePointerClick, PenTool, Gem, ArrowRight,
} from 'lucide-react';

/* ─── Types ─── */

type Tool = {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
};

type Persona = {
  id: string;
  label: string;
  icon: React.ElementType;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  tools: Tool[];
  catchphrase: string;
};

/* ─── Tool Data ─── */

const TOOLS_BUPPAN: Tool[] = [
  { name: 'プロフィールLP', description: 'あなたの魅力を伝えるプロフィールページを5分で作成', icon: UserCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'LPメーカー', description: '商品・サービスの魅力を最大限に伝えるランディングページ', icon: MousePointerClick, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { name: '診断クイズ', description: 'お客様の悩みを可視化し、最適な提案につなげる診断', icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: '予約メーカー', description: '面談・相談の予約受付を自動化', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'セールスライター', description: 'AIが商品の魅力を引き出すセールスレターを自動生成', icon: PenTool, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'メルマガメーカー', description: '見込み客との関係を育てるメールマガジン配信', icon: BookOpen, color: 'text-rose-600', bg: 'bg-rose-50' },
];

const TOOLS_COACH: Tool[] = [
  { name: 'プロフィールLP', description: 'あなたの実績・想いを伝える本格的なプロフィールページ', icon: UserCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: '診断クイズ', description: 'クライアントの課題を見える化する診断ツール', icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: '予約メーカー', description: 'セッション・体験会の予約を24時間自動受付', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'セールスライター', description: 'サービスの価値を伝えるセールスページをAIが作成', icon: PenTool, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'LPメーカー', description: 'セミナー・講座の集客ページを簡単作成', icon: MousePointerClick, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { name: 'メルマガメーカー', description: '見込み客にあなたの専門知識を定期配信', icon: BookOpen, color: 'text-rose-600', bg: 'bg-rose-50' },
];

const TOOLS_URANAI: Tool[] = [
  { name: 'プロフィールLP', description: '占い師としてのブランディングページを作成', icon: UserCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: '生年月日占い', description: 'オリジナル占いコンテンツを自動生成', icon: Star, color: 'text-violet-600', bg: 'bg-violet-50' },
  { name: '予約メーカー', description: '鑑定予約の受付を24時間自動化', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'メルマガメーカー', description: '今週の運勢など定期コンテンツを配信', icon: BookOpen, color: 'text-rose-600', bg: 'bg-rose-50' },
  { name: 'LPメーカー', description: '鑑定メニュー・料金を魅力的に紹介するページ', icon: MousePointerClick, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { name: 'フォームメーカー', description: '鑑定申し込み・決済を一つのフォームで完結', icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const TOOLS_BEGINNER: Tool[] = [
  { name: 'プロフィールLP', description: 'まずはここから！あなたを知ってもらうページ', icon: UserCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'LPメーカー', description: 'サービス紹介ページをテンプレートから簡単作成', icon: MousePointerClick, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { name: '予約メーカー', description: 'LINEやSNSからの予約を一元管理', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'フォームメーカー', description: '申し込み・お問い合わせフォームを決済付きで', icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50' },
  { name: 'セールスライター', description: 'AIがあなたの代わりに魅力的な文章を作成', icon: PenTool, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'サムネイルメーカー', description: 'SNS投稿やバナーに使える画像をAIで生成', icon: Gem, color: 'text-pink-600', bg: 'bg-pink-50' },
];

const TOOLS_MLM: Tool[] = [
  { name: 'プロフィールLP', description: 'あなた自身のブランドを確立するプロフィールページ', icon: UserCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'LPメーカー', description: '商品・ビジネスの魅力を伝えるランディングページ', icon: MousePointerClick, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { name: '診断クイズ', description: '見込み客の興味・悩みを引き出す診断コンテンツ', icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: '予約メーカー', description: '説明会・個別相談の予約を自動化', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'セールスライター', description: 'ビジネスの魅力を伝えるセールスレターをAI作成', icon: PenTool, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'メルマガメーカー', description: 'チームメンバーとの関係構築にメール配信', icon: BookOpen, color: 'text-rose-600', bg: 'bg-rose-50' },
];

const PERSONAS: Persona[] = [
  {
    id: 'buppan',
    label: '物販・EC',
    icon: ShoppingBag,
    activeBg: 'bg-orange-600',
    activeText: 'text-white',
    activeBorder: 'border-orange-600',
    tools: TOOLS_BUPPAN,
    catchphrase: '商品の魅力を伝えて、リピーターを増やす仕組みを。',
  },
  {
    id: 'coach',
    label: 'コーチ・コンサル',
    icon: Brain,
    activeBg: 'bg-blue-600',
    activeText: 'text-white',
    activeBorder: 'border-blue-600',
    tools: TOOLS_COACH,
    catchphrase: 'あなたの専門性を活かして、理想のクライアントと出会う仕組みを。',
  },
  {
    id: 'uranai',
    label: '占い・スピリチュアル',
    icon: Star,
    activeBg: 'bg-violet-600',
    activeText: 'text-white',
    activeBorder: 'border-violet-600',
    tools: TOOLS_URANAI,
    catchphrase: '鑑定の価値を伝えて、リピーターにつながる導線を。',
  },
  {
    id: 'beginner',
    label: '主婦・起業初心者',
    icon: Lightbulb,
    activeBg: 'bg-emerald-600',
    activeText: 'text-white',
    activeBorder: 'border-emerald-600',
    tools: TOOLS_BEGINNER,
    catchphrase: '初めてでも大丈夫。テンプレートを選ぶだけで集客の仕組みが完成。',
  },
  {
    id: 'mlm',
    label: 'MLM・ネットワーク',
    icon: Users,
    activeBg: 'bg-rose-600',
    activeText: 'text-white',
    activeBorder: 'border-rose-600',
    tools: TOOLS_MLM,
    catchphrase: 'オンラインで見込み客を集め、チームを拡大する仕組みを。',
  },
];

/* ─── Component ─── */

export default function PersonaTabs() {
  const [activeId, setActiveId] = useState(PERSONAS[0].id);
  const active = PERSONAS.find((p) => p.id === activeId)!;

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
        {PERSONAS.map((p) => {
          const isActive = p.id === activeId;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 min-h-[44px] shadow-sm ${
                isActive
                  ? `${p.activeBg} ${p.activeText} shadow-md`
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow'
              }`}
            >
              <Icon className="w-4 h-4" />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Active Catchphrase */}
      <p className="text-center text-gray-700 font-medium mb-8 text-lg">
        {active.catchphrase}
      </p>

      {/* Tool Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {active.tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.name}
              className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${tool.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${tool.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{tool.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA under tools */}
      <div className="mt-8 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
        >
          すべてのツールを見る <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
