import React, { useState, useEffect } from 'react';
import { 
    Edit3, MessageSquare, Trophy, Loader2, Save, Share2, 
    Sparkles, Wand2, BookOpen, Image as ImageIcon, 
    Layout, MessageCircle, ArrowLeft, Briefcase, GraduationCap, 
    CheckCircle, Shuffle, Plus, Trash2, X, Link, QrCode, UploadCloud, Mail, FileText, ChevronDown, RefreshCw, Eye, 
    ShoppingCart, Gift, Download, Code, Users, Star, Copy, ExternalLink, Store, Menu, ChevronLeft, Palette
} from 'lucide-react';
import { generateSlug } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { QUIZ_THEMES, QUIZ_THEME_IDS, getQuizTheme } from '../../constants/quizThemes';

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

// --- プリセットデータ定義 ---
const PRESETS = {
    business: [
        { label: "ビジネス診断のクイズテンプレート", data: null },
        { 
            label: "起業家タイプ診断", 
            data: {
                title: "あなたの「起業家タイプ」診断",
                description: "あなたの性格や行動パターンから、最適な起業スタイル（リーダー型、参謀型、職人型など）を診断します。",
                mode: "diagnosis", category: "Business", color: "bg-indigo-600",
                questions: [
                    {text: "トラブルが発生！まずどう動く？", options: [{label: "全体への指示出し", score: {A:3,B:0,C:0}}, {label: "困っている人のケア", score: {A:0,B:3,C:0}}, {label: "解決策を考案", score: {A:0,B:0,C:3}}, {label: "静観する", score: {A:1,B:1,C:1}}]},
                    {text: "新しいプロジェクト、何から始める？", options: [{label: "ゴール設定", score: {A:3,B:0,C:0}}, {label: "チーム編成", score: {A:0,B:3,C:0}}, {label: "アイデア出し", score: {A:0,B:0,C:3}}, {label: "予算確保", score: {A:1,B:1,C:1}}]},
                    {text: "褒められて嬉しい言葉は？", options: [{label: "頼れるね！", score: {A:3,B:0,C:0}}, {label: "助かったよ！", score: {A:0,B:3,C:0}}, {label: "天才だね！", score: {A:0,B:0,C:3}}, {label: "仕事早いね！", score: {A:1,B:1,C:1}}]},
                    {text: "会議での役割は？", options: [{label: "進行役", score: {A:3,B:0,C:0}}, {label: "調整役", score: {A:0,B:3,C:0}}, {label: "意見出し", score: {A:0,B:0,C:3}}, {label: "書記", score: {A:0,B:1,C:1}}]},
                    {text: "休日の過ごし方は？", options: [{label: "予定通り行動", score: {A:3,B:0,C:0}}, {label: "友人と交流", score: {A:0,B:3,C:0}}, {label: "趣味に没頭", score: {A:0,B:0,C:3}}, {label: "寝る", score: {A:0,B:0,C:0}}]}
                ],
                results: [
                    {type: "A", title: "統率者タイプ (リーダー)", description: "あなたには人を導く天性のカリスマがあります。全体を俯瞰し、決断するスピードはピカイチ。起業やマネジメントで才能が開花します。"},
                    {type: "B", title: "調和者タイプ (サポーター)", description: "あなたは組織の潤滑油となる重要な存在です。人の感情の機微に聡く、モチベーション管理が得意です。HRやカスタマーサクセスで活躍できます。"},
                    {type: "C", title: "革新者タイプ (クリエイター)", description: "あなたは常識にとらわれないアイデアマンです。0から1を生み出すことに喜びを感じます。ルーチンワークは苦手ですが、企画職や開発職で輝きます。"}
                ]
            }
        },
        {
            label: "SNS発信力レベル診断",
            data: {
                title: "SNS発信力レベル診断",
                description: "なぜフォロワーが増えないのか？あなたの運用スキルを辛口判定します。",
                mode: "diagnosis", category: "Business", color: "bg-pink-500",
                questions: [
                    {text: "投稿作成にかける時間は？", options: [{label: "10分以内", score: {A:0,B:1,C:0}}, {label: "30分〜1時間", score: {A:0,B:2,C:1}}, {label: "数時間", score: {A:0,B:0,C:3}}, {label: "気分次第", score: {A:1,B:0,C:0}}]},
                    {text: "分析ツールは見てる？", options: [{label: "見方が不明", score: {A:3,B:0,C:0}}, {label: "たまに見る", score: {A:0,B:3,C:1}}, {label: "毎日分析", score: {A:0,B:0,C:3}}, {label: "数字は気にしない", score: {A:2,B:0,C:0}}]},
                    {text: "他人の投稿への反応は？", options: [{label: "見るだけ", score: {A:2,B:0,C:0}}, {label: "いいねのみ", score: {A:0,B:2,C:0}}, {label: "引用RT・コメント", score: {A:0,B:1,C:3}}, {label: "無視", score: {A:1,B:0,C:0}}]},
                    {text: "発信の目的は？", options: [{label: "なんとなく", score: {A:3,B:0,C:0}}, {label: "認知拡大", score: {A:0,B:3,C:1}}, {label: "リスト獲得", score: {A:0,B:0,C:3}}, {label: "承認欲求", score: {A:1,B:1,C:0}}]},
                    {text: "プロフ更新頻度は？", options: [{label: "初期のまま", score: {A:3,B:0,C:0}}, {label: "たまに", score: {A:0,B:2,C:1}}, {label: "頻繁に改善", score: {A:0,B:0,C:3}}, {label: "変え方が不明", score: {A:2,B:0,C:0}}]}
                ],
                results: [
                    {type: "A", title: "初心者 (趣味レベル)", description: "まだSNSのパワーを活かしきれていません。「日記」ではなく「誰かの役に立つ情報」を発信することから始めましょう。"},
                    {type: "B", title: "中級者 (あと一歩！)", description: "良い発信をしていますが、少しムラがあるようです。ターゲットを一人に絞り、分析ツールを使って「伸びた投稿」の傾向を掴みましょう。"},
                    {type: "C", title: "プロ級 (インフルエンサー)", description: "素晴らしい！SNSの本質を理解しています。次は「自動化」や「収益化」のフェーズです。LINE公式アカウントへの誘導を強化しましょう。"}
                ]
            }
        },
        {
            label: "副業適性チェック",
            data: {
                title: "あなたの「副業適性」チェック",
                description: "あなたに合った副業は物販？アフィリエイト？コンテンツ販売？",
                mode: "diagnosis", category: "Business", color: "bg-blue-500",
                questions: [
                    {text: "使える初期資金は？", options: [{label: "ほぼゼロ", score: {A:1,B:3,C:2}}, {label: "数万円", score: {A:2,B:2,C:2}}, {label: "投資可", score: {A:3,B:1,C:3}}, {label: "借金してでも", score: {A:3,B:0,C:3}}]},
                    {text: "文章を書くのは？", options: [{label: "苦手", score: {A:3,B:0,C:1}}, {label: "普通", score: {A:2,B:3,C:2}}, {label: "得意", score: {A:0,B:3,C:3}}, {label: "読む専門", score: {A:2,B:0,C:0}}]},
                    {text: "在庫リスクは？", options: [{label: "絶対イヤ", score: {A:0,B:3,C:3}}, {label: "多少なら", score: {A:2,B:2,C:2}}, {label: "管理できる", score: {A:3,B:0,C:0}}, {label: "倉庫借りる", score: {A:3,B:0,C:0}}]},
                    {text: "作業スタイルは？", options: [{label: "すぐ結果が欲しい", score: {A:3,B:0,C:1}}, {label: "コツコツ継続", score: {A:1,B:3,C:2}}, {label: "仕組み化したい", score: {A:1,B:2,C:3}}, {label: "飽きっぽい", score: {A:2,B:0,C:0}}]},
                    {text: "人との関わりは？", options: [{label: "一人がいい", score: {A:2,B:3,C:1}}, {label: "SNSなら", score: {A:1,B:2,C:2}}, {label: "ガンガン関わる", score: {A:1,B:1,C:3}}, {label: "AI相手がいい", score: {A:1,B:3,C:2}}]}
                ],
                results: [
                    {type: "A", title: "転売・ポイ活 (即金重視)", description: "まずはフリマアプリやポイ活など、確実に現金化できる副業がおすすめ。リスクを取らず「ネットで1円を稼ぐ」経験を積みましょう。"},
                    {type: "B", title: "ブログ・アフィリエイト (資産型)", description: "ブログやアフィリエイトが向いています。最初の収益化までは時間がかかりますが、忍耐強く継続できれば将来の不労所得になります。"},
                    {type: "C", title: "コンテンツ販売 (起業型)", description: "自分の知識や経験を商品化する「コンテンツ販売」が最適です。noteやBrainでの販売や、コンサルティングで高利益を目指せます。"}
                ]
            }
        }
    ],
    education: [
        { label: "学習テストのクイズテンプレート", data: null },
        { 
            label: "確定申告「経費」クイズ", 
            data: {
                title: "確定申告「経費」クイズ",
                description: "これって経費になる？ならない？フリーランス1年目必見の○×テスト。",
                mode: "test", category: "Education", color: "bg-gray-800",
                questions: [
                    {text: "一人カフェでのコーヒー代は？", options: [{label: "なる", score: {A:1}}, {label: "ならない", score: {A:0}}, {label: "半額", score: {A:0}}, {label: "時価", score: {A:0}}]},
                    {text: "仕事用のスーツ代は？", options: [{label: "なる", score: {A:0}}, {label: "ならない", score: {A:1}}, {label: "靴ならOK", score: {A:0}}, {label: "全額OK", score: {A:0}}]},
                    {text: "取引先との接待ゴルフは？", options: [{label: "なる", score: {A:1}}, {label: "ならない", score: {A:0}}, {label: "飲食のみ", score: {A:0}}, {label: "1割負担", score: {A:0}}]},
                    {text: "自宅オフィスの家賃全額は？", options: [{label: "なる", score: {A:0}}, {label: "ならない", score: {A:1}}, {label: "50%固定", score: {A:0}}, {label: "大家次第", score: {A:0}}]},
                    {text: "健康診断の費用は？", options: [{label: "なる", score: {A:0}}, {label: "ならない", score: {A:1}}, {label: "福利厚生", score: {A:0}}, {label: "経費", score: {A:0}}]}
                ],
                results: [
                    {type: "A", title: "税理士レベル (高得点)", description: "完璧です！税金の仕組みをよく理解しています。無駄な税金を払わず、賢く手残りを増やしていきましょう。"},
                    {type: "B", title: "勉強中 (中得点)", description: "基本はわかっていますが、グレーゾーンの判断が危ういです。間違った申告は追徴課税のリスクがあります。"},
                    {type: "C", title: "危険信号 (低得点)", description: "知識不足です！プライベートな出費まで経費にしていませんか？まずは簿記3級レベルの知識をつけましょう。"}
                ]
            }
        },
        {
            label: "中学英語「前置詞」",
            data: {
                title: "中学英語「前置詞」完全攻略",
                description: "in, on, at の使い分け、本当に理解してる？",
                mode: "test", category: "Education", color: "bg-orange-500",
                questions: [
                    {text: "I was born __ 1990.", options: [{label: "in", score: {A:1}}, {label: "on", score: {A:0}}, {label: "at", score: {A:0}}, {label: "to", score: {A:0}}]},
                    {text: "See you __ Monday.", options: [{label: "in", score: {A:0}}, {label: "on", score: {A:1}}, {label: "at", score: {A:0}}, {label: "of", score: {A:0}}]},
                    {text: "The party starts __ 7 PM.", options: [{label: "in", score: {A:0}}, {label: "on", score: {A:0}}, {label: "at", score: {A:1}}, {label: "by", score: {A:0}}]},
                    {text: "He is good __ tennis.", options: [{label: "in", score: {A:0}}, {label: "on", score: {A:0}}, {label: "at", score: {A:1}}, {label: "for", score: {A:0}}]},
                    {text: "The cat is __ the table.", options: [{label: "in", score: {A:0}}, {label: "on", score: {A:1}}, {label: "at", score: {A:0}}, {label: "to", score: {A:0}}]}
                ],
                results: [
                    {type: "A", title: "ネイティブ級", description: "完璧です！前置詞のイメージがしっかりと頭に入っています。"},
                    {type: "B", title: "あと一歩", description: "時間や場所の基本的な使い分けはできていますが、熟語になると迷いがあるようです。"},
                    {type: "C", title: "要復習", description: "残念ながら基礎があやふやです。in=中、on=接触、at=点のイメージを復習しましょう。"}
                ]
            }
        },
        {
            label: "AIリテラシー検定",
            data: {
                title: "AIリテラシー検定",
                description: "ChatGPT時代の必須用語チェック！",
                mode: "test", category: "Education", color: "bg-indigo-600",
                questions: [
                    {text: "ChatGPTのベース技術は？", options: [{label: "LLM", score: {A:1}}, {label: "NFT", score: {A:0}}, {label: "VR", score: {A:0}}, {label: "IoT", score: {A:0}}]},
                    {text: "AIへの命令文は？", options: [{label: "スクリプト", score: {A:0}}, {label: "プロンプト", score: {A:1}}, {label: "コマンド", score: {A:0}}, {label: "オーダー", score: {A:0}}]},
                    {text: "画像生成AIでないのは？", options: [{label: "Midjourney", score: {A:0}}, {label: "Stable Diffusion", score: {A:0}}, {label: "Excel", score: {A:1}}, {label: "DALL-E", score: {A:0}}]},
                    {text: "AIが嘘をつく現象は？", options: [{label: "バグ", score: {A:0}}, {label: "ハルシネーション", score: {A:1}}, {label: "エラー", score: {A:0}}, {label: "フェイク", score: {A:0}}]},
                    {text: "ChatGPTの開発元は？", options: [{label: "Google", score: {A:0}}, {label: "OpenAI", score: {A:1}}, {label: "Meta", score: {A:0}}, {label: "Microsoft", score: {A:0}}]}
                ],
                results: [
                    {type: "A", title: "AIマスター", description: "最新技術を完璧に追えています。業務効率を劇的に上げることができる人材です。"},
                    {type: "B", title: "一般ユーザー", description: "ニュースレベルの知識はあります。実際にツールを使いこなすには実践が必要です。"},
                    {type: "C", title: "化石化注意", description: "危険です。時代に取り残されています。今すぐChatGPTを触ってみましょう。"}
                ]
            }
        }
    ],
    fortune: [
        { label: "占いのクイズテンプレート", data: null },
        { 
            label: "今日の「推し活」運勢", 
            data: {
                title: "今日の「推し活」運勢",
                description: "推しがいる全人類へ。今日の運勢を占います。",
                mode: "fortune", category: "Fortune", color: "bg-pink-500",
                questions: [
                    {text: "推しの尊さを一言で！", options: [{label: "天使", score: {A:0,B:0,C:0}}, {label: "神", score: {A:0,B:0,C:0}}, {label: "宇宙", score: {A:0,B:0,C:0}}, {label: "酸素", score: {A:0,B:0,C:0}}]},
                    {text: "グッズは？", options: [{label: "保存用も買う", score: {A:0,B:0,C:0}}, {label: "使う分だけ", score: {A:0,B:0,C:0}}, {label: "厳選する", score: {A:0,B:0,C:0}}, {label: "祭壇がある", score: {A:0,B:0,C:0}}]},
                    {text: "遠征はする？", options: [{label: "地球の裏側まで", score: {A:0,B:0,C:0}}, {label: "国内なら", score: {A:0,B:0,C:0}}, {label: "近場のみ", score: {A:0,B:0,C:0}}, {label: "在宅勢", score: {A:0,B:0,C:0}}]},
                    {text: "推し色は？", options: [{label: "暖色系", score: {A:0,B:0,C:0}}, {label: "寒色系", score: {A:0,B:0,C:0}}, {label: "モノトーン", score: {A:0,B:0,C:0}}, {label: "その他", score: {A:0,B:0,C:0}}]},
                    {text: "最後に一言！", options: [{label: "一生推す", score: {A:0,B:0,C:0}}, {label: "ありがとう", score: {A:0,B:0,C:0}}, {label: "結婚して", score: {A:0,B:0,C:0}}, {label: "生きてて偉い", score: {A:0,B:0,C:0}}]}
                ],
                results: [
                    {type: "A", title: "大吉 (神席確定!?)", description: "最高の運気です！チケット運、グッズ運ともに最強。推しからのファンサがもらえる予感。"},
                    {type: "B", title: "中吉 (供給過多)", description: "嬉しいニュースが飛び込んでくるかも。メディア出演や新曲発表など、嬉しい悲鳴をあげる一日に。"},
                    {type: "C", title: "小吉 (沼の深み)", description: "今日は過去の映像を見返すと吉。初心にかえり、尊さを噛み締めましょう。散財には注意。"}
                ]
            }
        },
        {
            label: "あなたの「オーラカラー」",
            data: {
                title: "あなたの「オーラカラー」診断",
                description: "性格からあなたの魂の色を導き出します。",
                mode: "diagnosis", category: "Fortune", color: "bg-purple-600",
                questions: [
                    {text: "好きな季節は？", options: [{label: "夏", score: {A:3,B:0,C:0}}, {label: "冬", score: {A:0,B:3,C:0}}, {label: "春秋", score: {A:0,B:0,C:3}}, {label: "特になし", score: {A:1,B:1,C:1}}]},
                    {text: "悩み事は？", options: [{label: "すぐ相談", score: {A:0,B:0,C:3}}, {label: "一人で考える", score: {A:0,B:3,C:0}}, {label: "寝て忘れる", score: {A:3,B:0,C:0}}, {label: "検索する", score: {A:1,B:1,C:1}}]},
                    {text: "直感は？", options: [{label: "信じる", score: {A:3,B:0,C:0}}, {label: "信じない", score: {A:0,B:3,C:0}}, {label: "場合による", score: {A:0,B:0,C:3}}, {label: "占いなら", score: {A:1,B:1,C:1}}]},
                    {text: "旅行先は？", options: [{label: "リゾート", score: {A:3,B:0,C:0}}, {label: "古都", score: {A:0,B:3,C:0}}, {label: "都会", score: {A:0,B:0,C:3}}, {label: "秘境", score: {A:2,B:1,C:0}}]},
                    {text: "人混みは？", options: [{label: "大好き", score: {A:3,B:0,C:0}}, {label: "苦手", score: {A:0,B:3,C:0}}, {label: "普通", score: {A:0,B:0,C:3}}, {label: "知人がいれば", score: {A:1,B:1,C:1}}]}
                ],
                results: [
                    {type: "A", title: "情熱のレッド", description: "燃えるようなエネルギーの持ち主。行動力があり、周囲を巻き込んで進むリーダータイプです。"},
                    {type: "B", title: "知性のブルー", description: "冷静沈着で深い知性を持ちます。論理的に考え、信頼されるアドバイザータイプ。"},
                    {type: "C", title: "無邪気なイエロー", description: "天真爛漫で、いるだけで場が明るくなるムードメーカー。好奇心旺盛で新しいものが大好き。"}
                ]
            }
        },
        {
            label: "前世の職業占い",
            data: {
                title: "前世の職業占い",
                description: "あなたの魂の記憶から前世を占います。",
                mode: "fortune", category: "Fortune", color: "bg-indigo-900",
                questions: [
                    {text: "古い建物を見ると？", options: [{label: "懐かしい", score: {A:0,B:0,C:0}}, {label: "怖い", score: {A:0,B:0,C:0}}, {label: "無関心", score: {A:0,B:0,C:0}}, {label: "住みたい", score: {A:0,B:0,C:0}}]},
                    {text: "得意科目は？", options: [{label: "体育", score: {A:0,B:0,C:0}}, {label: "国語", score: {A:0,B:0,C:0}}, {label: "数学", score: {A:0,B:0,C:0}}, {label: "歴史", score: {A:0,B:0,C:0}}]},
                    {text: "海と山どっち？", options: [{label: "海", score: {A:0,B:0,C:0}}, {label: "山", score: {A:0,B:0,C:0}}, {label: "両方", score: {A:0,B:0,C:0}}, {label: "どっちも嫌", score: {A:0,B:0,C:0}}]},
                    {text: "夢を見る？", options: [{label: "毎日", score: {A:0,B:0,C:0}}, {label: "たまに", score: {A:0,B:0,C:0}}, {label: "忘れた", score: {A:0,B:0,C:0}}, {label: "見ない", score: {A:0,B:0,C:0}}]},
                    {text: "直感で選ぶ色は？", options: [{label: "金", score: {A:0,B:0,C:0}}, {label: "銀", score: {A:0,B:0,C:0}}, {label: "赤", score: {A:0,B:0,C:0}}, {label: "黒", score: {A:0,B:0,C:0}}]}
                ],
                results: [
                    {type: "A", title: "王族・貴族", description: "国を治める立場にありました。プライドが高く、リーダーシップを発揮し多くの人を導く使命を持っています。"},
                    {type: "B", title: "職人・芸術家", "description": "黙々と一つの道を極める職人でした。こだわりが強く、妥協を許さない性格。クリエイティブな分野で才能を発揮します。"},
                    {type: "C", title: "旅人・商人", description: "世界中を旅して回っていました。束縛を嫌い自由を愛する心はそこから来ています。変化を恐れず挑戦しましょう。"}
                ]
            }
        }
    ]
};

// --- Input Components ---
const Input = ({label, val, onChange, ph}) => (
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

const Textarea = ({label, val, onChange}) => (
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

const Editor = ({ onBack, onSave, initialData, setPage, user, setShowAuth, isAdmin }) => {
  const [currentStep, setCurrentStep] = useState(initialData ? 2 : 1); // 編集時はステップ2から
  
  useEffect(() => { 
    document.title = "クイズ作成・編集 | 診断クイズメーカー"; 
    window.scrollTo(0, 0);
    
    // 用途別テンプレートIDが渡された場合、テンプレートを適用
    if (initialData?.templateId && USE_CASE_PRESETS[initialData.templateId]) {
      const preset = USE_CASE_PRESETS[initialData.templateId];
      setForm({ ...defaultForm, ...preset });
      // ステップ2（基本設定）に進む
      setCurrentStep(2);
    }
  }, []);

  // ステップ遷移時にスクロール位置を最上位に戻す
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);  // 数値ID（データベースのid）
  const [savedSlug, setSavedSlug] = useState(null);  // 文字列slug（公開URL用）
  const [aiTheme, setAiTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [regenerateSlug, setRegenerateSlug] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);
  const [hideLoginBanner, setHideLoginBanner] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [justSavedQuizId, setJustSavedQuizId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // 初期状態は閉じている

  const STEPS = [
      { id: 1, icon: Sparkles, label: '1.クイズの種類', description: 'テンプレートまたはAI生成' },
      { id: 2, icon: Edit3, label: '2.基本設定', description: 'タイトルや画像を設定' },
      { id: 3, icon: MessageSquare, label: '3.質問作成', description: '質問と選択肢を作成' },
      { id: 4, icon: Trophy, label: '4.結果ページ', description: '診断結果を設定' }
  ];

  const defaultForm = {
      title: "新規クイズ", description: "説明文を入力...", category: "Business", color: "bg-indigo-600", layout: "card", image_url: "", mode: "diagnosis",
      collect_email: false,
      theme: "standard" as const,
      questions: Array(5).fill(null).map((_,i)=>({text:`質問${i+1}を入力してください`, options: Array(4).fill(null).map((_,j)=>({label:`選択肢${j+1}`, score:{A:j===0?3:0, B:j===1?3:0, C:j===2?3:0}}))})),
      results: [ {type:"A", title:"結果A", description:"説明...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""}, {type:"B", title:"結果B", description:"...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""}, {type:"C", title:"結果C", description:"...", link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:""} ]
  };

  const [form, setForm] = useState(() => {
      if (!initialData) return defaultForm;
      return {
          ...defaultForm, 
          ...initialData, 
          results: initialData.results?.map(r => ({
              link_url: "", link_text: "", line_url: "", line_text: "", qr_url: "", qr_text: "", 
              ...r 
          })) || defaultForm.results
      };
  });

  const applyPreset = (mode, index) => {
      const preset = PRESETS[mode][index];
      if (!preset || !preset.data) return;
      if(!confirm(`「${preset.label}」のテンプレートを適用しますか？\n現在の入力内容は上書きされます。`)) return;
      
      setForm({ ...defaultForm, ...preset.data });
      alert('テンプレートを適用しました！');
  };

  const switchMode = (newMode) => {
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
  };

  const handlePublish = (urlId) => { 
      if (!urlId) {
          alert('保存が完了していません。先に保存してください。');
          return;
      }
      const url = `${window.location.origin}?id=${urlId}`;
      navigator.clipboard.writeText(url); 
      alert(`公開URLをクリップボードにコピーしました！\n\n${url}`); 
  };

  const resetToDefault = () => {
      if(confirm('初期値に戻しますか？現在の入力内容は失われます。')) {
          setForm(defaultForm);
      }
  };

  const addQuestion = () => {
      if(form.questions.length >= 10) return alert('質問は最大10個までです');
      setForm({
          ...form,
          questions: [...form.questions, {text:`質問${form.questions.length+1}`, options: Array(4).fill(null).map((_,j)=>({label:`選択肢${j+1}`, score:{A:0, B:0, C:0}}))}]
      });
  };

  const removeQuestion = (index) => {
      if(form.questions.length <= 1) return alert('質問は最低1つ必要です');
      const newQuestions = form.questions.filter((_, i) => i !== index);
      setForm({...form, questions: newQuestions});
  };

  const addOption = (qIndex) => {
      const newQuestions = [...form.questions];
      if(newQuestions[qIndex].options.length >= 6) return alert('選択肢は最大6つまでです');
      newQuestions[qIndex].options.push({label:`選択肢${newQuestions[qIndex].options.length+1}`, score:{A:0, B:0, C:0}});
      setForm({...form, questions: newQuestions});
  };

  const removeOption = (qIndex, optIndex) => {
      const newQuestions = [...form.questions];
      if(newQuestions[qIndex].options.length <= 2) return alert('選択肢は最低2つ必要です');
      newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== optIndex);
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

  const removeResult = (index) => {
      if(form.results.length <= 2) return alert('結果パターンは最低2つ必要です');
      const newResults = form.results.filter((_, i) => i !== index);
      setForm({...form, results: newResults});
  };

  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
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
      } catch (error) {
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
          // 既存の結果タイプを取得（A, B, C...）
          const existingResultTypes = form.results.map(r => r.type);
          
          // バックエンドAPIを経由してAI生成（セキュリティ強化）
          const res = await fetch("/api/generate-quiz", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  theme: aiTheme,
                  mode: form.mode,
                  resultTypes: existingResultTypes // 既存のタイプを送信
              })
          });
          
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'API request failed');
          }
          
          const { data: json } = await res.json();
          
          // 既存の結果タイプを保持しつつ、AIが生成した内容を適用
          const adjustedResults = json.results.map((r, idx) => ({
              ...r,
              type: existingResultTypes[idx] || r.type // 既存タイプを優先
          }));
          
          setForm(prev => ({ 
              ...prev, 
              ...json,
              results: adjustedResults.map(r => ({link_url:"", link_text:"", line_url:"", line_text:"", qr_url:"", qr_text:"", ...r}))
          })); 
          alert('AI生成が完了しました！');
      } catch(e) { 
          alert('AI生成エラー: ' + e.message); 
      } finally { 
          setIsGenerating(false); 
      }
  };

  const setCorrectOption = (qIndex, optIndex) => {
      const newQuestions = [...form.questions];
      newQuestions[qIndex].options = newQuestions[qIndex].options.map((opt, idx) => ({
          ...opt,
          score: { A: idx === optIndex ? 1 : 0, B: 0, C: 0 } 
      }));
      setForm({...form, questions: newQuestions});
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
        {/* プレビューモーダル */}
        {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Eye size={20} className="text-purple-600"/> プレビュー
                        </h3>
                        <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-full">
                            <X size={20}/>
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {/* タイトル・説明 */}
                        <div className="mb-6">
                            {form.image_url && (
                                <img src={form.image_url} alt="" className="w-full h-48 object-cover rounded-xl mb-4"/>
                            )}
                            <h2 className="text-2xl font-bold mb-2">{form.title || '（タイトル未設定）'}</h2>
                            <p className="text-gray-600">{form.description || '（説明文未設定）'}</p>
                        </div>

                        {/* 質問プレビュー */}
                        {form.questions.length > 0 && (
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-gray-500">
                                        質問 {previewQuestionIndex + 1} / {form.questions.length}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-4">{form.questions[previewQuestionIndex]?.text}</h3>
                                <div className="space-y-2">
                                    {form.questions[previewQuestionIndex]?.options.map((opt, i) => (
                                        <button key={i} className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg text-left hover:border-indigo-500 transition-all">
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button 
                                        onClick={() => setPreviewQuestionIndex(Math.max(0, previewQuestionIndex - 1))}
                                        disabled={previewQuestionIndex === 0}
                                        className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                                    >
                                        前へ
                                    </button>
                                    <button 
                                        onClick={() => setPreviewQuestionIndex(Math.min(form.questions.length - 1, previewQuestionIndex + 1))}
                                        disabled={previewQuestionIndex === form.questions.length - 1}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                                    >
                                        次へ
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 結果プレビュー */}
                        <div className="mt-6">
                            <h4 className="font-bold mb-3">結果パターン</h4>
                            <div className="space-y-3">
                                {form.results.map((r, i) => (
                                    <div key={i} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="font-bold text-indigo-600 mb-1">{r.title}</div>
                                        <div className="text-sm text-gray-600">{r.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* 保存成功時の寄付モーダル */}
        {showDonationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={(e) => {
                // 背景クリックでは閉じない（Xボタンまたは閉じるボタンでのみ閉じる）
                if (e.target === e.currentTarget) {
                    // 背景クリックは無視
                }
            }}>
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
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}?id=${justSavedQuizId}`}
                                    readOnly
                                    className="flex-1 text-xs bg-white border border-indigo-300 p-2 rounded-lg text-gray-900 font-bold"
                                />
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}?id=${justSavedQuizId}`);
                                        alert('URLをコピーしました！');
                                    }}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors whitespace-nowrap"
                                >
                                    <Copy size={16} className="inline mr-1"/> コピー
                                </button>
                            </div>
                        </div>

                        {/* 寄付ボタンとメリット説明 */}
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-orange-500 p-3 rounded-full">
                                    <Gift size={24} className="text-white"/>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                                        応援・寄付でPro機能を開放
                                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">オプション</span>
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        500円〜50,000円で、以下の追加機能が使えるようになります
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white rounded-lg p-4 border border-orange-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Download className="text-indigo-600" size={18}/>
                                        <span className="font-bold text-sm text-gray-900">HTMLダウンロード</span>
                                    </div>
                                    <p className="text-xs text-gray-600">自分のサーバーにアップロード可能</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-orange-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Code className="text-indigo-600" size={18}/>
                                        <span className="font-bold text-sm text-gray-900">埋め込みコード</span>
                                    </div>
                                    <p className="text-xs text-gray-600">WordPressなどに埋め込み可能</p>
                                </div>
                                {form.collect_email && (
                                    <div className="bg-white rounded-lg p-4 border border-orange-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="text-indigo-600" size={18}/>
                                            <span className="font-bold text-sm text-gray-900">メールリスト取得</span>
                                        </div>
                                        <p className="text-xs text-gray-600">CSVでダウンロード可能</p>
                                    </div>
                                )}
                                <div className="bg-white rounded-lg p-4 border border-orange-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="text-indigo-600" size={18}/>
                                        <span className="font-bold text-sm text-gray-900">優先サポート</span>
                                    </div>
                                    <p className="text-xs text-gray-600">機能改善の優先対応</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setShowDonationModal(false);
                                    // ダッシュボードへ遷移（寄付機能はダッシュボードにある）
                                    if (user) {
                                        setPage('dashboard');
                                    } else {
                                        setShowAuth(true);
                                    }
                                }}
                                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-4 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg flex items-center justify-center gap-2 text-lg"
                            >
                                <ShoppingCart size={20}/> マイページで寄付・機能開放する
                            </button>
                            <p className="text-xs text-center text-gray-500 mt-2">
                                ※寄付は任意です。無料でも診断クイズの公開・シェアは可能です
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowDonationModal(false);
                                    // クイズを表示するためにsetPageを使用
                                    setPage('quiz', { id: justSavedQuizId });
                                }}
                                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={18}/> 診断クイズにアクセス
                            </button>
                            <button 
                                onClick={() => setShowDonationModal(false)}
                                className="px-6 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ヘッダー */}
        <div className="bg-white border-b px-6 py-4 flex justify-between sticky top-0 z-50 shadow-sm">
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
                {justSavedQuizId && !showDonationModal && (
                    <button onClick={() => setShowDonationModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 whitespace-nowrap transition-all shadow-md">
                        <Trophy size={18}/> <span className="hidden md:inline">作成完了画面</span>
                    </button>
                )}
                <button onClick={() => setShowPreview(!showPreview)} className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-100 whitespace-nowrap transition-all">
                    <Eye size={18}/> <span className="hidden md:inline">プレビュー</span>
                </button>
                {(savedSlug || initialData?.slug || initialData?.id) && (
                    <button onClick={() => handlePublish(savedSlug || initialData?.slug || initialData?.id)} className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 animate-pulse whitespace-nowrap">
                        <Share2 size={18}/> <span className="hidden md:inline">公開URL</span>
                    </button>
                )}
                <button onClick={async ()=>{
                        setIsSaving(true); 
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
                            regenerateSlug: regenerateSlug
                        };
                        // 編集時のみ数値IDを渡す（テンプレートのtemplateIdは除外）
                        const existingId = savedId || (initialData?.id && !initialData?.templateId ? initialData.id : null);
                        const result = await onSave(saveData, existingId);
                        if(result) {
                            setSavedId(result.id);
                            setSavedSlug(result.slug);
                            // 新規作成時のみ寄付モーダルを表示
                            // initialDataがない、またはtemplateIdのみの場合は新規作成
                            const isNewCreation = !initialData || (initialData.templateId && !initialData.id);
                            if (isNewCreation && !savedId) {
                                setJustSavedQuizId(result.slug);
                                setShowDonationModal(true);
                            }
                        }
                        setIsSaving(false);
                    }} disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all whitespace-nowrap">
                    {isSaving ? <Loader2 className="animate-spin"/> : <Save/>} 保存
                </button>
            </div>
        </div>

        {/* 未ログインユーザー向けバナー */}
        {!user && !hideLoginBanner && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 px-6 py-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Sparkles className="text-indigo-600" size={20}/> ログインすると便利な機能が使えます！
                        </h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-7">
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-600 flex-shrink-0"/> 
                                作成した診断の編集・削除が可能
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-600 flex-shrink-0"/> 
                                マイページでアクセス解析を確認
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-600 flex-shrink-0"/> 
                                HTMLダウンロード・埋め込みコードなどの追加オプションが利用可能
                            </li>
                        </ul>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowAuth(true)} 
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all whitespace-nowrap shadow-md"
                        >
                            ログイン / 新規登録
                        </button>
                        <button 
                            onClick={() => setHideLoginBanner(true)}
                            className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-bold"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* プログレスバー */}
        <div className="bg-white border-b px-6 py-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between relative">
                    {STEPS.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center relative z-10 flex-1">
                                <button
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                        currentStep === step.id
                                            ? 'bg-indigo-600 text-white shadow-lg scale-110'
                                            : currentStep > step.id
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    {currentStep > step.id ? <CheckCircle size={20} /> : <step.icon size={20} />}
                                </button>
                                <div className="text-center mt-2 hidden md:block">
                                    <div className={`text-xs font-bold ${currentStep === step.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                                        {step.label}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">{step.description}</div>
                                </div>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-2 transition-all ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} style={{marginTop: '-20px'}}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            {/* サイドバー（ステップ1以外で表示） */}
            {currentStep !== 1 && (
            <div className={`bg-white border-b md:border-b-0 md:border-r flex flex-col shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-12 md:w-12' : 'w-full md:w-64'}`}>
                {/* サイドバー開閉ボタン */}
                <div className="p-2 border-b flex justify-center">
                    <button 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={sidebarCollapsed ? "メニューを開く" : "メニューを閉じる"}
                    >
                        {sidebarCollapsed ? <Menu size={20} className="text-gray-600"/> : <ChevronLeft size={20} className="text-gray-600"/>}
                    </button>
                </div>

                {/* 折りたたみ時のステップアイコン表示 */}
                {sidebarCollapsed && (
                    <div className="p-2 space-y-2">
                        {STEPS.map(step => (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(step.id)}
                                className={`w-full p-2 rounded-lg transition-all flex items-center justify-center ${
                                    currentStep === step.id
                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                                title={step.label}
                            >
                                <step.icon size={16} />
                            </button>
                        ))}
                    </div>
                )}

                {!sidebarCollapsed && (
                    <>
                        {/* クイックアクション */}
                        <div className="p-4 bg-gradient-to-b from-indigo-50 to-white border-b">
                            <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1">
                                <Sparkles size={14}/> クイックアクション
                            </p>
                            <button 
                                onClick={() => setCurrentStep(1)} 
                                className="w-full bg-white border border-indigo-200 text-indigo-600 py-2 px-3 rounded-lg font-bold text-xs hover:bg-indigo-50 transition-all mb-2 flex items-center justify-center gap-1"
                            >
                                <FileText size={12}/> テンプレート選択
                            </button>
                            <button 
                                onClick={() => setCurrentStep(1)} 
                                className="w-full bg-white border border-purple-200 text-purple-600 py-2 px-3 rounded-lg font-bold text-xs hover:bg-purple-50 transition-all flex items-center justify-center gap-1"
                            >
                                <Wand2 size={12}/> AI自動生成
                            </button>
                        </div>
                    </>
                )}

                {!sidebarCollapsed && (
                    <>
                        {/* ステップナビゲーション */}
                        <div className="p-4 border-b">
                            <p className="text-xs font-bold text-gray-500 mb-3">ステップ移動</p>
                            <div className="space-y-2">
                                {STEPS.map(step => (
                                    <button
                                        key={step.id}
                                        onClick={() => setCurrentStep(step.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                                            currentStep === step.id
                                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <step.icon size={14} />
                                        <span>{step.label}</span>
                                    </button>
                                ))}
                            </div>

                        </div>
                    </>
                )}

                {!sidebarCollapsed && (
                    <>
                        {/* 使い方リンク */}
                        <div className="p-4 border-b">
                            <a href="/?page=howto" target="_blank" rel="noopener noreferrer" className="w-full px-3 py-2 text-left text-xs text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-all block">
                                <BookOpen size={14}/> 使い方・規約を見る（新しいタブ）
                            </a>
                        </div>

                        <div className="flex-grow"></div>
                    </>
                )}
            </div>
            )}

            {/* Main Content */}
            <div className="flex-grow p-4 md:p-8 overflow-y-auto bg-gray-50">
                <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                    
                    {/* ステップ1: クイズの種類選択 */}
                    {currentStep === 1 && (
                        <div className="animate-fade-in">
                            <div className="text-center mb-8">
                                <h3 className="font-bold text-2xl mb-2 text-gray-900">クイズの種類を選択</h3>
                                <p className="text-sm text-gray-500">まずは作成方法を選んでください</p>
                            </div>

                            {/* クイズモード選択 */}
                            {!initialData && (
                                <div className="mb-10">
                                    <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                                        <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                                        クイズの種類（ビジネス利用、テスト形式、ランダム運勢）
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button onClick={()=>switchMode('diagnosis')} className={`p-6 rounded-xl border-2 font-bold flex flex-col items-center gap-3 transition-all hover:shadow-lg ${form.mode==='diagnosis' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 bg-white'}`}>
                                            <Briefcase size={32} className={form.mode==='diagnosis' ? 'text-indigo-600' : 'text-gray-400'}/>
                                            <div className="text-center">
                                                <div className={`font-bold ${form.mode==='diagnosis' ? 'text-indigo-700' : 'text-gray-700'}`}>ビジネス診断</div>
                                                <div className="text-xs text-gray-500 mt-1">性格・タイプ診断など</div>
                                            </div>
                                        </button>
                                        <button onClick={()=>switchMode('test')} className={`p-6 rounded-xl border-2 font-bold flex flex-col items-center gap-3 transition-all hover:shadow-lg ${form.mode==='test' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 bg-white'}`}>
                                            <GraduationCap size={32} className={form.mode==='test' ? 'text-orange-600' : 'text-gray-400'}/>
                                            <div className="text-center">
                                                <div className={`font-bold ${form.mode==='test' ? 'text-orange-700' : 'text-gray-700'}`}>学習テスト</div>
                                                <div className="text-xs text-gray-500 mt-1">正解・不正解のクイズ</div>
                                            </div>
                                        </button>
                                        <button onClick={()=>switchMode('fortune')} className={`p-6 rounded-xl border-2 font-bold flex flex-col items-center gap-3 transition-all hover:shadow-lg ${form.mode==='fortune' ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 bg-white'}`}>
                                            <Sparkles size={32} className={form.mode==='fortune' ? 'text-purple-600' : 'text-gray-400'}/>
                                            <div className="text-center">
                                                <div className={`font-bold ${form.mode==='fortune' ? 'text-purple-700' : 'text-gray-700'}`}>占い</div>
                                                <div className="text-xs text-gray-500 mt-1">運勢・相性診断など</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 作成方法選択 */}
                            <div className="mb-10">
                                <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                                    作成方法を選択（テンプレート利用、AIから自動作成、ゼロから作成）
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {/* 用途別テンプレート */}
                                    <div className="border-2 border-indigo-300 rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-indigo-100 p-3 rounded-lg">
                                                <Sparkles size={24} className="text-indigo-600"/>
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900 flex items-center gap-2">
                                                    用途別テンプレートから作成
                                                    <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">おすすめ</span>
                                                </h5>
                                                <p className="text-xs text-gray-500">すぐに使える実践的なテンプレート</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => { 
                                                    if(!confirm('「キンドル著者向けテンプレート」を適用しますか？\n現在の入力内容は上書きされます。')) return;
                                                    setForm({ ...defaultForm, ...USE_CASE_PRESETS.kindle }); 
                                                    setCurrentStep(2);
                                                }}
                                                className="p-3 rounded-lg border-2 font-bold text-sm transition-all flex items-center gap-2 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                            >
                                                <BookOpen size={16}/>
                                                <span className="truncate">キンドル著者</span>
                                            </button>
                                            <button 
                                                onClick={() => { 
                                                    if(!confirm('「講師向けテンプレート」を適用しますか？\n現在の入力内容は上書きされます。')) return;
                                                    setForm({ ...defaultForm, ...USE_CASE_PRESETS.instructor }); 
                                                    setCurrentStep(2);
                                                }}
                                                className="p-3 rounded-lg border-2 font-bold text-sm transition-all flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                            >
                                                <Users size={16}/>
                                                <span className="truncate">講師</span>
                                            </button>
                                            <button 
                                                onClick={() => { 
                                                    if(!confirm('「店舗向けテンプレート」を適用しますか？\n現在の入力内容は上書きされます。')) return;
                                                    setForm({ ...defaultForm, ...USE_CASE_PRESETS.store }); 
                                                    setCurrentStep(2);
                                                }}
                                                className="p-3 rounded-lg border-2 font-bold text-sm transition-all flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                            >
                                                <Store size={16}/>
                                                <span className="truncate">店舗</span>
                                            </button>
                                            <button 
                                                onClick={() => { 
                                                    if(!confirm('「コンサル向けテンプレート」を適用しますか？\n現在の入力内容は上書きされます。')) return;
                                                    setForm({ ...defaultForm, ...USE_CASE_PRESETS.consultant }); 
                                                    setCurrentStep(2);
                                                }}
                                                className="p-3 rounded-lg border-2 font-bold text-sm transition-all flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                                            >
                                                <Briefcase size={16}/>
                                                <span className="truncate">コンサル</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* その他のテンプレートから作成 */}
                                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-white hover:border-indigo-300 transition-all">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-blue-100 p-3 rounded-lg">
                                                <FileText size={24} className="text-blue-600"/>
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900">その他のテンプレートから作成</h5>
                                                <p className="text-xs text-gray-500">プロが作ったサンプルをカスタマイズ</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <select onChange={(e) => { applyPreset('business', e.target.value); if(e.target.value !== '0') setCurrentStep(2); }} className="w-full text-sm font-bold p-3 border-2 rounded-lg bg-white text-blue-600 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none hover:border-blue-300 transition-all">
                                                    {PRESETS.business.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-4 text-blue-400 pointer-events-none"/>
                                            </div>
                                            <div className="relative">
                                                <select onChange={(e) => { applyPreset('education', e.target.value); if(e.target.value !== '0') setCurrentStep(2); }} className="w-full text-sm font-bold p-3 border-2 rounded-lg bg-white text-green-600 border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none hover:border-green-300 transition-all">
                                                    {PRESETS.education.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-4 text-green-400 pointer-events-none"/>
                                            </div>
                                            <div className="relative">
                                                <select onChange={(e) => { applyPreset('fortune', e.target.value); if(e.target.value !== '0') setCurrentStep(2); }} className="w-full text-sm font-bold p-3 border-2 rounded-lg bg-white text-purple-600 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none hover:border-purple-300 transition-all">
                                                    {PRESETS.fortune.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-4 text-purple-400 pointer-events-none"/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AIで自動生成 */}
                                    <div className="border-2 border-purple-200 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-white hover:border-purple-300 transition-all">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-purple-100 p-3 rounded-lg">
                                                <Wand2 size={24} className="text-purple-600"/>
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900 flex items-center gap-2">
                                                    AIで自動生成
                                                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">人気</span>
                                                </h5>
                                                <p className="text-xs text-gray-500">テーマを入力するだけで完成</p>
                                            </div>
                                        </div>
                                        <textarea 
                                            className="w-full border-2 border-purple-200 p-3 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-white text-gray-900 placeholder-gray-400" 
                                            rows={3} 
                                            placeholder="例: 起業家タイプ診断、SNS発信力チェック、英語の前置詞クイズ..." 
                                            value={aiTheme} 
                                            onChange={e=>setAiTheme(e.target.value)} 
                                        />
                                        <button 
                                            onClick={async () => {
                                                await handleAiGenerate();
                                                if(!isGenerating) setCurrentStep(2);
                                            }} 
                                            disabled={isGenerating || !aiTheme} 
                                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={18}/>
                                                    生成中...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={18}/>
                                                    AIで自動生成する
                                                </>
                                            )}
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2 text-center">※生成には10〜30秒ほどかかります</p>
                                    </div>

                                    {/* ゼロから作成 */}
                                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-white hover:border-indigo-300 transition-all">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-gray-100 p-3 rounded-lg">
                                                <Edit3 size={24} className="text-gray-600"/>
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900">ゼロから作成（初期値に戻す）</h5>
                                                <p className="text-xs text-gray-500">すべて自分で設定する</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={resetToDefault} 
                                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition-all border border-gray-300"
                                        >
                                            初期値に戻す
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 次へ進むボタン（枠外） */}
                            <div className="flex justify-end pt-6 border-t">
                                <button 
                                    onClick={() => setCurrentStep(2)} 
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    次へ進む <ChevronDown size={18} className="rotate-[-90deg]"/>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ステップ2: 基本設定 */}
                    {currentStep === 2 && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                        <Edit3 className="text-indigo-600"/> 基本設定
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">クイズのタイトルや見た目を設定します</p>
                                </div>
                            </div>

                            <Input label="タイトル" val={form.title} onChange={v=>setForm({...form, title:v})} ph="例: あなたの起業家タイプ診断" />
                            <Textarea label="説明文" val={form.description} onChange={v=>setForm({...form, description:v})} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="mb-4 md:mb-0">
                                    <label className="text-sm font-bold text-gray-900 block mb-2">表示レイアウト</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <button onClick={()=>setForm({...form, layout:'card'})} className={`w-full py-3 rounded-lg font-bold text-sm border flex items-center justify-center gap-2 ${form.layout==='card' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                                                <Layout size={16}/> カード
                                            </button>
                                            <a href="https://shindan-quiz.makers.tokyo?id=d83bd" target="_blank" rel="noopener" className="text-xs text-blue-500 hover:underline block text-center mt-1">サンプル</a>
                                        </div>

                                        <div className="flex-1">
                                            <button onClick={()=>setForm({...form, layout:'chat'})} className={`w-full py-3 rounded-lg font-bold text-sm border flex items-center justify-center gap-2 ${form.layout==='chat' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                                                <MessageCircle size={16}/> チャット
                                            </button>
                                            <a href="https://shindan-quiz.makers.tokyo/?id=80038" target="_blank" rel="noopener" className="text-xs text-blue-500 hover:underline block text-center mt-1">サンプル</a>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-900 block mb-2">デザインテーマ（いずれか選択）</label>
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
                                                onClick={()=>setForm({...form, color:theme.color, theme: theme.id})} 
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
                            </div>

                            <div className="mt-6 mb-6">
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

                            {/* 高度な設定（折りたたみ） */}
                            <details className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
                                <summary className="bg-gray-50 px-4 py-3 cursor-pointer font-bold text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <ChevronDown size={16} className="transition-transform"/>
                                        高度な設定
                                    </span>
                                    <span className="text-xs text-gray-500">オプション</span>
                                </summary>
                                <div className="p-4 space-y-4 bg-white">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
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
                                                <p className="text-xs text-amber-700 mt-1">チェックすると保存時に新しいURLが発行されます。通常は変更不要です。</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={regenerateSlug} onChange={e=>setRegenerateSlug(e.target.checked)} />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </details>

                            {/* ナビゲーションボタン */}
                            <div className="flex justify-between items-center pt-6 border-t">
                                <button onClick={() => setCurrentStep(1)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2">
                                    <ArrowLeft size={18}/> 戻る
                                </button>
                                <button onClick={() => setCurrentStep(3)} className="px-6 py-3 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-lg transition-all shadow-md flex items-center gap-2">
                                    次へ進む <ChevronDown size={18} className="rotate-[-90deg]"/>
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* ステップ3: 質問作成 */}
                    {currentStep === 3 && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex justify-between items-center border-b pb-4 mb-6">
                                <div>
                                    <h3 className="font-bold text-xl flex items-center gap-2 text-gray-900">
                                        <MessageSquare className="text-indigo-600"/> 質問作成 ({form.questions.length}問)
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">質問と選択肢を設定します</p>
                                </div>
                                <button onClick={addQuestion} className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-1 transition-all"><Plus size={16}/> 追加</button>
                            </div>
                            
                            {form.questions.map((q, i)=>(
                                <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative group">
                                    <button onClick={()=>removeQuestion(i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                    <div className="font-bold text-indigo-600 mb-2">Q{i+1}</div>
                                    <Input label="質問文" val={q.text} onChange={v=>{const n=[...form.questions];n[i].text=v;setForm({...form, questions:n})}} />
                                    
                                    <div className="space-y-3 mt-4">
                                        <div className="flex text-xs text-gray-400 px-2 justify-between items-center">
                                            <span>選択肢</span>
                                            <button onClick={()=>addOption(i)} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1"><Plus size={12}/> 追加</button>
                                        </div>
                                        {q.options.map((o, j)=>(
                                            <div key={j} className="bg-white p-3 rounded border border-gray-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <button onClick={()=>removeOption(i, j)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                                                    <input className="flex-grow p-1 outline-none text-sm font-bold text-gray-900 placeholder-gray-400 min-w-0" value={o.label} onChange={e=>{const n=[...form.questions];n[i].options[j].label=e.target.value;setForm({...form, questions:n})}} placeholder={`選択肢${j+1}`} />
                                                </div>
                                                
                                                {form.mode === 'test' ? (
                                                    <div className="flex items-center gap-2 pl-6">
                                                        <span className="text-xs text-orange-500 font-bold">正解:</span>
                                                        <button onClick={()=>setCorrectOption(i, j)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${o.score.A === 1 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'}`}><CheckCircle size={16}/></button>
                                                    </div>
                                                ) : form.mode === 'fortune' ? (
                                                    <div className="flex items-center gap-2 pl-6 text-gray-400">
                                                        <Shuffle size={14}/> <span className="text-xs">ランダム表示</span>
                                                    </div>
                                                ) : (
                                                    <div className="pl-6 pt-2 border-t border-gray-100 mt-2">
                                                        <div className="text-xs text-gray-500 mb-2 font-bold">スコア配分:</div>
                                                        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                                            {form.results.map(r => (
                                                                <div key={r.type} className="flex items-center gap-1 bg-gray-50 p-1.5 rounded">
                                                                    <span className="text-xs font-bold text-gray-700 min-w-[20px]">{r.type}:</span>
                                                                    <input type="number" className="flex-1 min-w-0 bg-white border border-gray-300 text-center text-xs rounded text-gray-900 py-1 px-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={o.score[r.type] || 0} onChange={e=>{const n=[...form.questions];n[i].options[j].score[r.type]=e.target.value;setForm({...form, questions:n})}} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button onClick={addQuestion} className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center gap-2"><Plus size={16}/> 質問を追加する</button>
                            
                            {/* ナビゲーションボタン */}
                            <div className="flex justify-between items-center pt-6 border-t">
                                <button onClick={() => setCurrentStep(2)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2">
                                    <ArrowLeft size={18}/> 戻る
                                </button>
                                <button onClick={() => setCurrentStep(4)} className="px-6 py-3 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-lg transition-all shadow-md flex items-center gap-2">
                                    次へ進む <ChevronDown size={18} className="rotate-[-90deg]"/>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ステップ4: 結果ページ */}
                    {currentStep === 4 && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex justify-between items-center border-b pb-4 mb-6">
                                <div>
                                    <h3 className="font-bold text-xl flex items-center gap-2 text-gray-900">
                                        <Trophy className="text-indigo-600"/> 結果ページ ({form.results.length}パターン)
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">診断結果の内容を設定します</p>
                                </div>
                                <button onClick={addResult} className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-1 transition-all"><Plus size={16}/> 追加</button>
                            </div>
                            <div className={`p-4 rounded-lg mb-6 text-sm font-bold ${form.mode==='test'?'bg-orange-50 text-orange-800 border border-orange-200':form.mode==='fortune'?'bg-purple-50 text-purple-800 border border-purple-200':'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                                💡 {form.mode === 'test' ? "正解数に応じて結果が変わります" : form.mode === 'fortune' ? "結果はランダムに表示されます" : "獲得ポイントが多いタイプの結果が表示されます"}
                            </div>
                            {form.results.map((r, i)=>(
                                <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold text-sm">
                                            {form.mode === 'test' ? `ランク ${i+1}` : `パターン ${r.type}`}
                                        </div>
                                        <button onClick={()=>removeResult(i)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"><Trash2 size={18}/></button>
                                    </div>
                                    <Input label="タイトル" val={r.title} onChange={v=>{const n=[...form.results];n[i].title=v;setForm({...form, results:n})}} />
                                    <Textarea label="結果の説明文" val={r.description} onChange={v=>{const n=[...form.results];n[i].description=v;setForm({...form, results:n})}}/>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 mt-4">
                                        <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Link size={14}/> 誘導ボタン設定 (任意)</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <Input label="リンク先URL" val={r.link_url} onChange={v=>{const n=[...form.results];n[i].link_url=v;setForm({...form, results:n})}} ph="https://..." />
                                            <Input label="ボタン文言" val={r.link_text} onChange={v=>{const n=[...form.results];n[i].link_text=v;setForm({...form, results:n})}} ph="詳細を見る" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                                            <Input label="LINE登録URL" val={r.line_url} onChange={v=>{const n=[...form.results];n[i].line_url=v;setForm({...form, results:n})}} ph="https://line.me/..." />
                                            <Input label="ボタン文言" val={r.line_text} onChange={v=>{const n=[...form.results];n[i].line_text=v;setForm({...form, results:n})}} ph="LINEで相談する" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                            <Input label="QRコード画像URL" val={r.qr_url} onChange={v=>{const n=[...form.results];n[i].qr_url=v;setForm({...form, results:n})}} ph="https://..." />
                                            <Input label="ボタン文言" val={r.qr_text} onChange={v=>{const n=[...form.results];n[i].qr_text=v;setForm({...form, results:n})}} ph="QRコードを表示" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addResult} className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center gap-2"><Plus size={16}/> 結果パターンを追加する</button>
                            
                            {/* ナビゲーションボタン */}
                            <div className="flex justify-between items-center pt-6 border-t">
                                <button onClick={() => setCurrentStep(3)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2">
                                    <ArrowLeft size={18}/> 戻る
                                </button>
                                <button 
                                    onClick={async ()=>{
                                        setIsSaving(true); 
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
                                            regenerateSlug: regenerateSlug
                                        };
                                        // 編集時のみ数値IDを渡す（テンプレートのtemplateIdは除外）
                                        const existingId = savedId || (initialData?.id && !initialData?.templateId ? initialData.id : null);
                                        const result = await onSave(saveData, existingId);
                                        if(result) {
                                            setSavedId(result.id);
                                            setSavedSlug(result.slug);
                                            // 新規作成時のみ寄付モーダルを表示
                                            // initialDataがない、またはtemplateIdのみの場合は新規作成
                                            const isNewCreation = !initialData || (initialData.templateId && !initialData.id);
                                            if (isNewCreation && !savedId) {
                                                setJustSavedQuizId(result.slug);
                                                setShowDonationModal(true);
                                            } else {
                                                handlePublish(result.slug);
                                            }
                                        }
                                        setIsSaving(false);
                                    }} 
                                    disabled={isSaving} 
                                    className="px-8 py-3 bg-green-600 text-white font-bold hover:bg-green-700 disabled:bg-gray-400 rounded-lg transition-all shadow-md flex items-center gap-2 text-lg"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle size={20}/>} 
                                    完成・公開する
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Editor;