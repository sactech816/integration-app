import React, { useState, useEffect, useRef } from 'react';
import { 
    Edit3, MessageSquare, Trophy, Loader2, Save, Share2, 
    Sparkles, Wand2, BookOpen, Image as ImageIcon, 
    Layout, MessageCircle, ArrowLeft, Briefcase, GraduationCap, 
    CheckCircle, Shuffle, Plus, Trash2, X, Link, QrCode, UploadCloud, Mail, FileText, ChevronDown, ChevronUp, RefreshCw, Eye, 
    ShoppingCart, Gift, Download, Code, Users, Star, Copy, ExternalLink, Store, Menu, ChevronLeft, Palette, Play
} from 'lucide-react';
import { generateSlug } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { QUIZ_THEMES, QUIZ_THEME_IDS, getQuizTheme } from '../../constants/quizThemes';
import QuizPlayer from './QuizPlayer';

// --- 用途別テンプレート（プリセットデータ）---
const USE_CASE_PRESETS = {
    kindle: {
        title: "あなたの著者タイプ診断",
        description: "Kindle出版に向いている執筆スタイルや得意ジャンルを診断します。",
        mode: "diagnosis", 
        category: "Business", 
        color: "bg-amber-600",
        questions: [
            {text: "執筆するならどんな時間帯？", options: [{label: "朝型", score: {A:3,B:0,C:0}}, {label: "夜型", score: {A:0,B:3,C:0}}, {label: "昼型", score: {A:0,B:0,C:3}}, {label: "気分次第", score: {A:1,B:1,C:1}}]},
            {text: "書きたいテーマは？", options: [{label: "実用・ノウハウ", score: {A:3,B:0,C:0}}, {label: "小説・物語", score: {A:0,B:3,C:0}}, {label: "エッセイ・体験談", score: {A:0,B:0,C:3}}, {label: "特にない", score: {A:1,B:1,C:1}}]},
            {text: "執筆ペースは？", options: [{label: "毎日コツコツ", score: {A:3,B:0,C:0}}, {label: "一気に書く", score: {A:0,B:3,C:0}}, {label: "波がある", score: {A:0,B:0,C:3}}, {label: "締切前", score: {A:1,B:1,C:1}}]},
            {text: "読者のフィードバックは？", options: [{label: "欲しい", score: {A:3,B:0,C:0}}, {label: "怖い", score: {A:0,B:3,C:0}}, {label: "気になる", score: {A:0,B:0,C:3}}, {label: "見ない", score: {A:1,B:1,C:1}}]},
            {text: "目標は？", options: [{label: "印税収入", score: {A:3,B:0,C:0}}, {label: "表現したい", score: {A:0,B:3,C:0}}, {label: "権威性構築", score: {A:0,B:0,C:3}}, {label: "趣味", score: {A:1,B:1,C:1}}]}
        ],
        results: [
            {type: "A", title: "実用書タイプ", description: "ノウハウや実用情報を体系的に伝えることが得意です。ビジネス書や自己啓発書で読者の課題解決を目指しましょう。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""},
            {type: "B", title: "クリエイタータイプ", description: "物語や世界観を作ることに情熱を注げます。小説やエッセイで独自の表現を追求しましょう。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""},
            {type: "C", title: "発信者タイプ", description: "自分の経験や考えを発信することが得意です。ブログ形式やエッセイで共感を集めましょう。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""}
        ]
    },
    instructor: {
        title: "あなたの講師スタイル診断",
        description: "受講生に合った教え方や得意な講座形式を診断します。",
        mode: "diagnosis", 
        category: "Business", 
        color: "bg-blue-600",
        questions: [
            {text: "教えるのが得意なのは？", options: [{label: "理論・体系", score: {A:3,B:0,C:0}}, {label: "実践・ワーク", score: {A:0,B:3,C:0}}, {label: "対話・相談", score: {A:0,B:0,C:3}}, {label: "全部", score: {A:1,B:1,C:1}}]},
            {text: "受講生の質問には？", options: [{label: "その場で回答", score: {A:3,B:0,C:0}}, {label: "後で調べる", score: {A:0,B:3,C:0}}, {label: "一緒に考える", score: {A:0,B:0,C:3}}, {label: "予習必須", score: {A:1,B:1,C:1}}]},
            {text: "講座の進め方は？", options: [{label: "カリキュラム通り", score: {A:3,B:0,C:0}}, {label: "柔軟に調整", score: {A:0,B:3,C:0}}, {label: "受講生次第", score: {A:0,B:0,C:3}}, {label: "即興", score: {A:1,B:1,C:1}}]},
            {text: "得意な形式は？", options: [{label: "講義形式", score: {A:3,B:0,C:0}}, {label: "ワークショップ", score: {A:0,B:3,C:0}}, {label: "個別指導", score: {A:0,B:0,C:3}}, {label: "オンライン", score: {A:1,B:1,C:1}}]},
            {text: "受講生の成長は？", options: [{label: "データで測る", score: {A:3,B:0,C:0}}, {label: "作品で見る", score: {A:0,B:3,C:0}}, {label: "対話で感じる", score: {A:0,B:0,C:3}}, {label: "自己申告", score: {A:1,B:1,C:1}}]}
        ],
        results: [
            {type: "A", title: "体系派講師", description: "理論を体系的に教えることが得意です。資格講座や専門知識を伝える講座に向いています。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""},
            {type: "B", title: "実践派講師", description: "手を動かして学ぶワーク型講座が得意です。スキル習得や制作系の講座に向いています。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""},
            {type: "C", title: "伴走派講師", description: "受講生に寄り添い、個別対応が得意です。コーチングやコンサルティング型講座に向いています。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""}
        ]
    },
    store: {
        title: "来店きっかけ診断",
        description: "お客様の来店理由や求めているサービスを診断します。",
        mode: "diagnosis", 
        category: "Business", 
        color: "bg-green-600",
        questions: [
            {text: "来店のきっかけは？", options: [{label: "SNSで見た", score: {A:3,B:0,C:0}}, {label: "通りがかり", score: {A:0,B:3,C:0}}, {label: "友人の紹介", score: {A:0,B:0,C:3}}, {label: "検索", score: {A:1,B:1,C:1}}]},
            {text: "求めているのは？", options: [{label: "新商品・トレンド", score: {A:3,B:0,C:0}}, {label: "定番商品", score: {A:0,B:3,C:0}}, {label: "相談・提案", score: {A:0,B:0,C:3}}, {label: "特にない", score: {A:1,B:1,C:1}}]},
            {text: "予算感は？", options: [{label: "こだわりたい", score: {A:3,B:0,C:0}}, {label: "お手頃に", score: {A:0,B:3,C:0}}, {label: "相場を知りたい", score: {A:0,B:0,C:3}}, {label: "未定", score: {A:1,B:1,C:1}}]},
            {text: "滞在時間は？", options: [{label: "さっと買いたい", score: {A:3,B:0,C:0}}, {label: "じっくり見たい", score: {A:0,B:3,C:0}}, {label: "相談したい", score: {A:0,B:0,C:3}}, {label: "時間次第", score: {A:1,B:1,C:1}}]},
            {text: "購入後は？", options: [{label: "SNSで発信", score: {A:3,B:0,C:0}}, {label: "自分で楽しむ", score: {A:0,B:3,C:0}}, {label: "また相談したい", score: {A:0,B:0,C:3}}, {label: "特にない", score: {A:1,B:1,C:1}}]}
        ],
        results: [
            {type: "A", title: "トレンド重視タイプ", description: "新商品や話題の商品をチェックしたいお客様です。SNSでの発信力もあります。新商品コーナーやキャンペーン情報がおすすめです。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""},
            {type: "B", title: "定番重視タイプ", description: "お気に入りの定番商品を求めるお客様です。安定した品質とコスパを重視します。ロングセラー商品やセット割引がおすすめです。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""},
            {type: "C", title: "相談重視タイプ", description: "スタッフとの対話を大切にするお客様です。パーソナルな提案を求めています。個別相談やカウンセリングサービスがおすすめです。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""}
        ]
    },
    consultant: {
        title: "ビジネス課題診断",
        description: "現在の経営課題や優先的に解決すべきポイントを診断します。",
        mode: "diagnosis", 
        category: "Business", 
        color: "bg-purple-600",
        questions: [
            {text: "一番の悩みは？", options: [{label: "売上が伸びない", score: {A:3,B:0,C:0}}, {label: "人材が定着しない", score: {A:0,B:3,C:0}}, {label: "業務が回らない", score: {A:0,B:0,C:3}}, {label: "全部", score: {A:1,B:1,C:1}}]},
            {text: "マーケティングは？", options: [{label: "何もしていない", score: {A:3,B:0,C:0}}, {label: "SNSのみ", score: {A:2,B:1,C:0}}, {label: "広告出稿中", score: {A:1,B:0,C:2}}, {label: "体系的に実施", score: {A:0,B:1,C:3}}]},
            {text: "チームの状態は？", options: [{label: "人手不足", score: {A:0,B:3,C:1}}, {label: "スキル不足", score: {A:1,B:3,C:0}}, {label: "モチベーション低下", score: {A:0,B:3,C:1}}, {label: "問題なし", score: {A:1,B:0,C:2}}]},
            {text: "業務フローは？", options: [{label: "属人化している", score: {A:0,B:1,C:3}}, {label: "マニュアルなし", score: {A:1,B:2,C:3}}, {label: "一部仕組化済", score: {A:1,B:1,C:2}}, {label: "完全に仕組化", score: {A:2,B:1,C:0}}]},
            {text: "今後の目標は？", options: [{label: "売上2倍", score: {A:3,B:0,C:0}}, {label: "組織強化", score: {A:0,B:3,C:0}}, {label: "仕組み化", score: {A:0,B:0,C:3}}, {label: "現状維持", score: {A:1,B:1,C:1}}]}
        ],
        results: [
            {type: "A", title: "売上拡大フェーズ", description: "マーケティング強化と新規顧客獲得が最優先です。Web集客やセールス体制の構築から始めましょう。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""},
            {type: "B", title: "組織強化フェーズ", description: "採用・育成・定着が最優先です。評価制度の整備や社内コミュニケーション改善から始めましょう。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""},
            {type: "C", title: "仕組化フェーズ", description: "業務効率化と標準化が最優先です。マニュアル整備やITツール導入から始めましょう。", link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: ""}
        ]
    }
};

// --- Input Components ---
const Input = ({label, val, onChange, ph}: {label: string, val: string, onChange: (v: string) => void, ph?: string}) => (
    <div className="mb-4">
        <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
        <input 
            className="w-full border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400 transition-shadow" 
            value={val||''} 
            onChange={e=>onChange(e.target.value)} 
            placeholder={ph}
        />
    </div>
);

const Textarea = ({label, val, onChange}: {label: string, val: string, onChange: (v: string) => void}) => (
    <div className="mb-4">
        <label className="text-sm font-bold text-gray-900 block mb-2">{label}</label>
        <textarea 
            className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400 transition-shadow" 
            rows={3} 
            value={val} 
            onChange={e=>onChange(e.target.value)}
        />
    </div>
);

// --- セクションコンポーネント ---
const Section = ({ 
    title, 
    icon: Icon, 
    isOpen, 
    onToggle, 
    children,
    badge
}: { 
    title: string, 
    icon: any, 
    isOpen: boolean, 
    onToggle: () => void, 
    children: React.ReactNode,
    badge?: string
}) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
        <button 
            onClick={onToggle}
            className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                    <Icon size={18} />
                </div>
                <span className="font-bold text-gray-900">{title}</span>
                {badge && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{badge}</span>
                )}
            </div>
            {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </button>
        {isOpen && (
            <div className="p-5 border-t border-gray-100">
                {children}
            </div>
        )}
    </div>
);

interface EditorProps {
    onBack?: () => void;
    initialData?: any;
    setPage?: (page: string, params?: any) => void;
    user?: { id: string; email?: string } | null;
    setShowAuth?: (show: boolean) => void;
    isAdmin?: boolean;
}

const Editor = ({ onBack, initialData, setPage, user, setShowAuth, isAdmin }: EditorProps) => {
    useEffect(() => { 
        document.title = "クイズ作成・編集 | 診断クイズメーカー"; 
        window.scrollTo(0, 0);
        
        // 用途別テンプレートIDが渡された場合、テンプレートを適用
        if (initialData?.templateId && USE_CASE_PRESETS[initialData.templateId as keyof typeof USE_CASE_PRESETS]) {
            const preset = USE_CASE_PRESETS[initialData.templateId as keyof typeof USE_CASE_PRESETS];
            setForm({ ...defaultForm, ...preset });
        }
    }, []);

    const [isSaving, setIsSaving] = useState(false);
    const [savedId, setSavedId] = useState<number | null>(null);
    const [savedSlug, setSavedSlug] = useState<string | null>(null);
    const [aiTheme, setAiTheme] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [regenerateSlug, setRegenerateSlug] = useState(false);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [justSavedQuizId, setJustSavedQuizId] = useState<string | null>(null);
    const [customSlug, setCustomSlug] = useState('');
    const [slugError, setSlugError] = useState('');
    
    // セクションの開閉状態
    const [openSections, setOpenSections] = useState({
        template: !initialData, // 新規の場合はテンプレートセクションを開く
        basic: !!initialData, // 編集時は基本設定を開く
        questions: false,
        results: false,
        design: false,
        advanced: false
    });
    
    // プレビューのリセットキー
    const [previewKey, setPreviewKey] = useState(0);
    const resetPreview = () => setPreviewKey(k => k + 1);
    
    // モバイル用タブ切り替え（'editor' | 'preview'）
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

    const defaultForm = {
        title: "新規クイズ", 
        description: "説明文を入力...", 
        category: "Business", 
        color: "bg-indigo-600", 
        layout: "card", 
        image_url: "", 
        mode: "diagnosis",
        collect_email: false,
        show_in_portal: true,
        theme: "standard" as const,
        questions: Array(5).fill(null).map((_,i)=>({text:`質問${i+1}を入力してください`, options: Array(4).fill(null).map((_,j)=>({label:`選択肢${j+1}`, score:{A:j===0?3:0, B:j===1?3:0, C:j===2?3:0}}))})),
        results: [ 
            {type:"A", title:"結果A", description:"説明...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""}, 
            {type:"B", title:"結果B", description:"...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""}, 
            {type:"C", title:"結果C", description:"...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""} 
        ]
    };

    const [form, setForm] = useState(() => {
        if (!initialData) return defaultForm;
        return {
            ...defaultForm, 
            ...initialData, 
            results: initialData.results?.map((r: any) => ({
                link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: "", 
                ...r 
            })) || defaultForm.results
        };
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const applyPreset = (presetKey: keyof typeof USE_CASE_PRESETS) => {
        if(!confirm(`テンプレートを適用しますか？\n現在の入力内容は上書きされます。`)) return;
        const preset = USE_CASE_PRESETS[presetKey];
        setForm({ ...defaultForm, ...preset });
        setOpenSections({ template: false, basic: true, questions: false, results: false, design: false, advanced: false });
        resetPreview();
    };

    const switchMode = (newMode: string) => {
        let newResults = form.results;
        let newCategory = "Business";
        const templateResult = { link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"" };

        if (newMode === 'test') {
            newCategory = "Education";
            newResults = [
                { type: "A", title: "満点！天才！", description: "全問正解です。素晴らしい！", ...templateResult },
                { type: "B", title: "あと少し！", description: "惜しい、もう少しで満点です。", ...templateResult },
                { type: "C", title: "頑張ろう", description: "復習して再挑戦しましょう。", ...templateResult }
            ];
        } else if (newMode === 'fortune') {
            newCategory = "Fortune";
            newResults = [
                { type: "A", title: "大吉", description: "最高の運勢です！", ...templateResult },
                { type: "B", title: "中吉", description: "良いことがあるかも。", ...templateResult },
                { type: "C", title: "吉", description: "平凡こそ幸せ。", ...templateResult }
            ];
        } else {
            newCategory = "Business";
            newResults = [
                { type: "A", title: "結果A", description: "説明...", ...templateResult },
                { type: "B", title: "結果B", description: "...", ...templateResult },
                { type: "C", title: "結果C", description: "...", ...templateResult }
            ];
        }
        setForm({ ...form, mode: newMode, category: newCategory, results: newResults });
        resetPreview();
    };

    const handlePublish = (urlId: string) => { 
        if (!urlId) {
            alert('保存が完了していません。先に保存してください。');
            return;
        }
        const url = `${window.location.origin}/quiz/${urlId}`;
        navigator.clipboard.writeText(url); 
        alert(`公開URLをクリップボードにコピーしました！\n\n${url}`); 
    };

    const resetToDefault = () => {
        if(confirm('初期値に戻しますか？現在の入力内容は失われます。')) {
            setForm(defaultForm);
            resetPreview();
        }
    };

    const addQuestion = () => {
        if(form.questions.length >= 10) return alert('質問は最大10個までです');
        setForm({
            ...form,
            questions: [...form.questions, {text:`質問${form.questions.length+1}`, options: Array(4).fill(null).map((_,j)=>({label:`選択肢${j+1}`, score:{A:0, B:0, C:0}}))}]
        });
    };

    const removeQuestion = (index: number) => {
        if(form.questions.length <= 1) return alert('質問は最低1つ必要です');
        const newQuestions = form.questions.filter((_: any, i: number) => i !== index);
        setForm({...form, questions: newQuestions});
    };

    const addOption = (qIndex: number) => {
        const newQuestions = [...form.questions];
        if(newQuestions[qIndex].options.length >= 6) return alert('選択肢は最大6つまでです');
        newQuestions[qIndex].options.push({label:`選択肢${newQuestions[qIndex].options.length+1}`, score:{A:0, B:0, C:0}});
        setForm({...form, questions: newQuestions});
    };

    const removeOption = (qIndex: number, optIndex: number) => {
        const newQuestions = [...form.questions];
        if(newQuestions[qIndex].options.length <= 2) return alert('選択肢は最低2つ必要です');
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_: any, i: number) => i !== optIndex);
        setForm({...form, questions: newQuestions});
    };

    const addResult = () => {
        if(form.results.length >= 10) return alert('結果パターンは最大10個までです');
        const nextType = String.fromCharCode(65 + form.results.length);
        const templateResult = { link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"" };
        setForm({
            ...form,
            results: [...form.results, {type: nextType, title:`結果${nextType}`, description:"...", ...templateResult}]
        });
    };

    const removeResult = (index: number) => {
        if(form.results.length <= 2) return alert('結果パターンは最低2つ必要です');
        const newResults = form.results.filter((_: any, i: number) => i !== index);
        setForm({...form, results: newResults});
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!supabase) return alert("データベースに接続されていません");

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user?.id || 'anonymous'}/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('quiz-thumbnails').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('quiz-thumbnails').getPublicUrl(filePath);
            setForm({ ...form, image_url: data.publicUrl });
        } catch (error: any) {
            alert('アップロードエラー: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRandomImage = () => {
        const curatedImages = [
            "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80"
        ];
        const selected = curatedImages[Math.floor(Math.random() * curatedImages.length)];
        setForm({...form, image_url: selected});
    };

    const handleAiGenerate = async () => {
        if(!aiTheme) return alert('どんな診断を作りたいかテーマを入力してください');
        setIsGenerating(true);
        try {
            const existingResultTypes = form.results.map((r: any) => r.type);
            
            const res = await fetch("/api/generate-quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    theme: aiTheme,
                    mode: form.mode,
                    resultTypes: existingResultTypes
                })
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'API request failed');
            }
            
            const { data: json } = await res.json();
            
            const adjustedResults = json.results.map((r: any, idx: number) => ({
                ...r,
                type: existingResultTypes[idx] || r.type
            }));
            
            setForm((prev: any) => ({ 
                ...prev, 
                ...json,
                results: adjustedResults.map((r: any) => ({link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"", ...r}))
            })); 
            setOpenSections({ template: false, basic: true, questions: false, results: false, design: false, advanced: false });
            resetPreview();
            alert('AI生成が完了しました！');
        } catch(e: any) { 
            alert('AI生成エラー: ' + e.message); 
        } finally { 
            setIsGenerating(false); 
        }
    };

    const setCorrectOption = (qIndex: number, optIndex: number) => {
        const newQuestions = [...form.questions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.map((opt: any, idx: number) => ({
            ...opt,
            score: { A: idx === optIndex ? 1 : 0, B: 0, C: 0 } 
        }));
        setForm({...form, questions: newQuestions});
    };

    // 保存処理（内部で実装）
    const handleSave = async () => {
        if (!supabase) {
            alert('データベースに接続されていません');
            return;
        }

        // カスタムスラッグのバリデーション
        if (customSlug && !/^[a-z0-9-]{3,20}$/.test(customSlug)) {
            alert('カスタムURLの形式が正しくありません');
            return;
        }

        setIsSaving(true);
        
        try {
            const saveData = {
                title: form.title, 
                description: form.description, 
                category: form.category, 
                color: form.color,
                questions: form.questions, 
                results: form.results, 
                layout: form.layout || 'card', 
                image_url: form.image_url || null, 
                mode: form.mode || 'diagnosis',
                collect_email: form.collect_email || false,
                theme: form.theme || 'standard',
                show_in_portal: form.show_in_portal === undefined ? true : form.show_in_portal,
                user_id: user?.id || null
            };

            // 編集時のみ数値IDを渡す（テンプレートのtemplateIdは除外）
            const existingId = savedId || (initialData?.id && !initialData?.templateId ? initialData.id : null);
            
            let result;
            
            if (existingId) {
                // 更新
                const updateData: any = { ...saveData };
                if (regenerateSlug) {
                    updateData.slug = generateSlug();
                }
                
                const { data, error } = await supabase
                    .from('quizzes')
                    .update(updateData)
                    .eq('id', existingId)
                    .select()
                    .single();
                    
                if (error) throw error;
                result = data;
            } else {
                // 新規作成（カスタムスラッグがあればそれを使用、なければ自動生成）
                const newSlug = customSlug || generateSlug();
                const { data, error } = await supabase
                    .from('quizzes')
                    .insert({ ...saveData, slug: newSlug })
                    .select()
                    .single();
                    
                if (error) throw error;
                result = data;
                if (customSlug) setCustomSlug(''); // 保存後はクリア
            }
            
            if (result) {
                setSavedId(result.id);
                setSavedSlug(result.slug);
                
                // 新規作成時のみ開発支援モーダルを表示
                const isNewCreation = !initialData || (initialData.templateId && !initialData.id);
                if (isNewCreation && !savedId) {
                    setJustSavedQuizId(result.slug);
                    setShowDonationModal(true);
                } else {
                    alert('保存しました！');
                }
            }
        } catch (error: any) {
            console.error('保存エラー:', error);
            alert('保存に失敗しました: ' + (error.message || '不明なエラー'));
        } finally {
            setIsSaving(false);
        }
    };

    // プレビュー用のクイズデータを構築
    const previewQuizData = {
        ...form,
        slug: savedSlug || 'preview',
        id: savedId || 0
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
            {/* 保存成功時の完成モーダル */}
            {showDonationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-6 flex justify-between items-center z-10 rounded-t-2xl">
                            <div>
                                <h3 className="font-bold text-xl flex items-center gap-2">
                                    <Trophy size={24}/> 診断クイズを作成しました！
                                </h3>
                                <p className="text-sm text-indigo-100 mt-1">公開URLをコピーしてシェアできます</p>
                            </div>
                            <button onClick={() => setShowDonationModal(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                                <X size={24}/>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* 公開URL */}
                            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                                <p className="text-sm font-bold text-gray-700 mb-2">公開URL</p>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/quiz/${customSlug || justSavedQuizId}`}
                                        readOnly
                                        className="flex-1 text-xs bg-white border border-indigo-300 p-2 rounded-lg text-gray-900 font-bold"
                                    />
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/quiz/${customSlug || justSavedQuizId}`);
                                            alert('URLをコピーしました！');
                                        }}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors whitespace-nowrap"
                                    >
                                        <Copy size={16} className="inline mr-1"/> コピー
                                    </button>
                                </div>
                            </div>

                            {/* アクセスボタン */}
                            <button 
                                onClick={() => {
                                    setShowDonationModal(false);
                                    window.open(`/quiz/${customSlug || justSavedQuizId}`, '_blank');
                                }}
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
                            >
                                <ExternalLink size={20}/> 診断クイズにアクセス
                            </button>

                            {/* SNSでシェア */}
                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-3">SNSでシェア</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => {
                                            const url = `${window.location.origin}/quiz/${customSlug || justSavedQuizId}`;
                                            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(form.title + 'をやってみよう！')}`, '_blank');
                                        }}
                                        className="flex items-center justify-center gap-2 bg-[#1DA1F2] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                                    >
                                        X (Twitter)
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const url = `${window.location.origin}/quiz/${customSlug || justSavedQuizId}`;
                                            window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, '_blank');
                                        }}
                                        className="flex items-center justify-center gap-2 bg-[#06C755] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                                    >
                                        LINE
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const url = `${window.location.origin}/quiz/${customSlug || justSavedQuizId}`;
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                        }}
                                        className="flex items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                                    >
                                        Facebook
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const url = `${window.location.origin}/quiz/${customSlug || justSavedQuizId}`;
                                            if (navigator.share) {
                                                navigator.share({ title: form.title, url });
                                            } else {
                                                navigator.clipboard.writeText(url);
                                                alert('URLをコピーしました！');
                                            }
                                        }}
                                        className="flex items-center justify-center gap-2 bg-gray-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                                    >
                                        <Share2 size={18}/> その他
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-2">作成した診断クイズをSNSでシェアして、多くの人に見てもらいましょう！</p>
                            </div>

                            {/* QRコード表示ボタン */}
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        const url = `${window.location.origin}/quiz/${customSlug || justSavedQuizId}`;
                                        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`, '_blank');
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <QrCode size={18}/> QRコード表示
                                </button>
                            </div>

                            {/* 開発支援エリア */}
                            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-5">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="bg-orange-500 p-2 rounded-full">
                                        <Star size={20} className="text-white"/>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-base text-gray-900 mb-1 flex items-center gap-2">
                                            応援・開発支援でPro機能を開放
                                            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">オプション</span>
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            50円〜100,000円で、以下の追加機能が使えるようになります
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Download className="text-indigo-600" size={16}/>
                                            <span className="font-bold text-sm text-gray-900">HTMLダウンロード</span>
                                        </div>
                                        <p className="text-xs text-gray-600">自分のサーバーにアップロード可能</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Code className="text-indigo-600" size={16}/>
                                            <span className="font-bold text-sm text-gray-900">埋め込みコード</span>
                                        </div>
                                        <p className="text-xs text-gray-600">WordPressなどに埋め込み可能</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Star className="text-indigo-600" size={16}/>
                                            <span className="font-bold text-sm text-gray-900">優先サポート</span>
                                        </div>
                                        <p className="text-xs text-gray-600">機能改善の優先対応</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Plus className="text-indigo-600" size={16}/>
                                            <span className="font-bold text-sm text-gray-900">その他の機能</span>
                                        </div>
                                        <p className="text-xs text-gray-600">今後追加される機能も利用可能</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        setShowDonationModal(false);
                                        if (user && setPage) {
                                            setPage('dashboard');
                                        } else if (setShowAuth) {
                                            setShowAuth(true);
                                        }
                                    }}
                                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-3 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Menu size={18}/> マイページで開発支援・機能開放する
                                </button>
                                <p className="text-xs text-center text-gray-500 mt-2">
                                    ※開発支援は任意です。無料でもLPの公開・シェアは可能です
                                </p>
                            </div>

                            {/* 閉じるボタン */}
                            <button 
                                onClick={() => setShowDonationModal(false)}
                                className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ヘッダー - 共通ヘッダー(64px)の下に配置 */}
            <div className="bg-white border-b px-4 md:px-6 py-4 flex justify-between sticky top-16 z-40 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700"><ArrowLeft/></button>
                    <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
                        {initialData ? '編集' : '新規作成'}
                    </h2>
                    <span className={`hidden md:inline text-xs px-2 py-1 rounded font-bold ml-2 ${
                        form.mode === 'test' ? 'bg-orange-100 text-orange-700' : 
                        form.mode === 'fortune' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                        {form.mode === 'test' ? 'テスト' : form.mode === 'fortune' ? '占い' : '診断'}
                    </span>
                </div>
                <div className="flex gap-2">
                    {(savedSlug || justSavedQuizId) && (
                        <button onClick={() => setShowDonationModal(true)} className="hidden sm:flex bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:from-indigo-700 hover:to-purple-700 whitespace-nowrap transition-all shadow-md text-sm sm:text-base">
                            <Trophy size={16} className="sm:w-[18px] sm:h-[18px]"/> <span className="hidden md:inline">作成完了画面</span><span className="md:hidden">完了</span>
                        </button>
                    )}
                    {(savedSlug || initialData?.slug || customSlug) && (
                        <button onClick={() => handlePublish(customSlug || savedSlug || initialData?.slug)} className="hidden sm:flex bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 whitespace-nowrap text-sm sm:text-base">
                            <Share2 size={16} className="sm:w-[18px] sm:h-[18px]"/> <span className="hidden md:inline">公開URL</span><span className="md:hidden">URL</span>
                        </button>
                    )}
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="bg-indigo-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all whitespace-nowrap"
                    >
                        {isSaving ? <Loader2 className="animate-spin"/> : <Save/>} <span className="hidden sm:inline">保存</span>
                    </button>
                </div>
            </div>


            {/* モバイル用タブバー - 共通ヘッダー(64px) + エディターヘッダー(57px) = 121pxの下に配置 */}
            <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[121px] z-40">
                <div className="flex">
                    <button 
                        onClick={() => setMobileTab('editor')}
                        className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                            mobileTab === 'editor' 
                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Edit3 size={18}/> 編集
                    </button>
                    <button 
                        onClick={() => { setMobileTab('preview'); resetPreview(); }}
                        className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                            mobileTab === 'preview' 
                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Eye size={18}/> プレビュー
                    </button>
                </div>
            </div>

            {/* メインコンテンツ: 左（編集パネル） + 右（プレビュー） */}
            <div className="flex flex-1 overflow-hidden">
                {/* 左側: 編集パネル（モバイルではタブで切り替え） */}
                <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
                    <div className="max-w-2xl mx-auto space-y-4">
                        
                        {/* テンプレート・作成方法セクション */}
                        <Section 
                            title="テンプレート・作成方法" 
                            icon={Sparkles} 
                            isOpen={openSections.template} 
                            onToggle={() => toggleSection('template')}
                        >
                            {/* クイズモード選択 */}
                            <div className="mb-6">
                                <label className="text-sm font-bold text-gray-700 block mb-3">クイズの種類</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={()=>switchMode('diagnosis')} className={`p-3 rounded-lg border-2 font-bold text-sm flex flex-col items-center gap-1 transition-all ${form.mode==='diagnosis' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                                        <Briefcase size={20} className={form.mode==='diagnosis' ? 'text-indigo-600' : 'text-gray-400'}/>
                                        <span className={form.mode==='diagnosis' ? 'text-indigo-700' : 'text-gray-600'}>ビジネス診断</span>
                                    </button>
                                    <button onClick={()=>switchMode('test')} className={`p-3 rounded-lg border-2 font-bold text-sm flex flex-col items-center gap-1 transition-all ${form.mode==='test' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                                        <GraduationCap size={20} className={form.mode==='test' ? 'text-orange-600' : 'text-gray-400'}/>
                                        <span className={form.mode==='test' ? 'text-orange-700' : 'text-gray-600'}>学習テスト</span>
                                    </button>
                                    <button onClick={()=>switchMode('fortune')} className={`p-3 rounded-lg border-2 font-bold text-sm flex flex-col items-center gap-1 transition-all ${form.mode==='fortune' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}>
                                        <Sparkles size={20} className={form.mode==='fortune' ? 'text-purple-600' : 'text-gray-400'}/>
                                        <span className={form.mode==='fortune' ? 'text-purple-700' : 'text-gray-600'}>占い</span>
                                    </button>
                                </div>
                            </div>

                            {/* 用途別テンプレート */}
                            <div className="mb-6">
                                <label className="text-sm font-bold text-gray-700 block mb-3">用途別テンプレート</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => applyPreset('kindle')} className="p-3 rounded-lg border-2 border-amber-200 bg-amber-50 text-amber-700 font-bold text-sm hover:bg-amber-100 flex items-center gap-2">
                                        <BookOpen size={16}/> キンドル著者
                                    </button>
                                    <button onClick={() => applyPreset('instructor')} className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 flex items-center gap-2">
                                        <Users size={16}/> 講師
                                    </button>
                                    <button onClick={() => applyPreset('store')} className="p-3 rounded-lg border-2 border-green-200 bg-green-50 text-green-700 font-bold text-sm hover:bg-green-100 flex items-center gap-2">
                                        <Store size={16}/> 店舗
                                    </button>
                                    <button onClick={() => applyPreset('consultant')} className="p-3 rounded-lg border-2 border-purple-200 bg-purple-50 text-purple-700 font-bold text-sm hover:bg-purple-100 flex items-center gap-2">
                                        <Briefcase size={16}/> コンサル
                                    </button>
                                </div>
                            </div>

                            {/* AI生成 */}
                            <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                                <label className="text-sm font-bold text-purple-700 block mb-2 flex items-center gap-2">
                                    <Wand2 size={16}/> AIで自動生成
                                </label>
                                <textarea 
                                    className="w-full border-2 border-purple-200 p-3 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-white text-gray-900 placeholder-gray-400" 
                                    rows={2} 
                                    placeholder="例: 起業家タイプ診断、SNS発信力チェック..." 
                                    value={aiTheme} 
                                    onChange={e=>setAiTheme(e.target.value)} 
                                />
                                <button 
                                    onClick={handleAiGenerate} 
                                    disabled={isGenerating || !aiTheme} 
                                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? <><Loader2 className="animate-spin" size={18}/> 生成中...</> : <><Sparkles size={18}/> AIで自動生成する</>}
                                </button>
                            </div>

                            {/* 初期化 */}
                            <button onClick={resetToDefault} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition-all border border-gray-300">
                                初期値に戻す
                            </button>
                        </Section>

                        {/* 基本設定セクション */}
                        <Section 
                            title="基本設定" 
                            icon={Edit3} 
                            isOpen={openSections.basic} 
                            onToggle={() => toggleSection('basic')}
                        >
                            <Input label="タイトル" val={form.title} onChange={v=>{setForm({...form, title:v}); resetPreview();}} ph="例: あなたの起業家タイプ診断" />
                            <Textarea label="説明文" val={form.description} onChange={v=>{setForm({...form, description:v}); resetPreview();}} />
                            
                            <div className="mb-4">
                                <label className="text-sm font-bold text-gray-900 block mb-2">メイン画像（任意）</label>
                                <div className="flex flex-col md:flex-row gap-2">
                                    <input className="flex-grow border border-gray-300 p-3 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400" value={form.image_url||''} onChange={e=>setForm({...form, image_url:e.target.value})} placeholder="画像URL (https://...) またはアップロード"/>
                                    <label className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap">
                                        {isUploading ? <Loader2 className="animate-spin" size={16}/> : <UploadCloud size={16}/>}
                                        <span>アップロード</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading}/>
                                    </label>
                                    <button onClick={handleRandomImage} className="bg-gray-100 px-4 py-3 rounded-lg text-sm font-bold hover:bg-gray-200 flex items-center justify-center gap-1 whitespace-nowrap"><ImageIcon size={16}/> 自動</button>
                                </div>
                                {form.image_url && <img src={form.image_url} alt="Preview" className="h-32 w-full object-cover rounded-lg mt-2 border"/>}
                            </div>
                        </Section>

                        {/* デザインセクション */}
                        <Section 
                            title="デザイン" 
                            icon={Palette} 
                            isOpen={openSections.design} 
                            onToggle={() => toggleSection('design')}
                        >
                            <div className="mb-4">
                                <label className="text-sm font-bold text-gray-900 block mb-2">表示レイアウト</label>
                                <div className="flex gap-2">
                                    <button onClick={()=>{setForm({...form, layout:'card'}); resetPreview();}} className={`flex-1 py-3 rounded-lg font-bold text-sm border flex items-center justify-center gap-2 ${form.layout==='card' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                                        <Layout size={16}/> カード
                                    </button>
                                    <button onClick={()=>{setForm({...form, layout:'chat'}); resetPreview();}} className={`flex-1 py-3 rounded-lg font-bold text-sm border flex items-center justify-center gap-2 ${form.layout==='chat' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                                        <MessageCircle size={16}/> チャット
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-900 block mb-2">デザインテーマ</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'standard', name: 'スタンダード', color: 'bg-indigo-600', desc: 'シンプル' },
                                        { id: 'cyberpunk', name: 'サイバーパンク', color: 'bg-black', desc: '未来的', border: 'border-green-500' },
                                        { id: 'japanese', name: '和風・雅', color: 'bg-red-800', desc: '伝統的' },
                                        { id: 'pastel', name: 'パステルポップ', color: 'bg-gradient-to-r from-pink-300 to-purple-300', desc: '優しい' },
                                        { id: 'monochrome', name: 'モノトーン', color: 'bg-gray-900', desc: 'クール' }
                                    ].map(theme => (
                                        <button 
                                            key={theme.id} 
                                            onClick={()=>{setForm({...form, color:theme.color, theme: theme.id}); resetPreview();}} 
                                            className={`p-3 rounded-lg border-2 text-left transition-all ${form.theme===theme.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-4 h-4 rounded-full ${theme.color} ${theme.border || ''}`}></div>
                                                <span className="font-bold text-sm">{theme.name}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{theme.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Section>

                        {/* 質問セクション */}
                        <Section 
                            title="質問" 
                            icon={MessageSquare} 
                            isOpen={openSections.questions} 
                            onToggle={() => toggleSection('questions')}
                            badge={`${form.questions.length}問`}
                        >
                            <div className="space-y-4">
                                {form.questions.map((q: any, i: number)=>(
                                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                                        <button onClick={()=>removeQuestion(i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                        <div className="font-bold text-indigo-600 mb-2 text-sm">Q{i+1}</div>
                                        <input 
                                            className="w-full border border-gray-300 p-2 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white mb-3 text-sm" 
                                            value={q.text} 
                                            onChange={v=>{const n=[...form.questions];n[i].text=v.target.value;setForm({...form, questions:n});}} 
                                            placeholder="質問文を入力..."
                                        />
                                        
                                        {form.mode === 'test' && (
                                            <p className="text-xs text-orange-600 font-bold mb-2 flex items-center gap-1">
                                                <CheckCircle size={12}/> 正解を1つチェックしてください
                                            </p>
                                        )}
                                        
                                        <div className="space-y-2">
                                            {q.options.map((o: any, j: number)=>(
                                                <div key={j} className="bg-white p-2 rounded border border-gray-200 flex items-center gap-2">
                                                    <button onClick={()=>removeOption(i, j)} className="text-gray-300 hover:text-red-500"><Trash2 size={12}/></button>
                                                    <input className="flex-grow p-1 outline-none text-sm text-gray-900" value={o.label} onChange={e=>{const n=[...form.questions];n[i].options[j].label=e.target.value;setForm({...form, questions:n});}} placeholder={`選択肢${j+1}`} />
                                                    
                                                    {form.mode === 'test' && (
                                                        <button onClick={()=>setCorrectOption(i, j)} className={`w-6 h-6 rounded-full flex items-center justify-center ${o.score.A === 1 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-300'}`}><CheckCircle size={12}/></button>
                                                    )}
                                                    
                                                    {form.mode === 'diagnosis' && (
                                                        <div className="flex gap-1 flex-wrap">
                                                            {form.results.map((r: any) => (
                                                                <div key={r.type} className="flex flex-col items-center">
                                                                    <span className="text-[10px] text-gray-400 font-bold">{r.type}</span>
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-10 bg-gray-50 border border-gray-200 text-center text-xs rounded text-gray-900 py-1" 
                                                                        value={o.score[r.type] || 0} 
                                                                        onChange={e=>{const n=[...form.questions];n[i].options[j].score[r.type]=parseInt(e.target.value)||0;setForm({...form, questions:n});}} 
                                                                        title={`${r.title}(${r.type})のスコア`}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <button onClick={()=>addOption(i)} className="w-full py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded flex items-center justify-center gap-1"><Plus size={12}/> 選択肢追加</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addQuestion} className="w-full py-3 bg-white border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2"><Plus size={16}/> 質問を追加</button>
                            </div>
                        </Section>

                        {/* 結果セクション */}
                        <Section 
                            title="結果パターン" 
                            icon={Trophy} 
                            isOpen={openSections.results} 
                            onToggle={() => toggleSection('results')}
                            badge={`${form.results.length}パターン`}
                        >
                            <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${form.mode==='test'?'bg-orange-50 text-orange-800':form.mode==='fortune'?'bg-purple-50 text-purple-800':'bg-blue-50 text-blue-800'}`}>
                                💡 {form.mode === 'test' ? "正解数に応じて結果が変わります" : form.mode === 'fortune' ? "結果はランダムに表示されます" : "獲得ポイントが多いタイプの結果が表示されます"}
                            </div>
                            
                            <div className="space-y-4">
                                {form.results.map((r: any, i: number)=>(
                                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                                        <button onClick={()=>removeResult(i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                        <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold inline-block mb-3">
                                            {form.mode === 'test' ? `ランク ${i+1}` : `パターン ${r.type}`}
                                        </div>
                                        <Input label="タイトル" val={r.title} onChange={v=>{const n=[...form.results];n[i].title=v;setForm({...form, results:n});}} />
                                        <Textarea label="説明文" val={r.description} onChange={v=>{const n=[...form.results];n[i].description=v;setForm({...form, results:n});}}/>
                                        
                                        {/* 誘導ボタン設定 */}
                                        <details className="bg-white p-3 rounded-lg border border-gray-200 mt-3">
                                            <summary className="text-sm font-bold text-gray-700 cursor-pointer flex items-center gap-2">
                                                <Link size={14}/> 誘導ボタン設定（任意）
                                            </summary>
                                            <div className="mt-3 space-y-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input label="リンク先URL" val={r.link_url} onChange={v=>{const n=[...form.results];n[i].link_url=v;setForm({...form, results:n});}} ph="https://..." />
                                                    <Input label="ボタン文言" val={r.link_text} onChange={v=>{const n=[...form.results];n[i].link_text=v;setForm({...form, results:n});}} ph="詳細を見る" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input label="LINE登録URL" val={r.line_url} onChange={v=>{const n=[...form.results];n[i].line_url=v;setForm({...form, results:n});}} ph="https://line.me/..." />
                                                    <Input label="ボタン文言" val={r.line_text} onChange={v=>{const n=[...form.results];n[i].line_text=v;setForm({...form, results:n});}} ph="LINEで相談" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input label="LINE QR画像URL" val={r.qr_url} onChange={v=>{const n=[...form.results];n[i].qr_url=v;setForm({...form, results:n});}} ph="https://..." />
                                                    <Input label="ボタン文言" val={r.qr_text} onChange={v=>{const n=[...form.results];n[i].qr_text=v;setForm({...form, results:n});}} ph="QRコードを表示" />
                                                </div>
                                            </div>
                                        </details>
                                    </div>
                                ))}
                                <button onClick={addResult} className="w-full py-3 bg-white border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2"><Plus size={16}/> 結果パターンを追加</button>
                            </div>
                        </Section>

                        {/* 高度な設定セクション */}
                        <Section 
                            title="高度な設定" 
                            icon={FileText} 
                            isOpen={openSections.advanced} 
                            onToggle={() => toggleSection('advanced')}
                        >
                            {/* ポータル掲載 */}
                            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-1">
                                        <Star size={18} className="text-indigo-600"/> ポータルに掲載する
                                    </h4>
                                    <p className="text-xs text-indigo-700">
                                        ポータルに掲載することで、サービスの紹介およびSEO対策、AI対策として効果的となります。より多くの方にあなたの診断クイズを体験してもらえます。
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={form.show_in_portal === undefined ? true : form.show_in_portal} 
                                        onChange={e => setForm({...form, show_in_portal: e.target.checked})} 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            {/* カスタムURL */}
                            <div className="mb-4">
                                <label className="text-sm font-bold text-gray-900 block mb-2">
                                    カスタムURL（任意）
                                </label>
                                <input 
                                    className={`w-full border p-3 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder-gray-400 transition-shadow ${slugError ? 'border-red-400' : 'border-gray-300'} ${initialData?.nickname ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    value={customSlug} 
                                    onChange={e => {
                                        const val = e.target.value;
                                        setCustomSlug(val);
                                        if (val && !/^[a-z0-9-]{3,20}$/.test(val)) {
                                            setSlugError('英小文字、数字、ハイフンのみ（3〜20文字）');
                                        } else {
                                            setSlugError('');
                                        }
                                    }} 
                                    placeholder="my-quiz"
                                    disabled={!!initialData?.nickname}
                                />
                                {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
                                <p className="text-xs text-gray-500 mt-1">
                                    例: my-quiz, test-001<br/>
                                    ※英小文字、数字、ハイフンのみ（3〜20文字）。一度設定すると変更できません。
                                </p>
                                {customSlug && !slugError && (
                                    <p className="text-xs text-indigo-600 mt-1">
                                        公開URL: {typeof window !== 'undefined' ? window.location.origin : ''}/quiz/{customSlug}
                                    </p>
                                )}
                            </div>

                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="font-bold text-green-900 flex items-center gap-2"><Mail size={18}/> リード獲得機能</h4>
                                    <p className="text-xs text-green-700 mt-1">結果表示の前にメールアドレスの入力を求めます。</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={form.collect_email} onChange={e=>setForm({...form, collect_email: e.target.checked})} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            {initialData && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-amber-900 flex items-center gap-2">公開URLを再発行</h4>
                                        <p className="text-xs text-amber-700 mt-1">チェックすると保存時に新しいURLが発行されます。</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={regenerateSlug} onChange={e=>setRegenerateSlug(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                    </label>
                                </div>
                            )}
                        </Section>

                        {/* 保存ボタン（下部） */}
                        <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving} 
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md text-lg"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>} 
                                {savedId || initialData?.id ? '更新して保存' : '保存して公開'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 右側: リアルタイムプレビュー（モバイルではタブで切り替え） */}
                {/* PC: position:fixedで右半分に固定（トップヘッダー64px + エディタヘッダー分 = 138px下にオフセット） */}
                <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
                    {/* PC用ヘッダー */}
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
                            <RefreshCw size={14}/> リセット
                        </button>
                    </div>
                    {/* モバイル用ヘッダー */}
                    <div className="lg:hidden bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                        <span className="text-white font-bold text-sm">プレビュー</span>
                        <button 
                            onClick={resetPreview}
                            className="text-gray-400 hover:text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-gray-700 transition-colors"
                        >
                            <RefreshCw size={14}/> リセット
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                            <QuizPlayer 
                                key={previewKey}
                                quiz={previewQuizData}
                                isPreview={true}
                            />
                        </div>
                    </div>
                </div>
                {/* PC用：右側のfixed領域分のスペーサー（背景色を左側と揃える） */}
                <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
            </div>
        </div>
    );
};

export default Editor;
