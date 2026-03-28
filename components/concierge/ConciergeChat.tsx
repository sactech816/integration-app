'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Trash2, User, Headphones } from 'lucide-react';
import ConciergeAvatar from './ConciergeAvatar';
import ConciergeBubble from './ConciergeBubble';
import type { AvatarState, ConciergeMessage, PlanCard, PlanExecution } from './types';
import type { SessionStatus } from '@/lib/hooks/useConciergeChat';

interface ConciergeChatProps {
  messages: ConciergeMessage[];
  avatarState: AvatarState;
  isLoading: boolean;
  remainingMessages: number | null;
  currentPage?: string;
  avatarStyle?: any;
  /** オペレーターがオンラインか */
  operatorOnline?: boolean;
  /** 人間チャットモードか */
  isHumanMode?: boolean;
  /** セッション状態 */
  sessionStatus?: SessionStatus;
  /** プラン実行状態 */
  planExecution?: PlanExecution;
  onSend: (text: string) => void;
  onFeedback?: (messageId: string, feedback: 1 | -1) => void;
  onClose: () => void;
  onClear: () => void;
  /** 人間サポートリクエスト */
  onRequestHumanSupport?: () => void;
  /** プラン実行 */
  onExecutePlan?: (plan: PlanCard) => void;
}

/** ページ別クイックアクション */
function getQuickActions(page?: string): string[] {
  if (!page) return ['集客の相談をしたい', '何ができる？', 'LPを作りたい'];

  if (page.startsWith('/kindle'))
    return ['本の構成を考えたい', '表紙を作りたい', 'キーワード分析したい'];
  if (page.startsWith('/quiz'))
    return ['診断クイズの作り方', '結果タイプの設定方法', '診断で集客するコツ'];
  if (page.startsWith('/entertainment'))
    return ['エンタメ診断の作り方', '面白い診断のコツ', '診断をシェアしたい'];
  if (page.startsWith('/profile'))
    return ['プロフィールLPの作り方', '写真の設定方法', '公開・共有の仕方'];
  if (page.startsWith('/business'))
    return ['LPの作り方', 'コンバージョンを上げるコツ', 'フォームを追加したい'];
  if (page.startsWith('/salesletter'))
    return ['セールスレターの書き方', 'AIで文章を生成したい', 'LPと連携したい'];
  if (page.startsWith('/newsletter') || page.startsWith('/step-email'))
    return ['メルマガの始め方', 'ステップメールとの違い', '読者を増やすコツ'];
  if (page.startsWith('/funnel'))
    return ['ファネルの作り方', 'どんな流れがいい？', 'ツールを組み合わせたい'];
  if (page.startsWith('/gamification'))
    return ['ガチャの作り方', 'スロットを作りたい', '集客に活用するコツ'];
  if (page.startsWith('/booking'))
    return ['予約ページの作り方', 'カレンダー設定', '通知の設定方法'];
  if (page.startsWith('/survey'))
    return ['アンケートの作り方', '回答を集めるコツ', '結果の分析方法'];
  if (page.startsWith('/dashboard'))
    return ['集客の相談をしたい', '何ができる？', 'おすすめのツールは？'];

  return ['集客の相談をしたい', '何ができる？', 'LPを作りたい'];
}

export default function ConciergeChat({
  messages,
  avatarState,
  isLoading,
  remainingMessages,
  currentPage,
  avatarStyle,
  operatorOnline = false,
  isHumanMode = false,
  sessionStatus = 'active',
  planExecution,
  onSend,
  onFeedback,
  onClose,
  onClear,
  onRequestHumanSupport,
  onExecutePlan,
}: ConciergeChatProps) {
  const quickActions = getQuickActions(currentPage);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessagesLenRef = useRef(0);

  const isWaiting = sessionStatus === 'waiting';

  // 新しいメッセージでスクロール
  useEffect(() => {
    const prevLen = prevMessagesLenRef.current;
    prevMessagesLenRef.current = messages.length;

    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];

    // ユーザーメッセージ追加時 or ローディング開始時は末尾へスクロール
    if (lastMsg.role === 'user' || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // アシスタントメッセージが新たに追加されたとき → 回答の先頭へスクロール
    if (lastMsg.role === 'assistant' && messages.length > prevLen) {
      // 少し遅延させてDOMが更新されてからスクロール
      requestAnimationFrame(() => {
        lastAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [messages, isLoading]);

  // 開いたらフォーカス
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    onSend(text);
  };

  return (
    <div
      className="concierge-slide-up flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden
        w-[calc(100vw-2rem)] sm:w-[380px] h-[min(500px,70vh)] sm:h-[520px]"
      style={{ overscrollBehavior: 'contain' }}
    >

      {/* ヘッダー */}
      <div className={`flex items-center gap-3 px-4 py-3 text-white ${
        isHumanMode
          ? 'bg-gradient-to-r from-green-500 to-green-600'
          : 'bg-gradient-to-r from-blue-500 to-blue-600'
      }`}>
        {isHumanMode ? (
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
        ) : (
          <ConciergeAvatar state={avatarState} size={36} avatarStyle={avatarStyle} />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">
            {isHumanMode ? '担当者と会話中' : 'メイカーくん'}
          </div>
          <div className="text-xs opacity-80">
            {isHumanMode
              ? 'サポート担当者が対応しています'
              : isWaiting
                ? '担当者に接続中...'
                : 'AIコンシェルジュ'}
          </div>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          title="会話をクリア"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* メッセージ一覧 */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 scrollbar-hide"
        style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {messages.length === 0 && (
          <div className="text-center py-8">
            <ConciergeAvatar state="idle" size={64} avatarStyle={avatarStyle} />
            <p className="mt-3 text-sm text-gray-600 font-medium">
              こんにちは！メイカーくんです
            </p>
            <p className="mt-1 text-xs text-gray-400">
              ツールの使い方や機能のご質問など、お気軽にどうぞ
            </p>
            {/* クイックアクション */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {quickActions.map((q) => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  className="px-3 py-1.5 text-xs rounded-full bg-white border border-gray-200
                    text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600
                    transition-all duration-200 shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isLastAssistant = msg.role === 'assistant' && idx === messages.length - 1;
          return (
            <div key={msg.id} ref={isLastAssistant ? lastAssistantRef : undefined}>
              <ConciergeBubble
                message={msg}
                isLast={idx === messages.length - 1 && !isLoading}
                onNavigate={onClose}
                onSend={onSend}
                onFeedback={onFeedback}
                onExecutePlan={onExecutePlan}
                planExecution={msg.plan ? planExecution : undefined}
              />
            </div>
          );
        })}

        {/* タイピングインジケーター */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span
                  className="concierge-dot-bounce block w-2 h-2 rounded-full bg-gray-400"
                  style={{ animationDelay: '0s' }}
                />
                <span
                  className="concierge-dot-bounce block w-2 h-2 rounded-full bg-gray-400"
                  style={{ animationDelay: '0.2s' }}
                />
                <span
                  className="concierge-dot-bounce block w-2 h-2 rounded-full bg-gray-400"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="border-t border-gray-200 bg-white px-3 py-2.5">
        {remainingMessages !== null && remainingMessages <= 5 && (
          <div className="text-xs text-amber-600 mb-1.5 text-center">
            本日の残り: {remainingMessages}回
          </div>
        )}

        {/* 人間サポートリクエストボタン（waiting/assigned以外で表示） */}
        {!isHumanMode && !isWaiting && onRequestHumanSupport && messages.length > 0 && (
          <button
            onClick={onRequestHumanSupport}
            disabled={isLoading}
            className="w-full mb-2 px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center justify-center gap-1.5
              border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <User className="w-3.5 h-3.5" />
            {operatorOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                担当者に相談する
              </>
            ) : (
              '担当者に問い合わせを送信'
            )}
          </button>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isHumanMode ? '担当者にメッセージ...' : 'メッセージを入力...'}
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm
              text-gray-900 placeholder:text-gray-400
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-xl text-white shadow-md
              transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              min-w-[44px] min-h-[44px] flex items-center justify-center ${
                isHumanMode
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
