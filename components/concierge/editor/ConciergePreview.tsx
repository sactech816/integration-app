'use client';

import { useState } from 'react';
import { Send, X, Trash2 } from 'lucide-react';

interface ConciergeConfig {
  name: string;
  greeting: string;
  personality: string;
  avatar_style: { type: string; primaryColor: string };
  design: { position: string; bubbleSize: number; headerColor: string; fontFamily: string };
  [key: string]: any;
}

interface Props {
  config: ConciergeConfig;
}

/** プレビュー用のシンプルなアバター */
function PreviewAvatar({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      <circle cx="50" cy="50" r="48" fill={color} />
      {/* 目 */}
      <ellipse cx="35" cy="42" rx="5" ry="6" fill="white" />
      <ellipse cx="65" cy="42" rx="5" ry="6" fill="white" />
      <circle cx="35" cy="43" r="2.5" fill="#1a1a2e" />
      <circle cx="65" cy="43" r="2.5" fill="#1a1a2e" />
      {/* 口 */}
      <path d="M 35 60 Q 50 72 65 60" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* ほっぺ */}
      <circle cx="25" cy="55" r="6" fill="rgba(255,255,255,0.2)" />
      <circle cx="75" cy="55" r="6" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

export default function ConciergePreview({ config }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  const color = config.avatar_style.primaryColor;
  const bubbleSize = config.design.bubbleSize;
  const isRight = config.design.position === 'bottom-right';

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', text: input.trim() },
      { role: 'assistant', text: 'これはプレビューです。実際のAI応答は保存後に動作します。' },
    ]);
    setInput('');
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
      {/* 背景グリッド */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* プレビューラベル */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-500 font-medium border border-gray-200">
        プレビュー
      </div>

      {/* モック画面 */}
      <div className="relative w-[360px] h-[640px] bg-white rounded-3xl shadow-2xl border border-gray-300 overflow-hidden">
        {/* モックヘッダー */}
        <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-6 bg-gray-200 rounded-full w-full" />
          </div>
        </div>

        {/* モックコンテンツ */}
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
          <div className="h-20 bg-gray-100 rounded-xl mt-4" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-full" />
        </div>

        {/* コンシェルジュウィジェット */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`absolute bottom-4 ${isRight ? 'right-4' : 'left-4'} rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all`}
            style={{ width: bubbleSize, height: bubbleSize, background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
          >
            <PreviewAvatar color="transparent" size={bubbleSize * 0.65} />
          </button>
        )}

        {/* チャットパネル */}
        {isOpen && (
          <div className={`absolute bottom-4 ${isRight ? 'right-3' : 'left-3'} w-[calc(100%-24px)] max-w-[320px]`}>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: 380 }}>
              {/* ヘッダー */}
              <div className="flex items-center gap-2 px-3 py-2.5 text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                <PreviewAvatar color="transparent" size={28} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs">{config.name || 'アシスタント'}</div>
                  <div className="text-[10px] opacity-70">AIコンシェルジュ</div>
                </div>
                <button onClick={() => { setMessages([]); }} className="p-1 rounded hover:bg-white/20">
                  <Trash2 className="w-3 h-3" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/20">
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* メッセージ */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center py-6">
                    <PreviewAvatar color={color} size={48} />
                    <p className="mt-2 text-xs text-gray-600 font-medium">
                      {config.greeting || 'こんにちは！'}
                    </p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                    }`} style={msg.role === 'user' ? { backgroundColor: color } : undefined}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* 入力 */}
              <div className="border-t border-gray-200 bg-white px-2 py-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="メッセージを入力..."
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-1.5 rounded-lg text-white disabled:opacity-40 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
