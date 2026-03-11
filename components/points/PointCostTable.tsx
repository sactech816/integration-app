'use client';

import React, { useEffect, useState } from 'react';
import {
  Coins,
  Loader2,
  AlertCircle,
  FileText,
  Brain,
  PenTool,
  Megaphone,
  ShoppingCart,
  Sparkles,
  Layout,
  Globe,
  Lightbulb,
  ImageIcon,
  MessageSquare,
  CalendarCheck,
  Users,
  ClipboardList,
  Mail,
  GitBranch,
  ClipboardPen,
  Gamepad2,
  Cpu,
  Download,
} from 'lucide-react';

// ─── 型定義 ───

interface PointCostItem {
  serviceType: string;
  action: string;
  cost: number;
  description: string | null;
}

interface Category {
  label: string;
  icon: React.ReactNode;
  serviceTypes: string[];
}

// ─── マッピング定義 ───

const SERVICE_NAME_MAP: Record<string, string> = {
  profile: 'プロフィールLP',
  business: 'ビジネスLP',
  webinar: 'ウェビナーLP',
  onboarding: 'ガイドメーカー',
  quiz: '診断クイズ',
  entertainment_quiz: 'エンタメ診断',
  salesletter: 'セールスライター',
  thumbnail: 'サムネイル',
  'sns-post': 'SNS投稿',
  booking: '予約メニュー',
  attendance: '出欠管理',
  survey: 'アンケート',
  newsletter: 'メルマガ',
  funnel: 'ファネル',
  'order-form': '申し込みフォーム',
  gamification: 'ゲーミフィケーション',
  ai: 'AI生成',
  export: 'エクスポート',
};

const ACTION_NAME_MAP: Record<string, string> = {
  save: '保存',
  generate: '生成（1回）',
  html: 'HTMLダウンロード',
  embed: '埋め込みコード',
};

const SERVICE_ICON_MAP: Record<string, React.ReactNode> = {
  profile: <Layout size={18} />,
  business: <Globe size={18} />,
  webinar: <Megaphone size={18} />,
  onboarding: <Lightbulb size={18} />,
  quiz: <Brain size={18} />,
  entertainment_quiz: <Brain size={18} />,
  salesletter: <PenTool size={18} />,
  thumbnail: <ImageIcon size={18} />,
  'sns-post': <MessageSquare size={18} />,
  booking: <CalendarCheck size={18} />,
  attendance: <Users size={18} />,
  survey: <ClipboardList size={18} />,
  newsletter: <Mail size={18} />,
  funnel: <GitBranch size={18} />,
  'order-form': <ClipboardPen size={18} />,
  gamification: <Gamepad2 size={18} />,
  ai: <Cpu size={18} />,
  export: <Download size={18} />,
};

const CATEGORIES: Category[] = [
  {
    label: 'LP・ページ作成',
    icon: <FileText size={20} className="text-blue-600" />,
    serviceTypes: ['profile', 'business', 'webinar', 'onboarding'],
  },
  {
    label: '診断・クイズ',
    icon: <Brain size={20} className="text-purple-600" />,
    serviceTypes: ['quiz', 'entertainment_quiz'],
  },
  {
    label: 'ライティング・制作',
    icon: <PenTool size={20} className="text-emerald-600" />,
    serviceTypes: ['salesletter', 'thumbnail', 'sns-post'],
  },
  {
    label: '集客・イベント',
    icon: <Megaphone size={20} className="text-orange-600" />,
    serviceTypes: ['booking', 'attendance', 'survey', 'newsletter', 'funnel'],
  },
  {
    label: '収益化',
    icon: <ShoppingCart size={20} className="text-rose-600" />,
    serviceTypes: ['order-form', 'gamification'],
  },
  {
    label: 'AI・エクスポート',
    icon: <Sparkles size={20} className="text-indigo-600" />,
    serviceTypes: ['ai', 'export'],
  },
];

// ─── コンポーネント ───

export default function PointCostTable() {
  const [costs, setCosts] = useState<PointCostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCosts() {
      try {
        const res = await fetch('/api/points/costs');
        if (!res.ok) throw new Error('コスト情報の取得に失敗しました');
        const data = await res.json();
        setCosts(data.costs ?? []);
      } catch (err: any) {
        setError(err.message || 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }
    fetchCosts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600 font-medium">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-red-600">
        <AlertCircle size={20} className="mr-2" />
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  // コストをserviceType+actionでインデックス化
  const costMap = new Map<string, PointCostItem[]>();
  for (const item of costs) {
    const key = item.serviceType;
    if (!costMap.has(key)) costMap.set(key, []);
    costMap.get(key)!.push(item);
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2.5 rounded-xl">
          <Coins size={22} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">ポイント消費一覧</h2>
          <p className="text-sm text-gray-600">各ツール・アクションに必要なポイント数</p>
        </div>
      </div>

      {/* カテゴリごとのカード */}
      {CATEGORIES.map((category) => {
        // このカテゴリに属するコストアイテムを収集
        const categoryItems: { serviceType: string; items: PointCostItem[] }[] = [];
        for (const st of category.serviceTypes) {
          const items = costMap.get(st);
          if (items && items.length > 0) {
            categoryItems.push({ serviceType: st, items });
          }
        }

        if (categoryItems.length === 0) return null;

        return (
          <div
            key={category.label}
            className="bg-white border border-gray-300 shadow-md rounded-2xl overflow-hidden"
          >
            {/* カテゴリヘッダー */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              {category.icon}
              <h3 className="font-bold text-gray-900">{category.label}</h3>
            </div>

            {/* アイテム一覧 */}
            <div className="divide-y divide-gray-100">
              {categoryItems.map(({ serviceType, items }) =>
                items.map((item, idx) => (
                  <div
                    key={`${serviceType}-${item.action}-${idx}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-all duration-200 ease-in-out"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-gray-500 shrink-0">
                        {SERVICE_ICON_MAP[serviceType] ?? <FileText size={18} />}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">
                          {SERVICE_NAME_MAP[serviceType] ?? serviceType}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ACTION_NAME_MAP[item.action] ?? item.action}
                          {item.description && (
                            <span className="ml-1.5 text-gray-400">— {item.description}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* コスト表示 */}
                    {item.cost === 0 ? (
                      <span className="shrink-0 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold">
                        無料
                      </span>
                    ) : (
                      <span className="shrink-0 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
                        {item.cost.toLocaleString()} pt
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
