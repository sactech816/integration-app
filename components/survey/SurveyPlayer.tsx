"use client";

import { useState } from "react";
import { Survey, SurveyQuestion } from "@/lib/types";
import { CheckCircle, Send, Loader2 } from "lucide-react";
import ContentFooter from "@/components/shared/ContentFooter";
import SurveyResults from "./SurveyResults";
import { getSurveyTheme, SurveyTheme } from "@/constants/surveyThemes";

interface SurveyPlayerProps {
  survey: Survey;
  isPreview?: boolean;
}

export default function SurveyPlayer({ survey, isPreview = false }: SurveyPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const theme = getSurveyTheme(survey.settings?.theme);

  const handleChange = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isFormValid = () => {
    if (!respondentName.trim() || !respondentEmail.trim()) return false;

    // 必須質問のチェック
    for (const q of survey.questions) {
      if (q.required !== false && !answers[q.id]) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isPreview) {
      alert("プレビューモードでは送信できません");
      return;
    }

    if (!isFormValid()) {
      setErrorMessage("すべての必須項目を入力してください");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/send-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_id: survey.id,
          survey_title: survey.title,
          creator_email: survey.creator_email,
          creator_name: survey.creator_name,
          respondent_name: respondentName,
          respondent_email: respondentEmail,
          answers,
          questions: survey.questions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "送信に失敗しました");
      }

      setStatus("success");
    } catch (e: unknown) {
      setStatus("error");
      setErrorMessage(e instanceof Error ? e.message : "送信エラーが発生しました");
    }
  };

  // 送信完了画面
  if (status === "success") {
    // 投票モードがONの場合は結果を表示
    if (survey.show_results_after_submission) {
      return (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <SurveyResults
            surveyId={survey.id}
            thankYouMessage={survey.thank_you_message}
          />
        </div>
      );
    }

    // 通常モード: ありがとう画面
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {survey.thank_you_message || "ご回答ありがとうございました！"}
        </h2>
        <p className="text-gray-600">
          回答内容を確認メールでお送りしました。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* ヘッダー画像 */}
      {survey.settings?.headerImage && (
        <div className="relative rounded-t-xl overflow-hidden">
          <img
            src={survey.settings.headerImage}
            alt=""
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* ヘッダー */}
      <div
        className={`text-white p-6 ${survey.settings?.headerImage ? "" : "rounded-t-xl"}`}
        style={{ background: theme.headerGradient }}
      >
        <h1 className="text-2xl font-bold mb-2" style={{ color: theme.headerTextColor }}>
          {survey.title}
        </h1>
        {survey.description && (
          <p className="text-sm" style={{ color: theme.headerSubTextColor }}>
            {survey.description}
          </p>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-b-xl p-6">
        {/* 回答者情報 */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4">ご回答者情報</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none transition placeholder:text-gray-400 text-gray-900 bg-white"
                style={{ boxShadow: respondentName ? `0 0 0 2px ${theme.focusRing}` : undefined }}
                onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.focusRing}`}
                onBlur={(e) => { if (!respondentName) e.currentTarget.style.boxShadow = "none"; }}
                placeholder="山田 太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none transition placeholder:text-gray-400 text-gray-900 bg-white"
                style={{ boxShadow: respondentEmail ? `0 0 0 2px ${theme.focusRing}` : undefined }}
                onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.focusRing}`}
                onBlur={(e) => { if (!respondentEmail) e.currentTarget.style.boxShadow = "none"; }}
                placeholder="example@email.com"
              />
            </div>
          </div>
        </div>

        {/* 質問一覧 */}
        <div className="space-y-8">
          {survey.questions.map((q, index) => (
            <QuestionBlock
              key={q.id}
              question={q}
              index={index}
              value={answers[q.id]}
              onChange={(value) => handleChange(q.id, value)}
              theme={theme}
            />
          ))}
        </div>

        {/* エラーメッセージ */}
        {errorMessage && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {/* 送信ボタン */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={status === "submitting" || !isFormValid()}
            className="inline-flex items-center gap-2 text-white font-bold py-4 px-10 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            style={{ background: theme.buttonGradient }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = theme.buttonHoverGradient; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = theme.buttonGradient; }}
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                送信中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                回答を送信する
              </>
            )}
          </button>
          {isPreview && (
            <p className="text-sm text-gray-500 mt-2">
              ※プレビューモードでは実際に送信されません
            </p>
          )}
        </div>

        {/* フッター */}
        <ContentFooter toolType="survey" variant="light" className="mt-8 rounded-b-xl" hideFooter={survey.settings?.hideFooter} />
      </div>
    </div>
  );
}

// 質問ブロックコンポーネント
function QuestionBlock({
  question,
  index,
  value,
  onChange,
  theme,
}: {
  question: SurveyQuestion;
  index: number;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  theme: SurveyTheme;
}) {
  const isRequired = question.required !== false;

  return (
    <div className="border-b border-gray-100 pb-6 last:border-0">
      <h3 className="font-bold text-lg mb-4 text-gray-800">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm mr-2"
          style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
        >
          {index + 1}
        </span>
        {question.text}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </h3>

      {/* テキスト入力 */}
      {question.type === "text" && (
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-4 h-32 outline-none transition resize-none bg-gray-50 focus:bg-white placeholder:text-gray-400 text-gray-900"
          style={{ boxShadow: value ? `0 0 0 2px ${theme.focusRing}` : undefined }}
          onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.focusRing}`}
          onBlur={(e) => { if (!value) e.currentTarget.style.boxShadow = "none"; }}
          placeholder={question.placeholder || "ここに回答を入力してください..."}
        />
      )}

      {/* 選択式 */}
      {question.type === "choice" && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = value === option;
            return (
              <label
                key={option}
                className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all"
                style={
                  isSelected
                    ? {
                        borderColor: theme.selectedBorder,
                        backgroundColor: theme.selectedBg,
                        boxShadow: `0 0 0 2px ${theme.selectedRing}`,
                      }
                    : { borderColor: "#e5e7eb" }
                }
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-5 h-5"
                  style={{ accentColor: theme.radioColor }}
                />
                <span className="text-gray-700">{option}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* 評価式 */}
      {question.type === "rating" && (
        <div className="flex gap-2 flex-wrap">
          {[...Array(question.maxRating || 5)].map((_, i) => {
            const ratingValue = i + 1;
            const isSelected = value === ratingValue;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(ratingValue)}
                className="w-14 h-14 rounded-full font-bold text-lg transition-all"
                style={
                  isSelected
                    ? {
                        backgroundColor: theme.ratingSelectedBg,
                        color: theme.ratingSelectedText,
                        transform: "scale(1.1)",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                      }
                    : {
                        backgroundColor: "#f3f4f6",
                        color: "#4b5563",
                      }
                }
              >
                {ratingValue}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
