'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { Profile, Block, generateBlockId } from '@/lib/types';
import { profileTemplates } from '@/constants/templates';
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
  Link as LinkIcon,
  Youtube,
  MessageCircle,
  HelpCircle,
  DollarSign,
  UserCircle,
  Layout,
  Sparkles,
  Wand2,
  RefreshCw,
  UploadCloud,
  Book,
  Mail,
  Star,
  MapPin,
  Palette,
  ExternalLink,
  Copy,
  Trophy,
  Settings,
  ArrowUp,
  ArrowDown,
  Shuffle,
  Brain,
  Timer,
  Images,
  CheckCircle
} from 'lucide-react';

interface ProfileEditorProps {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  initialData?: Profile | null;
  setPage: (page: string) => void;
  onBack: () => void;
  setShowAuth: (show: boolean) => void;
}

// ブロックタイプの定義
const blockTypes = [
  { type: 'header', label: 'ヘッダー', icon: UserCircle, description: 'プロフィール画像・名前・肩書き' },
  { type: 'text_card', label: 'テキスト', icon: Type, description: 'タイトル付きテキストカード' },
  { type: 'image', label: '画像', icon: ImageIcon, description: '画像とキャプション' },
  { type: 'links', label: 'リンク集', icon: LinkIcon, description: 'SNSなどのリンクボタン' },
  { type: 'youtube', label: 'YouTube', icon: Youtube, description: '動画埋め込み' },
  { type: 'kindle', label: 'Kindle', icon: Book, description: '書籍紹介カード' },
  { type: 'line_card', label: 'LINE', icon: MessageCircle, description: 'LINE公式アカウント誘導' },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'よくある質問' },
  { type: 'pricing', label: '料金表', icon: DollarSign, description: 'プラン・価格表示' },
  { type: 'testimonial', label: 'お客様の声', icon: Star, description: '推薦文・レビュー' },
  { type: 'lead_form', label: 'リードフォーム', icon: Mail, description: 'メールアドレス収集' },
  { type: 'google_map', label: 'Googleマップ', icon: MapPin, description: '地図埋め込み' },
  { type: 'quiz', label: '診断クイズ', icon: Brain, description: '診断クイズ埋め込み' },
  { type: 'countdown', label: 'カウントダウン', icon: Timer, description: 'カウントダウンタイマー' },
  { type: 'gallery', label: 'ギャラリー', icon: Images, description: '複数画像スライドショー' },
];

// グラデーションプリセット（animated: trueのものは動くグラデーション）
const gradientPresets = [
  // 動くグラデーション（元のプロフィールLPから参照）
  { name: 'Sunset', value: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', animated: true },
  { name: 'Ocean', value: 'linear-gradient(-45deg, #1e3c72, #2a5298, #7e8ba3, #a8c0d0)', animated: true },
  { name: 'Berry', value: 'linear-gradient(-45deg, #f093fb, #f5576c, #c471ed, #f64f59)', animated: true },
  { name: 'Forest', value: 'linear-gradient(-45deg, #134e5e, #71b280, #134e5e, #71b280)', animated: true },
  { name: 'Purple', value: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)', animated: true },
  // 静的グラデーション（カラフルな色合い）
  { name: 'トロピカル', value: 'linear-gradient(-45deg, #f093fb, #f5576c, #ffd89b, #19547b)', animated: false },
  { name: 'コーラル', value: 'linear-gradient(-45deg, #fa709a, #fee140, #30cfd0, #330867)', animated: false },
  { name: 'オーロラ', value: 'linear-gradient(-45deg, #4facfe, #00f2fe, #43e97b, #38f9d7)', animated: false },
  { name: 'ラベンダー', value: 'linear-gradient(-45deg, #a8edea, #fed6e3, #d299c2, #fef9d7)', animated: false },
  { name: 'ピーチ', value: 'linear-gradient(-45deg, #ffecd2, #fcb69f, #ff9a9e, #fecfef)', animated: false },
];

// 画像アップロードサイズ制限（2MB）
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

// お客様の声用プリセット画像
const testimonialPresetImages = [
  { label: '男性A', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  { label: '男性B', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces' },
  { label: '男性C', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性A', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性B', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces' },
  { label: '女性C', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
];

// リンクスタイルオプション
const linkStyleOptions = [
  { value: '', label: 'デフォルト（白）' },
  { value: 'orange', label: 'オレンジ' },
  { value: 'blue', label: 'ブルー' },
  { value: 'green', label: 'グリーン' },
  { value: 'purple', label: 'パープル' },
  { value: 'line', label: 'LINE緑' },
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
    general: [
      'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80',
    ],
    book: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
    ],
  };
  const urls = categories[category] || categories.general;
  return urls[Math.floor(Math.random() * urls.length)];
};

// セクションコンポーネント
const Section = ({ 
  title, 
  icon: Icon, 
  isOpen, 
  onToggle, 
  children,
  badge
}: { 
  title: string, 
  icon: React.ComponentType<{ size?: number }>, 
  isOpen: boolean, 
  onToggle: () => void, 
  children: React.ReactNode,
  badge?: string
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    <button 
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{badge}</span>
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
const Input = ({label, val, onChange, ph, disabled = false}: {label: string, val: string, onChange: (v: string) => void, ph?: string, disabled?: boolean}) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <input 
      className={`w-full border border-gray-300 p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-white placeholder-gray-400 transition-shadow ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      value={val || ''} 
      onChange={e => onChange(e.target.value)} 
      placeholder={ph}
      disabled={disabled}
    />
  </div>
);

const Textarea = ({label, val, onChange, rows = 3}: {label: string, val: string, onChange: (v: string) => void, rows?: number}) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <textarea 
      className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none bg-white placeholder-gray-400 transition-shadow" 
      rows={rows} 
      value={val || ''} 
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

// プレビューコンポーネント（アニメーション付きグラデーション・背景画像対応）
const ProfilePreview = ({ profile }: { profile: Profile }) => {
  const theme = profile.settings?.theme;
  const backgroundImage = theme?.backgroundImage;
  const gradient = theme?.gradient || 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)';
  const isAnimated = theme?.animated !== false; // デフォルトはアニメーション有効

  // 背景スタイルの決定（アニメーション時はbackgroundImageプロパティを使用）
  const backgroundStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : {
        backgroundImage: gradient,
        backgroundSize: isAnimated ? '400% 400%' : 'auto',
      };

  return (
    <div 
      className={`min-h-screen py-8 px-4 ${!backgroundImage && isAnimated ? 'animate-gradient-xy' : ''}`}
      style={backgroundStyle}
    >
      <div className="max-w-md mx-auto">
        {profile.content?.map(block => (
          <ProfileBlockRenderer key={block.id} block={block} />
        ))}

        {/* フッター */}
        <div className="text-center py-8">
          <span className="text-white/60 text-xs">
            Powered by コンテンツメーカー
          </span>
        </div>
      </div>
    </div>
  );
};

// カウントダウンタイマーコンポーネント（プレビュー用）
const CountdownPreview = ({ block }: { block: Extract<Block, { type: 'countdown' }> }) => {
  const [countdownTime, setCountdownTime] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(block.data.targetDate);
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setCountdownTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdownTime({ days, hours, minutes, seconds });
      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [block.data.targetDate]);

  if (isExpired) {
    return (
      <div 
        className="glass rounded-2xl p-6 mb-4 text-center"
        style={{ backgroundColor: block.data.backgroundColor || '#f59e0b' }}
      >
        {block.data.title && (
          <h3 className="text-xl font-bold text-white mb-2">{block.data.title}</h3>
        )}
        <p className="text-white">{block.data.expiredText || '期限切れ'}</p>
      </div>
    );
  }

  if (!countdownTime) {
    return (
      <div 
        className="glass rounded-2xl p-6 mb-4 text-center"
        style={{ backgroundColor: block.data.backgroundColor || '#f59e0b' }}
      >
        <div className="text-white">読み込み中...</div>
      </div>
    );
  }

  return (
    <div 
      className="glass rounded-2xl p-6 mb-4 text-center"
      style={{ backgroundColor: block.data.backgroundColor || '#f59e0b' }}
    >
      {block.data.title && (
        <h3 className="text-xl font-bold text-white mb-4">{block.data.title}</h3>
      )}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/20 backdrop-blur rounded-xl p-4">
          <div className="text-3xl font-black text-white">{countdownTime.days}</div>
          <div className="text-sm text-white/80 mt-1">日</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-xl p-4">
          <div className="text-3xl font-black text-white">{countdownTime.hours}</div>
          <div className="text-sm text-white/80 mt-1">時間</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-xl p-4">
          <div className="text-3xl font-black text-white">{countdownTime.minutes}</div>
          <div className="text-sm text-white/80 mt-1">分</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-xl p-4">
          <div className="text-3xl font-black text-white">{countdownTime.seconds}</div>
          <div className="text-sm text-white/80 mt-1">秒</div>
        </div>
      </div>
    </div>
  );
};

// 簡易ブロックレンダラー（プレビュー用）
const ProfileBlockRenderer = ({ block }: { block: Block }) => {
  switch (block.type) {
    case 'header':
      return (
        <div className="text-center py-8">
          {block.data.avatar && (
            <img
              src={block.data.avatar}
              alt={block.data.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/30 shadow-lg object-cover"
            />
          )}
          <h1 className="text-2xl font-bold text-white mb-2">{block.data.name || '名前'}</h1>
          <p className="text-white/80">{block.data.title || '肩書き'}</p>
        </div>
      );

    case 'text_card':
      return (
        <div className="glass rounded-2xl p-6 mb-4" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}>
          {block.data.title && (
            <h3 className="font-bold text-gray-900 mb-3">{block.data.title}</h3>
          )}
          <p className={`text-gray-700 whitespace-pre-wrap ${block.data.align === 'center' ? 'text-center' : ''}`}>
            {block.data.text || 'テキストを入力...'}
          </p>
        </div>
      );

    case 'image':
      if (!block.data.url) {
        return (
          <div className="mb-4 rounded-2xl overflow-hidden shadow-lg bg-white/90 backdrop-blur p-8 text-center">
            <ImageIcon size={48} className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 text-sm">画像URLを設定してください</p>
          </div>
        );
      }
      return (
        <div className="mb-4">
          <img
            src={block.data.url}
            alt={block.data.caption || ''}
            className="w-full rounded-2xl shadow-lg"
          />
          {block.data.caption && (
            <p className="text-center text-white/70 text-sm mt-2">{block.data.caption}</p>
          )}
        </div>
      );

    case 'youtube':
      const videoId = block.data.url?.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsRes498498|\/watch\?v=))([\w-]{10,12})/)?.[1];
      if (!videoId) {
        return (
          <div className="mb-4 aspect-video rounded-2xl overflow-hidden shadow-lg bg-white/90 backdrop-blur flex flex-col items-center justify-center">
            <Youtube size={48} className="mb-2 text-red-500" />
            <p className="text-gray-500 text-sm">YouTube URLを設定してください</p>
          </div>
        );
      }
      return (
        <div className="mb-4 aspect-video rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      );

    case 'links':
      return (
        <div className="space-y-3 mb-4">
          {block.data.links?.map((link: { label: string; url: string; style?: string }, i: number) => {
            // スタイルに応じた背景色と文字色
            const styleClasses: Record<string, string> = {
              '': 'bg-white/90 text-gray-900',
              'orange': 'bg-orange-500 text-white',
              'blue': 'bg-blue-500 text-white',
              'green': 'bg-green-500 text-white',
              'purple': 'bg-purple-500 text-white',
              'line': 'bg-[#06C755] text-white',
            };
            const styleClass = styleClasses[link.style || ''] || styleClasses[''];
            
            return (
              <div
                key={i}
                className={`flex items-center justify-between w-full px-6 py-4 backdrop-blur rounded-xl font-medium ${styleClass}`}
              >
                <span>{link.label || 'リンク'}</span>
                <ExternalLink size={18} className={link.style ? 'text-white/70' : 'text-gray-400'} />
              </div>
            );
          })}
        </div>
      );

    case 'kindle':
      return (
        <div className="rounded-2xl p-6 mb-4" style={{ background: 'rgba(255,255,255,0.9)' }}>
          <div className="flex gap-4">
            {block.data.imageUrl && (
              <img
                src={block.data.imageUrl}
                alt={block.data.title}
                className="w-24 h-auto rounded-lg shadow"
              />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-2">{block.data.title || '書籍タイトル'}</h4>
              <p className="text-sm text-gray-600 mb-3">{block.data.description}</p>
            </div>
          </div>
        </div>
      );

    case 'line_card':
      return (
        <div className="bg-[#06C755] rounded-2xl p-6 mb-4 text-white">
          <h4 className="font-bold text-lg mb-2">{block.data.title || 'LINE登録'}</h4>
          <p className="text-white/80 text-sm mb-4">{block.data.description}</p>
          <div className="w-full text-center bg-white text-[#06C755] font-bold py-3 rounded-xl">
            {block.data.buttonText || 'LINEで登録'}
          </div>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-3 mb-4">
          {block.data.items?.map((item: { id: string; question: string; answer: string }) => (
            <div key={item.id} className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.9)' }}>
              <div className="p-4">
                <p className="font-medium text-gray-900">Q. {item.question || '質問'}</p>
                <p className="text-gray-600 mt-2 text-sm">A. {item.answer || '回答'}</p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'pricing':
      return (
        <div className="space-y-4 mb-4">
          {block.data.plans?.map((plan: { id: string; title: string; price: string; features: string[]; isRecommended: boolean }) => (
            <div 
              key={plan.id} 
              className={`rounded-2xl p-6 ${plan.isRecommended ? 'bg-white ring-2 ring-indigo-500' : ''}`}
              style={{ background: plan.isRecommended ? 'white' : 'rgba(255,255,255,0.9)' }}
            >
              {plan.isRecommended && (
                <span className="inline-block bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  おすすめ
                </span>
              )}
              <h4 className="font-bold text-lg text-gray-900">{plan.title || 'プラン名'}</h4>
              <p className="text-2xl font-black text-gray-900 my-2">{plan.price || '¥0'}</p>
              <ul className="space-y-2">
                {plan.features?.map((feature: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'testimonial':
      return (
        <div className="space-y-4 mb-4">
          {block.data.items?.map((item: { id: string; name: string; role: string; comment: string; imageUrl?: string }) => (
            <div key={item.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.9)' }}>
              <div className="flex items-center gap-3 mb-3">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{item.name || 'お名前'}</p>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm">{item.comment || 'コメント'}</p>
            </div>
          ))}
        </div>
      );

    case 'lead_form':
      return (
        <div className="rounded-2xl p-6 mb-4 text-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
          <h4 className="font-bold text-lg text-gray-900 mb-4">{block.data.title || 'お問い合わせ'}</h4>
          <div className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">
            {block.data.buttonText || '送信する'}
          </div>
        </div>
      );

    case 'google_map':
      return (
        <div className="mb-4">
          {block.data.title && (
            <h3 className="text-white font-bold mb-2 text-center">{block.data.title}</h3>
          )}
          <div className="rounded-2xl overflow-hidden shadow-lg h-48 bg-gray-200 flex items-center justify-center">
            <MapPin size={32} className="text-gray-400" />
          </div>
        </div>
      );

    case 'quiz': {
      const quizData = block.data as { quizId?: string; quizSlug?: string; title?: string };
      return (
        <div className="glass rounded-2xl p-4 mb-4 overflow-hidden">
          {quizData.title && (
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              {quizData.title}
            </h3>
          )}
          <div className="text-center py-8 text-gray-600">
            <Brain size={48} className="mx-auto mb-2 opacity-50" />
            <p>診断クイズ</p>
            {quizData.quizId && <p className="text-sm mt-1">ID: {quizData.quizId}</p>}
            {quizData.quizSlug && <p className="text-sm mt-1">Slug: {quizData.quizSlug}</p>}
          </div>
        </div>
      );
    }

    case 'countdown': {
      const countdownBlock = block as Extract<Block, { type: 'countdown' }>;
      return <CountdownPreview block={countdownBlock} />;
    }

    case 'gallery': {
      const galleryData = block.data as { items?: Array<{ id: string; imageUrl: string; caption?: string }>; columns?: 2 | 3 | 4; showCaptions?: boolean; title?: string };
      if (!galleryData.items || galleryData.items.length === 0) {
        return (
          <div className="glass rounded-2xl p-6 mb-4 text-center">
            <p className="text-gray-600">画像が設定されていません</p>
          </div>
        );
      }

      const columns = galleryData.columns || 3;
      const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4'
      }[columns] || 'grid-cols-3';

      return (
        <div className="mb-4">
          {galleryData.title && (
            <h3 className="text-xl font-bold text-white mb-4 text-center">{galleryData.title}</h3>
          )}
          <div className={`grid ${gridCols} gap-2`}>
            {galleryData.items.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                <img
                  src={item.imageUrl}
                  alt={item.caption || ''}
                  className="w-full h-full object-cover"
                />
                {galleryData.showCaptions && item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2 text-center">
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};

const ProfileEditor: React.FC<ProfileEditorProps> = ({
  user,
  isAdmin,
  initialData,
  setPage,
  onBack,
  setShowAuth,
}) => {
  // 初期ブロック（ヘッダー、テキスト、リンク集）
  const initialBlocks: Block[] = [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: '',
        name: 'あなたの名前',
        title: 'あなたの肩書き',
        category: 'business',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '自己紹介',
        text: 'ここに自己紹介を入力してください。あなたの経歴、専門分野、提供できる価値などを書きましょう。',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: 'ホームページ', url: '', style: '' },
          { label: 'お問い合わせ', url: '', style: 'green' },
        ],
      },
    },
  ];

  const [profile, setProfile] = useState<Partial<Profile>>({
    nickname: '',
    content: initialBlocks,
    settings: {
      theme: {
        gradient: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        animated: true,
      },
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(initialBlocks[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTheme, setAiTheme] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [customSlug, setCustomSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  
  // セクションの開閉状態 - 初期では template と blocks を開く
  const [openSections, setOpenSections] = useState({
    template: true,
    theme: false,
    blocks: true,
    advanced: false
  });

  const resetPreview = () => setPreviewKey(k => k + 1);

  useEffect(() => {
    if (initialData) {
      setProfile(initialData);
      setSavedSlug(initialData.slug);
      setCustomSlug(initialData.nickname || '');
      // 編集時はtemplateを閉じてblocksを開く
      setOpenSections({
        template: false,
        theme: true,
        blocks: true,
        advanced: false
      });
    }
  }, [initialData]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // カスタムスラッグのバリデーション
  const validateCustomSlug = (slug: string): boolean => {
    if (!slug) return true; // 空は許可（自動生成される）
    const regex = /^[a-z0-9-]{3,20}$/;
    if (!regex.test(slug)) {
      setSlugError('英小文字、数字、ハイフンのみ（3〜20文字）');
      return false;
    }
    setSlugError('');
    return true;
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = profileTemplates.find(t => t.id === templateId);
    if (template) {
      // 既存のブロックがある場合は確認メッセージ
      if (profile.content && profile.content.length > 0) {
        const confirmed = confirm(`「${template.name}」テンプレートを適用しますか？\n現在の内容は上書きされます。`);
        if (!confirmed) return;
      }
      
      setProfile(prev => ({
        ...prev,
        content: template.blocks.map(block => ({
          ...block,
          id: generateBlockId(),
        })) as Block[],
        settings: {
          ...prev.settings,
          theme: template.theme,
        },
      }));
      setOpenSections({ template: false, theme: true, blocks: true, advanced: false });
      resetPreview();
      
      // 成功メッセージ表示
      alert(`✨「${template.name}」テンプレートを適用しました！`);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    // カスタムスラッグのバリデーション
    if (customSlug && !validateCustomSlug(customSlug)) {
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nickname: customSlug || null,
        content: profile.content,
        settings: profile.settings,
        user_id: initialData?.id ? undefined : user.id,
        slug: savedSlug || generateSlug(),
      };

      let result;
      if (initialData?.id) {
        result = await supabase
          ?.from('profiles')
          .update(payload)
          .eq('id', initialData.id)
          .select()
          .single();
      } else {
        result = await supabase
          ?.from('profiles')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();
      }

      if (result?.error) throw result.error;

      if (result?.data) {
        setSavedSlug(result.data.slug);
        if (!initialData) {
          setShowSuccessModal(true);
        } else {
          alert('保存しました！');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('保存中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  const addBlock = (type: string) => {
    const newBlock = createDefaultBlock(type);
    setProfile(prev => {
      const content = prev.content || [];
      // headerブロックのインデックスを検索
      const headerIndex = content.findIndex(b => b.type === 'header');
      
      let newContent;
      if (headerIndex === -1) {
        // headerブロックが存在しない場合は最後に追加
        newContent = [...content, newBlock];
      } else if (headerIndex === content.length - 1) {
        // headerブロックが最後の要素の場合のみ、headerブロックの直後に挿入
        newContent = [
          ...content.slice(0, headerIndex + 1),
          newBlock,
          ...content.slice(headerIndex + 1)
        ];
      } else {
        // それ以外は最後に追加
        newContent = [...content, newBlock];
      }
      
      return {
        ...prev,
        content: newContent,
      };
    });
    setExpandedBlock(newBlock.id);
    setShowBlockSelector(false);
    resetPreview();
  };

  const removeBlock = (id: string) => {
    if (!confirm('このブロックを削除しますか？')) return;
    setProfile(prev => ({
      ...prev,
      content: prev.content?.filter(b => b.id !== id),
    }));
    resetPreview();
  };

  const updateBlock = (id: string, data: Record<string, unknown>) => {
    setProfile(prev => ({
      ...prev,
      content: prev.content?.map(b =>
        b.id === id ? { ...b, data: { ...b.data, ...data } } as typeof b : b
      ),
    }));
    resetPreview();
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setProfile(prev => {
      const content = [...(prev.content || [])];
      const index = content.findIndex(b => b.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= content.length) return prev;
      const [movedBlock] = content.splice(index, 1);
      content.splice(newIndex, 0, movedBlock);
      return { ...prev, content };
    });
    resetPreview();
  };

  const createDefaultBlock = (type: string): Block => {
    const id = generateBlockId();
    switch (type) {
      case 'header':
        return { id, type: 'header', data: { avatar: '', name: '', title: '', category: 'other' } };
      case 'text_card':
        return { id, type: 'text_card', data: { title: '', text: '', align: 'center' as const } };
      case 'image':
        return { id, type: 'image', data: { url: '', caption: '' } };
      case 'links':
        return { id, type: 'links', data: { links: [{ label: '', url: '', style: '' }] } };
      case 'youtube':
        return { id, type: 'youtube', data: { url: '' } };
      case 'kindle':
        return { id, type: 'kindle', data: { asin: '', imageUrl: '', title: '', description: '' } };
      case 'line_card':
        return { id, type: 'line_card', data: { title: '', description: '', url: '', buttonText: 'LINE登録' } };
      case 'faq':
        return { id, type: 'faq', data: { items: [{ id: generateBlockId(), question: '', answer: '' }] } };
      case 'pricing':
        return { id, type: 'pricing', data: { plans: [{ id: generateBlockId(), title: '', price: '', features: [], isRecommended: false }] } };
      case 'testimonial':
        return { id, type: 'testimonial', data: { items: [{ id: generateBlockId(), name: '', role: '', comment: '', imageUrl: '' }] } };
      case 'lead_form':
        return { id, type: 'lead_form', data: { title: '無料相談はこちら', buttonText: '送信する' } };
      case 'google_map':
        return { id, type: 'google_map', data: { embedUrl: '', address: '', title: '所在地', height: '300px' } };
      case 'quiz':
        return { id, type: 'quiz', data: { quizId: '', quizSlug: '', title: '' } };
      case 'countdown':
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 7); // デフォルトで7日後
        return { id, type: 'countdown', data: { title: '限定オファー', targetDate: targetDate.toISOString(), expiredText: '期限切れ', backgroundColor: '#f59e0b' } };
      case 'gallery':
        return { id, type: 'gallery', data: { title: '', items: [], columns: 3, showCaptions: true } };
      default:
        return { id, type: 'text_card', data: { title: '', text: '', align: 'center' as const } };
    }
  };

  // AI生成
  const handleAiGenerate = async () => {
    if (!aiTheme) return alert('どんなプロフィールを作りたいかテーマを入力してください');
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: aiTheme })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'API request failed');
      }
      
      const { data } = await res.json();
      
      if (data.blocks) {
        setProfile(prev => ({
          ...prev,
          content: data.blocks.map((block: Block) => ({
            ...block,
            id: generateBlockId(),
          })),
          settings: {
            ...prev.settings,
            theme: data.theme || prev.settings?.theme,
          },
        }));
        setOpenSections({ template: false, theme: true, blocks: true, advanced: false });
        resetPreview();
        alert('AI生成が完了しました！');
      }
    } catch(e: unknown) { 
      alert('AI生成エラー: ' + (e instanceof Error ? e.message : '不明なエラー')); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  // 画像アップロード
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) return alert("データベースに接続されていません");

    // ファイルサイズチェック（2MB以下）
    if (file.size > MAX_IMAGE_SIZE) {
      alert(`画像サイズが大きすぎます。\n\n最大: 2MB\n選択したファイル: ${(file.size / 1024 / 1024).toFixed(2)}MB\n\n画像を圧縮するか、小さいサイズの画像を選択してください。`);
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
      alert('アップロードエラー: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setIsUploading(false);
    }
  };

  // 背景画像アップロード
  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) return alert("データベースに接続されていません");

    // ファイルサイズチェック
    if (file.size > MAX_IMAGE_SIZE) {
      alert(`画像サイズが大きすぎます。\n\n最大: 2MB\n選択したファイル: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user?.id || 'anonymous'}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
      
      setProfile(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          theme: {
            ...prev.settings?.theme,
            backgroundImage: data.publicUrl,
            gradient: undefined, // 背景画像使用時はグラデーション無効
          },
        },
      }));
      resetPreview();
    } catch (error: unknown) {
      alert('アップロードエラー: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setIsUploading(false);
    }
  };

  // ランダム画像設定
  const handleRandomImage = (blockId: string, field: string, category: string = 'general') => {
    const randomUrl = getRandomImageUrl(category);
    
    // testimonialの場合は特別処理（field形式: testimonial-0, testimonial-1...）
    if (field.startsWith('testimonial-')) {
      const index = parseInt(field.split('-')[1]);
      const block = profile.content?.find(b => b.id === blockId);
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

  // プレビュー用のプロフィールデータを生成
  const previewProfile: Profile = {
    id: 'preview',
    slug: 'preview',
    nickname: profile.nickname || '',
    content: profile.content || [],
    settings: profile.settings,
  };

  // ブロックエディタのレンダリング
  const renderBlockEditor = (block: Block) => {
    switch (block.type) {
      case 'header':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">プロフィール画像</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={block.data.avatar}
                  onChange={(e) => updateBlock(block.id, { avatar: e.target.value })}
                  placeholder="画像URL"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400"
                />
                <label className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'avatar')} disabled={isUploading} />
                </label>
                <button
                  onClick={() => handleRandomImage(block.id, 'avatar', 'portrait')}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm"
                >
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.avatar && (
                <img src={block.data.avatar} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />
              )}
            </div>
            <Input label="名前" val={block.data.name} onChange={(v) => updateBlock(block.id, { name: v })} ph="山田 太郎" />
            <Input label="肩書き・キャッチコピー" val={block.data.title} onChange={(v) => updateBlock(block.id, { title: v })} ph="Webデザイナー / クリエイター" />
          </div>
        );

      case 'text_card':
        return (
          <div className="space-y-4">
            <Input label="タイトル（任意）" val={block.data.title} onChange={(v) => updateBlock(block.id, { title: v })} ph="自己紹介" />
            <Textarea label="テキスト" val={block.data.text} onChange={(v) => updateBlock(block.id, { text: v })} rows={4} />
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">配置</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateBlock(block.id, { align: 'center' })}
                  className={`px-4 py-2 rounded-lg font-medium ${block.data.align === 'center' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  中央
                </button>
                <button
                  onClick={() => updateBlock(block.id, { align: 'left' })}
                  className={`px-4 py-2 rounded-lg font-medium ${block.data.align === 'left' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  左寄せ
                </button>
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">画像</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={block.data.url}
                  onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                  placeholder="画像URL"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400"
                />
                <label className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 cursor-pointer flex items-center gap-1 text-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  <span className="hidden sm:inline">UP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'url')} disabled={isUploading} />
                </label>
                <button
                  onClick={() => handleRandomImage(block.id, 'url', 'general')}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm"
                >
                  <Shuffle size={14} />
                  <span className="hidden sm:inline">自動</span>
                </button>
              </div>
              {block.data.url && (
                <img src={block.data.url} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2" />
              )}
            </div>
            <Input label="キャプション（任意）" val={block.data.caption || ''} onChange={(v) => updateBlock(block.id, { caption: v })} ph="写真の説明" />
          </div>
        );

      case 'youtube':
        return (
          <Input label="YouTube URL" val={block.data.url} onChange={(v) => updateBlock(block.id, { url: v })} ph="https://www.youtube.com/watch?v=..." />
        );

      case 'links':
        return (
          <div className="space-y-4">
            {block.data.links.map((link: { label: string; url: string; style?: string }, i: number) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg relative">
                <button
                  onClick={() => {
                    const newLinks = block.data.links.filter((_: unknown, idx: number) => idx !== i);
                    updateBlock(block.id, { links: newLinks });
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <Input label="ラベル" val={link.label} onChange={(v) => {
                  const newLinks = [...block.data.links];
                  newLinks[i].label = v;
                  updateBlock(block.id, { links: newLinks });
                }} ph="Instagram" />
                <Input label="URL" val={link.url} onChange={(v) => {
                  const newLinks = [...block.data.links];
                  newLinks[i].url = v;
                  updateBlock(block.id, { links: newLinks });
                }} ph="https://instagram.com/..." />
                
                {/* スタイル選択 */}
                <div className="mt-3">
                  <label className="text-xs font-bold text-gray-600 block mb-2">ボタンスタイル</label>
                  <div className="flex flex-wrap gap-2">
                    {linkStyleOptions.map((option) => {
                      const isSelected = (link.style || '') === option.value;
                      const stylePreview: Record<string, string> = {
                        '': 'bg-white border-gray-200',
                        'orange': 'bg-orange-500 text-white',
                        'blue': 'bg-blue-500 text-white',
                        'green': 'bg-green-500 text-white',
                        'purple': 'bg-purple-500 text-white',
                        'line': 'bg-[#06C755] text-white',
                      };
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            const newLinks = [...block.data.links];
                            newLinks[i].style = option.value;
                            updateBlock(block.id, { links: newLinks });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${stylePreview[option.value]} ${isSelected ? 'ring-2 ring-emerald-400 border-emerald-500' : 'border-transparent'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newLinks = [...block.data.links, { label: '', url: '', style: '' }];
                updateBlock(block.id, { links: newLinks });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 font-medium"
            >
              + リンクを追加
            </button>
          </div>
        );

      case 'kindle':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-2">書籍画像</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={block.data.imageUrl}
                  onChange={(e) => updateBlock(block.id, { imageUrl: e.target.value })}
                  placeholder="画像URL"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400"
                />
                <label className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 cursor-pointer flex items-center gap-1 text-sm">
                  <UploadCloud size={14} />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, block.id, 'imageUrl')} />
                </label>
                <button
                  onClick={() => handleRandomImage(block.id, 'imageUrl', 'book')}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-1 text-sm"
                >
                  <Shuffle size={14} />
                </button>
              </div>
            </div>
            <Input label="書籍タイトル" val={block.data.title} onChange={(v) => updateBlock(block.id, { title: v })} ph="書籍タイトル" />
            <Textarea label="説明" val={block.data.description} onChange={(v) => updateBlock(block.id, { description: v })} />
            <Input label="ASIN（Amazon商品コード）" val={block.data.asin} onChange={(v) => updateBlock(block.id, { asin: v })} ph="B08XXXXXXX" />
          </div>
        );

      case 'line_card':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title} onChange={(v) => updateBlock(block.id, { title: v })} ph="公式LINE登録で特典GET!" />
            <Textarea label="説明" val={block.data.description} onChange={(v) => updateBlock(block.id, { description: v })} />
            <Input label="LINE URL" val={block.data.url} onChange={(v) => updateBlock(block.id, { url: v })} ph="https://lin.ee/..." />
            <Input label="ボタンテキスト" val={block.data.buttonText} onChange={(v) => updateBlock(block.id, { buttonText: v })} ph="LINEで登録する" />
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            {block.data.items.map((item: { id: string; question: string; answer: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button
                  onClick={() => {
                    if (block.data.items.length <= 1) return alert('最低1つのFAQが必要です');
                    const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id);
                    updateBlock(block.id, { items: newItems });
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="font-bold text-emerald-600 mb-2 text-sm">Q{i + 1}</div>
                <Input label="質問" val={item.question} onChange={(v) => {
                  const newItems = [...block.data.items];
                  newItems[i].question = v;
                  updateBlock(block.id, { items: newItems });
                }} ph="よくある質問" />
                <Textarea label="回答" val={item.answer} onChange={(v) => {
                  const newItems = [...block.data.items];
                  newItems[i].answer = v;
                  updateBlock(block.id, { items: newItems });
                }} />
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...block.data.items, { id: generateBlockId(), question: '', answer: '' }];
                updateBlock(block.id, { items: newItems });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 font-medium"
            >
              + FAQを追加
            </button>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-4">
            {block.data.plans.map((plan: { id: string; title: string; price: string; features: string[]; isRecommended: boolean }, i: number) => (
              <div key={plan.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button
                  onClick={() => {
                    if (block.data.plans.length <= 1) return alert('最低1つのプランが必要です');
                    const newPlans = block.data.plans.filter((p: { id: string }) => p.id !== plan.id);
                    updateBlock(block.id, { plans: newPlans });
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-emerald-600">プラン {i + 1}</span>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={plan.isRecommended}
                      onChange={(e) => {
                        const newPlans = [...block.data.plans];
                        newPlans[i].isRecommended = e.target.checked;
                        updateBlock(block.id, { plans: newPlans });
                      }}
                    />
                    おすすめ
                  </label>
                </div>
                <Input label="プラン名" val={plan.title} onChange={(v) => {
                  const newPlans = [...block.data.plans];
                  newPlans[i].title = v;
                  updateBlock(block.id, { plans: newPlans });
                }} ph="ベーシック" />
                <Input label="価格" val={plan.price} onChange={(v) => {
                  const newPlans = [...block.data.plans];
                  newPlans[i].price = v;
                  updateBlock(block.id, { plans: newPlans });
                }} ph="¥5,000/月" />
                <Textarea label="特徴（1行に1つ）" val={plan.features.join('\n')} onChange={(v) => {
                  const newPlans = [...block.data.plans];
                  newPlans[i].features = v.split('\n').filter(f => f.trim());
                  updateBlock(block.id, { plans: newPlans });
                }} />
              </div>
            ))}
            <button
              onClick={() => {
                const newPlans = [...block.data.plans, { id: generateBlockId(), title: '', price: '', features: [], isRecommended: false }];
                updateBlock(block.id, { plans: newPlans });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 font-medium"
            >
              + プランを追加
            </button>
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            {block.data.items.map((item: { id: string; name: string; role: string; comment: string; imageUrl?: string }, i: number) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                <button
                  onClick={() => {
                    if (block.data.items.length <= 1) return alert('最低1つのお客様の声が必要です');
                    const newItems = block.data.items.filter((it: { id: string }) => it.id !== item.id);
                    updateBlock(block.id, { items: newItems });
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="font-bold text-emerald-600 mb-2 text-sm">お客様 {i + 1}</div>
                
                {/* 画像プレビュー */}
                {item.imageUrl && (
                  <div className="mb-3 flex justify-center">
                    <img src={item.imageUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                  </div>
                )}
                
                {/* プリセット画像選択 */}
                <div className="mb-3">
                  <label className="text-xs font-bold text-gray-600 block mb-2">プロフィール画像</label>
                  <div className="flex gap-2 flex-wrap items-center mb-2">
                    {testimonialPresetImages.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          const newItems = [...block.data.items];
                          newItems[i].imageUrl = preset.url;
                          updateBlock(block.id, { items: newItems });
                        }}
                        className={`p-0.5 rounded-full border-2 transition-all ${item.imageUrl === preset.url ? 'border-emerald-500' : 'border-gray-200 hover:border-emerald-300'}`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-full object-cover" />
                      </button>
                    ))}
                    <button
                      onClick={() => handleRandomImage(block.id, `testimonial-${i}`, 'portrait')}
                      className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-emerald-400 transition-colors"
                      title="ランダム"
                    >
                      <Shuffle size={14} className="text-gray-400" />
                    </button>
                  </div>
                  {/* アップロードボタン */}
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg cursor-pointer transition-colors">
                    <UploadCloud size={14} />
                    <span>アップロード</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > MAX_IMAGE_SIZE) {
                          alert(`画像サイズが大きすぎます。最大2MBまで対応しています。`);
                          return;
                        }
                        // ファイルをアップロード
                        const uploadTestimonialImage = async () => {
                          if (!supabase) return;
                          setIsUploading(true);
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `testimonial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                            const filePath = `${user?.id || 'anonymous'}/${fileName}`;
                            const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
                            if (uploadError) throw uploadError;
                            const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
                            const newItems = [...block.data.items];
                            newItems[i].imageUrl = data.publicUrl;
                            updateBlock(block.id, { items: newItems });
                          } catch (err) {
                            alert('アップロードに失敗しました');
                          } finally {
                            setIsUploading(false);
                          }
                        };
                        uploadTestimonialImage();
                      }}
                    />
                  </label>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={item.imageUrl || ''}
                    onChange={(e) => {
                      const newItems = [...block.data.items];
                      newItems[i].imageUrl = e.target.value;
                      updateBlock(block.id, { items: newItems });
                    }}
                    placeholder="または画像URLを入力"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm"
                  />
                </div>
                <Input label="お名前" val={item.name} onChange={(v) => {
                  const newItems = [...block.data.items];
                  newItems[i].name = v;
                  updateBlock(block.id, { items: newItems });
                }} ph="田中 花子" />
                <Input label="肩書き" val={item.role} onChange={(v) => {
                  const newItems = [...block.data.items];
                  newItems[i].role = v;
                  updateBlock(block.id, { items: newItems });
                }} ph="30代・会社員" />
                <Textarea label="コメント" val={item.comment} onChange={(v) => {
                  const newItems = [...block.data.items];
                  newItems[i].comment = v;
                  updateBlock(block.id, { items: newItems });
                }} />
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...block.data.items, { id: generateBlockId(), name: '', role: '', comment: '', imageUrl: '' }];
                updateBlock(block.id, { items: newItems });
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 font-medium"
            >
              + お客様の声を追加
            </button>
          </div>
        );

      case 'lead_form':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title} onChange={(v) => updateBlock(block.id, { title: v })} ph="無料相談はこちら" />
            <Input label="ボタンテキスト" val={block.data.buttonText} onChange={(v) => updateBlock(block.id, { buttonText: v })} ph="送信する" />
          </div>
        );

      case 'google_map':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="所在地" />
            <Input label="住所" val={block.data.address || ''} onChange={(v) => updateBlock(block.id, { address: v })} ph="東京都渋谷区..." />
            <Textarea label="埋め込みURL" val={block.data.embedUrl} onChange={(v) => updateBlock(block.id, { embedUrl: v })} />
            <p className="text-xs text-gray-500">Googleマップ→共有→地図を埋め込む→HTMLをコピーして、src=&quot;...&quot;の部分を貼り付けてください</p>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <Input label="タイトル（オプション）" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="診断クイズ" />
            <Input label="クイズID" val={block.data.quizId || ''} onChange={(v) => updateBlock(block.id, { quizId: v, quizSlug: '' })} ph="1" />
            <p className="text-xs text-gray-500">または</p>
            <Input label="クイズSlug" val={block.data.quizSlug || ''} onChange={(v) => updateBlock(block.id, { quizSlug: v, quizId: '' })} ph="my-quiz" />
            <p className="text-xs text-gray-500">クイズIDまたはSlugのどちらかを入力してください</p>
          </div>
        );

      case 'countdown':
        return (
          <div className="space-y-4">
            <Input label="タイトル" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="限定オファー" />
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">期限日時</label>
              <input
                type="datetime-local"
                value={block.data.targetDate ? new Date(block.data.targetDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).toISOString() : '';
                  updateBlock(block.id, { targetDate: date });
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 text-sm"
              />
            </div>
            <Input label="期限切れ時のテキスト" val={block.data.expiredText || ''} onChange={(v) => updateBlock(block.id, { expiredText: v })} ph="期限切れ" />
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">背景色</label>
              <input
                type="color"
                value={block.data.backgroundColor || '#f59e0b'}
                onChange={(e) => updateBlock(block.id, { backgroundColor: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-200"
              />
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-4">
            <Input label="タイトル（オプション）" val={block.data.title || ''} onChange={(v) => updateBlock(block.id, { title: v })} ph="ギャラリー" />
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">列数</label>
              <select
                value={block.data.columns || 3}
                onChange={(e) => updateBlock(block.id, { columns: Number(e.target.value) as 2 | 3 | 4 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 text-sm"
              >
                <option value={2}>2列</option>
                <option value={3}>3列</option>
                <option value={4}>4列</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={block.data.showCaptions || false}
                onChange={(e) => updateBlock(block.id, { showCaptions: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-xs text-gray-600">キャプションを表示</label>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-600 block">画像一覧</label>
              {block.data.items.map((item, i) => (
                <div key={item.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex gap-3 mb-2">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200" />
                    )}
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-600 block mb-1">画像URL</label>
                      <input
                        type="text"
                        value={item.imageUrl || ''}
                        onChange={(e) => {
                          const newItems = [...block.data.items];
                          newItems[i].imageUrl = e.target.value;
                          updateBlock(block.id, { items: newItems });
                        }}
                        placeholder="画像URLを入力"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-gray-900 placeholder-gray-400 text-xs mb-2"
                      />
                      <label className="text-xs font-bold text-gray-600 block mb-1">キャプション（オプション）</label>
                      <input
                        type="text"
                        value={item.caption || ''}
                        onChange={(e) => {
                          const newItems = [...block.data.items];
                          newItems[i].caption = e.target.value;
                          updateBlock(block.id, { items: newItems });
                        }}
                        placeholder="キャプションを入力"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-gray-900 placeholder-gray-400 text-xs"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newItems = block.data.items.filter((_, idx) => idx !== i);
                        updateBlock(block.id, { items: newItems });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <label className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded cursor-pointer transition-colors">
                    <UploadCloud size={12} />
                    <span>アップロード</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > MAX_IMAGE_SIZE) {
                          alert(`画像サイズが大きすぎます。最大2MBまで対応しています。`);
                          return;
                        }
                        const uploadGalleryImage = async () => {
                          if (!supabase) return;
                          setIsUploading(true);
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                            const filePath = `${user?.id || 'anonymous'}/${fileName}`;
                            const { error: uploadError } = await supabase.storage.from('profile-uploads').upload(filePath, file);
                            if (uploadError) throw uploadError;
                            const { data } = supabase.storage.from('profile-uploads').getPublicUrl(filePath);
                            const newItems = [...block.data.items];
                            newItems[i].imageUrl = data.publicUrl;
                            updateBlock(block.id, { items: newItems });
                          } catch (err) {
                            alert('アップロードに失敗しました');
                          } finally {
                            setIsUploading(false);
                          }
                        };
                        uploadGalleryImage();
                      }}
                    />
                  </label>
                </div>
              ))}
              <button
                onClick={() => {
                  const newItems = [...block.data.items, { id: generateBlockId(), imageUrl: '', caption: '' }];
                  updateBlock(block.id, { items: newItems });
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 font-medium text-sm"
              >
                + 画像を追加
              </button>
            </div>
          </div>
        );

      default:
        return <p className="text-gray-500 text-sm">このブロックタイプの編集はまだサポートされていません</p>;
    }
  };

  // エディター本体のレンダリング
  const renderEditor = () => (
    <div className="space-y-4">
      {/* テンプレート・AI生成セクション */}
      <Section
        title="テンプレート・AI生成"
        icon={Sparkles}
        isOpen={openSections.template}
        onToggle={() => toggleSection('template')}
      >
        {/* テンプレート選択 */}
        <div className="mb-6">
          <label className="text-sm font-bold text-gray-700 block mb-3">テンプレートから選択</label>
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
            {profileTemplates.slice(0, 8).map(template => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:border-emerald-500 transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ background: template.theme.gradient }}
                />
                <div className="flex flex-col items-start flex-1 min-w-0 text-left">
                  <span className="text-sm font-medium text-gray-900 truncate w-full text-left">{template.name}</span>
                  <span className="text-xs text-emerald-600 font-semibold">{template.blocks.length}ブロック</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI生成 */}
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <label className="text-sm font-bold text-emerald-700 block mb-2 flex items-center gap-2">
            <Wand2 size={16} /> AIで自動生成
          </label>
          <textarea 
            className="w-full border-2 border-emerald-200 p-3 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white text-gray-900 placeholder-gray-400" 
            rows={2} 
            placeholder="例: フリーランスのWebデザイナー、美容サロンオーナー..." 
            value={aiTheme} 
            onChange={e => setAiTheme(e.target.value)} 
          />
          <button 
            onClick={handleAiGenerate} 
            disabled={isGenerating || !aiTheme} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? <><Loader2 className="animate-spin" size={18} /> 生成中...</> : <><Sparkles size={18} /> AIで自動生成する</>}
          </button>
        </div>
      </Section>

      {/* テーマ設定 */}
      <Section
        title="テーマ設定"
        icon={Palette}
        isOpen={openSections.theme}
        onToggle={() => toggleSection('theme')}
      >
        <div className="space-y-6">
          {/* グラデーション選択 */}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-3">背景グラデーション</label>
            
            {/* アニメ付きグラデーション */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                <span>✨</span> アニメーション付き（動くグラデーション）
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {gradientPresets.filter(p => p.animated).map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setProfile(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          theme: { 
                            gradient: preset.value, 
                            animated: preset.animated,
                            backgroundImage: undefined, // グラデーション選択時は背景画像をクリア
                          },
                        },
                      }));
                      resetPreview();
                    }}
                    className={`p-1 rounded-lg border-2 transition-all ${
                      profile.settings?.theme?.gradient === preset.value 
                        ? 'border-emerald-500 ring-2 ring-emerald-200' 
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div 
                      className="w-full h-12 rounded animate-gradient-xy"
                      style={{ background: preset.value, backgroundSize: '400% 400%' }}
                    />
                    <span className="text-xs text-gray-600 block mt-1 text-center">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* アニメなしグラデーション */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">
                静的グラデーション（カラフルな背景）
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {gradientPresets.filter(p => !p.animated).map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setProfile(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          theme: { 
                            gradient: preset.value, 
                            animated: preset.animated,
                            backgroundImage: undefined, // グラデーション選択時は背景画像をクリア
                          },
                        },
                      }));
                      resetPreview();
                    }}
                    className={`p-1 rounded-lg border-2 transition-all ${
                      profile.settings?.theme?.gradient === preset.value 
                        ? 'border-emerald-500 ring-2 ring-emerald-200' 
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div 
                      className="w-full h-12 rounded"
                      style={{ background: preset.value }}
                    />
                    <span className="text-xs text-gray-600 block mt-1 text-center">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 背景画像アップロード */}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-3">背景画像</label>
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg cursor-pointer transition-colors">
                <UploadCloud size={18} />
                <span>アップロード</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleBackgroundImageUpload}
                />
              </label>
              <button
                onClick={() => {
                  const randomUrl = getRandomImageUrl('general');
                  setProfile(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      theme: {
                        ...prev.settings?.theme,
                        backgroundImage: randomUrl,
                        gradient: undefined,
                      },
                    },
                  }));
                  resetPreview();
                }}
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-3 rounded-lg transition-colors"
              >
                <Shuffle size={18} />
                <span>自動</span>
              </button>
              {profile.settings?.theme?.backgroundImage && (
                <button
                  onClick={() => {
                    setProfile(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        theme: {
                          ...prev.settings?.theme,
                          backgroundImage: undefined,
                        },
                      },
                    }));
                    resetPreview();
                  }}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  削除
                </button>
              )}
            </div>
            {profile.settings?.theme?.backgroundImage && (
              <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                <img 
                  src={profile.settings.theme.backgroundImage} 
                  alt="背景プレビュー" 
                  className="w-full h-20 object-cover rounded"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">最大2MB。背景画像を設定するとグラデーションは無効になります。</p>
          </div>
        </div>
      </Section>

      {/* ブロック編集セクション */}
      <Section
        title="ブロック"
        icon={Layout}
        isOpen={openSections.blocks}
        onToggle={() => toggleSection('blocks')}
        badge={`${profile.content?.length || 0}個`}
      >
        {/* ブロック一覧 */}
        <div className="space-y-3 min-h-[100px]">
          {(!profile.content || profile.content.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <Layout size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">ブロックがありません</p>
              <p className="text-xs mt-1">下のボタンからブロックを追加してください</p>
            </div>
          )}
          {profile.content?.map((block, index) => {
            const blockType = blockTypes.find(bt => bt.type === block.type);
            const Icon = blockType?.icon || Type;

            return (
              <div key={block.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical size={18} className="text-gray-400" />
                    <Icon size={18} className="text-emerald-600" />
                    <span className="font-medium text-gray-700">
                      {blockType?.label || block.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveBlock(block.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => moveBlock(block.id, 'down')}
                      disabled={index === (profile.content?.length || 0) - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      onClick={() => removeBlock(block.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                      className="p-1 text-gray-400"
                    >
                      {expandedBlock === block.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {expandedBlock === block.id && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    {renderBlockEditor(block)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ブロック追加 */}
        <div className="relative mt-4">
          <button
            onClick={() => setShowBlockSelector(!showBlockSelector)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={20} />
            ブロックを追加
          </button>

          {showBlockSelector && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {blockTypes.map(bt => (
                  <button
                    key={bt.type}
                    onClick={() => addBlock(bt.type)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-emerald-200"
                  >
                    <bt.icon size={24} className="text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">{bt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* 高度な設定 */}
      <Section
        title="高度な設定"
        icon={Settings}
        isOpen={openSections.advanced}
        onToggle={() => toggleSection('advanced')}
      >
        <div className="space-y-4">
          {/* ポータル掲載 */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-1">
                  <Star size={18} className="text-emerald-600"/> ポータルに掲載する
                </h4>
                <p className="text-xs text-emerald-700">
                  ポータルに掲載することで、サービスの紹介およびSEO対策、AI対策として効果的となります。より多くの方にあなたのプロフィールを見てもらえます。
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={profile.settings?.showInPortal === undefined ? true : profile.settings?.showInPortal} 
                  onChange={e => setProfile(prev => ({
                    ...prev,
                    settings: { ...prev.settings, showInPortal: e.target.checked }
                  }))} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* カスタムURL（ニックネーム） */}
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">
              カスタムURL（任意）
            </label>
            <input 
              className={`w-full border p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-white placeholder-gray-400 transition-shadow ${slugError ? 'border-red-400' : 'border-gray-300'} ${initialData?.nickname ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={customSlug} 
              onChange={e => {
                setCustomSlug(e.target.value);
                validateCustomSlug(e.target.value);
              }} 
              placeholder="abc123, my-profile"
              disabled={!!initialData?.nickname}
            />
            {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
            <p className="text-xs text-gray-500 mt-1">
              例: abc123, my-profile<br/>
              ※英小文字、数字、ハイフンのみ（3〜20文字）。一度設定すると変更できません。
            </p>
            {customSlug && !slugError && (
              <p className="text-xs text-emerald-600 mt-1">
                公開URL: {typeof window !== 'undefined' ? window.location.origin : ''}/profile/{customSlug}
              </p>
            )}
          </div>

          <hr className="border-gray-200" />

          <Input 
            label="Google Tag Manager ID" 
            val={profile.settings?.gtmId || ''} 
            onChange={(v) => setProfile(prev => ({
              ...prev,
              settings: { ...prev.settings, gtmId: v }
            }))} 
            ph="GTM-XXXXXXX" 
          />
          <Input 
            label="Facebook Pixel ID" 
            val={profile.settings?.fbPixelId || ''} 
            onChange={(v) => setProfile(prev => ({
              ...prev,
              settings: { ...prev.settings, fbPixelId: v }
            }))} 
            ph="1234567890" 
          />
          <Input 
            label="LINE Tag ID" 
            val={profile.settings?.lineTagId || ''} 
            onChange={(v) => setProfile(prev => ({
              ...prev,
              settings: { ...prev.settings, lineTagId: v }
            }))} 
            ph="xxxxx-xxxxx" 
          />
        </div>
      </Section>

      {/* 保存ボタン（下部） */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md text-lg"
        >
          {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} 
          {initialData?.id ? '更新して保存' : '保存して公開'}
        </button>
      </div>
    </div>
  );

  // プレビューのレンダリング
  const renderPreview = () => (
    <div key={previewKey} className="h-full overflow-auto rounded-b-xl">
      <ProfilePreview profile={previewProfile} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      {/* 成功モーダル */}
      {showSuccessModal && savedSlug && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-6 flex justify-between items-center z-10 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Trophy size={24} /> プロフィールを作成しました！
                </h3>
                <p className="text-sm text-emerald-100 mt-1">公開URLをコピーしてシェアできます</p>
              </div>
              <button onClick={() => setShowSuccessModal(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 公開URL */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-700 mb-2">公開URL</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${customSlug || savedSlug}`}
                    readOnly
                    className="flex-1 text-xs bg-white border border-emerald-300 p-2 rounded-lg text-gray-900 font-bold"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/profile/${customSlug || savedSlug}`);
                      alert('URLをコピーしました！');
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors whitespace-nowrap"
                  >
                    <Copy size={16} className="inline mr-1" /> コピー
                  </button>
                </div>
              </div>

              {/* アクセスボタン */}
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  window.open(`/profile/${customSlug || savedSlug}`, '_blank');
                }}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
              >
                <ExternalLink size={20} /> プロフィールにアクセス
              </button>

              {/* SNSでシェア */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">SNSでシェア</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}/profile/${customSlug || savedSlug}`;
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('プロフィールページを作りました！')}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 bg-[#1DA1F2] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    X (Twitter)
                  </button>
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}/profile/${customSlug || savedSlug}`;
                      window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 bg-[#06C755] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    LINE
                  </button>
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}/profile/${customSlug || savedSlug}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    Facebook
                  </button>
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}/profile/${customSlug || savedSlug}`;
                      if (navigator.share) {
                        navigator.share({ title: 'プロフィールLP', url });
                      } else {
                        navigator.clipboard.writeText(url);
                        alert('URLをコピーしました！');
                      }
                    }}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink size={18} /> その他
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">作成したプロフィールLPをSNSでシェアして、多くの人に見てもらいましょう！</p>
              </div>

              {/* QRコード表示ボタン */}
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/profile/${customSlug || savedSlug}`;
                    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`, '_blank');
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  QRコード表示
                </button>
              </div>

              {/* 開発支援エリア */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-orange-500 p-2 rounded-full">
                    <Star size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base text-gray-900 mb-1 flex items-center gap-2">
                      応援・開発支援でPro機能を開放
                      <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">オプション</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      50円〜100,000円で、以下の追加機能が使えるようになります
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <UploadCloud className="text-emerald-600" size={16} />
                      <span className="font-bold text-sm text-gray-900">HTMLダウンロード</span>
                    </div>
                    <p className="text-xs text-gray-600">自分のサーバーにアップロード可能</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <LinkIcon className="text-emerald-600" size={16} />
                      <span className="font-bold text-sm text-gray-900">埋め込みコード</span>
                    </div>
                    <p className="text-xs text-gray-600">WordPressなどに埋め込み可能</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="text-emerald-600" size={16} />
                      <span className="font-bold text-sm text-gray-900">優先サポート</span>
                    </div>
                    <p className="text-xs text-gray-600">機能改善の優先対応</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Plus className="text-emerald-600" size={16} />
                      <span className="font-bold text-sm text-gray-900">その他の機能</span>
                    </div>
                    <p className="text-xs text-gray-600">今後追加される機能も利用可能</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setShowSuccessModal(false);
                    if (user) {
                      setPage('dashboard');
                    } else {
                      setShowAuth(true);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-3 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Layout size={18} /> マイページで開発支援・機能開放する
                </button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  ※開発支援は任意です。無料でもLPの公開・シェアは可能です
                </p>
              </div>

              {/* 閉じるボタン */}
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー - 共通ヘッダー(64px)の下に配置 */}
      <div className="bg-white border-b px-4 md:px-6 py-4 flex items-center justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
            {initialData ? 'プロフィール編集' : '新規作成'}
          </h2>
        </div>
        <div className="flex gap-2">
          {savedSlug && (
            <>
              <button 
                onClick={() => setShowSuccessModal(true)}
                className="hidden sm:flex bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:from-emerald-700 hover:to-teal-700 whitespace-nowrap transition-all shadow-md text-sm sm:text-base"
              >
                <Trophy size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden md:inline">作成完了画面</span><span className="md:hidden">完了</span>
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/profile/${customSlug || savedSlug}`);
                  alert('公開URLをコピーしました！');
                }} 
                className="hidden sm:flex bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 text-sm sm:text-base"
              >
                <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden md:inline">公開URL</span><span className="md:hidden">URL</span>
              </button>
            </>
          )}
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-emerald-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-md transition-all whitespace-nowrap"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
            <span className="hidden sm:inline">保存</span>
          </button>
        </div>
      </div>

      {/* モバイル用タブバー - 共通ヘッダー(64px) + エディターヘッダー(57px) = 121pxの下に配置 */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[121px] z-40">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'edit' 
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Edit3 size={18} /> 編集
          </button>
          <button 
            onClick={() => { setActiveTab('preview'); resetPreview(); }}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'preview' 
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye size={18} /> プレビュー
          </button>
        </div>
      </div>

      {/* メインコンテンツ: 左（編集パネル） + 右（プレビュー） */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左側: 編集パネル */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-2xl mx-auto">
            {renderEditor()}
          </div>
        </div>

        {/* 右側: リアルタイムプレビュー */}
        {/* PC: position:fixedで右半分に固定（トップヘッダー64px + エディタヘッダー57px = 138px分下にオフセット） */}
        <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-121px)] flex flex-col bg-gray-800 border-l border-gray-700 ${activeTab === 'edit' ? 'hidden lg:flex' : ''}`}>
          {/* PC用ヘッダー */}
          <div className="hidden lg:flex bg-gray-900 px-4 py-3 items-center justify-between border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-gray-400 text-sm font-mono">プレビュー</span>
            </div>
            <button 
              onClick={resetPreview}
              className="text-gray-400 hover:text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={14} /> リセット
            </button>
          </div>
          {/* モバイル用ヘッダー */}
          <div className="lg:hidden bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
            <span className="text-white font-bold text-sm">プレビュー</span>
            <button 
              onClick={resetPreview}
              className="text-gray-400 hover:text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={14} /> リセット
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
              {renderPreview()}
            </div>
          </div>
        </div>
        {/* PC用：右側のfixed領域分のスペーサー（背景色を左側と揃える） */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>
    </div>
  );
};

export default ProfileEditor;
