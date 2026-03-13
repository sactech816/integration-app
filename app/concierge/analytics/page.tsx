'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import {
  BarChart3, MessageSquare, Users, TrendingUp,
  ChevronRight, Search, Calendar, HelpCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type Tab = 'overview' | 'logs' | 'questions';

interface DailyChart {
  date: string;
  messages: number;
  responses: number;
}

interface SessionItem {
  userId: string;
  sessionId: string;
  lastMessage: string;
  lastAt: string;
  messageCount: number;
}

interface SessionMessage {
  role: string;
  content: string;
  metadata: any;
  created_at: string;
}

interface TopKeyword {
  keyword: string;
  count: number;
}

interface TopQuestion {
  question: string;
  count: number;
}

export default function ConciergeAnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [range, setRange] = useState(7);

  // Overview data
  const [overviewData, setOverviewData] = useState<{
    totalMessages: number;
    uniqueUsers: number;
    periodMessages: number;
    dailyChart: DailyChart[];
  } | null>(null);

  // Logs data
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<{
    userId: string;
    sessionId: string;
  } | null>(null);
  const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);

  // Questions data
  const [questionsData, setQuestionsData] = useState<{
    topKeywords: TopKeyword[];
    topQuestions: TopQuestion[];
    totalQuestions: number;
  } | null>(null);

  // Auth
  useEffect(() => {
    if (!supabase) return;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user;
      setUser(u || null);
      if (u?.email) {
        const adminEmails = getAdminEmails();
        setIsAdmin(adminEmails.some((e: string) => u.email?.toLowerCase() === e.toLowerCase()));
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const fetchData = useCallback(async (tab: Tab) => {
    try {
      const res = await fetch(`/api/concierge/analytics?tab=${tab}&range=${range}`);
      if (!res.ok) return;
      const data = await res.json();

      if (tab === 'overview') setOverviewData(data);
      if (tab === 'logs') setSessions(data.sessions || []);
      if (tab === 'questions') setQuestionsData(data);
    } catch {
      // ignore
    }
  }, [range]);

  useEffect(() => {
    if (isAdmin) fetchData(activeTab);
  }, [isAdmin, activeTab, range, fetchData]);

  const loadSession = async (userId: string, sessionId: string) => {
    setSelectedSession({ userId, sessionId });
    try {
      const res = await fetch(
        `/api/concierge/analytics?tab=session&userId=${userId}&sessionId=${sessionId}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setSessionMessages(data.messages || []);
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <>
        <Header user={user} onLogout={async () => { await supabase?.auth.signOut(); setUser(null); router.push('/'); }} setShowAuth={setShowAuth} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Header user={user} onLogout={async () => { await supabase?.auth.signOut(); setUser(null); router.push('/'); }} setShowAuth={setShowAuth} />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">管理者のみアクセスできます</p>
        </div>
      </>
    );
  }

  const tabs = [
    { id: 'overview' as Tab, label: '概要', icon: BarChart3 },
    { id: 'logs' as Tab, label: '会話ログ', icon: MessageSquare },
    { id: 'questions' as Tab, label: 'よくある質問', icon: HelpCircle },
  ];

  return (
    <>
      <Header user={user} onLogout={async () => { await supabase?.auth.signOut(); setUser(null); router.push('/'); }} setShowAuth={setShowAuth} />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="flex max-w-7xl mx-auto">
          {/* 左ナビ */}
          <aside className="w-60 min-h-[calc(100vh-4rem)] bg-white border-r border-gray-200 p-4 shrink-0">
            <h2 className="text-sm font-bold text-gray-800 mb-4 px-2">
              コンシェルジュ分析
            </h2>
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    setSelectedSession(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>

            {/* 期間選択 */}
            <div className="mt-6 px-2">
              <label className="text-xs text-gray-500 font-medium mb-2 block">期間</label>
              <div className="flex gap-1">
                {[7, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setRange(d)}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
                      range === d
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {d}日
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 右コンテンツ */}
          <main className="flex-1 p-6">
            {activeTab === 'overview' && overviewData && (
              <OverviewTab data={overviewData} range={range} />
            )}
            {activeTab === 'logs' && (
              selectedSession ? (
                <SessionDetail
                  session={selectedSession}
                  messages={sessionMessages}
                  onBack={() => setSelectedSession(null)}
                />
              ) : (
                <LogsTab sessions={sessions} onSelect={loadSession} />
              )
            )}
            {activeTab === 'questions' && questionsData && (
              <QuestionsTab data={questionsData} range={range} />
            )}
            {/* ローディング */}
            {((activeTab === 'overview' && !overviewData) ||
              (activeTab === 'questions' && !questionsData)) && (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

/** 概要タブ */
function OverviewTab({ data, range }: { data: any; range: number }) {
  const stats = [
    { label: '総メッセージ数', value: data.totalMessages, icon: MessageSquare, color: 'blue' },
    { label: 'ユニークユーザー', value: data.uniqueUsers, icon: Users, color: 'green' },
    { label: `${range}日間のメッセージ`, value: data.periodMessages, icon: TrendingUp, color: 'purple' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">概要</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 日別チャート */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4">日別メッセージ数</h2>
        {data.dailyChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.dailyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="messages" fill="#3B82F6" name="ユーザー" radius={[4, 4, 0, 0]} />
              <Bar dataKey="responses" fill="#93C5FD" name="AI応答" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">
            この期間のデータがありません
          </div>
        )}
      </div>
    </div>
  );
}

/** 会話ログタブ */
function LogsTab({ sessions, onSelect }: {
  sessions: SessionItem[];
  onSelect: (userId: string, sessionId: string) => void;
}) {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">会話ログ</h1>

      {sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          会話ログがありません
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelect(s.userId, s.sessionId)}
              className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4
                hover:border-blue-200 hover:shadow-md transition-all text-left flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 font-medium truncate">
                  {s.lastMessage}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(s.lastAt).toLocaleString('ja-JP')}
                  </span>
                  <span>{s.messageCount} メッセージ</span>
                  <span className="font-mono text-gray-400">{s.userId.slice(0, 8)}...</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** セッション詳細 */
function SessionDetail({ session, messages, onBack }: {
  session: { userId: string; sessionId: string };
  messages: SessionMessage[];
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1"
      >
        ← 一覧に戻る
      </button>
      <h1 className="text-xl font-bold text-gray-900 mb-2">会話詳細</h1>
      <p className="text-xs text-gray-500 mb-6">
        ユーザー: {session.userId.slice(0, 12)}... / セッション: {session.sessionId}
      </p>

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              <div className={`text-xs mt-1 ${m.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                {new Date(m.created_at).toLocaleTimeString('ja-JP')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** よくある質問タブ */
function QuestionsTab({ data, range }: { data: any; range: number }) {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        よくある質問（過去{range}日間）
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* キーワードランキング */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4" />
            キーワードランキング
          </h2>
          {data.topKeywords.length > 0 ? (
            <div className="space-y-2">
              {data.topKeywords.map((kw: TopKeyword, i: number) => (
                <div key={kw.keyword} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5 text-right">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-800 font-medium">{kw.keyword}</span>
                      <span className="text-xs text-gray-500">{kw.count}回</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${(kw.count / data.topKeywords[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">データがありません</p>
          )}
        </div>

        {/* 質問ランキング */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            よくある質問 TOP20
          </h2>
          {data.topQuestions.length > 0 ? (
            <div className="space-y-2">
              {data.topQuestions.map((q: TopQuestion, i: number) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <span className="text-xs font-bold text-gray-400 w-5 text-right shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-800 flex-1 truncate">{q.question}</span>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                    {q.count}回
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">データがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
