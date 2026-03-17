'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { generateSlug, detectVideoPlatform } from '@/lib/utils';
import { WebinarLP, Block, generateBlockId } from '@/lib/types';
import CustomColorPicker from '@/components/shared/CustomColorPicker';
import {
  Save,
  Eye,
  Edit3,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Type,
  Zap,
  MessageCircle,
  HelpCircle,
  Target,
  Youtube,
  Mail,
  Palette,
  ExternalLink,
  Trophy,
  Settings,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  UploadCloud,
  Shuffle,
  Timer,
  List,
  UserCircle,
  Star,
  Monitor,
  Smartphone,
  Layout,
  Lock,
} from 'lucide-react';
import { BlockRenderer } from '@/components/shared/BlockRenderer';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import { usePointsWithLimitModal } from '@/lib/hooks/usePointsWithLimitModal';
import CreationLimitModal from '@/components/shared/CreationLimitModal';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import FeaturePurchaseButton from '@/components/shared/FeaturePurchaseButton';

interface WebinarEditorProps {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  initialData?: WebinarLP | null;
  setPage: (page: string) => void;
  onBack: () => void;
  setShowAuth: (show: boolean) => void;
}

// ブロックタイプの定義 - ウェビナーLP専用 + 共通ブロック
const blockTypes = [
  // ウェビナーLP専用ブロック
  { type: 'hero', label: 'ヒーロー', icon: Zap, description: 'タイトル・サブタイトル', category: 'webinar', color: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: 'text-violet-500', hover: 'hover:bg-violet-100' } },
  { type: 'hero_fullwidth', label: 'フルワイドヒーロー', icon: Layout, description: 'インパクトのあるファーストビュー', category: 'webinar', color: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: 'text-violet-500', hover: 'hover:bg-violet-100' } },
  { type: 'youtube', label: '動画', icon: Youtube, description: 'YouTube / Vimeo / TikTok', category: 'webinar', color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500', hover: 'hover:bg-red-100' } },
  { type: 'speaker', label: '講師紹介', icon: UserCircle, description: '講師プロフィール', category: 'webinar', color: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', hover: 'hover:bg-emerald-100' } },
  { type: 'agenda', label: 'アジェンダ', icon: List, description: '学べること・内容', category: 'webinar', color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', hover: 'hover:bg-blue-100' } },
  { type: 'countdown', label: 'カウントダウン', icon: Timer, description: '開催日時タイマー', category: 'webinar', color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', hover: 'hover:bg-orange-100' } },
  { type: 'cta_section', label: 'CTAセクション', icon: Target, description: 'コンバージョンポイント', category: 'webinar', color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500', hover: 'hover:bg-red-100' } },
  { type: 'delayed_cta', label: 'CTAセクション（時間制御）', icon: Timer, description: '遅延表示ボタン', category: 'webinar', color: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-rose-500', hover: 'hover:bg-rose-100' } },
  // 共通ブロック
  { type: 'testimonial', label: '参加者の声', icon: MessageCircle, description: 'テスティモニアル', category: 'common', color: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', hover: 'hover:bg-amber-100' } },
  { type: 'text_card', label: 'テキスト', icon: Type, description: 'テキストカード', category: 'common', color: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', hover: 'hover:bg-slate-100' } },
  { type: 'image', label: '画像', icon: ImageIcon, description: '画像とキャプション', category: 'common', color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', hover: 'hover:bg-purple-100' } },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'よくある質問', category: 'common', color: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', hover: 'hover:bg-slate-100' } },
  { type: 'lead_form', label: 'リードフォーム', icon: Mail, description: 'メール収集', category: 'common', color: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-500', hover: 'hover:bg-cyan-100' } },
];

// グラデーションプリセット（ダーク系デフォルト - ウェビナー向け）
const gradientPresets = [
  { name: 'ダーク', value: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)', animated: false },
  { name: 'パープル', value: 'linear-gradient(-45deg, #2d1b69, #4c1d95, #6d28d9, #4c1d95)', animated: true },
  { name: 'ネイビー', value: 'linear-gradient(-45deg, #1e3a5f, #2d5a87, #3d7ab0, #2d5a87)', animated: true },
  { name: 'ブラック', value: 'linear-gradient(-45deg, #0f0f0f, #1a1a2e, #16213e, #1a1a2e)', animated: true },
  { name: 'グリーン', value: 'linear-gradient(-45deg, #064e3b, #065f46, #047857, #065f46)', animated: true },
  { name: 'サンセット', value: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', animated: true },
  { name: 'ティール', value: 'linear-gradient(-45deg, #14b8a6, #0d9488, #0f766e, #0d9488)', animated: true },
  { name: 'ローズ', value: 'linear-gradient(-45deg, #9f1239, #be123c, #e11d48, #be123c)', animated: true },
];

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

// CTAボタン設定用定数
const CTA_BORDER_RADIUS_OPTIONS = [
  { value: 'sm', label: '角丸 小', preview: 'rounded-lg' },
  { value: 'md', label: '角丸 中', preview: 'rounded-xl' },
  { value: 'lg', label: '角丸 大', preview: 'rounded-2xl' },
  { value: 'full', label: 'ピル型', preview: 'rounded-full' },
];

const CTA_SHADOW_OPTIONS = [
  { value: 'none', label: 'なし' },
  { value: 'sm', label: '小' },
  { value: 'md', label: '中' },
  { value: 'lg', label: '大' },
  { value: 'xl', label: '特大' },
];

const CTA_ANIMATION_OPTIONS = [
  { value: 'none', label: 'なし' },
  { value: 'pulse', label: 'パルス' },
  { value: 'shimmer', label: 'シマー' },
  { value: 'bounce', label: 'バウンス' },
];

const CTA_PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#16a34a',
  '#0891b2', '#db2777', '#4f46e5', '#ca8a04', '#0d9488',
];

// ランダム画像URL生成（Unsplash）
const getRandomImageUrl = (category: string = 'portrait') => {
  const categories: Record<string, string[]> = {
    portrait: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
    ],
    business: [
      'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80',
    ],
  };
  const urls = categories[category] || categories.portrait;
  return urls[Math.floor(Math.random() * urls.length)];
};

// お客様の声用プリセット画像
const testimonialPresetImages = [
  { label: '男性A', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  { label: '男性B', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性A', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性B', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces' },
];

// ウェビナーLPテンプレート定義
type WebinarTemplate = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  animated: boolean;
  blocks: () => Block[];
};

const WEBINAR_TEMPLATES: WebinarTemplate[] = [
  {
    id: 'free-webinar',
    name: '無料ウェビナー集客',
    description: 'リード獲得型。メール登録でセミナー参加',
    emoji: '🎓',
    gradient: 'linear-gradient(-45deg, #2d1b69, #4c1d95, #6d28d9, #4c1d95)',
    animated: true,
    blocks: () => [
      { id: generateBlockId(), type: 'hero', data: { headline: '【無料】あなたのビジネスを\n加速させるウェビナー', subheadline: '参加者限定の特別コンテンツをご用意しています', ctaText: '無料で参加する', ctaUrl: '#register', backgroundColor: 'linear-gradient(-45deg, #2d1b69, #4c1d95, #6d28d9, #4c1d95)' } },
      { id: generateBlockId(), type: 'countdown', data: { targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), title: '開催まであと', expiredText: 'アーカイブ視聴可能', backgroundColor: '#7c3aed', expiredAction: 'text' } },
      { id: generateBlockId(), type: 'youtube', data: { url: '' } },
      { id: generateBlockId(), type: 'agenda', data: { title: 'このウェビナーで学べること', items: [{ title: '成功するビジネス戦略の3つの柱', description: '実績のあるフレームワークを公開' }, { title: '集客を自動化する仕組みづくり', description: 'ツールとワークフローを紹介' }, { title: '明日から使える具体的アクションプラン', description: '参加者だけの特典付き' }] } },
      { id: generateBlockId(), type: 'speaker', data: { name: '講師名を入力', title: '肩書きを入力', image: '', bio: '講師の紹介文を入力してください。実績や専門分野について記載すると効果的です。' } },
      { id: generateBlockId(), type: 'testimonial', data: { items: [{ id: generateBlockId(), name: '参加者A', role: '会社員', comment: '具体的で分かりやすく、すぐに実践できる内容でした！', imageUrl: '' }, { id: generateBlockId(), name: '参加者B', role: '個人事業主', comment: '無料でここまでの内容が聞けるとは思いませんでした。', imageUrl: '' }] } },
      { id: generateBlockId(), type: 'lead_form', data: { title: '無料で参加する', buttonText: '今すぐ申し込む' } },
      { id: generateBlockId(), type: 'faq', data: { items: [{ id: generateBlockId(), question: '参加費はかかりますか？', answer: 'いいえ、完全無料でご参加いただけます。' }, { id: generateBlockId(), question: 'アーカイブ視聴はできますか？', answer: 'はい、申し込みいただいた方にアーカイブURLをお送りします。' }, { id: generateBlockId(), question: '初心者でも大丈夫ですか？', answer: 'はい、初心者の方にも分かりやすい内容です。' }] } },
    ],
  },
  {
    id: 'recorded-seminar',
    name: '録画セミナー販売',
    description: '録画済みセミナーの販売・申込誘導',
    emoji: '🎬',
    gradient: 'linear-gradient(-45deg, #1e3a5f, #2d5a87, #3d7ab0, #2d5a87)',
    animated: true,
    blocks: () => [
      { id: generateBlockId(), type: 'hero_fullwidth', data: { headline: '今すぐ視聴できる\nオンラインセミナー', subheadline: 'いつでも・どこでも・何度でも学べる', ctaText: '今すぐ申し込む', ctaUrl: '#cta', backgroundColor: 'linear-gradient(-45deg, #1e3a5f, #2d5a87, #3d7ab0, #2d5a87)' } },
      { id: generateBlockId(), type: 'text_card', data: { title: 'こんなお悩みありませんか？', text: '• 忙しくてセミナーに参加できない\n• 自分のペースで繰り返し学びたい\n• 移動時間をかけずに学習したい\n• 質の高いコンテンツに出会えない', align: 'left' as const } },
      { id: generateBlockId(), type: 'youtube', data: { url: '' } },
      { id: generateBlockId(), type: 'agenda', data: { title: 'セミナー内容', items: [{ title: 'セッション1: 基礎編', description: '全体像と基本的な考え方を解説' }, { title: 'セッション2: 実践編', description: '具体的な手順とテクニックを紹介' }, { title: 'セッション3: 応用編', description: 'さらなる成果を出すための上級テクニック' }, { title: '特典: テンプレート集', description: 'すぐに使えるテンプレートをプレゼント' }] } },
      { id: generateBlockId(), type: 'speaker', data: { name: '講師名を入力', title: '肩書きを入力', image: '', bio: '講師の紹介文を入力してください。' } },
      { id: generateBlockId(), type: 'testimonial', data: { items: [{ id: generateBlockId(), name: '受講者A', role: '経営者', comment: '何度も見返せるので、理解が深まりました。', imageUrl: '' }, { id: generateBlockId(), name: '受講者B', role: 'フリーランス', comment: '通勤中に視聴して、効率的に学べました。', imageUrl: '' }] } },
      { id: generateBlockId(), type: 'delayed_cta', data: { title: '期間限定の特別価格', buttonText: '今すぐ申し込む', buttonUrl: '', delaySeconds: 30, buttonColor: '#2563eb', buttonTextColor: '#ffffff', borderRadius: 'lg', shadow: 'lg', animation: 'pulse', size: 'lg' } },
      { id: generateBlockId(), type: 'faq', data: { items: [{ id: generateBlockId(), question: '視聴期限はありますか？', answer: 'ご購入から1年間、何度でも視聴いただけます。' }, { id: generateBlockId(), question: '返金保証はありますか？', answer: '14日間の返金保証をご用意しています。' }] } },
    ],
  },
  {
    id: 'series-seminar',
    name: 'セミナーシリーズ',
    description: '連続講座・全3回シリーズなど',
    emoji: '📚',
    gradient: 'linear-gradient(-45deg, #064e3b, #065f46, #047857, #065f46)',
    animated: true,
    blocks: () => [
      { id: generateBlockId(), type: 'hero', data: { headline: '全3回で完全マスター\nオンライン集中講座', subheadline: 'ステップバイステップで確実にスキルアップ', ctaText: 'シリーズに申し込む', ctaUrl: '#register', backgroundColor: 'linear-gradient(-45deg, #064e3b, #065f46, #047857, #065f46)' } },
      { id: generateBlockId(), type: 'youtube', data: { url: '' } },
      { id: generateBlockId(), type: 'agenda', data: { title: '全3回の講座内容', items: [{ title: '第1回: 基礎を固める', description: '重要な概念と基本スキルの習得' }, { title: '第2回: 実践力を磨く', description: 'ケーススタディと実践ワーク' }, { title: '第3回: 成果を出す', description: '総仕上げと独自プラン作成' }] } },
      { id: generateBlockId(), type: 'speaker', data: { name: '講師名を入力', title: '肩書きを入力', image: '', bio: '講師の紹介文を入力してください。' } },
      { id: generateBlockId(), type: 'text_card', data: { title: '受講の流れ', text: '1. お申し込み後、受講URLをメールでお届け\n2. 各回の動画を順番に視聴\n3. ワークシートに取り組み、実践\n4. 質問フォームで疑問を解消\n5. 修了証を発行', align: 'left' as const } },
      { id: generateBlockId(), type: 'countdown', data: { targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), title: '第1回開催まで', expiredText: '次回の開催をお待ちください', backgroundColor: '#047857', expiredAction: 'text' } },
      { id: generateBlockId(), type: 'cta_section', data: { title: 'シリーズ講座に申し込む', description: '全3回セットで特別価格。早期申込割引あり。', buttonText: '今すぐ申し込む', buttonUrl: '', backgroundGradient: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' } },
      { id: generateBlockId(), type: 'faq', data: { items: [{ id: generateBlockId(), question: '途中から参加できますか？', answer: 'はい、各回のアーカイブ視聴が可能です。' }, { id: generateBlockId(), question: '個別の質問はできますか？', answer: '各回終了後に質問フォームをご用意しています。' }] } },
    ],
  },
  {
    id: 'product-demo',
    name: 'プロダクトデモ',
    description: 'SaaS・ツールのデモウェビナー',
    emoji: '💻',
    gradient: 'linear-gradient(-45deg, #0f0f0f, #1a1a2e, #16213e, #1a1a2e)',
    animated: true,
    blocks: () => [
      { id: generateBlockId(), type: 'hero_fullwidth', data: { headline: 'サービス名のデモを\nライブでお見せします', subheadline: '導入を検討中の方向け・無料デモウェビナー', ctaText: 'デモに参加する', ctaUrl: '#register', backgroundColor: 'linear-gradient(-45deg, #0f0f0f, #1a1a2e, #16213e, #1a1a2e)' } },
      { id: generateBlockId(), type: 'youtube', data: { url: '' } },
      { id: generateBlockId(), type: 'agenda', data: { title: 'デモでお見せする内容', items: [{ title: 'ダッシュボード概要', description: '管理画面の全体像をご紹介' }, { title: '主要機能のデモ', description: '日常業務で最も使う機能を実演' }, { title: '導入事例の紹介', description: '実際の企業の活用方法' }, { title: 'Q&Aセッション', description: 'ご質問にリアルタイムでお答え' }] } },
      { id: generateBlockId(), type: 'testimonial', data: { items: [{ id: generateBlockId(), name: '導入企業A', role: '株式会社○○', comment: '導入後、業務効率が30%改善しました。', imageUrl: '' }, { id: generateBlockId(), name: '導入企業B', role: '有限会社△△', comment: 'サポートが手厚く、安心して使えています。', imageUrl: '' }] } },
      { id: generateBlockId(), type: 'text_card', data: { title: '料金プラン', text: '• スタータープラン: 月額 ¥9,800\n• ビジネスプラン: 月額 ¥29,800\n• エンタープライズ: お問い合わせ\n\n※ 14日間の無料トライアル付き', align: 'left' as const } },
      { id: generateBlockId(), type: 'delayed_cta', data: { title: '', buttonText: '無料トライアルを始める', buttonUrl: '', delaySeconds: 20, buttonColor: '#2563eb', buttonTextColor: '#ffffff', borderRadius: 'lg', shadow: 'xl', animation: 'shimmer', size: 'lg' } },
      { id: generateBlockId(), type: 'lead_form', data: { title: 'お問い合わせ・デモ申込', buttonText: '申し込む' } },
    ],
  },
  {
    id: 'book-launch',
    name: '出版記念セミナー',
    description: 'Kindle著者の出版記念ウェビナー',
    emoji: '📖',
    gradient: 'linear-gradient(-45deg, #9f1239, #be123c, #e11d48, #be123c)',
    animated: true,
    blocks: () => [
      { id: generateBlockId(), type: 'hero', data: { headline: '出版記念\n特別オンラインセミナー', subheadline: '著者が語る、本には書けなかった裏話', ctaText: '参加申し込み', ctaUrl: '#register', backgroundColor: 'linear-gradient(-45deg, #9f1239, #be123c, #e11d48, #be123c)' } },
      { id: generateBlockId(), type: 'image', data: { url: '', caption: '書籍カバー画像をアップロードしてください' } },
      { id: generateBlockId(), type: 'youtube', data: { url: '' } },
      { id: generateBlockId(), type: 'speaker', data: { name: '著者名を入力', title: '著者・○○の専門家', image: '', bio: '著者プロフィールを入力してください。出版実績や専門分野、メディア出演歴などを記載すると効果的です。' } },
      { id: generateBlockId(), type: 'agenda', data: { title: 'トークテーマ', items: [{ title: 'なぜこの本を書いたのか', description: '執筆の背景にある想いと問題意識' }, { title: '本では書けなかった裏話', description: 'セミナー参加者だけの特別エピソード' }, { title: '読者からの質問に回答', description: '出版後に寄せられた反響を紹介' }] } },
      { id: generateBlockId(), type: 'countdown', data: { targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), title: '開催まであと', expiredText: 'アーカイブ視聴をお申し込みください', backgroundColor: '#be123c', expiredAction: 'text' } },
      { id: generateBlockId(), type: 'cta_section', data: { title: '出版記念セミナーに参加する', description: '書籍購入者は無料で参加できます', buttonText: '参加を申し込む', buttonUrl: '', backgroundGradient: 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)' } },
      { id: generateBlockId(), type: 'faq', data: { items: [{ id: generateBlockId(), question: '書籍を購入していなくても参加できますか？', answer: 'はい、どなたでもご参加いただけます。' }, { id: generateBlockId(), question: 'セミナー中に質問できますか？', answer: 'はい、Q&Aセッションを設けています。' }] } },
    ],
  },
];

// セクションコンポーネント
const Section = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  badge,
  step,
  stepLabel,
  headerBgColor = 'bg-gray-50',
  headerHoverColor = 'hover:bg-gray-100',
  accentColor = 'bg-violet-100 text-violet-600'
}: {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  step?: number;
  stepLabel?: string;
  headerBgColor?: string;
  headerHoverColor?: string;
  accentColor?: string;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    {step && stepLabel && (
      <div className={`px-5 py-2 ${headerBgColor} border-b border-gray-200/50`}>
        <span className="text-xs font-bold text-gray-600 bg-white/60 px-2 py-0.5 rounded">
          STEP {step}
        </span>
        <span className="text-sm text-gray-700 ml-2">{stepLabel}</span>
      </div>
    )}
    <button
      onClick={onToggle}
      className={`w-full px-5 py-4 flex items-center justify-between ${headerBgColor} ${headerHoverColor} transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOpen ? accentColor : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-white/80 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">{badge}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
    </button>
    {isOpen && (
      <div className="p-5 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

// 入力コンポーネント
const Input = ({ label, val, onChange, ph, disabled = false }: { label: string; val: string; onChange: (v: string) => void; ph?: string; disabled?: boolean }) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <input
      className={`w-full border border-gray-300 p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-violet-500 outline-none bg-white placeholder-gray-400 transition-shadow ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      value={val || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={ph}
      disabled={disabled}
    />
  </div>
);

const Textarea = ({ label, val, onChange, rows = 3 }: { label: string; val: string; onChange: (v: string) => void; rows?: number }) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <textarea
      className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500 outline-none bg-white placeholder-gray-400 transition-shadow"
      rows={rows}
      value={val || ''}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

// 全幅表示対象ブロックの判定
const isFullWidthBlock = (block: Block): boolean => {
  if (block.type === 'hero_fullwidth') return true;
  if (block.type === 'hero' && block.data.isFullWidth) return true;
  if (block.type === 'cta_section' && block.data.isFullWidth) return true;
  if (block.type === 'testimonial' && block.data.isFullWidth) return true;
  return false;
};

const WebinarEditor: React.FC<WebinarEditorProps> = ({
  user,
  isAdmin,
  initialData,
  setPage,
  onBack,
  setShowAuth,
}) => {
  const { userPlan } = useUserPlan(user?.id);
  const { consumeAndExecute, limitModalProps } = usePointsWithLimitModal({ userId: user?.id, isPro: userPlan.isProUser });

  // 初期ブロック
  const initialBlocks: Block[] = [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'ウェビナータイトル',
        subheadline: 'サブタイトルを入力してください',
        ctaText: '今すぐ申し込む',
        ctaUrl: '',
        backgroundColor: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)',
      },
    },
    {
      id: generateBlockId(),
      type: 'youtube',
      data: { url: '' },
    },
    {
      id: generateBlockId(),
      type: 'speaker',
      data: { name: '講師名', title: '肩書き', image: '', bio: '講師の紹介文を入力してください' },
    },
    {
      id: generateBlockId(),
      type: 'agenda',
      data: {
        title: 'このウェビナーで学べること',
        items: [
          { title: '内容1', description: '' },
          { title: '内容2', description: '' },
          { title: '内容3', description: '' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '今すぐ参加する',
        description: '席に限りがございます。お早めにお申し込みください。',
        buttonText: '無料で参加する',
        buttonUrl: '',
      },
    },
  ];

  const [lp, setLp] = useState<Partial<WebinarLP>>({
    title: '',
    description: '',
    content: initialBlocks,
    settings: {
      theme: {
        gradient: gradientPresets[0].value,
        animated: false,
      },
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(
    new Set(initialBlocks[0]?.id ? [initialBlocks[0].id] : [])
  );
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isUploading, setIsUploading] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewMode, setPreviewMode] = useState<'pc' | 'mobile'>('pc');
  const pcIframeRef = useRef<HTMLIFrameElement>(null);
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [justSavedSlug, setJustSavedSlug] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [videoMeta, setVideoMeta] = useState<Record<string, { title: string; channelTitle: string; thumbnailUrl: string; viewCount: number; likeCount: number; publishedAt: string; description: string } | null>>({});
  const [fetchingVideoMeta, setFetchingVideoMeta] = useState<string | null>(null);

  // YouTube メタ情報自動取得
  const fetchVideoMeta = useCallback(async (blockId: string, url: string) => {
    if (!url || detectVideoPlatform(url) !== 'youtube') {
      setVideoMeta(prev => ({ ...prev, [blockId]: null }));
      return;
    }
    setFetchingVideoMeta(blockId);
    try {
      const res = await fetch('/api/video-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setVideoMeta(prev => ({ ...prev, [blockId]: data }));
      } else {
        setVideoMeta(prev => ({ ...prev, [blockId]: null }));
      }
    } catch {
      setVideoMeta(prev => ({ ...prev, [blockId]: null }));
    } finally {
      setFetchingVideoMeta(null);
    }
  }, []);

  // カスタムスラッグのバリデーション
  const validateCustomSlug = (slug: string): boolean => {
    if (!slug) {
      setSlugError('');
      return true;
    }
    const regex = /^[a-z0-9-]{3,20}$/;
    if (!regex.test(slug)) {
      setSlugError('英小文字、数字、ハイフンのみ（3〜20文字）');
      return false;
    }
    setSlugError('');
    return true;
  };

  // セクションの開閉状態
  const [openSections, setOpenSections] = useState({
    theme: true,
    blocks: true,
    advanced: false,
  });

  const resetPreview = () => setPreviewKey(k => k + 1);

  // iframeにプレビューデータを送信
  const sendPreviewData = useCallback(() => {
    const payload = {
      type: 'PREVIEW_DATA',
      payload: {
        title: lp.title || '',
        description: lp.description || '',
        content: lp.content || [],
        settings: lp.settings,
      },
    };
    if (pcIframeRef.current?.contentWindow) {
      pcIframeRef.current.contentWindow.postMessage(payload, '*');
    }
    if (mobileIframeRef.current?.contentWindow) {
      mobileIframeRef.current.contentWindow.postMessage(payload, '*');
    }
  }, [lp]);

  // iframeがreadyになったらデータを送信
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_READY') {
        sendPreviewData();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendPreviewData]);

  // lpが変更されたらiframeにデータを送信
  useEffect(() => {
    sendPreviewData();
  }, [lp, sendPreviewData]);

  // previewModeが変わった時は少し待ってからデータを送信
  useEffect(() => {
    const timer = setTimeout(() => sendPreviewData(), 100);
    return () => clearTimeout(timer);
  }, [previewMode, sendPreviewData]);

  useEffect(() => {
    if (initialData) {
      setLp(initialData);
      setSavedSlug(initialData.slug);
      setSavedId(initialData.id);
      setCustomSlug(initialData.slug || '');
      setJustSavedSlug(initialData.slug);
      setOpenSections({
        theme: true,
        blocks: true,
        advanced: false,
      });
    }
  }, [initialData]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    const existingId = initialData?.id || savedId;
    // 新規作成時のみカスタムスラッグをバリデーション（編集時は既存スラッグなのでスキップ）
    if (!existingId && customSlug && !validateCustomSlug(customSlug)) return;
    if (!user) {
      if (confirm(existingId ? '編集・更新にはログインが必要です。ログイン画面を開きますか？' : 'ウェビナーLPの作成にはログインが必要です。ログイン画面を開きますか？')) {
        setShowAuth(true);
      }
      return;
    }

    await consumeAndExecute('webinar', 'save', async () => {
      setIsSaving(true);
      try {
        const finalTitle = lp.title?.trim() || '無題のウェビナーLP';
        let result;

        if (existingId) {
          const updateResult = await supabase
            ?.from('webinar_lps')
            .update({
              content: lp.content,
              settings: {
                ...lp.settings,
                title: finalTitle,
                description: lp.description,
              },
              title: finalTitle,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingId);

          if (updateResult?.error) throw new Error(updateResult.error.message || 'データベースエラー');

          // 更新成功 - 既存のslug/idを維持
          const currentSlug = initialData?.slug || savedSlug;
          if (currentSlug) {
            setJustSavedSlug(currentSlug);
            fetch('/api/revalidate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: `/webinar/${currentSlug}` }),
            }).catch(() => {});
          }
          alert('保存しました！');
          return;
        } else {
          let attempts = 0;
          const maxAttempts = 5;

          while (attempts < maxAttempts) {
            const newSlug = customSlug.trim() || generateSlug();
            result = await supabase
              ?.from('webinar_lps')
              .insert({
                content: lp.content,
                settings: {
                  ...lp.settings,
                  title: finalTitle,
                  description: lp.description,
                },
                title: finalTitle,
                slug: newSlug,
                user_id: user?.id || null,
                status: 'published',
              })
              .select();

            if (result?.error?.code === '23505' && result?.error?.message?.includes('slug') && !customSlug.trim()) {
              attempts++;
              continue;
            }
            break;
          }

          if (attempts >= maxAttempts) {
            throw new Error('ユニークなURLの生成に失敗しました。もう一度お試しください。');
          }

          if (result?.error) {
            if (result.error.code === '23505' && result.error.message?.includes('slug')) {
              throw new Error('このカスタムURLは既に使用されています。別のURLを指定してください。');
            }
            throw new Error(result.error.message || 'データベースエラー');
          }
        }

        const savedData = result?.data?.[0];
        if (!savedData) {
          throw new Error('保存に失敗しました。ページを再読み込みしてもう一度お試しください。');
        }

        setSavedSlug(savedData.slug);
        setSavedId(savedData.id);
        setJustSavedSlug(savedData.slug);

        // ISRキャッシュを無効化
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `/webinar/${savedData.slug}` }),
        }).catch(() => {});

        if (!initialData && !savedId) {
          setShowSuccessModal(true);
          if (!user) {
            try {
              const stored = JSON.parse(localStorage.getItem('guest_content') || '[]');
              stored.push({ table: 'webinar_lps', id: savedData.id });
              localStorage.setItem('guest_content', JSON.stringify(stored));
            } catch {}
          }
        } else {
          alert('保存しました！');
        }
      } catch (error) {
        console.error('Save error:', error);
        const errorMessage = error instanceof Error ? error.message : '不明なエラー';
        alert(`保存中にエラーが発生しました: ${errorMessage}`);
      } finally {
        setIsSaving(false);
      }
    }, existingId);
  };

  const addBlock = (type: string) => {
    const newBlock = createDefaultBlock(type);
    setLp(prev => {
      const content = prev.content || [];
      const heroIndex = content.findIndex(b => b.type === 'hero' || b.type === 'hero_fullwidth');
      let newContent;
      if (heroIndex === -1 || heroIndex < content.length - 1) {
        newContent = [...content, newBlock];
      } else {
        newContent = [...content.slice(0, heroIndex + 1), newBlock, ...content.slice(heroIndex + 1)];
      }
      return { ...prev, content: newContent };
    });
    setExpandedBlocks(prev => new Set(prev).add(newBlock.id));
    setShowBlockSelector(false);
  };

  const removeBlock = (id: string) => {
    if (!confirm('このブロックを削除しますか？')) return;
    setLp(prev => ({ ...prev, content: prev.content?.filter(b => b.id !== id) }));
  };

  const updateBlock = (id: string, data: Record<string, unknown>) => {
    setLp(prev => ({
      ...prev,
      content: prev.content?.map(b =>
        b.id === id ? { ...b, data: { ...b.data, ...data } } as typeof b : b
      ),
    }));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setLp(prev => {
      const content = [...(prev.content || [])];
      const index = content.findIndex(b => b.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= content.length) return prev;
      const [movedBlock] = content.splice(index, 1);
      content.splice(newIndex, 0, movedBlock);
      return { ...prev, content };
    });
  };

  // 画像アップロード
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) return alert('データベースに接続されていません');
    if (file.size > MAX_IMAGE_SIZE) {
      alert('画像サイズが大きすぎます。最大2MBまで対応しています。');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user?.id || 'anonymous'}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
      updateBlock(blockId, { [field]: data.publicUrl });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      if (message.includes('row-level security policy')) {
        alert('画像をアップロードするにはログインが必要です。');
      } else {
        alert('アップロードエラー: ' + message);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // ランダム画像設定
  const handleRandomImage = (blockId: string, field: string, category: string = 'portrait') => {
    const randomUrl = getRandomImageUrl(category);
    if (field.startsWith('testimonial-')) {
      const index = parseInt(field.split('-')[1]);
      const block = lp.content?.find(b => b.id === blockId);
      if (block && block.type === 'testimonial') {
        const newItems = [...(block.data.items || [])];
        if (newItems[index]) {
          newItems[index] = { ...newItems[index], imageUrl: randomUrl };
          updateBlock(blockId, { items: newItems });
        }
      }
    } else {
      updateBlock(blockId, { [field]: randomUrl });
    }
  };

  const createDefaultBlock = (type: string): Block => {
    const id = generateBlockId();
    switch (type) {
      case 'hero':
        return { id, type: 'hero', data: { headline: 'ウェビナータイトル', subheadline: 'サブタイトル', ctaText: '今すぐ申し込む', ctaUrl: '', backgroundColor: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)' } };
      case 'hero_fullwidth':
        return { id, type: 'hero_fullwidth', data: { headline: 'あなたのビジネスを成功に導く', subheadline: 'サブタイトルを入力してください', ctaText: '今すぐ参加する', ctaUrl: '', backgroundColor: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)' } };
      case 'youtube':
        return { id, type: 'youtube', data: { url: '' } };
      case 'speaker':
        return { id, type: 'speaker', data: { name: '', title: '', image: '', bio: '' } };
      case 'agenda':
        return { id, type: 'agenda', data: { title: '学べること', items: [{ title: '', description: '' }] } };
      case 'countdown':
        return { id, type: 'countdown', data: { targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), title: '開催まで', expiredText: 'アーカイブ視聴可能', backgroundColor: '#7c3aed', expiredAction: 'text', expiredUrl: '', expiredHero: { headline: 'ウェビナーは終了しました', description: 'ご参加ありがとうございました', buttonText: 'アーカイブを見る', buttonUrl: '' } } };
      case 'cta_section':
        return { id, type: 'cta_section', data: { title: '今すぐ参加する', description: 'お早めにお申し込みください', buttonText: '無料で参加する', buttonUrl: '', backgroundGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' } };
      case 'delayed_cta':
        return { id, type: 'delayed_cta', data: { title: '', buttonText: '今すぐ申し込む', buttonUrl: '', delaySeconds: 300, buttonColor: '#7c3aed', buttonTextColor: '#ffffff', borderRadius: 'lg', shadow: 'lg', animation: 'none', size: 'md' } };
      case 'testimonial':
        return { id, type: 'testimonial', data: { items: [{ id: generateBlockId(), name: '', role: '', comment: '', imageUrl: '' }] } };
      case 'text_card':
        return { id, type: 'text_card', data: { title: '', text: '', align: 'center' as const } };
      case 'image':
        return { id, type: 'image', data: { url: '', caption: '' } };
      case 'faq':
        return { id, type: 'faq', data: { items: [{ id: generateBlockId(), question: '', answer: '' }] } };
      case 'lead_form':
        return { id, type: 'lead_form', data: { title: '無料で参加する', buttonText: '申し込む' } };
      default:
        return { id, type: 'text_card', data: { title: '', text: '', align: 'center' as const } };
    }
  };

  // ブロックエディタのレンダリング
  const renderBlockEditor = (block: Block) => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <Textarea label="メインキャッチコピー" val={block.data.headline || ''} onChange={v => updateBlock(block.id, { headline: v })} rows={2} />
            <Input label="サブテキスト" val={block.data.subheadline || ''} onChange={v => updateBlock(block.id, { subheadline: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="ボタンテキスト" val={block.data.ctaText || ''} onChange={v => updateBlock(block.id, { ctaText: v })} ph="今すぐ申し込む" />
              <Input label="ボタンURL" val={block.data.ctaUrl || ''} onChange={v => updateBlock(block.id, { ctaUrl: v })} ph="#contact" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">背景画像（任意）</label>
              <div className="flex gap-2">
                <input type="text" value={block.data.backgroundImage || ''} onChange={e => updateBlock(block.id, { backgroundImage: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-violet-50 text-violet-700 rounded-lg font-bold hover:bg-violet-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, block.id, 'backgroundImage')} disabled={isUploading} />
                </label>
                <button onClick={() => handleRandomImage(block.id, 'backgroundImage', 'business')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm">
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.backgroundImage && (
                <img src={block.data.backgroundImage} alt="Preview" className="w-full h-24 object-cover rounded-lg mt-2" />
              )}
              {block.data.backgroundImage && (
                <div className="mt-3">
                  <label className="text-sm font-bold text-gray-900 block mb-2">背景画像の透明度: {block.data.backgroundOpacity ?? 20}%</label>
                  <input type="range" min="0" max="100" step="5" value={block.data.backgroundOpacity ?? 20} onChange={e => updateBlock(block.id, { backgroundOpacity: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>透明</span><span>半透明</span><span>不透明</span></div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">見出し文字色</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={block.data.headlineColor || '#ffffff'} onChange={e => updateBlock(block.id, { headlineColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                  <span className="text-xs text-gray-500">{block.data.headlineColor || '#ffffff'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">サブテキスト文字色</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={block.data.subheadlineColor || '#ffffff'} onChange={e => updateBlock(block.id, { subheadlineColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                  <span className="text-xs text-gray-500">{block.data.subheadlineColor || '#ffffff'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-lg border border-violet-200">
              <input type="checkbox" id={`fullwidth-${block.id}`} checked={block.data.isFullWidth || false} onChange={e => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-violet-600" />
              <label htmlFor={`fullwidth-${block.id}`} className="text-sm font-medium text-violet-800">🖥️ 全幅表示（PC向け）</label>
            </div>
          </div>
        );

      case 'hero_fullwidth':
        return (
          <div className="space-y-4">
            <Textarea label="メインキャッチコピー" val={block.data.headline || ''} onChange={v => updateBlock(block.id, { headline: v })} rows={2} />
            <Input label="サブテキスト" val={block.data.subheadline || ''} onChange={v => updateBlock(block.id, { subheadline: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="ボタンテキスト" val={block.data.ctaText || ''} onChange={v => updateBlock(block.id, { ctaText: v })} ph="今すぐ参加する" />
              <Input label="ボタンURL" val={block.data.ctaUrl || ''} onChange={v => updateBlock(block.id, { ctaUrl: v })} ph="#contact" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">背景画像（任意）</label>
              <div className="flex gap-2">
                <input type="text" value={block.data.backgroundImage || ''} onChange={e => updateBlock(block.id, { backgroundImage: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-violet-50 text-violet-700 rounded-lg font-bold hover:bg-violet-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, block.id, 'backgroundImage')} disabled={isUploading} />
                </label>
                <button onClick={() => handleRandomImage(block.id, 'backgroundImage', 'business')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm">
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.backgroundImage && (
                <>
                  <img src={block.data.backgroundImage} alt="Preview" className="w-full h-24 object-cover rounded-lg mt-2" />
                  <div className="mt-3">
                    <label className="text-sm font-bold text-gray-900 block mb-2">背景画像の透明度: {block.data.backgroundOpacity ?? 40}%</label>
                    <input type="range" min="0" max="100" step="5" value={block.data.backgroundOpacity ?? 40} onChange={e => updateBlock(block.id, { backgroundOpacity: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1"><span>透明</span><span>半透明</span><span>不透明</span></div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'youtube': {
        const videoPlatform = detectVideoPlatform(block.data.url || '');
        const platformLabels: Record<string, { label: string; color: string }> = {
          youtube: { label: 'YouTube', color: 'bg-red-100 text-red-700' },
          vimeo: { label: 'Vimeo', color: 'bg-sky-100 text-sky-700' },
          tiktok: { label: 'TikTok', color: 'bg-gray-900 text-white' },
          unknown: { label: '', color: '' },
        };
        const detected = platformLabels[videoPlatform];
        const meta = videoMeta[block.id];
        const isFetchingMeta = fetchingVideoMeta === block.id;
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <Input label="動画URL" val={block.data.url || ''} onChange={v => {
                updateBlock(block.id, { url: v });
                // YouTube URLの場合、debounce的に自動取得
                if (detectVideoPlatform(v) === 'youtube' && v.length > 10) {
                  fetchVideoMeta(block.id, v);
                } else {
                  setVideoMeta(prev => ({ ...prev, [block.id]: null }));
                }
              }} ph="https://www.youtube.com/watch?v=..." />
              <div className="flex items-center gap-2 flex-wrap">
                {detected.label && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${detected.color}`}>{detected.label} 検出</span>
                )}
                <p className="text-xs text-gray-500">YouTube / Vimeo / TikTok に対応</p>
              </div>
              {videoPlatform === 'tiktok' && (
                <p className="text-xs text-amber-600 -mt-2">TikTokは https://www.tiktok.com/@ユーザー名/video/数字 形式のフルURLを入力してください</p>
              )}
            </div>
            {/* YouTube メタ情報表示 */}
            {isFetchingMeta && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <Loader2 size={14} className="animate-spin text-gray-400" />
                <span className="text-xs text-gray-500">動画情報を取得中...</span>
              </div>
            )}
            {meta && !isFetchingMeta && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2">
                <div className="flex gap-3">
                  {meta.thumbnailUrl && (
                    <img src={meta.thumbnailUrl} alt="" className="w-24 h-14 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{meta.title}</p>
                    <p className="text-xs text-gray-600">{meta.channelTitle}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-gray-500">{meta.viewCount.toLocaleString()} 回再生</span>
                      <span className="text-xs text-gray-500">{meta.likeCount.toLocaleString()} いいね</span>
                    </div>
                  </div>
                </div>
                {meta.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{meta.description}</p>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'speaker':
        return (
          <div className="space-y-4">
            <Input label="講師名" val={block.data.name || ''} onChange={v => updateBlock(block.id, { name: v })} ph="講師の名前" />
            <Input label="肩書き" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="株式会社〇〇 代表取締役" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">プロフィール画像</label>
              <div className="flex gap-2">
                <input type="text" value={block.data.image || ''} onChange={e => updateBlock(block.id, { image: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-violet-50 text-violet-700 rounded-lg font-bold hover:bg-violet-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, block.id, 'image')} disabled={isUploading} />
                </label>
                <button onClick={() => handleRandomImage(block.id, 'image', 'portrait')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm">
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.image && <img src={block.data.image} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />}
            </div>
            <Textarea label="紹介文" val={block.data.bio || ''} onChange={v => updateBlock(block.id, { bio: v })} rows={4} />
          </div>
        );

      case 'agenda':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="このウェビナーで学べること" />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">項目</label>
              <div className="space-y-3">
                {(block.data.items || []).map((item: { title: string; description?: string }, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <input type="text" value={item.title} onChange={e => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], title: e.target.value }; updateBlock(block.id, { items }); }} placeholder="タイトル" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                      <button onClick={() => { const items = (block.data.items || []).filter((_: unknown, j: number) => j !== i); updateBlock(block.id, { items }); }} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                    <input type="text" value={item.description || ''} onChange={e => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], description: e.target.value }; updateBlock(block.id, { items }); }} placeholder="説明（任意）" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                  </div>
                ))}
                <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { title: '', description: '' }] })} className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 text-sm">
                  + 項目を追加
                </button>
              </div>
            </div>
          </div>
        );

      case 'countdown':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="開催まであと" />
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-900 block mb-2">開催日時</label>
              <input type="datetime-local" value={block.data.targetDate?.slice(0, 16) || ''} onChange={e => updateBlock(block.id, { targetDate: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500 outline-none" />
            </div>

            {/* 色設定 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">背景色</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={block.data.backgroundColor || '#7c3aed'} onChange={e => updateBlock(block.id, { backgroundColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                  <span className="text-xs text-gray-500">{block.data.backgroundColor || '#7c3aed'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">文字色</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={block.data.textColor || '#ffffff'} onChange={e => updateBlock(block.id, { textColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                  <span className="text-xs text-gray-500">{block.data.textColor || '#ffffff'}</span>
                </div>
              </div>
            </div>

            {/* 期限切れ時の動作 */}
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">期限切れ時の動作</label>
              <select
                value={block.data.expiredAction || 'text'}
                onChange={e => updateBlock(block.id, { expiredAction: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500 outline-none"
              >
                <option value="text">テキストを表示</option>
                <option value="redirect">別ページへ移動</option>
                <option value="fullscreen">終了画面を表示</option>
              </select>
            </div>

            {(block.data.expiredAction || 'text') === 'text' && (
              <Input label="期限切れ時テキスト" val={block.data.expiredText || ''} onChange={v => updateBlock(block.id, { expiredText: v })} ph="アーカイブ視聴可能" />
            )}

            {block.data.expiredAction === 'redirect' && (
              <Input label="リダイレクト先URL" val={block.data.expiredUrl || ''} onChange={v => updateBlock(block.id, { expiredUrl: v })} ph="https://example.com/archive" />
            )}

            {block.data.expiredAction === 'fullscreen' && (
              <div className="space-y-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-sm font-bold text-orange-800">終了画面の設定</p>
                <Input label="見出し" val={block.data.expiredHero?.headline || ''} onChange={v => updateBlock(block.id, { expiredHero: { ...block.data.expiredHero, headline: v } })} ph="ウェビナーは終了しました" />
                <Textarea label="説明文" val={block.data.expiredHero?.description || ''} onChange={v => updateBlock(block.id, { expiredHero: { ...block.data.expiredHero, description: v } })} rows={2} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="ボタンテキスト" val={block.data.expiredHero?.buttonText || ''} onChange={v => updateBlock(block.id, { expiredHero: { ...block.data.expiredHero, buttonText: v } })} ph="アーカイブを見る" />
                  <Input label="ボタンURL" val={block.data.expiredHero?.buttonUrl || ''} onChange={v => updateBlock(block.id, { expiredHero: { ...block.data.expiredHero, buttonUrl: v } })} ph="https://..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">背景色</label>
                    <input type="color" value={block.data.expiredHero?.backgroundColor || '#1e293b'} onChange={e => updateBlock(block.id, { expiredHero: { ...block.data.expiredHero, backgroundColor: e.target.value } })} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">背景画像URL</label>
                    <input type="text" value={block.data.expiredHero?.backgroundImage || ''} onChange={e => updateBlock(block.id, { expiredHero: { ...block.data.expiredHero, backgroundImage: e.target.value } })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'cta_section':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="今すぐ参加する" />
            <Textarea label="説明文" val={block.data.description || ''} onChange={v => updateBlock(block.id, { description: v })} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="ボタンテキスト" val={block.data.buttonText || ''} onChange={v => updateBlock(block.id, { buttonText: v })} ph="無料で参加する" />
              <Input label="ボタンURL" val={block.data.buttonUrl || ''} onChange={v => updateBlock(block.id, { buttonUrl: v })} ph="https://..." />
            </div>
            <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-lg border border-violet-200">
              <input type="checkbox" id={`fullwidth-cta-${block.id}`} checked={block.data.isFullWidth || false} onChange={e => updateBlock(block.id, { isFullWidth: e.target.checked })} className="w-4 h-4 text-violet-600" />
              <label htmlFor={`fullwidth-cta-${block.id}`} className="text-sm font-medium text-violet-800">🖥️ 全幅表示（PC向け）</label>
            </div>
          </div>
        );

      case 'delayed_cta':
        return (
          <div className="space-y-4">
            <Input label="セクションタイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="特別なご案内" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="ボタンテキスト" val={block.data.buttonText || ''} onChange={v => updateBlock(block.id, { buttonText: v })} ph="今すぐ申し込む" />
              <Input label="ボタンURL" val={block.data.buttonUrl || ''} onChange={v => updateBlock(block.id, { buttonUrl: v })} ph="https://..." />
            </div>
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-900 block mb-2">遅延時間（秒）</label>
              <input type="number" value={block.data.delaySeconds ?? 300} onChange={e => updateBlock(block.id, { delaySeconds: parseInt(e.target.value) || 0 })} min={0} className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500 outline-none" />
              <p className="text-xs text-gray-500 mt-1">0 = 即時表示、300 = 5分後に表示</p>
            </div>

            {/* ボタンプレビュー */}
            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-3 text-center">ボタンプレビュー</p>
              <div className="flex justify-center">
                <div
                  className={`inline-block font-bold text-center transition-all ${
                    { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl', full: 'rounded-full' }[block.data.borderRadius || 'lg']
                  } ${
                    { none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg', xl: 'shadow-xl' }[block.data.shadow || 'lg']
                  } ${
                    block.data.size === 'lg' ? 'px-12 py-5 text-lg' : 'px-10 py-4 text-base'
                  } ${
                    { none: '', pulse: 'cta-pulse', shimmer: 'cta-shimmer', bounce: 'cta-bounce' }[block.data.animation || 'none']
                  }`}
                  style={{ backgroundColor: block.data.buttonColor || '#7c3aed', color: block.data.buttonTextColor || '#ffffff' }}
                >
                  {block.data.buttonText || '今すぐ申し込む'}
                </div>
              </div>
            </div>

            {/* 色設定 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">背景色</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CTA_PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => updateBlock(block.id, { buttonColor: c })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${(block.data.buttonColor || '#7c3aed') === c ? 'border-gray-900 scale-110' : 'border-gray-200 hover:scale-105'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                <input type="color" value={block.data.buttonColor || '#7c3aed'} onChange={e => updateBlock(block.id, { buttonColor: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">テキスト色</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['#ffffff', '#000000', '#1f2937', '#f9fafb'].map(c => (
                    <button key={c} type="button" onClick={() => updateBlock(block.id, { buttonTextColor: c })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${(block.data.buttonTextColor || '#ffffff') === c ? 'border-gray-900 scale-110' : 'border-gray-300 hover:scale-105'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                <input type="color" value={block.data.buttonTextColor || '#ffffff'} onChange={e => updateBlock(block.id, { buttonTextColor: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer border border-gray-200" />
              </div>
            </div>

            {/* 角丸 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">角丸</label>
              <div className="grid grid-cols-4 gap-2">
                {CTA_BORDER_RADIUS_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => updateBlock(block.id, { borderRadius: opt.value })}
                    className={`p-2 text-center border-2 transition-all ${opt.preview} ${(block.data.borderRadius || 'lg') === opt.value ? 'border-violet-500 bg-violet-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className={`w-full h-6 bg-gray-300 mx-auto mb-1 ${opt.preview}`} />
                    <p className="text-xs font-semibold text-gray-700">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 影 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">影</label>
              <div className="grid grid-cols-5 gap-2">
                {CTA_SHADOW_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => updateBlock(block.id, { shadow: opt.value })}
                    className={`p-2 rounded-xl text-center border-2 transition-all ${(block.data.shadow || 'lg') === opt.value ? 'border-violet-500 bg-violet-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <p className="text-xs font-semibold text-gray-700">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* アニメーション */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">アニメーション</label>
              <div className="grid grid-cols-4 gap-2">
                {CTA_ANIMATION_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => updateBlock(block.id, { animation: opt.value })}
                    className={`p-2 rounded-xl text-center border-2 transition-all ${(block.data.animation || 'none') === opt.value ? 'border-violet-500 bg-violet-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <p className="text-xs font-semibold text-gray-700">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* サイズ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">サイズ</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: 'md', label: '標準' }, { value: 'lg', label: '大きい' }].map(opt => (
                  <button key={opt.value} type="button" onClick={() => updateBlock(block.id, { size: opt.value })}
                    className={`p-3 rounded-xl text-center border-2 transition-all ${(block.data.size || 'md') === opt.value ? 'border-violet-500 bg-violet-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <p className="text-sm font-semibold text-gray-700">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            {(block.data.items || []).map((item: { id: string; name: string; role: string; comment: string; imageUrl?: string }, i: number) => (
              <div key={item.id || i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">参加者 {i + 1}</span>
                  <button onClick={() => { const items = (block.data.items || []).filter((_: unknown, j: number) => j !== i); updateBlock(block.id, { items }); }} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400" /></button>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">プロフィール画像</label>
                  <div className="flex gap-2 items-center flex-wrap">
                    <label className="px-3 py-2 bg-violet-50 text-violet-700 rounded-lg font-bold hover:bg-violet-100 cursor-pointer flex items-center gap-1 text-sm">
                      {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                      UP
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, block.id, `testimonial-image-${i}`).then(() => {
                        // handled by updateBlock
                      })} disabled={isUploading} />
                    </label>
                    {testimonialPresetImages.map(preset => (
                      <button key={preset.label} onClick={() => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], imageUrl: preset.url }; updateBlock(block.id, { items }); }} className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 hover:border-violet-400 transition-colors" title={preset.label}>
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button onClick={() => handleRandomImage(block.id, `testimonial-${i}`, 'portrait')} className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs hover:bg-gray-200">
                      <Shuffle size={12} />
                    </button>
                  </div>
                  {item.imageUrl && <img src={item.imageUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover mt-2" />}
                </div>
                <Input label="名前" val={item.name} onChange={v => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], name: v }; updateBlock(block.id, { items }); }} ph="参加者名" />
                <Input label="肩書き" val={item.role} onChange={v => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], role: v }; updateBlock(block.id, { items }); }} ph="会社名 / 職種" />
                <Textarea label="コメント" val={item.comment} onChange={v => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], comment: v }; updateBlock(block.id, { items }); }} rows={3} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), name: '', role: '', comment: '', imageUrl: '' }] })} className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 text-sm">
              + 参加者を追加
            </button>
          </div>
        );

      case 'text_card':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="タイトル" />
            <Textarea label="テキスト" val={block.data.text || ''} onChange={v => updateBlock(block.id, { text: v })} rows={4} />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">画像</label>
              <div className="flex gap-2">
                <input type="text" value={block.data.url || ''} onChange={e => updateBlock(block.id, { url: e.target.value })} placeholder="画像URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400" />
                <label className="px-3 py-2 bg-violet-50 text-violet-700 rounded-lg font-bold hover:bg-violet-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, block.id, 'url')} disabled={isUploading} />
                </label>
              </div>
              {block.data.url && <img src={block.data.url} alt="" className="w-full max-h-40 object-cover rounded-lg mt-2" />}
            </div>
            <Input label="キャプション" val={block.data.caption || ''} onChange={v => updateBlock(block.id, { caption: v })} ph="画像の説明" />
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-3">
            {(block.data.items || []).map((item: { id: string; question: string; answer: string }, i: number) => (
              <div key={item.id || i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Q{i + 1}</span>
                  <button onClick={() => { const items = (block.data.items || []).filter((_: unknown, j: number) => j !== i); updateBlock(block.id, { items }); }} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400" /></button>
                </div>
                <Input label="質問" val={item.question} onChange={v => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], question: v }; updateBlock(block.id, { items }); }} ph="よくある質問" />
                <Textarea label="回答" val={item.answer} onChange={v => { const items = [...(block.data.items || [])]; items[i] = { ...items[i], answer: v }; updateBlock(block.id, { items }); }} rows={2} />
              </div>
            ))}
            <button onClick={() => updateBlock(block.id, { items: [...(block.data.items || []), { id: generateBlockId(), question: '', answer: '' }] })} className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 text-sm">
              + 質問を追加
            </button>
          </div>
        );

      case 'lead_form':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={v => updateBlock(block.id, { title: v })} ph="無料で参加する" />
            <Input label="ボタンテキスト" val={block.data.buttonText || ''} onChange={v => updateBlock(block.id, { buttonText: v })} ph="申し込む" />
          </div>
        );

      default:
        return <p className="text-gray-500 text-sm">このブロックの編集フォームは準備中です</p>;
    }
  };

  // エディタ部分のレンダリング
  // テンプレート適用
  const applyTemplate = (template: WebinarTemplate) => {
    const blocks = template.blocks();
    setLp(prev => ({
      ...prev,
      content: blocks,
      settings: {
        ...prev.settings,
        theme: {
          gradient: template.gradient,
          animated: template.animated,
        },
      },
    }));
    // 最初のブロックを開く
    setExpandedBlocks(new Set(blocks[0]?.id ? [blocks[0].id] : []));
  };

  const renderEditor = () => (
    <div className="space-y-4 pb-32">
      {/* テンプレート選択（新規作成時のみ） */}
      {!savedId && !initialData && (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-violet-100 p-1.5 rounded-lg"><Layout className="w-4 h-4 text-violet-600" /></span>テンプレートから作成
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">テンプレートを選ぶと、ブロックが自動追加されます</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WEBINAR_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-violet-400 hover:shadow-md transition-all text-left group"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{template.emoji}</span>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 group-hover:text-violet-700 transition-colors">{template.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ステップ1: テーマ設定 */}
      <Section
        title="テーマ設定"
        icon={Palette}
        isOpen={openSections.theme}
        onToggle={() => toggleSection('theme')}
        step={1}
        stepLabel="タイトル・背景デザインを設定"
        headerBgColor="bg-violet-50"
        headerHoverColor="hover:bg-violet-100"
        accentColor="bg-violet-100 text-violet-600"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Input
              label="LPタイトル"
              val={lp.title || ''}
              onChange={v => setLp(prev => ({ ...prev, title: v }))}
              ph="未入力の場合「無題のウェビナーLP」になります"
            />
            <Textarea
              label="説明文（SEO用）"
              val={lp.description || ''}
              onChange={v => setLp(prev => ({ ...prev, description: v }))}
              rows={2}
            />
          </div>

          {/* グラデーション選択 */}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-3">背景グラデーション</label>
            <div className="grid grid-cols-4 gap-2">
              {gradientPresets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => setLp(prev => ({ ...prev, settings: { ...prev.settings, theme: { gradient: preset.value, animated: preset.animated, backgroundImage: undefined } } }))}
                  className={`p-1 rounded-lg border-2 transition-all ${lp.settings?.theme?.gradient === preset.value ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200 hover:border-violet-300'}`}
                >
                  <div className={`w-full h-12 rounded ${preset.animated ? 'animate-gradient-xy' : ''}`} style={{ background: preset.value, backgroundSize: '400% 400%' }} />
                  <span className="text-xs text-gray-600 block mt-1 text-center">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* カスタムカラー作成ボタン */}
            <div className="mt-4">
              <button
                onClick={() => setShowColorPicker(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-500 hover:text-violet-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Palette size={18} />
                カスタムカラーを作成
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ステップ2: ブロック編集 */}
      <Section
        title="ブロック"
        icon={Layout}
        isOpen={openSections.blocks}
        onToggle={() => toggleSection('blocks')}
        badge={`${lp.content?.length || 0}個`}
        step={2}
        stepLabel="コンテンツブロックを追加・編集"
        headerBgColor="bg-orange-50"
        headerHoverColor="hover:bg-orange-100"
        accentColor="bg-orange-100 text-orange-600"
      >
        <div className="space-y-3 min-h-[100px]">
          {(!lp.content || lp.content.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <Layout size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">ブロックがありません</p>
              <p className="text-xs mt-1">下のボタンからブロックを追加してください</p>
            </div>
          )}
          {lp.content?.map((block, index) => {
            const blockType = blockTypes.find(bt => bt.type === block.type);
            const Icon = blockType?.icon || Type;
            return (
              <EditorBlockItem
                key={block.id}
                block={block}
                index={index}
                totalBlocks={lp.content?.length || 0}
                blockType={blockType}
                Icon={Icon}
                isExpanded={expandedBlocks.has(block.id)}
                onToggle={() => {
                  setExpandedBlocks(prev => {
                    const next = new Set(prev);
                    if (next.has(block.id)) next.delete(block.id);
                    else next.add(block.id);
                    return next;
                  });
                }}
                onMoveUp={() => moveBlock(block.id, 'up')}
                onMoveDown={() => moveBlock(block.id, 'down')}
                onRemove={() => removeBlock(block.id)}
                renderBlockEditor={renderBlockEditor}
              />
            );
          })}
        </div>

        {/* ブロック追加 */}
        <div className="relative mt-4">
          <button onClick={() => setShowBlockSelector(!showBlockSelector)} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-500 hover:text-violet-600 transition-colors flex items-center justify-center gap-2 font-medium">
            <Plus size={20} />
            ブロックを追加
          </button>

          {showBlockSelector && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 max-h-80 overflow-y-auto">
              <p className="text-xs font-bold text-violet-600 mb-2">ウェビナーLP専用</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                {blockTypes.filter(bt => bt.category === 'webinar').map(bt => (
                  <button key={bt.type} onClick={() => addBlock(bt.type)} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-violet-50 transition-colors border border-transparent hover:border-violet-200">
                    <bt.icon size={24} className="text-violet-600" />
                    <span className="text-xs font-medium text-gray-700">{bt.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-gray-600 mb-2">共通ブロック</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {blockTypes.filter(bt => bt.category === 'common').map(bt => (
                  <button key={bt.type} onClick={() => addBlock(bt.type)} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                    <bt.icon size={24} className="text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">{bt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ステップ3: 高度な設定 */}
      <Section
        title="高度な設定"
        icon={Settings}
        isOpen={openSections.advanced}
        onToggle={() => toggleSection('advanced')}
        step={3}
        stepLabel="各種オプションを設定（任意）"
        headerBgColor="bg-gray-100"
        headerHoverColor="hover:bg-gray-200"
        accentColor="bg-gray-200 text-gray-600"
      >
        <div className="space-y-4">
          {/* ポータル掲載 */}
          <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-violet-900 flex items-center gap-2 mb-1">
                  <Star size={18} className="text-violet-600" /> ポータルに掲載する
                </h4>
                <p className="text-xs text-violet-700">
                  ポータルに掲載することで、SEO対策として効果的となります。より多くの方にウェビナーを見てもらえます。
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                <input type="checkbox" className="sr-only peer" checked={lp.settings?.showInPortal === undefined ? true : lp.settings?.showInPortal} onChange={e => setLp(prev => ({ ...prev, settings: { ...prev.settings, showInPortal: e.target.checked } }))} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
          </div>

          {/* フッター非表示（有料プラン特典） */}
          <div className={`p-4 rounded-xl border ${userPlan.canHideCopyright ? 'bg-violet-50 border-violet-200' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-bold flex items-center gap-2 mb-1 ${userPlan.canHideCopyright ? 'text-violet-900' : 'text-gray-500'}`}>
                  {userPlan.canHideCopyright ? <Eye size={18} className="text-violet-600" /> : <Lock size={18} className="text-gray-400" />}
                  フッターを非表示にする
                  <span className={`text-xs px-2 py-0.5 rounded-full ${userPlan.canHideCopyright ? 'bg-violet-500 text-white' : 'bg-gray-400 text-white'}`}>有料</span>
                </h4>
                <p className={`text-xs ${userPlan.canHideCopyright ? 'text-violet-700' : 'text-gray-500'}`}>
                  コンテンツ下部のフッターを非表示にします。
                </p>
                {!userPlan.canHideCopyright && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-violet-600 font-medium">※ ビジネスプラン以上で利用可能 / 単品購入 ¥500</p>
                    {user?.id && (savedId || initialData?.id) && (
                      <FeaturePurchaseButton
                        userId={user.id}
                        productId="footer_hide"
                        contentId={String(savedId || initialData?.id)}
                        contentType="webinar"
                      />
                    )}
                  </div>
                )}
              </div>
              <label className={`relative inline-flex items-center ml-4 flex-shrink-0 ${userPlan.canHideCopyright ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <input type="checkbox" className="sr-only peer" checked={userPlan.canHideCopyright && (lp.settings?.hideFooter || false)} onChange={e => { if (userPlan.canHideCopyright) setLp(prev => ({ ...prev, settings: { ...prev.settings, hideFooter: e.target.checked } })); }} disabled={!userPlan.canHideCopyright} />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${userPlan.canHideCopyright ? 'bg-gray-200 peer-focus:outline-none peer-checked:bg-violet-600' : 'bg-gray-300'}`}></div>
              </label>
            </div>
          </div>

          {/* 関連コンテンツ非表示（有料プラン特典） */}
          <div className={`p-4 rounded-xl border ${userPlan.canHideCopyright ? 'bg-violet-50 border-violet-200' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-bold flex items-center gap-2 mb-1 ${userPlan.canHideCopyright ? 'text-violet-900' : 'text-gray-500'}`}>
                  {userPlan.canHideCopyright ? <Eye size={18} className="text-violet-600" /> : <Lock size={18} className="text-gray-400" />}
                  関連コンテンツを非表示にする
                  <span className={`text-xs px-2 py-0.5 rounded-full ${userPlan.canHideCopyright ? 'bg-violet-500 text-white' : 'bg-gray-400 text-white'}`}>有料</span>
                </h4>
                <p className={`text-xs ${userPlan.canHideCopyright ? 'text-violet-700' : 'text-gray-500'}`}>
                  ページ下部の関連コンテンツセクションを非表示にします。
                </p>
                {!userPlan.canHideCopyright && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-violet-600 font-medium">※ ビジネスプラン以上で利用可能 / 単品購入 ¥500</p>
                    {user?.id && (savedId || initialData?.id) && (
                      <FeaturePurchaseButton
                        userId={user.id}
                        productId="related_content_hide"
                        contentId={String(savedId || initialData?.id)}
                        contentType="webinar"
                      />
                    )}
                  </div>
                )}
              </div>
              <label className={`relative inline-flex items-center ml-4 flex-shrink-0 ${userPlan.canHideCopyright ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <input type="checkbox" className="sr-only peer" checked={userPlan.canHideCopyright && (lp.settings?.hideRelatedContent || false)} onChange={e => { if (userPlan.canHideCopyright) setLp(prev => ({ ...prev, settings: { ...prev.settings, hideRelatedContent: e.target.checked } })); }} disabled={!userPlan.canHideCopyright} />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${userPlan.canHideCopyright ? 'bg-gray-200 peer-focus:outline-none peer-checked:bg-violet-600' : 'bg-gray-300'}`}></div>
              </label>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* カスタムURL */}
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">カスタムURL（任意）</label>
            <input
              className={`w-full border p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-violet-500 outline-none bg-white placeholder-gray-400 transition-shadow ${slugError ? 'border-red-400' : 'border-gray-300'} ${initialData?.slug ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={customSlug}
              onChange={e => { const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''); setCustomSlug(val); validateCustomSlug(val); }}
              placeholder="my-webinar-page"
              disabled={!!initialData?.slug}
            />
            {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
            <p className="text-xs text-gray-500 mt-1">例: my-webinar, seminar-01<br />※英小文字、数字、ハイフンのみ（3〜20文字）。一度設定すると変更できません。</p>
            {customSlug && !slugError && (
              <p className="text-xs text-violet-600 mt-1">公開URL: {typeof window !== 'undefined' ? window.location.origin : ''}/webinar/{customSlug}</p>
            )}
          </div>

          <hr className="border-gray-200" />
          <Input label="Google Tag Manager ID" val={lp.settings?.gtmId || ''} onChange={v => setLp(prev => ({ ...prev, settings: { ...prev.settings, gtmId: v } }))} ph="GTM-XXXXXXX" />
          <Input label="Facebook Pixel ID" val={lp.settings?.fbPixelId || ''} onChange={v => setLp(prev => ({ ...prev, settings: { ...prev.settings, fbPixelId: v } }))} ph="1234567890" />
          <Input label="LINE Tag ID" val={lp.settings?.lineTagId || ''} onChange={v => setLp(prev => ({ ...prev, settings: { ...prev.settings, lineTagId: v } }))} ph="xxxxx-xxxxx" />
        </div>
      </Section>

      {/* 保存ボタン（下部） */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <button onClick={handleSave} disabled={isSaving} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-purple-700 transition-all shadow-md text-lg">
          {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          {initialData?.id ? '更新して保存' : '保存して公開'}
        </button>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ログインが必要です</h2>
          <button onClick={() => setShowAuth(true)} className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 shadow-md">
            ログイン / 新規登録
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      {/* 成功モーダル */}
      <CreationCompleteModal
        isOpen={showSuccessModal && !!savedSlug}
        onClose={() => setShowSuccessModal(false)}
        title="ウェビナーLP"
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/webinar/${savedSlug}`}
        contentTitle={lp.title || 'ウェビナーLPを作成しました！'}
        theme="purple"
        userId={user?.id}
        contentId={savedId || initialData?.id || undefined}
        contentType="webinar"
        canHideCopyright={userPlan.canHideCopyright}
      />

      {/* ヘッダー */}
      <div className="bg-white border-b px-4 md:px-6 py-4 flex justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
            {initialData ? 'ウェビナーLP編集' : 'ウェビナーLP新規作成'}
          </h2>
        </div>
        <div className="flex gap-2">
          {justSavedSlug && (
            <button onClick={() => setShowSuccessModal(true)} className="hidden sm:flex bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:from-violet-700 hover:to-purple-700 shadow-md text-sm sm:text-base">
              <Trophy size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden md:inline">作成完了画面</span><span className="md:hidden">完了</span>
            </button>
          )}
          {justSavedSlug && (
            <button onClick={() => window.open(`/webinar/${justSavedSlug}`, '_blank')} className="hidden sm:flex bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:bg-green-100 text-sm sm:text-base">
              <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden md:inline">公開URL</span><span className="md:hidden">URL</span>
            </button>
          )}
          <button onClick={handleSave} disabled={isSaving} className="bg-violet-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-violet-700 shadow-md">
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span className="hidden sm:inline">保存</span>
          </button>
        </div>
      </div>

      {/* モバイル用タブバー */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[121px] z-40">
        <div className="flex">
          <button onClick={() => setActiveTab('edit')} className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'edit' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' : 'text-gray-500 hover:text-gray-700'}`}>
            <Edit3 size={18} /> 編集
          </button>
          <button onClick={() => setActiveTab('preview')} className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'preview' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' : 'text-gray-500 hover:text-gray-700'}`}>
            <Eye size={18} /> プレビュー
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左側: 編集パネル */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-2xl mx-auto">
            {renderEditor()}
          </div>
        </div>

        {/* 右側: リアルタイムプレビュー（iframe） */}
        <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${activeTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
          {/* PC用ヘッダー */}
          <div className="hidden lg:flex bg-gray-900 px-4 py-3 items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-gray-400 text-sm font-mono">プレビュー</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button onClick={() => setPreviewMode('pc')} className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-all ${previewMode === 'pc' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`} title="PC表示">
                  <Monitor size={14} /><span className="hidden xl:inline">PC</span>
                </button>
                <button onClick={() => setPreviewMode('mobile')} className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-all ${previewMode === 'mobile' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`} title="スマホ表示">
                  <Smartphone size={14} /><span className="hidden xl:inline">スマホ</span>
                </button>
              </div>
              <button onClick={resetPreview} className="text-gray-400 hover:text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-gray-700">
                <RefreshCw size={14} /><span className="hidden xl:inline">リセット</span>
              </button>
            </div>
          </div>
          {/* モバイル用ヘッダー */}
          <div className="lg:hidden bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <span className="text-white font-bold text-sm">プレビュー</span>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-800 rounded-lg p-0.5">
                <button onClick={() => setPreviewMode('pc')} className={`p-1.5 rounded transition-all ${previewMode === 'pc' ? 'bg-violet-600 text-white' : 'text-gray-400'}`} title="PC表示"><Monitor size={14} /></button>
                <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded transition-all ${previewMode === 'mobile' ? 'bg-violet-600 text-white' : 'text-gray-400'}`} title="スマホ表示"><Smartphone size={14} /></button>
              </div>
              <button onClick={resetPreview} className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-700"><RefreshCw size={14} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-800">
            <div className={`w-full h-full bg-white ${previewMode === 'pc' ? '' : 'hidden'}`}>
              <iframe ref={pcIframeRef} src="/webinar/preview" className="w-full h-full border-0" title="PCプレビュー" key={`pc-${previewKey}`} />
            </div>
            <div className={`p-4 h-full flex items-center justify-center ${previewMode === 'mobile' ? '' : 'hidden'}`}>
              <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl" style={{ width: '390px' }}>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10 pointer-events-none" />
                <div className="bg-white rounded-[2.5rem] overflow-hidden" style={{ width: '375px', height: '667px' }}>
                  <iframe ref={mobileIframeRef} src="/webinar/preview" className="w-full h-full border-0" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties} title="スマホプレビュー" key={`mobile-${previewKey}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>

      {/* カスタムカラーピッカーモーダル */}
      <CustomColorPicker
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onApply={(value, isAnimated) => {
          setLp(prev => ({
            ...prev,
            settings: { ...prev.settings, theme: { gradient: value, animated: isAnimated ?? false, backgroundImage: undefined } },
          }));
        }}
        accentColor="emerald"
        userId={user?.id}
      />
      <CreationLimitModal {...limitModalProps} />
    </div>
  );
};

// エディタ用ブロックアイテム（展開時にスクロール）
function EditorBlockItem({
  block,
  index,
  totalBlocks,
  blockType,
  Icon,
  isExpanded,
  onToggle,
  onMoveUp,
  onMoveDown,
  onRemove,
  renderBlockEditor,
}: {
  block: Block;
  index: number;
  totalBlocks: number;
  blockType: { label: string; type: string; color?: { bg: string; border: string; text: string; icon: string; hover: string } } | undefined;
  Icon: React.ElementType;
  isExpanded: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  renderBlockEditor: (block: Block) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    const wasCollapsed = !isExpanded;
    onToggle();
    if (wasCollapsed && ref.current) {
      setTimeout(() => {
        const el = ref.current;
        if (!el) return;
        let scrollParent = el.parentElement;
        while (scrollParent && getComputedStyle(scrollParent).overflowY !== 'auto') {
          scrollParent = scrollParent.parentElement;
        }
        if (scrollParent) {
          const elRect = el.getBoundingClientRect();
          const containerRect = scrollParent.getBoundingClientRect();
          const offset = elRect.top - containerRect.top + scrollParent.scrollTop - 12;
          scrollParent.scrollTo({ top: offset, behavior: 'smooth' });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }, [isExpanded, onToggle]);

  return (
    <div ref={ref} className={`rounded-xl border overflow-hidden ${blockType?.color?.border || 'border-gray-200'} ${blockType?.color?.bg || 'bg-gray-50'}`}>
      <div className={`w-full flex items-center justify-between p-4 cursor-pointer ${blockType?.color?.hover || 'hover:bg-gray-100'}`} onClick={handleToggle}>
        <div className="flex items-center gap-3 flex-1">
          <GripVertical size={18} className="text-gray-400" />
          <Icon size={18} className={blockType?.color?.icon || 'text-violet-600'} />
          <span className={`font-medium ${blockType?.color?.text || 'text-gray-700'}`}>
            {blockType?.label || block.type}
          </span>
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={onMoveUp} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowUp size={16} /></button>
          <button onClick={onMoveDown} disabled={index === totalBlocks - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowDown size={16} /></button>
          <button onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
          <button onClick={handleToggle} className="p-1 text-gray-400">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-white">
          {renderBlockEditor(block)}
        </div>
      )}
    </div>
  );
}

export default WebinarEditor;
