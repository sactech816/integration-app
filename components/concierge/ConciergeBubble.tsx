'use client';

import { ThumbsUp, ThumbsDown, Phone, Mail, ExternalLink, Clock, Sparkles, ChevronRight, Check, Loader2, AlertCircle } from 'lucide-react';
import ConciergeToolButton from './ConciergeToolButton';
import type { ConciergeMessage, ContactInfo, PlanCard, PlanExecution } from './types';

interface ConciergeBubbleProps {
  message: ConciergeMessage;
  isLast?: boolean;
  onNavigate?: () => void;
  onSend?: (text: string) => void;
  onFeedback?: (messageId: string, feedback: 1 | -1) => void;
  onExecutePlan?: (plan: PlanCard) => void;
  planExecution?: PlanExecution;
}

/** マークダウン記号をプレーンテキストに変換 */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.+?)\*/g, '$1')       // *italic*
    .replace(/__(.+?)__/g, '$1')       // __bold__
    .replace(/_(.+?)_/g, '$1')         // _italic_
    .replace(/^#{1,6}\s+/gm, '')       // # headings
    .replace(/^[-*+]\s+/gm, '・')      // - list items → ・
    .replace(/^\d+\.\s+/gm, '')        // 1. numbered list
    .replace(/`([^`]+)`/g, '$1')       // `code`
    .replace(/```[\s\S]*?```/g, '')    // ```code blocks```
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // [link](url)
}

/** ツールIDからラベルとURLのマッピング */
const TOOL_MAP: Record<string, { label: string; url: string; emoji: string }> = {
  profile: { label: 'プロフィールLP', url: '/profile', emoji: '👤' },
  business: { label: 'ビジネスLP', url: '/business', emoji: '💼' },
  quiz: { label: '診断クイズ', url: '/quiz', emoji: '🧩' },
  entertainment: { label: 'エンタメ診断', url: '/entertainment', emoji: '🎮' },
  newsletter: { label: 'メルマガ', url: '/newsletter', emoji: '📧' },
  'step-email': { label: 'ステップメール', url: '/step-email', emoji: '📨' },
  funnel: { label: 'ファネル', url: '/funnel', emoji: '🔄' },
  booking: { label: '予約', url: '/booking', emoji: '📅' },
  survey: { label: 'アンケート', url: '/survey', emoji: '📋' },
  gamification: { label: 'ゲーミフィケーション', url: '/gamification', emoji: '🎰' },
  salesletter: { label: 'セールスレター', url: '/salesletter', emoji: '✍️' },
  'sns-post': { label: 'SNS投稿', url: '/sns-post', emoji: '📱' },
  webinar: { label: 'ウェビナーLP', url: '/webinar', emoji: '🎥' },
  'order-form': { label: '申し込みフォーム', url: '/order-form', emoji: '📝' },
  site: { label: 'ホームページ', url: '/site', emoji: '🌐' },
  thumbnail: { label: 'サムネイル', url: '/thumbnail', emoji: '🖼️' },
};

/** 集客プランカード */
function PlanCardView({
  plan,
  execution,
  onExecute,
}: {
  plan: PlanCard;
  execution?: PlanExecution;
  onExecute?: () => void;
}) {
  const isExecuting = execution?.status === 'executing';
  const isCompleted = execution?.status === 'completed';

  return (
    <div className="mt-3 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
          {isCompleted ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : isExecuting ? (
            <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          )}
        </span>
        <p className="text-xs font-bold text-indigo-800">
          {isCompleted ? `${plan.name}（完成！）` : isExecuting ? `${plan.name}（作成中...）` : plan.name}
        </p>
      </div>

      <div className="space-y-1.5">
        {plan.steps.map((step, idx) => {
          const tool = TOOL_MAP[step.toolId];
          const progress = execution?.progress?.find(p => p.stepIndex === idx);
          const result = execution?.results?.find(r => r.stepIndex === idx);
          const isDone = progress?.status === 'done';
          const isGenerating = progress?.status === 'generating';
          const isError = progress?.status === 'error';

          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 px-3 py-2 border rounded-lg transition-all ${
                isDone
                  ? 'bg-green-50 border-green-200'
                  : isGenerating
                    ? 'bg-indigo-50 border-indigo-200'
                    : isError
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-indigo-100'
              }`}
            >
              <span className={`shrink-0 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center mt-0.5 ${
                isDone ? 'bg-green-500' : isGenerating ? 'bg-indigo-500' : isError ? 'bg-red-500' : 'bg-indigo-500'
              }`}>
                {isDone ? (
                  <Check className="w-3 h-3" />
                ) : isGenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isError ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  idx + 1
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {tool && <span className="text-xs">{tool.emoji}</span>}
                  <span className="text-xs font-semibold text-gray-800">
                    {result?.title || tool?.label || step.toolId}
                  </span>
                </div>
                {isGenerating && progress?.message ? (
                  <p className="text-[11px] text-indigo-600 mt-0.5 leading-relaxed">{progress.message}</p>
                ) : isError && progress?.message ? (
                  <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">{progress.message}</p>
                ) : (
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{step.description}</p>
                )}
              </div>
              {result?.url && (
                <a
                  href={result.url}
                  className="shrink-0 p-1 rounded-md text-green-500 hover:text-green-700 hover:bg-green-50 transition-colors"
                  title="作成したコンテンツを開く"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {!result && !isExecuting && tool && (
                <a
                  href={tool.url}
                  className="shrink-0 p-1 rounded-md text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title={`${tool.label}を開く`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {!isExecuting && !isCompleted && onExecute && (
        <button
          onClick={onExecute}
          className="w-full px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          このプランで作成する
        </button>
      )}

      {isCompleted && execution.results.length > 0 && (
        <div className="text-center">
          <p className="text-[11px] text-green-700 font-medium">
            {execution.results.length}つのコンテンツを作成しました！各リンクから編集できます。
          </p>
        </div>
      )}
    </div>
  );
}

/** お問い合わせカード */
function ContactCard({ contactInfo }: { contactInfo: ContactInfo }) {
  return (
    <div className="mt-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 space-y-2.5">
      <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
        <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">📞</span>
        お問い合わせ先
      </p>

      {contactInfo.formUrl && (
        <a
          href={contactInfo.formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium">お問い合わせフォーム</span>
        </a>
      )}

      {contactInfo.phone && (
        <a
          href={`tel:${contactInfo.phone.replace(/[-\s]/g, '')}`}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
        >
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium">{contactInfo.phone}</span>
        </a>
      )}

      {contactInfo.email && (
        <a
          href={`mailto:${contactInfo.email}`}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
        >
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium">{contactInfo.email}</span>
        </a>
      )}

      {contactInfo.businessHours && (
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600">
          <Clock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span>営業時間: {contactInfo.businessHours}</span>
        </div>
      )}
    </div>
  );
}

export default function ConciergeBubble({ message, isLast, onNavigate, onSend, onFeedback, onExecutePlan, planExecution }: ConciergeBubbleProps) {
  const isUser = message.role === 'user';
  const displayText = isUser ? message.content : stripMarkdown(message.content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
        }`}
      >
        {/* メッセージテキスト */}
        <div className="whitespace-pre-wrap">{displayText}</div>

        {/* メディア画像（FAQ回答にスクリーンショット等を含む場合） */}
        {!isUser && message.metadata?.mediaUrl && (
          <a
            href={message.metadata.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2"
          >
            <img
              src={message.metadata.mediaUrl}
              alt="参考画像"
              className="rounded-lg border border-gray-200 max-w-full max-h-48 object-contain cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
            />
          </a>
        )}

        {/* ツールアクションボタン */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.actions.map((action) => (
              <ConciergeToolButton
                key={action.id}
                action={action}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}

        {/* 集客プランカード */}
        {!isUser && message.plan && (
          <PlanCardView
            plan={message.plan}
            execution={planExecution}
            onExecute={onExecutePlan ? () => onExecutePlan(message.plan!) : undefined}
          />
        )}

        {/* お問い合わせカード */}
        {!isUser && message.contactInfo && (
          <ContactCard contactInfo={message.contactInfo} />
        )}

        {/* 👍👎 フィードバックボタン（AI応答のみ） */}
        {!isUser && onFeedback && !message.id.startsWith('err_') && (
          <div className="flex items-center gap-1 mt-2 pt-1.5">
            <button
              onClick={() => onFeedback(message.id, 1)}
              className={`p-1 rounded-md transition-all ${
                message.feedback === 1
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
              }`}
              title="役に立った"
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onFeedback(message.id, -1)}
              className={`p-1 rounded-md transition-all ${
                message.feedback === -1
                  ? 'text-red-500 bg-red-50'
                  : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
              }`}
              title="改善が必要"
            >
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* フォローアップ候補（最後のメッセージのみ表示） */}
        {!isUser && isLast && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-100">
            {message.suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onSend?.(suggestion)}
                className="px-2.5 py-1 text-xs rounded-full bg-gray-50 border border-gray-200
                  text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600
                  transition-all duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
