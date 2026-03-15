'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import {
  BarChart3, MessageSquare, Users, TrendingUp, ThumbsUp,
  ChevronRight, Calendar, HelpCircle, Search, ArrowLeft, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type Tab = 'overview' | 'logs' | 'questions';

interface SessionItem {
  visitorId: string;
  sessionId: string;
  lastMessage: string;
  lastAt: string;
  messageCount: number;
}

interface SessionMessage {
  role: string;
  content: string;
  created_at: string;
  feedback: number | null;
}

interface TopKeyword {
  keyword: string;
  count: number;
}

interface TopQuestion {
  question: string;
  count: number;
}

function ConfigAnalyticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const configId = searchParams.get('id');

  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [range, setRange] = useState(7);
  const [configName, setConfigName] = useState('');

  // Overview
  const [overviewData, setOverviewData] = useState<any>(null);
  // Logs
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<{
    visitorId: string;
    sessionId: string;
  } | null>(null);
  const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);
  // Questions
  const [questionsData, setQuestionsData] = useState<{
    topKeywords: TopKeyword[];
    topQuestions: TopQuestion[];
    totalQuestions: number;
  } | null>(null);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setUser(null);
    router.push('/');
  };

  useEffect(() => {
    if (!supabase) { setIsLoading(false); return; }
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsLoading(false);
    };
    init();
  }, []);

  const fetchData = useCallback(async (tab: Tab) => {
    if (!configId) return;
    try {
      const res = await fetch(
        `/api/concierge/config-analytics?configId=${configId}&tab=${tab}&range=${range}`
      );
      if (!res.ok) return;
      const data = await res.json();

      if (tab === 'overview') {
        setOverviewData(data);
        if (data.configName) setConfigName(data.configName);
      }
      if (tab === 'logs') setSessions(data.sessions || []);
      if (tab === 'questions') setQuestionsData(data);
    } catch {
      // ignore
    }
  }, [configId, range]);

  useEffect(() => {
    if (user && configId) fetchData(activeTab);
  }, [user, configId, activeTab, range, fetchData]);

  const loadSession = async (visitorId: string, sessionId: string) => {
    setSelectedSession({ visitorId, sessionId });
    try {
      const res = await fetch(
        `/api/concierge/config-analytics?configId=${configId}&tab=session&visitorId=${visitorId}&sessionId=${sessionId}`
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
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <p className="text-gray-600">ログインが必要です</p>
          <button
            onClick={() => setShowAuth(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition-all font-semibold"
          >
            ログイン
          </button>
        </div>
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          setUser={setUser}
          defaultTab="login"
        />
      </>
    );
  }

  if (!configId) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">configId が指定されていません</p>
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
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="flex max-w-7xl mx-auto">
          {/* 左ナビ */}
          <aside className="w-60 min-h-[calc(100vh-4rem)] bg-white border-r border-gray-200 p-4 shrink-0 hidden md:block">
            <button
              onClick={() => router.push(`/concierge/editor?id=${configId}`)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mb-4 px-2"
            >
              <ArrowLeft className="w-4 h-4" />
              エディタに戻る
            </button>
            <h2 className="text-sm font-bold text-gray-800 mb-1 px-2">
              アクセス解析
            </h2>
            {configName && (
              <p className="text-xs text-gray-500 mb-4 px-2 truncate">{configName}</p>
            )}
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

          {/* モバイルタブ */}
          <div className="md:hidden fixed top-16 left-0 right-0 z-30 bg-white border-b border-gray-200 px-2 py-2">
            <div className="flex gap-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    setSelectedSession(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 mt-2">
              {[7, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setRange(d)}
                  className={`flex-1 py-1 text-xs rounded-lg font-medium ${
                    range === d
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {d}日
                </button>
              ))}
            </div>
          </div>

          {/* 右コンテンツ */}
          <main className="flex-1 p-4 md:p-6 mt-24 md:mt-0">
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
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
    { label: `${range}日間のメッセージ`, value: data.periodMessages, icon: TrendingUp, color: 'purple' },
    { label: 'ユニーク訪問者', value: data.uniqueVisitors, icon: Users, color: 'green' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">概要</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{(value ?? 0).toLocaleString()}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 満足度 */}
      {data.satisfaction && data.satisfaction.total > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4" />
            満足度
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-3xl font-bold text-gray-900">
              {data.satisfaction.rate}%
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4 text-blue-500" />
                {data.satisfaction.thumbsUp}
              </span>
              <span className="flex items-center gap-1">
                <span className="rotate-180 inline-block"><ThumbsUp className="w-4 h-4 text-red-400" /></span>
                {data.satisfaction.thumbsDown}
              </span>
              <span className="text-gray-400">（合計 {data.satisfaction.total} 件）</span>
            </div>
          </div>
        </div>
      )}

      {/* 日別チャート */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4">日別メッセージ数</h2>
        {data.dailyChart && data.dailyChart.length > 0 ? (
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
  onSelect: (visitorId: string, sessionId: string) => void;
}) {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">会話ログ</h1>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            まだ会話データがありません
          </p>
          <p className="text-gray-400 text-xs mt-1">
            コンシェルジュを公開し、訪問者が会話すると表示されます
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelect(s.visitorId, s.sessionId)}
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
                  <span className="font-mono text-gray-400">
                    {(s.visitorId || '').slice(0, 12)}...
                  </span>
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
  session: { visitorId: string; sessionId: string };
  messages: SessionMessage[];
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        一覧に戻る
      </button>
      <h1 className="text-xl font-bold text-gray-900 mb-2">会話詳細</h1>
      <p className="text-xs text-gray-500 mb-6">
        ビジター: {session.visitorId.slice(0, 16)}...
      </p>

      {messages.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">メッセージが見つかりません</p>
      ) : (
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
                <div className={`text-xs mt-1 flex items-center gap-2 ${m.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(m.created_at).toLocaleTimeString('ja-JP')}
                  {m.role === 'assistant' && m.feedback === 1 && (
                    <ThumbsUp className="w-3 h-3 text-blue-500" />
                  )}
                  {m.role === 'assistant' && m.feedback === -1 && (
                    <span className="rotate-180 inline-block"><ThumbsUp className="w-3 h-3 text-red-400" /></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** よくある質問タブ */
function QuestionsTab({ data, range }: { data: { topKeywords: TopKeyword[]; topQuestions: TopQuestion[]; totalQuestions: number }; range: number }) {
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
            よく使われるキーワード
          </h2>
          {data.topKeywords.length > 0 ? (
            <div className="space-y-2">
              {data.topKeywords.map((kw, i) => (
                <div key={kw.keyword} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-800 font-medium">{kw.keyword}</span>
                      <span className="text-xs text-gray-500">{kw.count}回</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(kw.count / data.topKeywords[0].count) * 100}%` }}
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
              {data.topQuestions.map((q, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <span className="text-xs font-bold text-gray-400 w-5 text-right shrink-0">{i + 1}</span>
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

export default function ConciergeConfigAnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <ConfigAnalyticsContent />
    </Suspense>
  );
}
