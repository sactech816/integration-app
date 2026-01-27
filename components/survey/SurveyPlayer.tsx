"use client";

import { useState } from "react";
import { Survey, SurveyQuestion } from "@/lib/types";
import { CheckCircle, Send, Loader2 } from "lucide-react";
import ContentFooter from "@/components/shared/ContentFooter";
import SurveyResults from "./SurveyResults";

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
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-t-xl">
        <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
        {survey.description && (
          <p className="text-teal-100 text-sm">{survey.description}</p>
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
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition placeholder:text-gray-400 text-gray-900 bg-white"
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
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition placeholder:text-gray-400 text-gray-900 bg-white"
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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold py-4 px-10 rounded-full hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
}: {
  question: SurveyQuestion;
  index: number;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
}) {
  const isRequired = question.required !== false;

  return (
    <div className="border-b border-gray-100 pb-6 last:border-0">
      <h3 className="font-bold text-lg mb-4 text-gray-800">
        <span className="inline-flex items-center justify-center w-7 h-7 bg-teal-100 text-teal-700 rounded-full text-sm mr-2">
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
          className="w-full border border-gray-300 rounded-lg p-4 h-32 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition resize-none bg-gray-50 focus:bg-white placeholder:text-gray-400 text-gray-900"
          placeholder={question.placeholder || "ここに回答を入力してください..."}
        />
      )}

      {/* 選択式 */}
      {question.type === "choice" && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option}
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                value === option
                  ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="w-5 h-5 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
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
                className={`w-14 h-14 rounded-full font-bold text-lg transition-all ${
                  isSelected
                    ? "bg-teal-600 text-white scale-110 shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
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

