'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import HomeAuthProvider from '@/components/home/HomeAuthProvider';
import {
  Headset, ArrowRight, Sparkles, Check, ChevronRight,
  Video, Mail, FileText, GitBranch, Share2, Calendar,
  Gamepad2, MapPin, BarChart3, BookOpen, Lightbulb,
  TrendingUp, Repeat, MousePointerClick,
  MessageCircle, ClipboardCheck, Rocket, Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface PackItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface SupportPack {
  id: string;
  packName: string;
  tagline: string;
  description: string;
  color: string;
  bgGradient: string;
  icon: LucideIcon;
  includes: PackItem[];
}

const SUPPORT_PACKS: SupportPack[] = [
  {
    id: 'coach',
    packName: 'セミナー集客パック',
    tagline: 'コーチ・コンサル・講師の方へ',
    description: 'セミナー告知→フォローアップ→個別相談予約の流れを、プロが一緒に構築します。',
    color: '#6366f1',
    bgGradient: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    icon: Video,
    includes: [
      { icon: FileText, title: 'ウェビナーLP初期設定代行', description: 'あなたのセミナー内容をヒアリングし、最適なLP構成で作成をサポート' },
      { icon: Mail, title: 'ステップメール5通分のシナリオ設計', description: 'セミナー後のフォローアップメールの文面を一緒に作成' },
      { icon: MousePointerClick, title: '予約導線の構築', description: '予約フォーム設定 + LP・メールからの導線を設計' },
      { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
    ],
  },
  {
    id: 'creator',
    packName: 'コンテンツ販売スタートパック',
    tagline: 'コンテンツ販売者・Kindle著者の方へ',
    description: '商品の魅力を最大限に伝え、売れ続ける仕組みをプロが一緒に構築します。',
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    icon: GitBranch,
    includes: [
      { icon: FileText, title: '販売LP作成サポート', description: 'あなたのコンテンツの魅力を最大限に伝えるLP構成を一緒に設計' },
      { icon: Sparkles, title: '診断クイズシナリオ設計', description: '見込み客を惹きつける診断クイズのシナリオを一緒に作成' },
      { icon: GitBranch, title: 'ファネル設計コンサル', description: '集客→教育→販売の導線を設計' },
      { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
    ],
  },
  {
    id: 'freelance',
    packName: 'フリーランス集客パック',
    tagline: 'フリーランス・SNS発信者の方へ',
    description: 'あなたの強みを引き出し、SNSからお客様につながる導線をプロが一緒に構築します。',
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    icon: Share2,
    includes: [
      { icon: FileText, title: 'プロフィールLP作成サポート', description: 'あなたの強みを引き出すヒアリング + LP作成をサポート' },
      { icon: Share2, title: 'SNS発信戦略', description: 'ターゲットに刺さるSNS投稿テンプレートを一緒に作成' },
      { icon: TrendingUp, title: '集客導線の設計', description: 'SNS→プロフィールLP→お問い合わせの流れを構築' },
      { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
    ],
  },
  {
    id: 'shop',
    packName: '店舗集客パック',
    tagline: '店舗・教室・サロンの方へ',
    description: 'お店の魅力を伝え、リピーターが増える仕組みをプロが一緒に構築します。',
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    icon: Gamepad2,
    includes: [
      { icon: FileText, title: 'ホームページ作成サポート', description: '店舗情報・メニュー・アクセスを見やすく配置したページを作成' },
      { icon: Gamepad2, title: '予約・来店促進の仕組み', description: '予約フォーム設定 + クーポン診断クイズの設計' },
      { icon: MapPin, title: 'Googleマップ・SNS連携アドバイス', description: 'MEO対策の基本設定をサポート' },
      { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
    ],
  },
  {
    id: 'starter',
    packName: '起業スタートパック',
    tagline: 'これから起業・副業を始める方へ',
    description: '何から始めればいいか分からない方へ。ビジネスの土台づくりをプロが一緒にサポートします。',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    icon: Lightbulb,
    includes: [
      { icon: Lightbulb, title: 'ビジネスコンセプト整理', description: 'ヒアリングであなたの強み・ターゲットを明確化' },
      { icon: FileText, title: 'プロフィールLP作成サポート', description: 'コンセプトを反映した自己紹介ページを一緒に作成' },
      { icon: TrendingUp, title: '初期集客プラン設計', description: '診断クイズ + SNS投稿の初期設計をサポート' },
      { icon: Repeat, title: '30日間メールサポート', description: '運用開始後の疑問や改善相談に対応' },
    ],
  },
  {
    id: 'business',
    packName: '法人導入サポートパック',
    tagline: '法人・チーム運営の方へ',
    description: '現在のツール環境を分析し、最適な移行・導入プランをプロが一緒に設計します。',
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    icon: BarChart3,
    includes: [
      { icon: BarChart3, title: '導入コンサルティング', description: '現在のツール環境を分析し、最適な移行プランを提案' },
      { icon: FileText, title: 'LP・フォーム初期構築代行', description: '最初のキャンペーンLP + フォームを代行作成' },
      { icon: BookOpen, title: 'チーム運用マニュアル作成', description: '社内向けの操作ガイド・テンプレート活用ガイドを作成' },
      { icon: Repeat, title: '60日間メール・チャットサポート', description: '導入後の定着まで手厚くサポート' },
    ],
  },
];

const FLOW_STEPS = [
  { number: 1, title: '無料相談', description: 'フォームからお問い合わせ。現在の課題やご希望をお聞かせください。', icon: MessageCircle, color: '#3b82f6' },
  { number: 2, title: 'プラン提案', description: 'ヒアリング内容をもとに、あなたに最適なサポート内容をご提案します。', icon: ClipboardCheck, color: '#10b981' },
  { number: 3, title: '一緒に構築', description: 'プロが伴走しながら、集客の仕組みを一緒に作り上げます。', icon: Users, color: '#f59e0b' },
  { number: 4, title: '運用サポート', description: '構築後も30〜60日間、運用の疑問や改善相談に対応します。', icon: Rocket, color: '#ec4899' },
];

const FAQ_ITEMS = [
  { question: 'サポートパックの料金はいくらですか？', answer: 'パックの内容やご状況に応じてお見積りをお出しします。まずは無料相談で、あなたに最適なプランをご提案させてください。' },
  { question: 'どのくらいの期間で仕組みが完成しますか？', answer: '多くの場合、初回ヒアリングから2〜4週間で基本的な仕組みが完成します。その後30日間（法人パックは60日間）のサポート期間で運用を定着させます。' },
  { question: 'オンラインで完結しますか？', answer: 'はい、すべてオンライン（Zoom + メール）で完結します。対面での打ち合わせは不要です。' },
  { question: 'ツールの月額費用は別途かかりますか？', answer: 'サポートパックは「仕組みの構築支援」です。ツール自体はフリープラン（¥0）のまま使えます。有料プランへのアップグレードは任意です。' },
  { question: '途中でキャンセルできますか？', answer: '構築開始前であればキャンセル可能です。詳細は無料相談時にご説明いたします。' },
];

export default function SupportPageClient() {
  const searchParams = useSearchParams();
  const personaParam = searchParams.get('persona');
  const [selectedPack, setSelectedPack] = useState(personaParam || '');
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const inquiryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (personaParam) {
      setSelectedPack(personaParam);
      // Scroll to the pack card after a short delay
      setTimeout(() => {
        const el = document.getElementById(`pack-${personaParam}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [personaParam]);

  const scrollToInquiry = (packId: string) => {
    setSelectedPack(packId);
    setTimeout(() => {
      inquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('loading');

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      pack: formData.get('pack') as string,
      situation: formData.get('situation') as string,
      message: formData.get('message') as string,
    };

    try {
      const res = await fetch('/api/support-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFormStatus('success');
        formRef.current?.reset();
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <HomeAuthProvider>
      {/* ========== Hero ========== */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden" style={{ background: 'linear-gradient(180deg, #fffbf0 0%, #fff7ed 50%, #ffffff 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.04 }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/80 backdrop-blur text-sm font-bold mb-8 border shadow-sm" style={{ color: '#f97316', borderColor: '#fed7aa' }}>
            <Headset size={16} />
            サポートパック
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ color: '#5d4037' }}>
            ひとりで悩まない。<br />
            <span style={{ color: '#f97316' }}>プロと一緒に、最短で構築。</span>
          </h1>

          <p className="text-base md:text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            ツールは揃っている。でも「何から手をつければいいか分からない」——<br className="hidden md:block" />
            そんなあなたに、プロが伴走しながら集客の仕組みを一緒につくります。
          </p>

          <a
            href="#inquiry"
            className="inline-flex items-center gap-2 text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{ backgroundColor: '#f97316' }}
          >
            <Headset size={20} />
            まずは無料で相談する
          </a>
          <p className="text-xs text-gray-500 mt-3">※ 相談は無料です。無理な営業は一切いたしません。</p>
        </div>
      </section>

      {/* ========== こんな方におすすめ ========== */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ color: '#5d4037' }}>
            こんな方に<span style={{ color: '#f97316' }}>おすすめ</span>です
          </h2>
          <div className="space-y-3">
            {[
              'ツールは揃っているけど、使いこなせていない',
              '集客の仕組みをつくりたいけど、何から手をつけるか分からない',
              '自分でやるより、プロに見てもらいながら最短で成果を出したい',
              'LP・メール・予約の導線設計に自信がない',
              '一人で試行錯誤するのに疲れた',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa40' }}>
                <span style={{ color: '#f97316' }} className="mt-0.5 flex-shrink-0">●</span>
                <span className="text-gray-700 text-sm font-medium leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 6パック一覧 ========== */}
      <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
              あなたに合ったパックを選べます
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }}>
              6つのサポートパック
            </h2>
            <p className="text-gray-600">それぞれのビジネスタイプに合わせた、専用の構築サポートをご用意。</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUPPORT_PACKS.map((pack) => {
              const PackIcon = pack.icon;
              const isHighlighted = personaParam === pack.id;
              return (
                <div
                  key={pack.id}
                  id={`pack-${pack.id}`}
                  className={`bg-white rounded-3xl border-2 overflow-hidden hover:shadow-xl transition-all duration-300 ${isHighlighted ? 'shadow-xl ring-2 ring-offset-2' : 'shadow-md'}`}
                  style={{
                    borderColor: isHighlighted ? pack.color : '#e5e7eb',
                    ...(isHighlighted ? { ringColor: pack.color } : {}),
                  }}
                >
                  <div className="p-2">
                    <div className="rounded-2xl p-4" style={{ background: pack.bgGradient }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${pack.color}20`, color: pack.color }}>
                          <PackIcon size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{pack.tagline}</p>
                          <h3 className="text-base font-bold" style={{ color: '#5d4037' }}>{pack.packName}</h3>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{pack.description}</p>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="space-y-3 mb-6">
                      {pack.includes.map((item, i) => {
                        const ItemIcon = item.icon;
                        return (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${pack.color}10`, color: pack.color }}>
                              <ItemIcon size={12} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-700">{item.title}</p>
                              <p className="text-xs text-gray-400">{item.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => scrollToInquiry(pack.id)}
                      className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-bold py-3 px-6 rounded-full shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                      style={{ backgroundColor: pack.color }}
                    >
                      この内容で相談する
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== サポートの流れ ========== */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }}>
              サポートの<span style={{ color: '#f97316' }}>流れ</span>
            </h2>
            <p className="text-gray-600">無料相談から運用定着まで、4つのステップで進めます。</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FLOW_STEPS.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className="text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg" style={{ backgroundColor: step.color }}>
                    <StepIcon size={28} />
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-2" style={{ backgroundColor: `${step.color}15`, color: step.color }}>
                    Step {step.number}
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#5d4037' }}>{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== Before / After ========== */}
      <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ color: '#5d4037' }}>
            自力 vs サポートパック
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2">
              <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold mb-4">
                  自力でやった場合
                </div>
                <ul className="space-y-3">
                  {[
                    'ツールの使い方を調べるのに時間がかかる',
                    '「これで合っているのか？」と不安なまま進める',
                    '導線設計が分からず、アクセスが来ても成果に繋がらない',
                    '数ヶ月たっても仕組みが完成しない',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="mt-0.5 flex-shrink-0">△</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8" style={{ backgroundColor: '#fff7ed' }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: '#ffedd5', color: '#f97316' }}>
                  サポートパックを使った場合
                </div>
                <ul className="space-y-3">
                  {[
                    'プロが最適な設定を一緒に行うから迷わない',
                    '導線設計のプロがアドバイスするから成果が出やすい',
                    '2〜4週間で基本的な仕組みが完成',
                    '運用開始後も30日間のサポートで安心',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                      <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ color: '#5d4037' }}>
            よくある質問
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-orange-50 bg-white">
                <details className="group">
                  <summary className="flex justify-between items-center px-6 py-5 font-bold cursor-pointer select-none list-none" style={{ color: '#5d4037' }}>
                    <span>{faq.question}</span>
                    <span className="transition group-open:rotate-180" style={{ color: '#f97316' }}>▼</span>
                  </summary>
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== お問い合わせフォーム ========== */}
      <section className="py-20" style={{ backgroundColor: '#fffbf0' }} ref={inquiryRef} id="inquiry">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
              <Headset size={16} />
              無料相談
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }}>
              まずはお気軽にご相談ください
            </h2>
            <p className="text-gray-600 text-sm">
              内容を確認後、2営業日以内にご連絡いたします。
            </p>
          </div>

          {formStatus === 'success' ? (
            <div className="bg-white rounded-3xl border border-green-200 p-10 text-center shadow-lg">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#5d4037' }}>送信が完了しました</h3>
              <p className="text-gray-600 text-sm">
                お問い合わせありがとうございます。<br />
                2営業日以内にご連絡いたしますので、しばらくお待ちください。
              </p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold mb-2" style={{ color: '#5d4037' }}>
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold mb-2" style={{ color: '#5d4037' }}>
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="pack" className="block text-sm font-bold mb-2" style={{ color: '#5d4037' }}>
                  関心のあるパック
                </label>
                <select
                  id="pack"
                  name="pack"
                  value={selectedPack}
                  onChange={(e) => setSelectedPack(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="">選択してください</option>
                  {SUPPORT_PACKS.map((pack) => (
                    <option key={pack.id} value={pack.id}>{pack.packName}（{pack.tagline}）</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="situation" className="block text-sm font-bold mb-2" style={{ color: '#5d4037' }}>
                  現在の状況（任意）
                </label>
                <textarea
                  id="situation"
                  name="situation"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  placeholder="例: フリーランスとしてSNSで発信しているが、集客に繋がっていない"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold mb-2" style={{ color: '#5d4037' }}>
                  メッセージ（任意）
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  placeholder="ご質問やご要望がありましたらお気軽にどうぞ"
                />
              </div>

              {formStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                  送信に失敗しました。しばらく時間をおいて再度お試しください。
                </div>
              )}

              <button
                type="submit"
                disabled={formStatus === 'loading'}
                className="w-full inline-flex items-center justify-center gap-2 text-white text-base font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#f97316' }}
              >
                {formStatus === 'loading' ? (
                  '送信中...'
                ) : (
                  <>
                    <Headset size={18} />
                    無料相談を申し込む
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                ※ 無理な営業は一切いたしません。お気軽にご相談ください。
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ========== Final CTA ========== */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#f97316' }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-yellow-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-6 text-white leading-tight">
            「ひとりで悩む」を、<br />今日で終わりにしませんか？
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed text-white/80">
            プロと一緒なら、集客の仕組みは最短で完成します。<br />
            まずは無料相談で、あなたの課題をお聞かせください。
          </p>
          <a
            href="#inquiry"
            className="bg-white text-lg font-bold py-4 px-12 rounded-full shadow-2xl transition transform hover:-translate-y-1 inline-flex items-center gap-2"
            style={{ color: '#f97316' }}
          >
            <Headset size={20} />
            無料で相談する
          </a>
        </div>
      </section>

      {/* ========== 他のページリンク ========== */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-xl font-bold text-center mb-8" style={{ color: '#5d4037' }}>
            ビジネスタイプ別の活用法も見る
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'コーチ・コンサル・講師', href: '/for/coach', color: '#6366f1' },
              { label: 'コンテンツ販売者', href: '/for/creator', color: '#ec4899' },
              { label: 'フリーランス・SNS発信者', href: '/for/freelance', color: '#3b82f6' },
              { label: '店舗・教室・サロン', href: '/for/shop', color: '#10b981' },
              { label: 'これから起業する方', href: '/for/starter', color: '#f59e0b' },
              { label: '法人・チーム', href: '/for/business', color: '#8b5cf6' },
            ].map((type, i) => (
              <a
                key={i}
                href={type.href}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <span className="font-bold text-sm" style={{ color: '#5d4037' }}>{type.label}</span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-500 transition" />
              </a>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="/" className="text-sm font-bold hover:underline transition" style={{ color: '#f97316' }}>
              ← トップページに戻る
            </a>
          </div>
        </div>
      </section>
    </HomeAuthProvider>
  );
}
