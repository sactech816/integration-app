'use client';

import { useState } from 'react';
import {
  Briefcase,
  Mic,
  ShoppingCart,
  BookOpen,
  Store,
  Megaphone,
  ArrowRight,
  ChevronRight,
  Eye,
  Users,
  CreditCard,
  Rocket,
  Search,
  CheckCircle2,
} from 'lucide-react';

// ─── ペルソナ定義 ───
type Persona = {
  id: string;
  name: string;
  subtitle: string;
  icon: typeof Briefcase;
  color: string;       // Tailwind bg color
  textColor: string;
  borderColor: string;
  steps: Step[];
};

type Step = {
  phase: string;
  phaseIcon: typeof Eye;
  phaseColor: string;
  tools: { name: string; href: string; description: string }[];
};

const personas: Persona[] = [
  {
    id: 'startup',
    name: 'これから起業する方',
    subtitle: '副業開始・個人事業の準備中',
    icon: Briefcase,
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    steps: [
      {
        phase: '認知をつくる',
        phaseIcon: Eye,
        phaseColor: 'text-sky-600',
        tools: [
          { name: 'プロフィールメーカー', href: '/profile/editor', description: '名刺代わりのWebページを作成' },
          { name: 'SNS投稿メーカー', href: '/sns-post/editor', description: 'SNS用の投稿画像を量産' },
        ],
      },
      {
        phase: '見込み客を集める',
        phaseIcon: Users,
        phaseColor: 'text-emerald-600',
        tools: [
          { name: '診断クイズメーカー', href: '/quiz/editor', description: '「あなたは何タイプ？」で興味を引く' },
          { name: 'サムネイルメーカー', href: '/thumbnail/editor', description: 'クリックされるサムネを作成' },
        ],
      },
      {
        phase: '商品を販売する',
        phaseIcon: CreditCard,
        phaseColor: 'text-orange-600',
        tools: [
          { name: 'ガイドメーカー', href: '/onboarding/editor', description: 'はじめかたページで信頼を獲得' },
          { name: '申し込みフォーム', href: '/order-form/new', description: '決済付きの申し込みページ' },
        ],
      },
      {
        phase: '自動化・拡大する',
        phaseIcon: Rocket,
        phaseColor: 'text-purple-600',
        tools: [
          { name: 'メルマガメーカー', href: '/newsletter/campaigns/new', description: 'メール配信で継続的にアプローチ' },
          { name: 'ファネルメーカー', href: '/funnel/new', description: '集客〜販売を自動化' },
        ],
      },
    ],
  },
  {
    id: 'coach',
    name: 'コーチ・コンサル',
    subtitle: '1対1のサービス提供者',
    icon: Mic,
    color: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    steps: [
      {
        phase: '認知をつくる',
        phaseIcon: Eye,
        phaseColor: 'text-sky-600',
        tools: [
          { name: 'プロフィールメーカー', href: '/profile/editor', description: '実績・経歴を魅力的にアピール' },
          { name: '診断クイズメーカー', href: '/quiz/editor', description: 'お客様の悩みを可視化' },
        ],
      },
      {
        phase: '見込み客を集める',
        phaseIcon: Users,
        phaseColor: 'text-emerald-600',
        tools: [
          { name: 'LPメーカー', href: '/business/editor', description: 'サービス紹介ページを作成' },
          { name: 'メルマガメーカー', href: '/newsletter/campaigns/new', description: 'メールで見込み客を育成' },
        ],
      },
      {
        phase: '商品を販売する',
        phaseIcon: CreditCard,
        phaseColor: 'text-orange-600',
        tools: [
          { name: '予約メーカー', href: '/booking/new', description: '日程調整の手間をゼロに' },
          { name: '申し込みフォーム', href: '/order-form/new', description: '決済付きの申し込みページ' },
          { name: 'セールスライター', href: '/salesletter/editor', description: 'AIが売れる文章を自動生成' },
        ],
      },
      {
        phase: '自動化・拡大する',
        phaseIcon: Rocket,
        phaseColor: 'text-purple-600',
        tools: [
          { name: 'ステップメール', href: '/step-email/sequences/new', description: '自動フォローアップメール' },
          { name: 'ファネルメーカー', href: '/funnel/new', description: '集客〜成約を仕組み化' },
          { name: 'ゲーミフィケーション', href: '/gamification', description: 'リピーター育成の仕掛け' },
        ],
      },
    ],
  },
  {
    id: 'seminar',
    name: 'セミナー・講座開催者',
    subtitle: 'グループ型ビジネス',
    icon: Users,
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    steps: [
      {
        phase: '認知をつくる',
        phaseIcon: Eye,
        phaseColor: 'text-sky-600',
        tools: [
          { name: 'ウェビナーLPメーカー', href: '/webinar/editor', description: 'セミナー告知ページを即作成' },
          { name: 'SNS投稿メーカー', href: '/sns-post/editor', description: '告知画像をSNSで拡散' },
        ],
      },
      {
        phase: '見込み客を集める',
        phaseIcon: Users,
        phaseColor: 'text-emerald-600',
        tools: [
          { name: '診断クイズメーカー', href: '/quiz/editor', description: '参加者の悩みを事前に把握' },
          { name: 'メルマガメーカー', href: '/newsletter/campaigns/new', description: 'セミナー案内をメール配信' },
        ],
      },
      {
        phase: 'イベントを運営する',
        phaseIcon: CreditCard,
        phaseColor: 'text-orange-600',
        tools: [
          { name: '予約メーカー', href: '/booking/new', description: '参加申し込みを自動受付' },
          { name: '出欠メーカー', href: '/attendance/editor', description: '出欠確認をスムーズに' },
          { name: 'アンケートメーカー', href: '/survey/editor', description: '満足度・フィードバック収集' },
        ],
      },
      {
        phase: '自動化・拡大する',
        phaseIcon: Rocket,
        phaseColor: 'text-purple-600',
        tools: [
          { name: 'ファネルメーカー', href: '/funnel/new', description: 'セミナー→バックエンド販売を自動化' },
          { name: 'ステップメール', href: '/step-email/sequences/new', description: '参加後フォローを自動配信' },
          { name: 'アフィリエイト', href: '/affiliate', description: '紹介制度で集客を加速' },
        ],
      },
    ],
  },
  {
    id: 'content',
    name: 'コンテンツ販売者',
    subtitle: 'Kindle・教材・デジタル商品',
    icon: BookOpen,
    color: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    steps: [
      {
        phase: '認知をつくる',
        phaseIcon: Eye,
        phaseColor: 'text-sky-600',
        tools: [
          { name: 'プロフィールメーカー', href: '/profile/editor', description: '著者ページで信頼を構築' },
          { name: 'Kindle体験版', href: '/kindle/demo', description: '試し読みページを作成' },
        ],
      },
      {
        phase: '見込み客を集める',
        phaseIcon: Users,
        phaseColor: 'text-emerald-600',
        tools: [
          { name: 'LPメーカー', href: '/business/editor', description: '商品紹介ページを作成' },
          { name: 'サムネイルメーカー', href: '/thumbnail/editor', description: '目を引く表紙・サムネを作成' },
          { name: 'SNS投稿メーカー', href: '/sns-post/editor', description: 'SNSで商品を告知' },
        ],
      },
      {
        phase: '商品を販売する',
        phaseIcon: CreditCard,
        phaseColor: 'text-orange-600',
        tools: [
          { name: 'セールスライター', href: '/salesletter/editor', description: 'AIが売れる文章を自動生成' },
          { name: '申し込みフォーム', href: '/order-form/new', description: '決済付きの販売ページ' },
        ],
      },
      {
        phase: '自動化・拡大する',
        phaseIcon: Rocket,
        phaseColor: 'text-purple-600',
        tools: [
          { name: 'ファネルメーカー', href: '/funnel/new', description: '集客〜販売を自動化' },
          { name: 'ステップメール', href: '/step-email/sequences/new', description: '購入後のアップセルを自動化' },
          { name: 'ゲーミフィケーション', href: '/gamification', description: 'リピーター育成の仕掛け' },
        ],
      },
    ],
  },
  {
    id: 'ec',
    name: 'EC・物販事業者',
    subtitle: '楽天・Amazon・自社EC',
    icon: Store,
    color: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    steps: [
      {
        phase: '市場を調査する',
        phaseIcon: Search,
        phaseColor: 'text-sky-600',
        tools: [
          { name: '楽天リサーチ', href: '/rakuten-research/editor', description: '売れ筋商品・キーワードを調査' },
          { name: 'Googleキーワードリサーチ', href: '/google-keyword-research/editor', description: '検索需要を把握' },
        ],
      },
      {
        phase: '見込み客を集める',
        phaseIcon: Users,
        phaseColor: 'text-emerald-600',
        tools: [
          { name: 'LPメーカー', href: '/business/editor', description: '商品紹介ページを作成' },
          { name: 'SNS投稿メーカー', href: '/sns-post/editor', description: 'SNSで商品を告知' },
          { name: 'サムネイルメーカー', href: '/thumbnail/editor', description: '商品画像を魅力的に' },
        ],
      },
      {
        phase: '商品を販売する',
        phaseIcon: CreditCard,
        phaseColor: 'text-orange-600',
        tools: [
          { name: 'セールスライター', href: '/salesletter/editor', description: '商品説明文をAIで生成' },
          { name: '申し込みフォーム', href: '/order-form/new', description: '自社販売ページを作成' },
        ],
      },
      {
        phase: '自動化・拡大する',
        phaseIcon: Rocket,
        phaseColor: 'text-purple-600',
        tools: [
          { name: 'メルマガメーカー', href: '/newsletter/campaigns/new', description: 'リピート購入を促進' },
          { name: 'ファネルメーカー', href: '/funnel/new', description: '集客〜販売を自動化' },
          { name: 'アフィリエイト', href: '/affiliate', description: '紹介制度で販路拡大' },
        ],
      },
    ],
  },
  {
    id: 'sns',
    name: 'SNS発信者',
    subtitle: 'インフルエンサー・フォロワー収益化',
    icon: Megaphone,
    color: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    steps: [
      {
        phase: '認知をつくる',
        phaseIcon: Eye,
        phaseColor: 'text-sky-600',
        tools: [
          { name: 'プロフィールメーカー', href: '/profile/editor', description: 'リンクまとめページを作成' },
          { name: 'SNS投稿メーカー', href: '/sns-post/editor', description: '投稿画像を量産' },
          { name: 'サムネイルメーカー', href: '/thumbnail/editor', description: 'YouTube用サムネ作成' },
        ],
      },
      {
        phase: 'ファンを増やす',
        phaseIcon: Users,
        phaseColor: 'text-emerald-600',
        tools: [
          { name: 'エンタメ診断メーカー', href: '/entertainment/create', description: 'バズる診断コンテンツ' },
          { name: 'YouTube競合分析', href: '/youtube-analysis/editor', description: '競合チャンネルを分析' },
        ],
      },
      {
        phase: '収益化する',
        phaseIcon: CreditCard,
        phaseColor: 'text-orange-600',
        tools: [
          { name: 'LPメーカー', href: '/business/editor', description: '商品・サービス紹介ページ' },
          { name: '申し込みフォーム', href: '/order-form/new', description: '決済付きの販売ページ' },
        ],
      },
      {
        phase: '拡大・仕組み化',
        phaseIcon: Rocket,
        phaseColor: 'text-purple-600',
        tools: [
          { name: 'ゲーミフィケーション', href: '/gamification', description: 'ガチャ・福引きでエンゲージUP' },
          { name: 'メルマガメーカー', href: '/newsletter/campaigns/new', description: 'ファンとの関係を深める' },
          { name: 'アフィリエイト', href: '/affiliate', description: '紹介報酬で収益拡大' },
        ],
      },
    ],
  },
];

export default function PersonaRoadmap() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const activePersona = personas.find((p) => p.id === selectedPersona);

  return (
    <div>
      {/* ─── ペルソナ選択カード ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 max-w-6xl mx-auto mb-12">
        {personas.map((persona) => {
          const Icon = persona.icon;
          const isActive = selectedPersona === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(isActive ? null : persona.id)}
              className={`relative p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 text-left group
                ${isActive
                  ? `${persona.color} ${persona.borderColor} shadow-lg scale-[1.02]`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-1'
                }`}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${isActive ? persona.color : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                <Icon size={22} className={isActive ? persona.textColor : 'text-gray-500 group-hover:text-gray-700'} />
              </div>
              <h3 className={`font-bold text-sm md:text-base leading-tight mb-1 ${isActive ? persona.textColor : 'text-gray-800'}`}>
                {persona.name}
              </h3>
              <p className="text-xs text-gray-500 leading-snug">{persona.subtitle}</p>
              {isActive && (
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${persona.textColor}`}>
                  <CheckCircle2 size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── ロードマップ表示 ─── */}
      {activePersona && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-black" style={{ color: '#5d4037' }}>
              <span className={activePersona.textColor}>{activePersona.name}</span>の
              <br className="md:hidden" />
              おすすめロードマップ
            </h3>
            <p className="text-sm text-gray-500 mt-2">上から順番に進めていくのがおすすめです</p>
          </div>

          <div className="relative">
            {/* 縦のつなぎ線 */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {activePersona.steps.map((step, stepIdx) => {
                const PhaseIcon = step.phaseIcon;
                return (
                  <div key={stepIdx} className="relative pl-16 md:pl-20">
                    {/* ステップ番号 */}
                    <div
                      className="absolute left-0 top-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg z-10"
                      style={{ backgroundColor: '#f97316' }}
                    >
                      <span className="text-[10px] leading-none opacity-80">STEP</span>
                      <span className="text-lg md:text-xl leading-none">{stepIdx + 1}</span>
                    </div>

                    {/* フェーズカード */}
                    <div className={`${activePersona.color} border ${activePersona.borderColor} rounded-2xl p-5 md:p-6`}>
                      <div className="flex items-center gap-2 mb-4">
                        <PhaseIcon size={18} className={step.phaseColor} />
                        <h4 className="font-bold text-base md:text-lg" style={{ color: '#5d4037' }}>
                          {step.phase}
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {step.tools.map((tool, toolIdx) => (
                          <a
                            key={toolIdx}
                            href={tool.href}
                            className="flex items-center justify-between bg-white rounded-xl p-3 md:p-4 border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm md:text-base text-gray-800 group-hover:text-orange-600 transition-colors">
                                {tool.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">{tool.description}</div>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-500 transition-colors flex-shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* ステップ間の矢印 */}
                    {stepIdx < activePersona.steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowRight size={16} className="text-gray-300 rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 全ツール一覧へのリンク */}
          <div className="text-center mt-10">
            <p className="text-sm text-gray-500 mb-3">
              もちろん、どのツールも自由にお使いいただけます
            </p>
            <button
              onClick={() => document.getElementById('create-section-services')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 font-bold text-sm border-b-2 transition"
              style={{ color: '#f97316', borderColor: '#f97316' }}
            >
              全ツール一覧を見る <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 未選択時のヒント */}
      {!selectedPersona && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">
            あなたに近いタイプを選ぶと、おすすめの使い方をステップバイステップでご案内します
          </p>
        </div>
      )}
    </div>
  );
}
