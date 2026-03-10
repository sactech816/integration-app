'use client';

import { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  UserCircle,
  Building2,
  Video,
  Globe,
  Sparkles,
  PartyPopper,
  Gift,
  Gamepad2,
  Star,
  Ticket,
  Stamp,
  Mail,
  PenTool,
  FileText,
  ShoppingBag,
  Calendar,
  GitBranch,
  ClipboardCheck,
  ClipboardList,
  BookOpen,
  Search,
  Tv,
  Compass,
  type LucideIcon,
} from 'lucide-react';

type ToolItem = {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  name: string;
  desc: string;
  href: string;
};

type GuidePage = {
  emoji: string;
  subtitle: string;
  description: string;
  gradient: string;
  tools: ToolItem[];
};

const guidePages: GuidePage[] = [
  {
    emoji: '👋',
    subtitle: '知ってもらう',
    description: 'まずは「あなたは何者？」を伝えるページを作りましょう',
    gradient: 'from-blue-500 to-indigo-600',
    tools: [
      { icon: UserCircle, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100', name: 'プロフィールメーカー', desc: 'SNSリンクまとめ＆自己紹介ページ。lit.link代替に', href: '/profile' },
      { icon: Building2, iconColor: 'text-blue-600', iconBg: 'bg-blue-100', name: 'LPメーカー', desc: '商品・サービスのランディングページを簡単作成', href: '/business' },
      { icon: Video, iconColor: 'text-purple-600', iconBg: 'bg-purple-100', name: 'ウェビナーLPメーカー', desc: 'セミナー・イベントの告知ページを作成', href: '/webinar' },
      { icon: Globe, iconColor: 'text-teal-600', iconBg: 'bg-teal-100', name: 'HPメーカー', desc: 'ビジネス用のホームページを手軽に作成', href: '/site' },
    ],
  },
  {
    emoji: '🧲',
    subtitle: '集める',
    description: '興味を引くコンテンツで、見込み客を集めましょう',
    gradient: 'from-emerald-500 to-teal-600',
    tools: [
      { icon: Sparkles, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100', name: '診断クイズメーカー', desc: '性格診断・適職診断・検定クイズをAIで自動生成', href: '/quiz' },
      { icon: PartyPopper, iconColor: 'text-pink-600', iconBg: 'bg-pink-100', name: 'エンタメ診断メーカー', desc: 'バズる診断コンテンツでSNS拡散', href: '/entertainment' },
      { icon: Gift, iconColor: 'text-rose-600', iconBg: 'bg-rose-100', name: '福引きメーカー', desc: 'オンライン福引きでキャンペーン集客', href: '/gamification' },
      { icon: Gamepad2, iconColor: 'text-purple-600', iconBg: 'bg-purple-100', name: 'ガチャメーカー', desc: 'ガチャ演出で楽しくエンゲージメント向上', href: '/gamification' },
      { icon: Star, iconColor: 'text-yellow-600', iconBg: 'bg-yellow-100', name: 'スロット・スクラッチ', desc: 'スロットやスクラッチカードで来店促進', href: '/gamification' },
      { icon: Stamp, iconColor: 'text-green-600', iconBg: 'bg-green-100', name: 'スタンプラリー', desc: 'デジタルスタンプラリーでリピーター獲得', href: '/gamification' },
    ],
  },
  {
    emoji: '💌',
    subtitle: '育てる',
    description: '見込み客との関係を深め、信頼を築きましょう',
    gradient: 'from-amber-500 to-orange-600',
    tools: [
      { icon: Mail, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-100', name: 'メルマガメーカー', desc: 'メールマガジンで定期的に情報発信', href: '/newsletter' },
      { icon: Mail, iconColor: 'text-blue-600', iconBg: 'bg-blue-100', name: 'ステップメール', desc: '自動配信メールで見込み客を育成', href: '/step-email' },
      { icon: PenTool, iconColor: 'text-amber-600', iconBg: 'bg-amber-100', name: 'セールスライター', desc: 'AIが売れる文章を自動生成', href: '/salesletter' },
      { icon: FileText, iconColor: 'text-orange-600', iconBg: 'bg-orange-100', name: 'SNS投稿メーカー', desc: 'SNS投稿文・キャプションをAIで作成', href: '/sns-post' },
    ],
  },
  {
    emoji: '💰',
    subtitle: '売る・つなげる',
    description: '予約・申込み・決済をスムーズに。チャンスを逃さない仕組みを',
    gradient: 'from-rose-500 to-pink-600',
    tools: [
      { icon: Calendar, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-100', name: '予約メーカー', desc: '日程調整不要の予約受付システム', href: '/booking' },
      { icon: ClipboardCheck, iconColor: 'text-purple-600', iconBg: 'bg-purple-100', name: '申し込みフォーム', desc: '決済付きの申し込みフォームを作成', href: '/order-form' },
      { icon: GitBranch, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100', name: 'ファネルメーカー', desc: '集客→教育→販売の自動化フロー構築', href: '/funnel' },
      { icon: ClipboardList, iconColor: 'text-teal-600', iconBg: 'bg-teal-100', name: '出欠メーカー', desc: 'イベント参加の出欠管理を簡単に', href: '/attendance' },
      { icon: ShoppingBag, iconColor: 'text-green-600', iconBg: 'bg-green-100', name: 'アンケートメーカー', desc: '顧客の声を集めてサービス改善', href: '/survey' },
    ],
  },
  {
    emoji: '🔍',
    subtitle: '調べる',
    description: '市場のニーズを調べて、売れる商品・コンテンツを見つけましょう',
    gradient: 'from-violet-500 to-purple-600',
    tools: [
      { icon: BookOpen, iconColor: 'text-orange-600', iconBg: 'bg-orange-100', name: 'Kindleリサーチ', desc: 'Kindle市場の売れ筋・キーワードを分析', href: '/kindle' },
      { icon: ShoppingBag, iconColor: 'text-rose-600', iconBg: 'bg-rose-100', name: '楽天リサーチ', desc: '楽天市場の商品トレンドを調査', href: '/rakuten-research' },
      { icon: Globe, iconColor: 'text-teal-600', iconBg: 'bg-teal-100', name: 'Googleリサーチ', desc: '検索トレンド・ニーズをリサーチ', href: '/google-research' },
      { icon: Search, iconColor: 'text-red-600', iconBg: 'bg-red-100', name: 'YouTubeリサーチ', desc: 'YouTube市場の人気動画・キーワードを分析', href: '/youtube-research' },
      { icon: Tv, iconColor: 'text-orange-600', iconBg: 'bg-orange-100', name: 'ニコニコリサーチ', desc: 'ニコニコ動画の人気コンテンツを調査', href: '/niconico-research' },
      { icon: Globe, iconColor: 'text-orange-700', iconBg: 'bg-orange-100', name: 'Redditリサーチ', desc: '海外市場のトレンド・ニーズを調査', href: '/reddit-research' },
    ],
  },
];

export default function ToolGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);

  if (!isOpen) return null;

  const page = guidePages[currentPage];
  const totalPages = guidePages.length;
  const isFirst = currentPage === 0;
  const isLast = currentPage === totalPages - 1;

  const handleNext = () => {
    if (!isLast) setCurrentPage((p) => p + 1);
  };

  const handleBack = () => {
    if (!isFirst) setCurrentPage((p) => p - 1);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setCurrentPage(0);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentPage(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${page.gradient} px-6 py-5 text-white relative flex-shrink-0`}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
          <div className="text-xs font-medium opacity-80 mb-1">
            集客メーカーガイド — {currentPage + 1} / {totalPages}
          </div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span className="text-2xl">{page.emoji}</span>
            {page.subtitle}
          </h3>
          <p className="text-sm opacity-90 mt-1">{page.description}</p>
          {/* Progress dots */}
          <div className="flex gap-1.5 mt-3">
            {guidePages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentPage
                    ? 'w-6 bg-white'
                    : idx < currentPage
                    ? 'w-3 bg-white/60'
                    : 'w-3 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tool list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {page.tools.map((tool, idx) => (
            <a
              key={idx}
              href={tool.href}
              className="flex items-start gap-3 p-3 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${tool.iconBg} ${tool.iconColor} flex items-center justify-center flex-shrink-0`}>
                <tool.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{ color: '#5d4037' }}>
                  {tool.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {tool.desc}
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-orange-400 flex-shrink-0 mt-1 transition" />
            </a>
          ))}
        </div>

        {/* Footer navigation */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          {!isFirst ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition"
            >
              <ArrowLeft size={16} />
              戻る
            </button>
          ) : (
            <div />
          )}
          {!isLast ? (
            <button
              onClick={handleNext}
              className={`flex items-center gap-1.5 text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-md transition bg-gradient-to-r ${page.gradient} hover:opacity-90`}
            >
              次へ
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-md transition bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90"
            >
              閉じる
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
