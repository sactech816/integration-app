'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  UserCircle,
  Building2,
  FileText,
  Calendar,
  Users,
  Gift,
  Gamepad2,
  Ticket,
  Star,
  Stamp,
  ArrowRight,
  TrendingUp,
  PenTool,
  Crown,
  Image,
  Store,
  Lightbulb,
  PartyPopper,
  Mail,
  GitBranch,
  Video,
  ClipboardCheck,
  Send,
  BookOpen,
  Share2,
  ListOrdered,
  MessageCircle,
  Search,
  Tv,
  Globe,
  LayoutGrid,
  Target,
  Briefcase,
  Mic,
  ShoppingCart,
  Megaphone,
  CheckCircle2,
  Monitor,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { supabase } from '@/lib/supabase';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

// ===== 共通ツール型 =====
type GenreCategoryId = 'page' | 'quiz' | 'writing' | 'marketing' | 'gamification' | 'research' | 'monetization';
type PurposeCategoryId = 'awareness' | 'collect' | 'nurture' | 'sell' | 'automate' | 'research';
type PersonaId = 'startup' | 'coach' | 'seminar' | 'content' | 'ec' | 'sns';

type ToolDef = {
  name: string;
  description: string;
  icon: typeof Sparkles;
  href: string;
  color: string;
  bgColor: string;
  textColor: string;
  features: string[];
  isPro?: boolean;
  isDemo?: boolean;
  genre: GenreCategoryId;
  purpose: PurposeCategoryId;
  personas: PersonaId[];
};

// ===== ジャンルカテゴリ定義 =====
const genreCategories: { id: GenreCategoryId; label: string; color: string; bgColor: string; borderColor: string; headerBg: string }[] = [
  { id: 'page', label: 'LP・ページ作成', color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', headerBg: 'from-indigo-500 to-blue-600' },
  { id: 'quiz', label: '診断・クイズ', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', headerBg: 'from-emerald-500 to-teal-600' },
  { id: 'writing', label: 'ライティング・制作', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', headerBg: 'from-amber-500 to-orange-600' },
  { id: 'marketing', label: '集客・イベント', color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', headerBg: 'from-cyan-500 to-blue-600' },
  { id: 'gamification', label: 'ゲーミフィケーション', color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', headerBg: 'from-pink-500 to-rose-600' },
  { id: 'research', label: 'リサーチ', color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', headerBg: 'from-rose-500 to-red-600' },
  { id: 'monetization', label: '収益化・販売', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', headerBg: 'from-purple-500 to-violet-600' },
];

// ===== 目的カテゴリ定義 =====
const purposeCategories: { id: PurposeCategoryId; label: string; subtitle: string; color: string; bgColor: string; borderColor: string; headerBg: string; emoji: string }[] = [
  { id: 'awareness', label: '知ってもらう', subtitle: '認知獲得', color: 'text-sky-600', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', headerBg: 'from-sky-500 to-blue-600', emoji: '👋' },
  { id: 'collect', label: '集める', subtitle: 'リード獲得', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', headerBg: 'from-emerald-500 to-teal-600', emoji: '🧲' },
  { id: 'nurture', label: '育てる', subtitle: 'ナーチャリング', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', headerBg: 'from-amber-500 to-orange-600', emoji: '🌱' },
  { id: 'sell', label: '売る', subtitle: '成約', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', headerBg: 'from-orange-500 to-red-600', emoji: '💰' },
  { id: 'automate', label: '自動化する', subtitle: '仕組み化', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', headerBg: 'from-purple-500 to-indigo-600', emoji: '⚙️' },
  { id: 'research', label: '調べる', subtitle: 'リサーチ', color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', headerBg: 'from-rose-500 to-red-600', emoji: '🔍' },
];

// ===== ペルソナ定義 =====
const personaTypes: { id: PersonaId; name: string; subtitle: string; icon: typeof Briefcase; color: string; textColor: string; borderColor: string; bgColor: string }[] = [
  { id: 'startup', name: 'これから起業する方', subtitle: '副業開始・個人事業の準備中', icon: Briefcase, color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-700', borderColor: 'border-blue-200', bgColor: 'bg-blue-50' },
  { id: 'coach', name: 'コーチ・コンサル', subtitle: '1対1のサービス提供者', icon: Mic, color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', bgColor: 'bg-emerald-50' },
  { id: 'seminar', name: 'セミナー・講座開催者', subtitle: 'グループ型ビジネス', icon: Users, color: 'from-amber-500 to-orange-600', textColor: 'text-amber-700', borderColor: 'border-amber-200', bgColor: 'bg-amber-50' },
  { id: 'content', name: 'コンテンツ販売者', subtitle: 'Kindle・教材・デジタル商品', icon: BookOpen, color: 'from-rose-500 to-pink-600', textColor: 'text-rose-700', borderColor: 'border-rose-200', bgColor: 'bg-rose-50' },
  { id: 'ec', name: 'EC・物販事業者', subtitle: '楽天・Amazon・自社EC', icon: Store, color: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-700', borderColor: 'border-cyan-200', bgColor: 'bg-cyan-50' },
  { id: 'sns', name: 'SNS発信者', subtitle: 'インフルエンサー・フォロワー収益化', icon: Megaphone, color: 'from-purple-500 to-violet-600', textColor: 'text-purple-700', borderColor: 'border-purple-200', bgColor: 'bg-purple-50' },
];

// ===== 全ツールデータ =====
const allTools: ToolDef[] = [
  // LP・ページ作成
  { name: 'プロフィールメーカー', description: 'SNSプロフィールに最適なリンクまとめページを作成。lit.linkの代替として無料で使えます。', icon: UserCircle, href: '/profile', color: 'from-indigo-500 to-blue-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', features: ['リンクまとめ', 'テンプレート', 'アクセス解析'], genre: 'page', purpose: 'awareness', personas: ['startup', 'coach', 'content', 'sns'] },
  { name: 'LPメーカー', description: '商品・サービスのランディングページを無料で作成。CV最適化されたテンプレートで簡単にLPを作れます。', icon: Building2, href: '/business', color: 'from-indigo-500 to-purple-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', features: ['テンプレート豊富', 'CV最適化', 'レスポンシブ'], genre: 'page', purpose: 'collect', personas: ['coach', 'content', 'ec', 'sns'] },
  { name: 'ウェビナーLPメーカー', description: 'ウェビナー・オンラインセミナーの集客LPを無料で作成。申し込みフォーム付きで参加者管理も楽々。', icon: Video, href: '/webinar', color: 'from-indigo-400 to-violet-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', features: ['LP作成', '申込フォーム', '参加者管理'], genre: 'page', purpose: 'collect', personas: ['seminar'] },
  { name: 'ガイドメーカー', description: 'サイトに埋め込めるはじめかたガイドを無料で作成。外部サイトへの埋め込みにも対応します。', icon: Lightbulb, href: '/onboarding', color: 'from-indigo-400 to-blue-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', features: ['埋め込み対応', 'トリガー設定', 'PRO'], isPro: true, genre: 'page', purpose: 'sell', personas: ['startup'] },
  { name: 'ホームページメーカー', description: '複数ページのホームページを無料で作成。事業紹介サイトをノーコードで構築できます。', icon: Monitor, href: '/site', color: 'from-indigo-500 to-blue-700', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', features: ['マルチページ', 'ノーコード', 'レスポンシブ'], genre: 'page', purpose: 'awareness', personas: ['startup', 'coach', 'seminar'] },
  // 診断・クイズ
  { name: '診断クイズメーカー', description: '性格診断、適職診断、心理テスト、検定クイズなどをAIで簡単作成。SNSでバズる診断コンテンツを無料で作れます。', icon: Sparkles, href: '/quiz', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', features: ['AI自動生成', 'SNSシェア', '分析機能'], genre: 'quiz', purpose: 'collect', personas: ['startup', 'coach', 'seminar', 'sns'] },
  { name: 'エンタメ診断メーカー', description: 'バズるエンタメ系診断コンテンツをAIで無料作成。SNSで拡散される楽しい診断を作れます。', icon: PartyPopper, href: '/entertainment/create', color: 'from-emerald-400 to-green-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', features: ['AI自動生成', 'SNSバズ', 'エンタメ系'], genre: 'quiz', purpose: 'collect', personas: ['sns'] },
  // ライティング・制作
  { name: 'セールスライター', description: 'セールスレター・LP文章をAIで無料自動生成。売れるコピーライティングを誰でも簡単に作成できます。', icon: PenTool, href: '/salesletter', color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50', textColor: 'text-amber-600', features: ['AI自動生成', '売れる文章', 'テンプレート'], genre: 'writing', purpose: 'sell', personas: ['coach', 'content', 'ec'] },
  { name: 'サムネイルメーカー', description: 'YouTube・ブログ・Kindle用のサムネイル画像をAIで無料自動生成。プロ品質のビジュアルを簡単に作成。', icon: Image, href: '/thumbnail', color: 'from-amber-400 to-yellow-600', bgColor: 'bg-amber-50', textColor: 'text-amber-600', features: ['AI自動生成', 'YouTube対応', 'PRO'], isPro: true, genre: 'writing', purpose: 'awareness', personas: ['startup', 'content', 'ec', 'sns'] },
  { name: 'SNS投稿メーカー', description: 'SNS投稿文をAIで無料自動生成。X・Instagram・Facebook等に最適な投稿を簡単作成。', icon: Send, href: '/sns-post', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-50', textColor: 'text-amber-600', features: ['AI自動生成', 'SNS最適化', 'マルチ対応'], genre: 'writing', purpose: 'awareness', personas: ['startup', 'seminar', 'content', 'ec', 'sns'] },
  { name: 'Kindle執筆体験版', description: 'AIでKindle本を執筆体験。書籍執筆の第一歩をサポートします。', icon: BookOpen, href: '/kindle/demo', color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50', textColor: 'text-amber-600', features: ['AI執筆', '体験版', '書籍作成'], isDemo: true, genre: 'writing', purpose: 'sell', personas: ['content'] },
  { name: 'ネタ発掘診断', description: 'あなたに合った執筆ネタをAIが診断。書籍・ブログのテーマ探しに最適。', icon: Lightbulb, href: '/kindle/discovery/demo', isDemo: true, color: 'from-amber-400 to-yellow-500', bgColor: 'bg-amber-50', textColor: 'text-amber-600', features: ['AI診断', 'ネタ発掘', 'テーマ探し'], genre: 'writing', purpose: 'research', personas: ['content'] },
  // 集客・イベント
  { name: '予約メーカー', description: '無料で使えるビジネス向け予約管理システム。スプレッドシート連動やExcelエクスポートで効率的な予約管理が可能。', icon: Calendar, href: '/booking', color: 'from-cyan-500 to-blue-600', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600', features: ['カレンダー連携', 'Excel出力', '通知機能'], genre: 'marketing', purpose: 'sell', personas: ['coach', 'seminar'] },
  { name: '出欠表メーカー', description: '飲み会・イベントの日程調整を簡単に。調整さん風の出欠表を無料で何度でも作成できます。', icon: Users, href: '/attendance', color: 'from-cyan-400 to-teal-600', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600', features: ['ログイン不要', '無制限作成', 'リアルタイム'], genre: 'marketing', purpose: 'sell', personas: ['seminar'] },
  { name: 'アンケートメーカー', description: 'オンラインアンケート・投票・フィードバック収集を無料で作成。Googleフォームの代替として使えます。', icon: FileText, href: '/survey', color: 'from-cyan-500 to-sky-600', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600', features: ['簡単作成', '集計機能', 'リアルタイム'], genre: 'marketing', purpose: 'collect', personas: ['seminar'] },
  { name: 'メルマガメーカー', description: 'メールマガジンの作成・配信・管理を一元化。読者リスト管理からキャンペーン配信まで対応。', icon: Mail, href: '/newsletter', color: 'from-cyan-400 to-blue-600', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600', features: ['メール配信', '読者管理', 'キャンペーン'], genre: 'marketing', purpose: 'nurture', personas: ['startup', 'coach', 'seminar', 'ec', 'sns'] },
  { name: 'ステップメール', description: 'シナリオ設計からメール配信まで自動化。見込み客を段階的にナーチャリングして成約率をアップ。', icon: ListOrdered, href: '/step-email', color: 'from-cyan-500 to-blue-600', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600', features: ['自動配信', 'シナリオ設計', 'PRO'], isPro: true, genre: 'marketing', purpose: 'nurture', personas: ['coach', 'seminar', 'content'] },
  { name: 'LINE配信', description: 'LINE公式アカウントと連携してメッセージ配信。リッチメニュー・ステップ配信で顧客との関係を構築。', icon: MessageCircle, href: '/line', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50', textColor: 'text-green-600', features: ['LINE連携', 'ステップ配信', 'PRO'], isPro: true, genre: 'marketing', purpose: 'nurture', personas: ['coach', 'seminar'] },
  // ゲーミフィケーション
  { name: '福引き', description: 'デジタル福引きで景品抽選。イベントやキャンペーンに最適。', icon: Gift, href: '/fukubiki', color: 'from-pink-500 to-rose-600', bgColor: 'bg-pink-50', textColor: 'text-pink-600', features: ['景品抽選', 'キャンペーン', 'PRO'], isPro: true, genre: 'gamification', purpose: 'nurture', personas: ['sns', 'coach'] },
  { name: 'ガチャ', description: 'オンラインガチャで景品をランダム抽選。楽しいコンテンツを提供。', icon: Gamepad2, href: '/gacha', color: 'from-purple-500 to-pink-600', bgColor: 'bg-pink-50', textColor: 'text-pink-600', features: ['ランダム抽選', 'エンタメ', 'PRO'], isPro: true, genre: 'gamification', purpose: 'nurture', personas: ['sns', 'coach'] },
  { name: 'スロット', description: 'スロットゲームで景品抽選。エンターテイメント性抜群。', icon: Star, href: '/slot', color: 'from-yellow-500 to-orange-600', bgColor: 'bg-pink-50', textColor: 'text-pink-600', features: ['スロット体験', 'エンタメ', 'PRO'], isPro: true, genre: 'gamification', purpose: 'nurture', personas: ['sns'] },
  { name: 'スクラッチ', description: 'スクラッチカードで景品当選。リアルな削る体験。', icon: Ticket, href: '/scratch', color: 'from-cyan-500 to-blue-600', bgColor: 'bg-pink-50', textColor: 'text-pink-600', features: ['スクラッチ体験', 'リアル感', 'PRO'], isPro: true, genre: 'gamification', purpose: 'nurture', personas: ['sns'] },
  { name: 'スタンプラリー', description: 'デジタルスタンプラリーでリピート促進。店舗・イベントに最適。', icon: Stamp, href: '/stamp-rally', color: 'from-green-500 to-emerald-600', bgColor: 'bg-pink-50', textColor: 'text-pink-600', features: ['リピート促進', '店舗向け', 'PRO'], isPro: true, genre: 'gamification', purpose: 'nurture', personas: ['coach', 'seminar'] },
  { name: 'ログインボーナス', description: '毎日のログインでポイント付与。継続利用を促進。', icon: TrendingUp, href: '/login-bonus', color: 'from-indigo-500 to-purple-600', bgColor: 'bg-pink-50', textColor: 'text-pink-600', features: ['継続利用促進', 'ポイント', 'PRO'], isPro: true, genre: 'gamification', purpose: 'nurture', personas: ['coach'] },
  // リサーチ
  { name: 'YouTubeリサーチ', description: 'YouTube動画のリサーチ・分析をAIでサポート。競合分析やネタ探し、トレンド把握に最適。', icon: Search, href: '/youtube-analysis', color: 'from-red-500 to-rose-600', bgColor: 'bg-rose-50', textColor: 'text-rose-600', features: ['AI分析', '競合リサーチ', 'トレンド'], genre: 'research', purpose: 'research', personas: ['sns'] },
  { name: 'YouTubeキーワードリサーチ', description: 'YouTubeキーワード検索で上位動画の指標を一括分析。再生数・登録者数でソート・比較。', icon: TrendingUp, href: '/youtube-keyword-research', color: 'from-rose-500 to-red-600', bgColor: 'bg-rose-50', textColor: 'text-rose-600', features: ['キーワード検索', '上位動画分析', '比較チャート'], genre: 'research', purpose: 'research', personas: ['sns'] },
  { name: '楽天リサーチ', description: '楽天市場の売れ筋商品・キーワードを調査。EC事業者のリサーチに最適。', icon: ShoppingCart, href: '/rakuten-research', color: 'from-rose-500 to-pink-600', bgColor: 'bg-rose-50', textColor: 'text-rose-600', features: ['売れ筋調査', 'キーワード分析', 'EC向け'], genre: 'research', purpose: 'research', personas: ['ec'] },
  { name: 'Googleキーワードリサーチ', description: 'Google検索のキーワード需要を把握。SEO対策やコンテンツ企画に活用。', icon: Globe, href: '/google-keyword-research', color: 'from-teal-500 to-cyan-600', bgColor: 'bg-rose-50', textColor: 'text-rose-600', features: ['検索需要', 'SEO対策', 'キーワード提案'], genre: 'research', purpose: 'research', personas: ['ec', 'content'] },
  { name: 'Kindleリサーチ', description: 'Kindle市場のベストセラー・キーワードを調査。出版戦略の立案をサポート。', icon: BookOpen, href: '/kindle-research', color: 'from-orange-500 to-amber-600', bgColor: 'bg-rose-50', textColor: 'text-rose-600', features: ['ベストセラー分析', 'キーワード調査', '出版戦略'], genre: 'research', purpose: 'research', personas: ['content'] },
  { name: 'ニコニコキーワードリサーチ', description: 'ニコニコ動画のキーワード検索で上位動画の再生数・コメント数を一括分析。', icon: Tv, href: '/niconico-keyword-research', color: 'from-orange-400 to-orange-600', bgColor: 'bg-rose-50', textColor: 'text-rose-600', features: ['コメント文化分析', 'タグ分析', 'AI分析'], genre: 'research', purpose: 'research', personas: ['sns'] },
  { name: 'Redditキーワードリサーチ', description: 'Redditの人気投稿のスコア・エンゲージメントを一括分析。海外マーケティングに最適。', icon: Globe, href: '/reddit-keyword-research', color: 'from-orange-500 to-red-600', bgColor: 'bg-rose-50', textColor: 'text-rose-600', features: ['スコア分析', 'エンゲージメント', 'AI分析'], genre: 'research', purpose: 'research', personas: ['ec'] },
  // 収益化・販売
  { name: 'フォームメーカー', description: '申し込み・決済フォームを簡単作成。Stripe連携でオンライン決済にも対応。', icon: ClipboardCheck, href: '/order-form', color: 'from-purple-500 to-violet-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600', features: ['申込フォーム', '決済連携', 'カスタマイズ'], genre: 'monetization', purpose: 'sell', personas: ['startup', 'coach', 'seminar', 'content', 'ec', 'sns'] },
  { name: 'ファネルメーカー', description: '集客から成約までのセールスファネルを簡単構築。マーケティング自動化で売上アップ。', icon: GitBranch, href: '/funnel', color: 'from-purple-500 to-indigo-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600', features: ['ファネル構築', 'マーケ自動化', '成約率UP'], genre: 'monetization', purpose: 'automate', personas: ['startup', 'coach', 'seminar', 'content', 'ec'] },
  { name: 'アフィリエイト', description: '集客メーカーを紹介して報酬を獲得。紹介プログラムで簡単に収益化できます。', icon: Share2, href: '/affiliate', color: 'from-purple-400 to-indigo-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600', features: ['紹介報酬', '簡単登録', '収益化'], genre: 'monetization', purpose: 'automate', personas: ['seminar', 'ec', 'sns'] },
  { name: 'スキルマーケット', description: 'LP作成・診断クイズ・デザインなど集客のプロに依頼できるマーケット。', icon: Store, href: '/marketplace', color: 'from-purple-400 to-indigo-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600', features: ['プロに依頼', 'LP制作', 'PRO'], isPro: true, genre: 'monetization', purpose: 'sell', personas: [] },
];

// ===== ToolCard コンポーネント =====
function ToolCard({ tool, highlight, genreBg }: { tool: ToolDef; highlight?: boolean; genreBg?: string }) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.href}
      className={`group relative rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        highlight
          ? `${tool.bgColor} border-orange-300 shadow-md ring-2 ring-orange-200 ring-offset-1`
          : genreBg
            ? `${genreBg} border-transparent hover:bg-white hover:border-gray-100 shadow-sm hover:shadow-xl`
            : 'bg-white border-gray-100 hover:border-transparent'
      }`}
    >
      {tool.isPro && (
        <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
          <Crown size={10} className="mr-0.5" />PRO
        </div>
      )}
      {tool.isDemo && !tool.isPro && (
        <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">デモ</div>
      )}
      {highlight && (
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">
          <CheckCircle2 size={10} />おすすめ
        </div>
      )}

      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.name}</h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">{tool.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tool.features.map((f, i) => (
          <span key={i} className={`${tool.bgColor} ${tool.textColor} px-2 py-0.5 rounded-full text-xs font-bold`}>{f}</span>
        ))}
      </div>
      <div className={`flex items-center gap-2 ${tool.textColor} font-bold text-sm group-hover:gap-3 transition-all`}>
        詳しく見る <ArrowRight size={16} />
      </div>
    </Link>
  );
}

// ===== メイン =====
export default function ToolsPageClient() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [viewMode, setViewMode] = useState<'genre' | 'purpose' | 'persona'>('genre');
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>('startup');

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    const init = async () => {
      if (supabase) {
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_, session) => {
          setUser(session?.user || null);
        });
        subscription = sub;
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }
    };
    init();
    return () => { subscription?.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    if (supabase) { await supabase.auth.signOut(); setUser(null); }
  };

  const navigateTo = (path: string) => {
    window.location.href = path === '/' || path === '' ? '/' : `/${path}`;
  };

  // ペルソナのおすすめツール名Set
  const personaToolNames = useMemo(() => {
    return new Set(allTools.filter(t => t.personas.includes(selectedPersona)).map(t => t.name));
  }, [selectedPersona]);

  const toolsListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '集客メーカーの無料ツール一覧',
    description: '集客メーカーで利用できる全ツール',
    itemListElement: allTools.map((tool, index) => ({
      '@type': 'ListItem', position: index + 1, name: tool.name, description: tool.description, url: `${siteUrl}${tool.href}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsListSchema) }} />

      <div className="min-h-screen bg-gray-50">
        <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={() => {}} />

        {/* ヒーロー */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">全ツール一覧</h1>
            <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
              無料で使える30種以上の集客ツールを、3つの切り口でご覧いただけます
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#f9fafb" />
            </svg>
          </div>
        </section>

        {/* ===== ビューモード切替タブ ===== */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 py-3 justify-center">
              {([
                { id: 'genre' as const, label: 'ジャンル別', icon: LayoutGrid },
                { id: 'purpose' as const, label: '目的別', icon: Target },
                { id: 'persona' as const, label: 'タイプ別', icon: Users },
              ]).map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                      viewMode === tab.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <TabIcon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== タブ1: ジャンル別 ===== */}
        {viewMode === 'genre' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {genreCategories.map((cat) => {
              const catTools = allTools.filter(t => t.genre === cat.id);
              if (catTools.length === 0) return null;
              return (
                <div key={cat.id} className="mb-16">
                  {/* セクション見出し */}
                  <div className={`flex items-center gap-3 mb-8`}>
                    <div className={`h-10 w-1.5 rounded-full bg-gradient-to-b ${cat.headerBg}`} />
                    <div>
                      <h2 className={`text-2xl font-black ${cat.color}`}>{cat.label}</h2>
                      <p className="text-sm text-gray-500">{catTools.length}個のツール</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catTools.map((tool) => <ToolCard key={tool.name} tool={tool} genreBg={cat.bgColor} />)}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* ===== タブ2: 目的別 ===== */}
        {viewMode === 'purpose' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* フロー図 */}
            <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
              {purposeCategories.map((cat, idx) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <div className={`${cat.bgColor} ${cat.color} border ${cat.borderColor} px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2`}>
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </div>
                  {idx < purposeCategories.length - 1 && (
                    <ArrowRight size={16} className="text-gray-300 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>

            {purposeCategories.map((cat) => {
              const catTools = allTools.filter(t => t.purpose === cat.id);
              if (catTools.length === 0) return null;
              return (
                <div key={cat.id} className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`h-10 w-1.5 rounded-full bg-gradient-to-b ${cat.headerBg}`} />
                    <div>
                      <h2 className={`text-2xl font-black ${cat.color} flex items-center gap-2`}>
                        <span>{cat.emoji}</span> {cat.label}
                        <span className="text-base font-normal text-gray-400 ml-1">— {cat.subtitle}</span>
                      </h2>
                      <p className="text-sm text-gray-500">{catTools.length}個のツール</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catTools.map((tool) => <ToolCard key={tool.name} tool={tool} genreBg={cat.bgColor} />)}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* ===== タブ3: タイプ別 ===== */}
        {viewMode === 'persona' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* ペルソナ選択 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
              {personaTypes.map((p) => {
                const Icon = p.icon;
                const isActive = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group ${
                      isActive
                        ? `${p.bgColor} ${p.borderColor} shadow-lg scale-[1.02]`
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${isActive ? p.bgColor : 'bg-gray-50'}`}>
                      <Icon size={20} className={isActive ? p.textColor : 'text-gray-500'} />
                    </div>
                    <h3 className={`font-bold text-sm leading-tight mb-0.5 ${isActive ? p.textColor : 'text-gray-800'}`}>{p.name}</h3>
                    <p className="text-xs text-gray-500">{p.subtitle}</p>
                    {isActive && (
                      <div className={`absolute top-2 right-2 ${p.textColor}`}><CheckCircle2 size={16} /></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* おすすめ説明 */}
            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm">
                <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold mr-1">
                  <CheckCircle2 size={10} />おすすめ
                </span>
                バッジ付きのツールが、このタイプに特におすすめです
              </p>
            </div>

            {/* 全ツールをグリッド表示（おすすめにハイライト） */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* おすすめツールを先頭に */}
              {allTools
                .sort((a, b) => {
                  const aRec = a.personas.includes(selectedPersona) ? 0 : 1;
                  const bRec = b.personas.includes(selectedPersona) ? 0 : 1;
                  return aRec - bRec;
                })
                .map((tool) => (
                  <ToolCard
                    key={tool.name}
                    tool={tool}
                    highlight={personaToolNames.has(tool.name)}
                  />
                ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">今すぐ無料で始めよう</h2>
            <p className="text-xl opacity-90 mb-8">すべてのツールが無料。会員登録も不要で今すぐ使えます</p>
            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
              <Sparkles size={22} />無料で始める
            </Link>
          </div>
        </section>

        <Footer setPage={navigateTo} />
      </div>
    </>
  );
}
