'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Trash2 } from 'lucide-react';
import ConciergeAvatar from './ConciergeAvatar';
import ConciergeBubble from './ConciergeBubble';
import type { AvatarState, ConciergeMessage } from './types';

interface ConciergeChatProps {
  messages: ConciergeMessage[];
  avatarState: AvatarState;
  isLoading: boolean;
  remainingMessages: number | null;
  currentPage?: string;
  onSend: (text: string) => void;
  onFeedback?: (messageId: string, feedback: 1 | -1) => void;
  onClose: () => void;
  onClear: () => void;
}

/** ページ別クイックアクション */
function getQuickActions(page?: string): string[] {
  if (!page) return ['何ができる？', 'LPを作りたい', '集客したい'];

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
    return ['何ができる？', 'おすすめのツールは？', '集客したい'];

  return ['何ができる？', 'LPを作りたい', '集客したい'];
}

export default function ConciergeChat({
  messages,
  avatarState,
  isLoading,
  remainingMessages,
  currentPage,
  onSend,
  onFeedback,
  onClose,
  onClear,
}: ConciergeChatProps) {
  const quickActions = getQuickActions(currentPage);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessagesLenRef = useRef(0);

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
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <ConciergeAvatar state={avatarState} size={36} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">メイカーくん</div>
          <div className="text-xs text-blue-100">AIコンシェルジュ</div>
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
            <ConciergeAvatar state="idle" size={64} />
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
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm
              text-gray-900 placeholder:text-gray-400
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl bg-blue-500 text-white shadow-md
              hover:bg-blue-600 transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
