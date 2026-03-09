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
  Lock,
  Palette,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";
import { Survey, SurveyQuestion, generateSurveyQuestionId } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/utils";
import SurveyPlayer from "./SurveyPlayer";
import { useUserPlan } from "@/lib/hooks/useUserPlan";
import { usePoints } from "@/lib/hooks/usePoints";
import CreationCompleteModal from "@/components/shared/CreationCompleteModal";
import OnboardingModal from "@/components/shared/OnboardingModal";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { SURVEY_THEMES, SURVEY_THEME_IDS, getSurveyTheme } from "@/constants/surveyThemes";

// セクションコンポーネント
const Section = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  badge,
  step,
  stepLabel,
  headerBgColor = "bg-gray-50",
  headerHoverColor = "hover:bg-gray-100",
  accentColor = "bg-teal-100 text-teal-600",
}: {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  step?: number;
  stepLabel?: string;
  headerBgColor?: string;
  headerHoverColor?: string;
  accentColor?: string;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    {/* ステップ見出し */}
    {step && stepLabel && (
      <div className={`px-5 py-2 ${headerBgColor} border-b border-gray-200/50`}>
        <span className="text-xs font-bold text-gray-600 bg-white/60 px-2 py-0.5 rounded">
          STEP {step}
        </span>
        <span className="text-sm text-gray-700 ml-2">{stepLabel}</span>
      </div>
    )}
    <button
      onClick={onToggle}
      className={`w-full px-5 py-4 flex items-center justify-between ${headerBgColor} ${headerHoverColor} transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isOpen ? accentColor : "bg-gray-200 text-gray-500"
          }`}
        >
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-white/80 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
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
  setShowAuth?: (show: boolean) => void;
}

export default function SurveyEditor({ onBack, initialData, user, templateId, setShowAuth }: SurveyEditorProps) {
  // ユーザープラン権限を取得
  const { userPlan, isLoading: isPlanLoading } = useUserPlan(user?.id);
  const { consumeAndExecute } = usePoints({ userId: user?.id, isPro: userPlan.isProUser });
  // はじめかたガイド
  const { showOnboarding, setShowOnboarding } = useOnboarding('survey_editor_onboarding_dismissed', { skip: !!initialData?.id });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(initialData?.id || null);
  const [savedSlug, setSavedSlug] = useState<string | null>(initialData?.slug || null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  const [openSections, setOpenSections] = useState({
    template: !initialData && !templateId, // 新規作成時はテンプレート選択を開く
    basic: !!initialData || !!templateId,
    design: false,
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

  // ログインメールを通知先に自動入力
  useEffect(() => {
    if (user?.email && !form.creator_email) {
      setForm((prev) => ({ ...prev, creator_email: user.email! }));
    }
  }, [user?.email]);

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
    setOpenSections({ template: false, basic: true, design: false, questions: true, settings: false });
    resetPreview();
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const resetPreview = () => setPreviewKey((k) => k + 1);

  // 画像アップロード
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) return alert("データベースに接続されていません");

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id || "anonymous"}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("quiz-thumbnails").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("quiz-thumbnails").getPublicUrl(filePath);
      setForm({ ...form, settings: { ...form.settings, headerImage: data.publicUrl } });
      resetPreview();
    } catch (error: unknown) {
      alert("アップロードエラー: " + (error instanceof Error ? error.message : "不明なエラー"));
    } finally {
      setIsUploading(false);
    }
  };

  // ランダム画像
  const handleRandomImage = () => {
    const curatedImages = [
      "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80",
    ];
    const selected = curatedImages[Math.floor(Math.random() * curatedImages.length)];
    setForm({ ...form, settings: { ...form.settings, headerImage: selected } });
    resetPreview();
  };

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

    // 既存IDの判定（savedIdまたはinitialData.id）
    const existingId = savedId || initialData?.id;
    
    // 編集にはログインが必要
    if (existingId && !user) {
      if (confirm("編集・更新にはログインが必要です。ログイン画面を開きますか？")) {
        setShowAuth?.(true);
      }
      return;
    }

    await consumeAndExecute('survey', 'save', async () => {
      setIsSaving(true);

      try {
        // UPDATE用のデータ（user_idは含めない）
        const updateData = {
          title: form.title,
          description: form.description,
          questions: form.questions,
          creator_email: form.creator_email,
          creator_name: form.creator_name,
          thank_you_message: form.thank_you_message,
          settings: form.settings,
          show_in_portal: form.settings?.showInPortal || false,
          show_results_after_submission: form.show_results_after_submission || false,
        };

        let result;

        if (existingId) {
          // 更新（user_idは変更しない）
          const { data, error } = await supabase
            .from("surveys")
            .update(updateData)
            .eq("id", existingId)
            .select()
            .single();

          if (error) throw error;
          result = data;
        } else {
          // 新規作成（slugとuser_idを追加）
          const newSlug = generateSlug();
          const insertData = {
            ...updateData,
            slug: newSlug,
            user_id: user?.id || null, // INSERT時のみuser_idを設定
          };

          const { data, error } = await supabase
            .from("surveys")
            .insert(insertData)
            .select()
            .single();

          if (error) throw error;
          result = data;
        }

        if (result) {
          const wasNewCreation = !existingId; // 保存前の状態で判定

          setSavedId(result.id);
          setSavedSlug(result.slug);

          // ゲストが新規作成した場合、ログイン後に紐付けるためlocalStorageに保存
          if (!user && wasNewCreation) {
            try {
              const stored = JSON.parse(localStorage.getItem('guest_content') || '[]');
              stored.push({ table: 'surveys', id: result.id });
              localStorage.setItem('guest_content', JSON.stringify(stored));
            } catch {}
          }

          // ISRキャッシュを無効化
          fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: `/survey/${result.slug}` }),
          }).catch(() => {});

          if (wasNewCreation) {
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
    });
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
      <CreationCompleteModal
        isOpen={showSuccessModal && !!savedSlug}
        onClose={() => setShowSuccessModal(false)}
        title="アンケート"
        publicUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/survey/${savedSlug}`}
        contentTitle={form.title || "アンケートを作成しました！"}
        theme="teal"
      />

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
            <>
              <button
                onClick={() => setShowSuccessModal(true)}
                className="hidden sm:flex bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:from-orange-600 hover:to-amber-600 shadow-md text-sm sm:text-base"
              >
                <Trophy size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden md:inline">作成完了画面</span><span className="md:hidden">完了</span>
              </button>
              <button
                onClick={handleCopyUrl}
                className="hidden sm:flex bg-amber-50 border-2 border-amber-400 text-amber-700 px-4 py-2 rounded-lg font-bold items-center gap-2 hover:bg-amber-100 text-sm sm:text-base"
              >
                <ExternalLink size={16} /> 公開URL
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:from-orange-600 hover:to-amber-600 shadow-md transition-all"
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
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* 左側: 編集パネル */}
        <div
          className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${
            mobileTab === "preview" ? "hidden lg:block" : ""
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            {/* ステップ1: テンプレート選択 */}
            <Section
              title="テンプレートから作成"
              icon={Sparkles}
              isOpen={openSections.template}
              onToggle={() => toggleSection("template")}
              step={1}
              stepLabel="テンプレートからアンケートを作成（任意）"
              headerBgColor="bg-purple-50"
              headerHoverColor="hover:bg-purple-100"
              accentColor="bg-purple-100 text-purple-600"
            >
              <p className="text-sm text-gray-600 mb-2">
                よく使われるアンケートのテンプレートから始めることができます。
              </p>
              <p className="text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg mb-4 flex items-center gap-2">
                📊 <span>投票モード（回答後に結果グラフを表示）は「詳細設定」で選択できます。</span>
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

            {/* ステップ2: 基本設定 */}
            <Section
              title="基本設定"
              icon={FileText}
              isOpen={openSections.basic}
              onToggle={() => toggleSection("basic")}
              step={2}
              stepLabel="タイトル・説明文・通知先を設定"
              headerBgColor="bg-blue-50"
              headerHoverColor="hover:bg-blue-100"
              accentColor="bg-blue-100 text-blue-600"
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
              {user?.email && form.creator_email === user.email && (
                <p className="text-xs text-teal-600 -mt-3 mb-4 flex items-center gap-1">
                  ※ ログインメールが自動入力されています
                </p>
              )}
              <Input
                label="作成者名（任意）"
                value={form.creator_name || ""}
                onChange={(v) => setForm({ ...form, creator_name: v })}
                placeholder="メールに表示される名前"
              />
            </Section>

            {/* デザインセクション */}
            <Section
              title="デザイン"
              icon={Palette}
              isOpen={openSections.design}
              onToggle={() => toggleSection("design")}
              headerBgColor="bg-pink-50"
              headerHoverColor="hover:bg-pink-100"
              accentColor="bg-pink-100 text-pink-600"
            >
              {/* カラーテーマ */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-900">カラーテーマ</label>
                  <button
                    onClick={() => {
                      setForm({ ...form, settings: { ...form.settings, theme: "teal" } });
                      resetPreview();
                    }}
                    className="text-xs text-teal-600 hover:text-teal-800 hover:underline"
                  >
                    初期値に戻す
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SURVEY_THEME_IDS.map((themeId) => {
                    const theme = SURVEY_THEMES[themeId];
                    const isSelected = (form.settings?.theme || "teal") === themeId;
                    return (
                      <button
                        key={themeId}
                        onClick={() => {
                          setForm({ ...form, settings: { ...form.settings, theme: themeId } });
                          resetPreview();
                        }}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? "border-gray-800 bg-gray-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-5 h-5 rounded-full border border-white shadow-sm"
                            style={{ background: theme.headerGradient }}
                          />
                          <span className="font-bold text-sm text-gray-900">{theme.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{theme.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ヘッダー画像 */}
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">ヘッダー画像（任意）</label>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    className="flex-grow border border-gray-300 p-3 rounded-lg text-black font-medium focus:ring-2 focus:ring-teal-500 outline-none bg-white placeholder-gray-400 text-sm"
                    value={form.settings?.headerImage || ""}
                    onChange={(e) => {
                      setForm({ ...form, settings: { ...form.settings, headerImage: e.target.value } });
                      resetPreview();
                    }}
                    placeholder="画像URL (https://...) またはアップロード"
                  />
                  <label className="bg-pink-50 text-pink-700 px-4 py-3 rounded-lg font-bold hover:bg-pink-100 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap text-sm">
                    {isUploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                    <span>アップロード</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <button
                    onClick={handleRandomImage}
                    className="bg-gray-100 px-4 py-3 rounded-lg text-sm font-bold hover:bg-gray-200 flex items-center justify-center gap-1 whitespace-nowrap"
                  >
                    <ImageIcon size={16} /> 自動
                  </button>
                </div>
                {form.settings?.headerImage && (
                  <div className="relative mt-2">
                    <img
                      src={form.settings.headerImage}
                      alt="Header Preview"
                      className="h-32 w-full object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => {
                        setForm({ ...form, settings: { ...form.settings, headerImage: undefined } });
                        resetPreview();
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">アンケートのヘッダーに画像を表示します。</p>
              </div>
            </Section>

            {/* ステップ3: 質問編集 */}
            <Section
              title="質問"
              icon={MessageSquare}
              isOpen={openSections.questions}
              onToggle={() => toggleSection("questions")}
              badge={`${form.questions.length}問`}
              step={3}
              stepLabel="質問と選択肢を作成・編集"
              headerBgColor="bg-green-50"
              headerHoverColor="hover:bg-green-100"
              accentColor="bg-green-100 text-green-600"
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

            {/* ステップ4: 詳細設定 */}
            <Section
              title="詳細設定"
              icon={Settings}
              isOpen={openSections.settings}
              onToggle={() => toggleSection("settings")}
              step={4}
              stepLabel="完了メッセージ・公開設定（任意）"
              headerBgColor="bg-gray-100"
              headerHoverColor="hover:bg-gray-200"
              accentColor="bg-gray-200 text-gray-600"
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

              {/* 投票モード設定 */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-bold text-purple-900 flex items-center gap-2 mb-1">
                    📊 回答後に結果を全員に公開する（投票モード）
                  </h4>
                  <p className="text-xs text-purple-700">
                    ONにすると、回答完了後に選択式・評価式の集計結果がグラフで表示されます。
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.show_results_after_submission || false}
                    onChange={(e) => {
                      setForm({ ...form, show_results_after_submission: e.target.checked });
                      resetPreview();
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* ポータル掲載設定 */}
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

              {/* フッター非表示（Proプラン特典） */}
              <div className={`p-4 rounded-xl flex items-start justify-between border ${
                userPlan.canHideCopyright 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-gray-100 border-gray-200'
              }`}>
                <div className="flex-1">
                  <h4 className={`font-bold flex items-center gap-2 mb-1 ${
                    userPlan.canHideCopyright ? 'text-orange-900' : 'text-gray-500'
                  }`}>
                    {userPlan.canHideCopyright 
                      ? <Eye size={18} className="text-orange-600" /> 
                      : <Lock size={18} className="text-gray-400" />
                    }
                    フッターを非表示にする
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      userPlan.canHideCopyright 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-400 text-white'
                    }`}>Pro</span>
                  </h4>
                  <p className={`text-xs ${userPlan.canHideCopyright ? 'text-orange-700' : 'text-gray-500'}`}>
                    コンテンツ下部に表示される「アンケートメーカーで作成しました」のフッターを非表示にします。
                  </p>
                  {!userPlan.canHideCopyright && (
                    <p className="text-xs text-teal-600 mt-2 font-medium">
                      ※ Proプランにアップグレードすると利用可能になります
                    </p>
                  )}
                </div>
                <label className={`relative inline-flex items-center ml-4 flex-shrink-0 ${
                  userPlan.canHideCopyright ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}>
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={userPlan.canHideCopyright && (form.settings?.hideFooter || false)}
                    onChange={(e) => {
                      if (userPlan.canHideCopyright) {
                        setForm({
                          ...form,
                          settings: { ...form.settings, hideFooter: e.target.checked },
                        });
                      }
                    }}
                    disabled={!userPlan.canHideCopyright}
                  />
                  <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    userPlan.canHideCopyright 
                      ? 'bg-gray-200 peer-focus:outline-none peer-checked:bg-orange-600' 
                      : 'bg-gray-300'
                  }`}></div>
                </label>
              </div>

              {/* 関連コンテンツ非表示（Proプラン特典） */}
              <div className={`p-4 rounded-xl border ${
                userPlan.canHideCopyright
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-gray-100 border-gray-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-bold flex items-center gap-2 mb-1 ${
                      userPlan.canHideCopyright ? 'text-orange-900' : 'text-gray-500'
                    }`}>
                      {userPlan.canHideCopyright
                        ? <Eye size={18} className="text-orange-600"/>
                        : <Lock size={18} className="text-gray-400"/>
                      }
                      関連コンテンツを非表示にする
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        userPlan.canHideCopyright
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}>Pro</span>
                    </h4>
                    <p className={`text-xs ${userPlan.canHideCopyright ? 'text-orange-700' : 'text-gray-500'}`}>
                      ページ下部の「他のアンケートもチェック」セクションを非表示にします。
                    </p>
                    {!userPlan.canHideCopyright && (
                      <p className="text-xs text-teal-600 mt-2 font-medium">
                        ※ Proプランにアップグレードすると利用可能になります
                      </p>
                    )}
                  </div>
                  <label className={`relative inline-flex items-center ml-4 flex-shrink-0 ${
                    userPlan.canHideCopyright ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}>
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={userPlan.canHideCopyright && (form.settings?.hideRelatedContent || false)}
                      onChange={(e) => {
                        if (userPlan.canHideCopyright) {
                          setForm({
                            ...form,
                            settings: { ...form.settings, hideRelatedContent: e.target.checked },
                          });
                        }
                      }}
                      disabled={!userPlan.canHideCopyright}
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      userPlan.canHideCopyright
                        ? 'bg-gray-200 peer-focus:outline-none peer-checked:bg-orange-600'
                        : 'bg-gray-300'
                    }`}></div>
                  </label>
                </div>
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
        {/* PC用スペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0"></div>
      </div>

      {/* はじめかたガイド */}
      {showOnboarding && (
        <OnboardingModal
          storageKey="survey_editor_onboarding_dismissed"
          title="アンケートエディタの使い方"
          pages={[
            {
              subtitle: 'エディタの基本',
              items: [
                { icon: Settings, iconColor: 'blue', title: '左 = 設定パネル / 右 = リアルタイムプレビュー', description: '左側で質問や設定を編集すると、右側のプレビューにリアルタイム反映されます。モバイルでは「編集/プレビュー」タブで切替できます。' },
                { icon: Sparkles, iconColor: 'amber', title: 'テンプレートから始める', description: '用途別テンプレートから始めると、質問や設定が自動入力されます。カスタマイズも自由です。' },
                { icon: Palette, iconColor: 'teal', title: 'デザイン設定', description: 'テーマカラーやスタイルを「デザイン設定」セクションで変更できます。複数のプリセットテーマが選べます。' },
                { icon: ListChecks, iconColor: 'purple', title: '質問タイプの種類', description: 'テキスト入力・単一選択・複数選択・評価スケールなど、複数の質問タイプに対応しています。' },
              ],
            },
            {
              subtitle: '質問と結果の設定',
              items: [
                { icon: Plus, iconColor: 'blue', title: '質問の追加・並べ替え', description: '「質問設定」セクションで質問を追加し、ドラッグで順番を変更できます。' },
                { icon: Trophy, iconColor: 'amber', title: '結果表示の設定', description: '「設定」セクションで結果の表示方法をカスタマイズできます。' },
                { icon: Share2, iconColor: 'green', title: '共有方法', description: '保存後、URLをコピーして共有できます。QRコードやSNSでの配布にも対応しています。' },
              ],
            },
          ]}
          gradientFrom="from-teal-500"
          gradientTo="to-cyan-500"
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}

