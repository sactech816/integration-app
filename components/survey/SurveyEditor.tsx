"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Edit3,
  RefreshCw,
  Share2,
  Copy,
  ExternalLink,
  Trophy,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Settings,
  FileText,
  ListChecks,
  Star,
  Type,
  Sparkles,
  Users,
  ShoppingCart,
  GraduationCap,
  Heart,
  Calendar,
} from "lucide-react";
import { Survey, SurveyQuestion, generateSurveyQuestionId } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/utils";
import SurveyPlayer from "./SurveyPlayer";

// セクションコンポーネント
const Section = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  badge,
}: {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    <button
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isOpen ? "bg-teal-100 text-teal-600" : "bg-gray-200 text-gray-500"
          }`}
        >
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {isOpen ? (
        <ChevronUp size={20} className="text-gray-500" />
      ) : (
        <ChevronDown size={20} className="text-gray-500" />
      )}
    </button>
    {isOpen && <div className="p-5 border-t border-gray-100">{children}</div>}
  </div>
);

// 入力コンポーネント
const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      className="w-full border border-gray-300 p-3 rounded-lg text-black font-medium focus:ring-2 focus:ring-teal-500 outline-none bg-white placeholder-gray-400 transition-shadow"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="mb-4">
    <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
    <textarea
      className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-teal-500 outline-none bg-white placeholder-gray-400 transition-shadow"
      rows={3}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

// アンケートテンプレート定義
const SURVEY_TEMPLATES = {
  customer_satisfaction: {
    title: "顧客満足度調査",
    description: "サービスや商品への満足度をお聞かせください。",
    icon: Heart,
    color: "text-rose-600",
    bg: "bg-rose-50",
    questions: [
      { id: "cs_1", text: "全体的な満足度を教えてください", type: "rating" as const, required: true, maxRating: 5 },
      { id: "cs_2", text: "サービスの品質はいかがでしたか？", type: "choice" as const, required: true, options: ["とても良い", "良い", "普通", "やや不満", "不満"] },
      { id: "cs_3", text: "スタッフの対応はいかがでしたか？", type: "rating" as const, required: true, maxRating: 5 },
      { id: "cs_4", text: "また利用したいと思いますか？", type: "choice" as const, required: true, options: ["ぜひ利用したい", "機会があれば", "どちらとも言えない", "あまり思わない"] },
      { id: "cs_5", text: "改善点やご要望があればお聞かせください", type: "text" as const, required: false },
    ],
  },
  event_feedback: {
    title: "イベント・セミナーアンケート",
    description: "本日のイベントについてご意見をお聞かせください。",
    icon: Calendar,
    color: "text-purple-600",
    bg: "bg-purple-50",
    questions: [
      { id: "ef_1", text: "イベント全体の満足度を教えてください", type: "rating" as const, required: true, maxRating: 5 },
      { id: "ef_2", text: "内容は分かりやすかったですか？", type: "choice" as const, required: true, options: ["とても分かりやすい", "分かりやすい", "普通", "やや難しい", "難しい"] },
      { id: "ef_3", text: "このイベントを知ったきっかけは？", type: "choice" as const, required: true, options: ["SNS", "メルマガ", "友人・知人の紹介", "検索", "その他"] },
      { id: "ef_4", text: "今後参加したいテーマがあれば教えてください", type: "text" as const, required: false },
      { id: "ef_5", text: "その他ご意見・ご感想", type: "text" as const, required: false },
    ],
  },
  nps_survey: {
    title: "NPS（推奨度）調査",
    description: "サービスを友人や知人に薦める可能性をお聞かせください。",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    questions: [
      { id: "nps_1", text: "このサービスを友人や同僚に薦める可能性は？（0: 全く薦めない〜10: 強く薦める）", type: "rating" as const, required: true, maxRating: 10 },
      { id: "nps_2", text: "その評価の理由を教えてください", type: "text" as const, required: true },
      { id: "nps_3", text: "特に良かった点は何ですか？", type: "text" as const, required: false },
      { id: "nps_4", text: "改善してほしい点はありますか？", type: "text" as const, required: false },
    ],
  },
  product_feedback: {
    title: "商品・サービス改善アンケート",
    description: "商品やサービスの改善にご協力ください。",
    icon: ShoppingCart,
    color: "text-amber-600",
    bg: "bg-amber-50",
    questions: [
      { id: "pf_1", text: "この商品/サービスを使い始めたきっかけは？", type: "choice" as const, required: true, options: ["広告を見て", "口コミ", "検索", "店頭で見て", "友人の紹介", "その他"] },
      { id: "pf_2", text: "使用頻度を教えてください", type: "choice" as const, required: true, options: ["毎日", "週に数回", "月に数回", "年に数回", "初めて"] },
      { id: "pf_3", text: "価格についてどう思いますか？", type: "choice" as const, required: true, options: ["とても安い", "適正価格", "やや高い", "高い"] },
      { id: "pf_4", text: "追加してほしい機能やサービスはありますか？", type: "text" as const, required: false },
      { id: "pf_5", text: "総合的な満足度を教えてください", type: "rating" as const, required: true, maxRating: 5 },
    ],
  },
  training_evaluation: {
    title: "研修・講座評価アンケート",
    description: "研修や講座の内容についてフィードバックをお願いします。",
    icon: GraduationCap,
    color: "text-green-600",
    bg: "bg-green-50",
    questions: [
      { id: "te_1", text: "研修内容の理解度はいかがでしたか？", type: "rating" as const, required: true, maxRating: 5 },
      { id: "te_2", text: "講師の説明は分かりやすかったですか？", type: "rating" as const, required: true, maxRating: 5 },
      { id: "te_3", text: "研修時間は適切でしたか？", type: "choice" as const, required: true, options: ["長すぎる", "やや長い", "ちょうど良い", "やや短い", "短すぎる"] },
      { id: "te_4", text: "今後の業務に活かせそうですか？", type: "choice" as const, required: true, options: ["とても活かせる", "ある程度活かせる", "どちらとも言えない", "あまり活かせない"] },
      { id: "te_5", text: "今後取り上げてほしいテーマがあれば教えてください", type: "text" as const, required: false },
    ],
  },
  employee_engagement: {
    title: "従業員エンゲージメント調査",
    description: "職場環境や働きがいについてお聞かせください（匿名）",
    icon: Sparkles,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    questions: [
      { id: "ee_1", text: "現在の仕事にやりがいを感じていますか？", type: "rating" as const, required: true, maxRating: 5 },
      { id: "ee_2", text: "職場の人間関係は良好ですか？", type: "rating" as const, required: true, maxRating: 5 },
      { id: "ee_3", text: "業務量は適切だと思いますか？", type: "choice" as const, required: true, options: ["多すぎる", "やや多い", "適切", "やや少ない", "少ない"] },
      { id: "ee_4", text: "会社の将来に期待していますか？", type: "rating" as const, required: true, maxRating: 5 },
      { id: "ee_5", text: "改善してほしい点があれば教えてください", type: "text" as const, required: false },
    ],
  },
};

interface SurveyEditorProps {
  onBack?: () => void;
  initialData?: Partial<Survey>;
  user?: { id: string; email?: string } | null;
  templateId?: keyof typeof SURVEY_TEMPLATES;
}

export default function SurveyEditor({ onBack, initialData, user, templateId }: SurveyEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(initialData?.id || null);
  const [savedSlug, setSavedSlug] = useState<string | null>(initialData?.slug || null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  const [openSections, setOpenSections] = useState({
    template: !initialData && !templateId, // 新規作成時はテンプレート選択を開く
    basic: !!initialData || !!templateId,
    questions: !!initialData || !!templateId,
    settings: false,
  });

  const defaultForm: Omit<Survey, "id" | "created_at" | "updated_at"> = {
    slug: "",
    title: "新規アンケート",
    description: "",
    questions: [
      {
        id: generateSurveyQuestionId(),
        text: "質問1を入力してください",
        type: "choice",
        required: true,
        options: ["選択肢1", "選択肢2", "選択肢3"],
      },
    ],
    creator_email: user?.email || "",
    creator_name: "",
    thank_you_message: "ご回答ありがとうございました！",
    user_id: user?.id || null,
    settings: {
      showInPortal: false,
    },
  };

  const [form, setForm] = useState(() => {
    // テンプレートIDが指定されている場合
    if (templateId && SURVEY_TEMPLATES[templateId]) {
      const template = SURVEY_TEMPLATES[templateId];
      return {
        ...defaultForm,
        title: template.title,
        description: template.description,
        questions: template.questions,
      };
    }
    if (!initialData) return defaultForm;
    return { ...defaultForm, ...initialData };
  });

  useEffect(() => {
    document.title = "アンケート作成・編集";
    window.scrollTo(0, 0);
  }, []);

  // テンプレート適用
  const applyTemplate = (key: keyof typeof SURVEY_TEMPLATES) => {
    if (!confirm("テンプレートを適用しますか？\n現在の入力内容は上書きされます。")) return;
    const template = SURVEY_TEMPLATES[key];
    setForm({
      ...defaultForm,
      title: template.title,
      description: template.description,
      questions: template.questions.map((q) => ({ ...q, id: generateSurveyQuestionId() })),
    });
    setOpenSections({ template: false, basic: true, questions: true, settings: false });
    resetPreview();
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const resetPreview = () => setPreviewKey((k) => k + 1);

  // 質問操作
  const addQuestion = (type: SurveyQuestion["type"]) => {
    if (form.questions.length >= 20) {
      alert("質問は最大20個までです");
      return;
    }

    const newQuestion: SurveyQuestion = {
      id: generateSurveyQuestionId(),
      text: `質問${form.questions.length + 1}を入力してください`,
      type,
      required: true,
      ...(type === "choice" && { options: ["選択肢1", "選択肢2", "選択肢3"] }),
      ...(type === "rating" && { maxRating: 5 }),
      ...(type === "text" && { placeholder: "ここに回答を入力..." }),
    };

    setForm({ ...form, questions: [...form.questions, newQuestion] });
  };

  const removeQuestion = (index: number) => {
    if (form.questions.length <= 1) {
      alert("質問は最低1つ必要です");
      return;
    }
    const newQuestions = form.questions.filter((_, i) => i !== index);
    setForm({ ...form, questions: newQuestions });
  };

  const updateQuestion = (index: number, updates: Partial<SurveyQuestion>) => {
    const newQuestions = [...form.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setForm({ ...form, questions: newQuestions });
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...form.questions];
    const question = newQuestions[qIndex];
    const options = (question as { options?: string[] }).options || [];
    if (options.length >= 10) {
      alert("選択肢は最大10個までです");
      return;
    }
    (newQuestions[qIndex] as { options?: string[] }).options = [...options, `選択肢${options.length + 1}`];
    setForm({ ...form, questions: newQuestions });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const newQuestions = [...form.questions];
    const question = newQuestions[qIndex];
    const options = (question as { options?: string[] }).options || [];
    if (options.length <= 2) {
      alert("選択肢は最低2つ必要です");
      return;
    }
    (newQuestions[qIndex] as { options?: string[] }).options = options.filter((_, i) => i !== optIndex);
    setForm({ ...form, questions: newQuestions });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...form.questions];
    const question = newQuestions[qIndex];
    const options = [...((question as { options?: string[] }).options || [])];
    options[optIndex] = value;
    (newQuestions[qIndex] as { options?: string[] }).options = options;
    setForm({ ...form, questions: newQuestions });
  };

  // 保存処理
  const handleSave = async () => {
    if (!supabase) {
      alert("データベースに接続されていません");
      return;
    }

    if (!form.title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    if (!form.creator_email.trim()) {
      alert("通知先メールアドレスを入力してください");
      return;
    }

    setIsSaving(true);

    try {
      const saveData = {
        title: form.title,
        description: form.description,
        questions: form.questions,
        creator_email: form.creator_email,
        creator_name: form.creator_name,
        thank_you_message: form.thank_you_message,
        settings: form.settings,
        show_in_portal: form.settings?.showInPortal || false,
        user_id: user?.id || null,
      };

      let result;

      if (savedId) {
        // 更新
        const { data, error } = await supabase
          .from("surveys")
          .update(saveData)
          .eq("id", savedId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // 新規作成
        const newSlug = generateSlug();
        const { data, error } = await supabase
          .from("surveys")
          .insert({ ...saveData, slug: newSlug })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      if (result) {
        setSavedId(result.id);
        setSavedSlug(result.slug);

        if (!initialData?.id && !savedId) {
          setShowSuccessModal(true);
        } else {
          alert("保存しました！");
        }
      }
    } catch (error: unknown) {
      console.error("保存エラー:", error);
      alert("保存に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUrl = () => {
    if (!savedSlug) return;
    const url = `${window.location.origin}/survey/${savedSlug}`;
    navigator.clipboard.writeText(url);
    alert("URLをコピーしました！");
  };

  // プレビュー用データ
  const previewSurvey: Survey = {
    id: savedId || 0,
    slug: savedSlug || "preview",
    ...form,
  } as Survey;

  return (
    <div className="bg-gray-100 flex flex-col font-sans text-gray-900" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* 成功モーダル */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Trophy size={24} /> アンケートを作成しました！
                </h3>
                <p className="text-sm text-teal-100 mt-1">公開URLをコピーしてシェアできます</p>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 公開URL */}
              <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-700 mb-2">公開URL</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/survey/${savedSlug}`}
                    readOnly
                    className="flex-1 text-xs bg-white border border-teal-300 p-2 rounded-lg text-gray-900 font-bold"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-teal-700 transition-colors whitespace-nowrap"
                  >
                    <Copy size={16} className="inline mr-1" /> コピー
                  </button>
                </div>
              </div>

              {/* アクセスボタン */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  window.open(`/survey/${savedSlug}`, "_blank");
                }}
                className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
              >
                <ExternalLink size={20} /> アンケートを開く
              </button>

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

      {/* ヘッダー */}
      <div className="bg-white border-b px-4 md:px-6 py-4 flex justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <ArrowLeft />
          </button>
          <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
            {initialData ? "アンケート編集" : "新規アンケート作成"}
          </h2>
        </div>
        <div className="flex gap-2">
          {savedSlug && (
            <button
              onClick={handleCopyUrl}
              className="hidden sm:flex bg-teal-50 border border-teal-200 text-teal-700 px-4 py-2 rounded-lg font-bold items-center gap-2"
            >
              <Share2 size={16} /> URL
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-teal-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 shadow-md transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}{" "}
            <span className="hidden sm:inline">保存</span>
          </button>
        </div>
      </div>

      {/* モバイル用タブ */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[121px] z-40">
        <div className="flex">
          <button
            onClick={() => setMobileTab("editor")}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              mobileTab === "editor"
                ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Edit3 size={18} /> 編集
          </button>
          <button
            onClick={() => {
              setMobileTab("preview");
              resetPreview();
            }}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              mobileTab === "preview"
                ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Eye size={18} /> プレビュー
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左側: 編集パネル */}
        <div
          className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${
            mobileTab === "preview" ? "hidden lg:block" : ""
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            {/* テンプレート選択 */}
            <Section
              title="テンプレートから作成"
              icon={Sparkles}
              isOpen={openSections.template}
              onToggle={() => toggleSection("template")}
            >
              <p className="text-sm text-gray-600 mb-4">
                よく使われるアンケートのテンプレートから始めることができます。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.entries(SURVEY_TEMPLATES) as [keyof typeof SURVEY_TEMPLATES, typeof SURVEY_TEMPLATES[keyof typeof SURVEY_TEMPLATES]][]).map(([key, template]) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key)}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 ${template.bg} hover:border-gray-300 transition-all text-left`}
                    >
                      <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                        <Icon size={20} className={template.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm ${template.color}`}>{template.title}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</div>
                        <div className="text-xs text-gray-400 mt-1">{template.questions.length}問</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 基本設定 */}
            <Section
              title="基本設定"
              icon={FileText}
              isOpen={openSections.basic}
              onToggle={() => toggleSection("basic")}
            >
              <Input
                label="アンケートタイトル"
                value={form.title}
                onChange={(v) => {
                  setForm({ ...form, title: v });
                  resetPreview();
                }}
                placeholder="例: 顧客満足度調査"
                required
              />
              <Textarea
                label="説明文"
                value={form.description || ""}
                onChange={(v) => {
                  setForm({ ...form, description: v });
                  resetPreview();
                }}
                placeholder="アンケートの目的や回答にかかる時間などを記載"
              />
              <Input
                label="通知先メールアドレス"
                value={form.creator_email}
                onChange={(v) => setForm({ ...form, creator_email: v })}
                placeholder="回答通知を受け取るメールアドレス"
                type="email"
                required
              />
              <Input
                label="作成者名（任意）"
                value={form.creator_name || ""}
                onChange={(v) => setForm({ ...form, creator_name: v })}
                placeholder="メールに表示される名前"
              />
            </Section>

            {/* 質問編集 */}
            <Section
              title="質問"
              icon={MessageSquare}
              isOpen={openSections.questions}
              onToggle={() => toggleSection("questions")}
              badge={`${form.questions.length}問`}
            >
              <div className="space-y-4">
                {form.questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-gray-300" />
                        <span className="font-bold text-teal-600 text-sm">Q{i + 1}</span>
                        <select
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(i, {
                              type: e.target.value as SurveyQuestion["type"],
                              ...(e.target.value === "choice" && {
                                options: q.options || ["選択肢1", "選択肢2"],
                              }),
                              ...(e.target.value === "rating" && { maxRating: 5 }),
                            })
                          }
                          className="text-xs bg-white border border-gray-200 rounded px-2 py-1"
                        >
                          <option value="choice">選択式</option>
                          <option value="rating">評価式</option>
                          <option value="text">自由記述</option>
                        </select>
                      </div>
                      <button
                        onClick={() => removeQuestion(i)}
                        className="text-gray-300 hover:text-red-500 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <input
                      className="w-full border border-gray-300 p-2 rounded-lg text-black font-medium focus:ring-2 focus:ring-teal-500 outline-none bg-white mb-3 text-sm"
                      value={q.text}
                      onChange={(e) => updateQuestion(i, { text: e.target.value })}
                      placeholder="質問文を入力..."
                    />

                    {/* 選択式オプション */}
                    {q.type === "choice" && (
                      <div className="space-y-2">
                        {q.options?.map((opt, j) => (
                          <div
                            key={j}
                            className="bg-white p-2 rounded border border-gray-200 flex items-center gap-2"
                          >
                            <button
                              onClick={() => removeOption(i, j)}
                              className="text-gray-300 hover:text-red-500"
                            >
                              <Trash2 size={12} />
                            </button>
                            <input
                              className="flex-grow p-1 outline-none text-sm text-gray-900"
                              value={opt}
                              onChange={(e) => updateOption(i, j, e.target.value)}
                              placeholder={`選択肢${j + 1}`}
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(i)}
                          className="w-full py-1 text-xs text-teal-600 hover:bg-teal-50 rounded flex items-center justify-center gap-1"
                        >
                          <Plus size={12} /> 選択肢追加
                        </button>
                      </div>
                    )}

                    {/* 評価式設定 */}
                    {q.type === "rating" && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">最大評価値:</span>
                        <select
                          value={q.maxRating || 5}
                          onChange={(e) =>
                            updateQuestion(i, { maxRating: parseInt(e.target.value) })
                          }
                          className="bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                        >
                          {[3, 4, 5, 7, 10].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* 必須チェック */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required !== false}
                          onChange={(e) => updateQuestion(i, { required: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded"
                        />
                        <span className="text-sm text-gray-600">必須</span>
                      </label>
                    </div>
                  </div>
                ))}

                {/* 質問追加ボタン */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Plus size={16} className="text-teal-600" />
                    <span className="text-sm font-bold text-gray-700">質問を追加する</span>
                    <span className="text-xs text-gray-400">（タイプを選んでクリック）</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => addQuestion("choice")}
                      className="py-3 bg-white border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 hover:border-teal-400 hover:text-teal-600 flex flex-col items-center gap-1 text-sm transition-colors"
                    >
                      <ListChecks size={20} />
                      選択式
                    </button>
                    <button
                      onClick={() => addQuestion("rating")}
                      className="py-3 bg-white border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 hover:border-teal-400 hover:text-teal-600 flex flex-col items-center gap-1 text-sm transition-colors"
                    >
                      <Star size={20} />
                      評価式
                    </button>
                    <button
                      onClick={() => addQuestion("text")}
                      className="py-3 bg-white border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 hover:border-teal-400 hover:text-teal-600 flex flex-col items-center gap-1 text-sm transition-colors"
                    >
                      <Type size={20} />
                      自由記述
                    </button>
                  </div>
                </div>
              </div>
            </Section>

            {/* 詳細設定 */}
            <Section
              title="詳細設定"
              icon={Settings}
              isOpen={openSections.settings}
              onToggle={() => toggleSection("settings")}
            >
              <Textarea
                label="完了メッセージ"
                value={form.thank_you_message || ""}
                onChange={(v) => {
                  setForm({ ...form, thank_you_message: v });
                  resetPreview();
                }}
                placeholder="回答完了後に表示されるメッセージ"
              />

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-teal-900 flex items-center gap-2 mb-1">
                    <Star size={18} className="text-teal-600" /> ポータルに掲載する
                  </h4>
                  <p className="text-xs text-teal-700">
                    ポータルに掲載することで、より多くの方にアンケートへの回答を促せます。
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.settings?.showInPortal || false}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        settings: { ...form.settings, showInPortal: e.target.checked },
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </Section>

            {/* 保存ボタン */}
            <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md text-lg"
              >
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                {savedId ? "更新して保存" : "保存して公開"}
              </button>
            </div>
          </div>
        </div>

        {/* 右側: プレビュー */}
        <div
          className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${
            mobileTab === "editor" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* ヘッダー */}
          <div className="hidden lg:flex bg-gray-900 px-4 py-3 items-center justify-between border-b border-gray-700">
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
          <div className="lg:hidden bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <span className="text-white font-bold text-sm">プレビュー</span>
            <button
              onClick={resetPreview}
              className="text-gray-400 hover:text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={14} /> リセット
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
              <SurveyPlayer key={previewKey} survey={previewSurvey} isPreview={true} />
            </div>
          </div>
        </div>
        {/* スペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>
    </div>
  );
}

