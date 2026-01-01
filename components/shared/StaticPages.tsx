'use client';

import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, CheckCircle, ChevronDown, ChevronUp, 
    Briefcase, GraduationCap, Sparkles, TrendingUp, 
    Share2, Search, Megaphone, Lightbulb, Target, Heart,
    QrCode, Users, Repeat, Smartphone, Eye, Zap, Lock, Unlock,
    Download, Code, FileText, Image as ImageIcon, BarChart2,
    Mail, Shield, Scale, ExternalLink, Smile, MessageCircle,
    Magnet, Building2, UserCircle, Crown, Flame, Rocket
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

// ====================================
// 効果的な活用法9選（統合版）
// ====================================
export const EffectiveUsePage = ({ 
    onBack, 
    setPage, 
    user, 
    onLogout, 
    setShowAuth, 
    isAdmin 
}: {
    onBack: () => void;
    setPage: (page: string) => void;
    user: { email?: string } | null;
    onLogout: () => void;
    setShowAuth: (show: boolean) => void;
    isAdmin?: boolean;
}) => {
    useEffect(() => { 
        document.title = "効果的な活用法9選 | 集客メーカー"; 
        window.scrollTo(0, 0);
    }, []);
    
    const tips = [
        { 
            icon: Share2, 
            color: "text-blue-600", 
            bg: "bg-blue-100", 
            title: "1. SNS拡散（UGC）を狙う", 
            text: "診断結果やプロフィールは「自分語り」ができる最高のコンテンツ。X(Twitter)やInstagramでシェアされやすく、広告費をかけずに認知拡大が可能です。",
            services: ["診断クイズ", "プロフィールLP"]
        },
        { 
            icon: Search, 
            color: "text-purple-600", 
            bg: "bg-purple-100", 
            title: "2. SEO & AI検索対策", 
            text: "公開ページは構造化データ対応。Google検索だけでなく、ChatGPTなどのAI検索からの流入も期待できます。被リンク効果でドメインパワー向上も。",
            services: ["全サービス共通"]
        },
        { 
            icon: Megaphone, 
            color: "text-green-600", 
            bg: "bg-green-100", 
            title: "3. 自然なリスト獲得", 
            text: "「診断結果を受け取る」「詳しい情報を見る」という名目でLINE登録やメールアドレス入力を促進。押し売り感なく見込み客リストを構築できます。",
            services: ["診断クイズ", "ビジネスLP"]
        },
        { 
            icon: Target, 
            color: "text-red-600", 
            bg: "bg-red-100", 
            title: "4. サービスを自然に告知", 
            text: "結果ページやLPに「詳しく見る」「LINE登録」「QRコード」ボタンを設置。興味を持った見込み客に、自然な流れでサービスを紹介できます。",
            services: ["全サービス共通"]
        },
        { 
            icon: TrendingUp, 
            color: "text-yellow-600", 
            bg: "bg-yellow-100", 
            title: "5. 集客のA/Bテスト", 
            text: "どんなコンテンツが人気か、どの導線でクリック率が高いかをリアルタイム分析。本格的な広告投資の前に、低コストで顧客の反応をテストできます。",
            services: ["診断クイズ"]
        },
        { 
            icon: QrCode, 
            color: "text-gray-800", 
            bg: "bg-gray-100", 
            title: "6. リアル店舗・イベント活用", 
            text: "QRコードを発行してチラシや店頭に掲示。待ち時間にコンテンツを楽しんでもらいながら、クーポン配布や会員登録へ誘導できます。",
            services: ["全サービス共通"]
        },
        { 
            icon: Users, 
            color: "text-indigo-600", 
            bg: "bg-indigo-100", 
            title: "7. 顧客セグメント分析", 
            text: "診断結果で「Aタイプ（初心者）」が多ければ初心者向けセミナーを、「Bタイプ（上級者）」が多ければ個別相談を案内するなど、属性別セールスが可能に。",
            services: ["診断クイズ"]
        },
        { 
            icon: GraduationCap, 
            color: "text-orange-600", 
            bg: "bg-orange-100", 
            title: "8. 教育・社内研修に", 
            text: "「学習モード」で楽しみながら知識定着を図るテストを作成。お客様への啓蒙コンテンツや、社内マニュアルの理解度チェックにも最適です。",
            services: ["診断クイズ"]
        },
        { 
            icon: Repeat, 
            color: "text-pink-600", 
            bg: "bg-pink-100", 
            title: "9. リピート訪問の促進", 
            text: "「占いモード」で「今日の運勢」や「日替わり診断」を作成すれば、ユーザーが毎日サイトを訪れる習慣（リテンション）を構築できます。",
            services: ["診断クイズ"]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} />
            <div className="bg-gradient-to-br from-orange-600 via-red-500 to-pink-500 text-white py-16 px-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Magnet size={40} className="text-yellow-300" />
                    <h1 className="text-3xl font-extrabold">
                        集客メーカーの<span className="text-yellow-300">効果的な活用法 9選</span>
                    </h1>
                </div>
                <p className="text-orange-100 max-w-xl mx-auto">
                    診断クイズ・プロフィールLP・ビジネスLPを最大限に活かし、集客と売上につなげるための具体的なアイデアをご紹介します。
                </p>
            </div>
            <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-500 font-bold hover:text-orange-600 mb-4">
                    <ArrowLeft size={16}/> 戻る
                </button>
                <div className="grid md:grid-cols-2 gap-6">
                    {tips.map((tip, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 p-3 rounded-full ${tip.bg} ${tip.color}`}>
                                    <tip.icon size={24}/>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-2">{tip.text}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {tip.services.map((s, j) => (
                                            <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-100 mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Magnet className="text-orange-500"/> 集客メーカーで作るメリット
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>無料で始められる:</strong> アカウント登録だけで、すぐに高品質なコンテンツを作成できます。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>即座にシェア可能:</strong> 作成したコンテンツは自動的に公開され、URLが発行されます。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>3つのツールが統合:</strong> 診断クイズ・プロフィールLP・ビジネスLPを一元管理。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>AI自動生成:</strong> テーマを入力するだけで、プロ品質のコンテンツが数分で完成。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>SEO・AI検索対応:</strong> 構造化データ対応で、検索エンジンからの流入を最大化。</span>
                        </li>
                    </ul>
                </div>
                
                <div className="text-center pt-8">
                    <button 
                        onClick={() => setPage('create')} 
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                    >
                        さっそくコンテンツを作ってみる
                    </button>
                </div>
            </div>
            <Footer setPage={setPage} onCreate={() => setPage('create')} user={user} setShowAuth={setShowAuth} />
        </div>
    );
};

// ====================================
// 売れるコンテンツの作り方
// ====================================
export const SellingContentPage = ({ 
    onBack, 
    setPage, 
    user, 
    onLogout, 
    setShowAuth, 
    isAdmin 
}: {
    onBack: () => void;
    setPage: (page: string) => void;
    user: { email?: string } | null;
    onLogout: () => void;
    setShowAuth: (show: boolean) => void;
    isAdmin?: boolean;
}) => {
    useEffect(() => { 
        document.title = "売れるコンテンツの作り方 | 集客メーカー"; 
        window.scrollTo(0, 0);
    }, []);
    
    const logics = [
        { 
            icon: Target, 
            title: "1. ターゲットの「悩み」を明確に", 
            text: "「誰の、どんな課題を解決するか」を最初に決めます。「なんでも対応」ではなく、「起業初期の集客に悩む個人事業主向け」のように具体的に絞ることで、刺さるコンテンツが作れます。",
            applicable: ["診断", "LP"]
        },
        { 
            icon: Heart, 
            title: "2. ベネフィットを最初に伝える", 
            text: "サービスの特徴ではなく、「お客様が得られる未来」を最初に見せましょう。「Web制作します」より「24時間働く営業マンを手に入れませんか？」の方が心に響きます。",
            applicable: ["LP"]
        },
        { 
            icon: Megaphone, 
            title: "3. キャッチコピーで心を掴む", 
            text: "最初の3秒で離脱されるか決まります。「○○で悩んでいませんか？」「たった○日で○○を実現」など、読み手の感情を動かすフレーズを冒頭に置きましょう。",
            applicable: ["診断", "LP"]
        },
        { 
            icon: Sparkles, 
            title: "4. バーナム効果で共感を生む", 
            text: "誰にでも当てはまることを「自分のことだ」と思わせる心理テクニック。「一見大胆ですが、繊細な一面も…」のような多面的な記述が共感を呼びます。",
            applicable: ["診断"]
        },
        { 
            icon: ImageIcon, 
            title: "5. ビジュアルで世界観を作る", 
            text: "魅力的なメイン画像、プロフィール写真、実績画像など、視覚的要素でブランドイメージを統一。文字だけより画像があるページの方が滞在時間が長くなります。",
            applicable: ["診断", "LP"]
        },
        { 
            icon: Smartphone, 
            title: "6. スマホファーストで設計", 
            text: "閲覧の7割以上はスマホから。長すぎる文章は避け、スクロールしやすいブロック構成を心がけましょう。CTAボタンは親指で押しやすい位置に配置。",
            applicable: ["診断", "LP"]
        },
        { 
            icon: Eye, 
            title: "7. CTAは複数回、具体的に", 
            text: "「お問い合わせ」ではなく「無料相談を予約する」「LINEで質問する」など、次のアクションが明確なボタンを複数回配置しましょう。",
            applicable: ["診断", "LP"]
        },
        { 
            icon: Crown, 
            title: "8. 承認欲求を満たす結果設計", 
            text: "悪い結果でも必ずポジティブなフォローを。「あなたはダメです」ではなく「伸びしろがあります」と伝えることで、シェアされやすくなります。",
            applicable: ["診断"]
        },
        { 
            icon: TrendingUp, 
            title: "9. 限定性・緊急性を演出", 
            text: "「先着○名様限定」「○月○日まで」など、今すぐ行動する理由を作りましょう。ただし嘘の限定性は信頼を損なうので、本当のオファーを用意することが大切。",
            applicable: ["LP"]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} />
            <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 text-white py-16 px-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Rocket size={40} className="text-yellow-300" />
                    <h1 className="text-3xl font-extrabold">
                        思わず行動したくなる！<br/>
                        <span className="text-yellow-200">「売れるコンテンツ」</span>の鉄板ロジック
                    </h1>
                </div>
                <p className="text-green-100 max-w-xl mx-auto">
                    人が動く心理トリガーを押さえた、効果的なコンテンツの作り方を伝授します。
                </p>
            </div>
            <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-500 font-bold hover:text-green-600 mb-4">
                    <ArrowLeft size={16}/> 戻る
                </button>
                <div className="space-y-6">
                    {logics.map((logic, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                            <div className="flex-shrink-0 bg-green-100 text-green-600 p-3 rounded-full h-fit">
                                <logic.icon size={24}/>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{logic.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed mb-2">{logic.text}</p>
                                <div className="flex gap-2">
                                    {logic.applicable.map((a, j) => (
                                        <span key={j} className={`text-xs px-2 py-0.5 rounded-full ${
                                            a === "診断" ? "bg-indigo-100 text-indigo-600" : "bg-amber-100 text-amber-600"
                                        }`}>
                                            {a === "診断" ? "診断クイズ" : "LP"}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Zap className="text-yellow-500"/> 集客メーカーなら簡単に実現
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={20} className="text-indigo-500" />
                                <span className="font-bold text-gray-900">診断クイズ</span>
                            </div>
                            <p className="text-sm text-gray-600">AI自動生成で質問・結果を作成。シェアされやすい設計で拡散を狙う</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <UserCircle size={20} className="text-emerald-500" />
                                <span className="font-bold text-gray-900">プロフィールLP</span>
                            </div>
                            <p className="text-sm text-gray-600">ブロック形式で自由にレイアウト。SNSプロフィールに最適</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 size={20} className="text-amber-500" />
                                <span className="font-bold text-gray-900">ビジネスLP</span>
                            </div>
                            <p className="text-sm text-gray-600">CV最適化テンプレートでプロ品質のLPを簡単作成</p>
                        </div>
                    </div>
                </div>
                
                <div className="text-center pt-8">
                    <button 
                        onClick={() => setPage('create')} 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105"
                    >
                        このロジックでコンテンツを作る
                    </button>
                </div>
            </div>
            <Footer setPage={setPage} onCreate={() => setPage('create')} user={user} setShowAuth={setShowAuth} />
        </div>
    );
};

// ====================================
// 使い方・機能一覧ページ
// ====================================
export const HowToPage = ({ 
    onBack, 
    setPage, 
    user, 
    onLogout, 
    setShowAuth, 
    isAdmin 
}: {
    onBack: () => void;
    setPage: (page: string) => void;
    user: { email?: string } | null;
    onLogout: () => void;
    setShowAuth: (show: boolean) => void;
    isAdmin?: boolean;
}) => {
    useEffect(() => { 
        document.title = "使い方・機能一覧 | 集客メーカー"; 
        window.scrollTo(0, 0);
    }, []);
    
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} />
            <div className="py-12 px-4 max-w-5xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-orange-600">
                    <ArrowLeft size={16}/> 戻る
                </button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4 flex items-center gap-3">
                    <Magnet className="text-orange-500" />
                    集客メーカー 機能一覧・使い方ガイド
                </h1>
                
                {/* 3つのサービス紹介 */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-4 text-indigo-700 font-bold text-xl">
                            <Sparkles size={24} className="text-indigo-500"/> 診断クイズ
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            性格診断・適職診断・心理テスト・検定クイズ・占いなど、様々なタイプの診断コンテンツを作成できます。
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex gap-2"><CheckCircle size={16} className="text-indigo-500 flex-shrink-0"/> AI自動生成</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-indigo-500 flex-shrink-0"/> 3モード（診断・検定・占い）</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-indigo-500 flex-shrink-0"/> アクセス解析</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-indigo-500 flex-shrink-0"/> リード獲得機能</li>
                        </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                        <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold text-xl">
                            <UserCircle size={24} className="text-emerald-500"/> プロフィールLP
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            SNSプロフィールに最適なリンクまとめページを作成。ブロック形式で自由にレイアウトをカスタマイズ。
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 flex-shrink-0"/> ブロック形式エディタ</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 flex-shrink-0"/> おしゃれな背景</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 flex-shrink-0"/> YouTube埋め込み</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 flex-shrink-0"/> リンク集</li>
                        </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                        <div className="flex items-center gap-2 mb-4 text-amber-700 font-bold text-xl">
                            <Building2 size={24} className="text-amber-500"/> ビジネスLP
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            商品・サービスの魅力を効果的にアピール。CV最適化されたテンプレートでプロ品質のLPを作成。
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex gap-2"><CheckCircle size={16} className="text-amber-500 flex-shrink-0"/> AI Flyer機能</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-amber-500 flex-shrink-0"/> CV最適化テンプレート</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-amber-500 flex-shrink-0"/> 料金表・FAQ対応</li>
                            <li className="flex gap-2"><CheckCircle size={16} className="text-amber-500 flex-shrink-0"/> CTAボタン</li>
                        </ul>
                    </div>
                </div>

                {/* 料金プラン */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-xl">
                            <Unlock size={24} className="text-blue-500"/> 基本機能 (無料)
                        </div>
                        <ul className="space-y-4 text-sm text-gray-800">
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Zap size={16}/></span><span><strong>全エディタ:</strong> 診断・プロフィール・ビジネスLP作成</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Sparkles size={16}/></span><span><strong>AI自動生成:</strong> テーマ入力で自動作成</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><FileText size={16}/></span><span><strong>豊富なテンプレート:</strong> すぐに使える雛形</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Eye size={16}/></span><span><strong>リアルタイムプレビュー:</strong> 作成中に確認</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><BarChart2 size={16}/></span><span><strong>アクセス解析:</strong> 閲覧数・完了率を確認</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Share2 size={16}/></span><span><strong>即座に公開:</strong> URL自動発行</span></li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">PRO</div>
                        <div className="flex items-center gap-2 mb-4 text-orange-900 font-bold text-xl">
                            <Lock size={24} className="text-orange-500"/> Pro機能 (寄付で開放)
                        </div>
                        <p className="text-xs text-orange-700 mb-4">※コンテンツごとに任意の金額(500円〜)を寄付いただくと開放されます。</p>
                        <ul className="space-y-4 text-sm text-gray-800">
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Download size={16}/></span><span><strong>HTML書き出し:</strong> 自社サーバーに設置可能</span></li>
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Code size={16}/></span><span><strong>埋め込みタグ:</strong> ブログやHPに埋め込み</span></li>
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><FileText size={16}/></span><span><strong>リストCSV出力:</strong> メールアドレス一括DL</span></li>
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Heart size={16}/></span><span><strong>開発者支援:</strong> 継続的なアップデート</span></li>
                        </ul>
                    </div>
                </div>

                {/* 利用規約 */}
                <div className="border-t pt-8 mt-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">利用規約・免責事項</h2>
                    <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                        <p>「集客メーカー」（以下、本サービス）をご利用いただく際の基本的なルールと免責事項です。</p>
                        <ol className="space-y-3 list-decimal list-inside">
                            <li><strong>サービスの利用:</strong> 本サービスは無料でコンテンツを作成・公開できるプラットフォームです。</li>
                            <li><strong>コンテンツの権利:</strong> 作成したコンテンツの著作権は作成者に帰属します。個人・商用問わず利用可能です。</li>
                            <li><strong>禁止事項:</strong> 公序良俗違反・権利侵害・違法な内容の掲載は禁止します。</li>
                            <li><strong>Pro機能:</strong> 500円〜の任意の寄付でPro機能が開放されます。寄付後の返金はできません。</li>
                            <li><strong>免責:</strong> サービスは現状有姿で提供され、損害について運営者は責任を負いません。</li>
                            <li><strong>準拠法:</strong> 本規約は日本法に準拠し、紛争は運営者所在地の裁判所を管轄とします。</li>
                        </ol>
                    </div>
                </div>
            </div>
            <Footer setPage={setPage} onCreate={() => setPage('create')} user={user} setShowAuth={setShowAuth} />
        </div>
    );
};

// ====================================
// FAQ ページ
// ====================================
export const FaqPage = ({ 
    onBack, 
    setPage, 
    user, 
    onLogout, 
    setShowAuth, 
    isAdmin 
}: {
    onBack: () => void;
    setPage: (page: string) => void;
    user: { email?: string } | null;
    onLogout: () => void;
    setShowAuth: (show: boolean) => void;
    isAdmin?: boolean;
}) => {
    useEffect(() => { 
        document.title = "よくある質問 | 集客メーカー"; 
        window.scrollTo(0, 0);
    }, []);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    
    const faqs = [
        { category: "一般", q: "無料で使えますか？", a: "はい、診断クイズ・プロフィールLP・ビジネスLPの作成・公開の基本機能はすべて無料でご利用いただけます。AI自動生成、テンプレート、プレビュー、アクセス解析など、すべて無料です。" },
        { category: "一般", q: "商用利用は可能ですか？", a: "可能です。作成したコンテンツは、ご自身のビジネス（SNS拡散、集客、リード獲得、サービス紹介）で自由にご活用ください。" },
        { category: "一般", q: "ログインは必要ですか？", a: "コンテンツの作成・公開はログインなしでも可能です。ただし、編集・削除・HTMLダウンロード機能を使用する場合はログインが必要です。" },
        { category: "機能", q: "AI自動生成の精度は？", a: "テーマを入力するだけで、質問・結果パターン・キャッチコピーなどを自動生成します。生成後に自由に編集できるため、たたき台として非常に便利です。" },
        { category: "機能", q: "プレビュー機能はありますか？", a: "はい、作成中のコンテンツをリアルタイムで確認できます。保存前に見た目をチェックできるので安心です。" },
        { category: "機能", q: "スマホでも使えますか？", a: "はい、完全レスポンシブ対応です。作成も閲覧もスマホで快適に行えます。" },
        { category: "Pro機能", q: "Pro機能（寄付）とは？", a: "コンテンツごとに任意の金額（500円〜）を寄付いただくことで、「HTMLダウンロード」「埋め込みコード発行」「収集したメールアドレスのCSVダウンロード」機能が開放されます。" },
        { category: "技術", q: "SEO対策はされていますか？", a: "はい、構造化データ、メタタグ、適切なタイトル設定など、基本的なSEO対策は実装済みです。AI検索（ChatGPT等）からの流入も考慮した設計になっています。" },
        { category: "技術", q: "HTMLダウンロードとは？", a: "Pro機能を開放すると、作成したコンテンツをHTMLファイルとしてダウンロードできます。自社サーバーに設置することで、完全に自分の管理下で運用できます。" },
    ];
    
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} />
            <div className="max-w-3xl mx-auto py-12 px-4">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-orange-600">
                    <ArrowLeft size={16}/> 戻る
                </button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">よくある質問</h1>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <button 
                                onClick={() => setOpenIndex(openIndex === i ? null : i)} 
                                className="w-full px-6 py-4 text-left font-bold text-gray-800 flex justify-between items-center hover:bg-gray-50"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">{faq.category}</span>
                                    {faq.q}
                                </span>
                                {openIndex === i ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                            </button>
                            {openIndex === i && (
                                <div className="px-6 py-4 bg-gray-50 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <Footer setPage={setPage} onCreate={() => setPage('create')} user={user} setShowAuth={setShowAuth} />
        </div>
    );
};

// ====================================
// お問い合わせページ
// ====================================
export const ContactPage = ({ 
    onBack, 
    setPage, 
    user, 
    onLogout, 
    setShowAuth, 
    isAdmin 
}: {
    onBack: () => void;
    setPage: (page: string) => void;
    user: { email?: string } | null;
    onLogout: () => void;
    setShowAuth: (show: boolean) => void;
    isAdmin?: boolean;
}) => {
    useEffect(() => { 
        document.title = "お問い合わせ | 集客メーカー"; 
        window.scrollTo(0, 0);
    }, []);
    
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} />
            <div className="py-12 px-4 max-w-2xl mx-auto text-center">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-orange-600 mx-auto">
                    <ArrowLeft size={16}/> 戻る
                </button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">お問い合わせ</h1>
                <p className="text-gray-600 mb-8">
                    機能へのご要望、不具合のご報告、その他ご質問は以下のフォームよりお問い合わせください。<br/>
                    原則として3営業日以内にご返信いたします。
                </p>
                <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSd8euNVubqlITrCF2_W7VVBjLd2mVxzOIcJ67pNnk3GPLnT_A/viewform" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-orange-700 transition-transform hover:scale-105"
                >
                    <Mail size={20}/> お問い合わせフォームを開く
                </a>
            </div>
            <Footer setPage={setPage} onCreate={() => setPage('create')} user={user} setShowAuth={setShowAuth} />
        </div>
    );
};

// ====================================
// 特定商取引法に基づく表記
// ====================================
export const LegalPage = ({ 
    onBack, 
    setPage, 
    user, 
    onLogout, 
    setShowAuth, 
    isAdmin 
}: {
    onBack: () => void;
    setPage: (page: string) => void;
    user: { email?: string } | null;
    onLogout: () => void;
    setShowAuth: (show: boolean) => void;
    isAdmin?: boolean;
}) => {
    useEffect(() => { 
        document.title = "特定商取引法に基づく表記 | 集客メーカー"; 
        window.scrollTo(0, 0);
    }, []);
    
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} />
            <div className="py-12 px-4 max-w-3xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-orange-600">
                    <ArrowLeft size={16}/> 戻る
                </button>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
                    <Scale className="text-gray-400"/> 特定商取引法に基づく表記
                </h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">販売事業者名</div>
                        <div className="md:col-span-2 text-gray-900">ケイショウ株式会社</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">運営統括責任者</div>
                        <div className="md:col-span-2 text-gray-900">宇城利浩</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">所在地</div>
                        <div className="md:col-span-2 text-gray-900">福井県福井市中央1-9-24</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">お問い合わせ先</div>
                        <div className="md:col-span-2 text-gray-900">
                            お問い合わせフォームよりご連絡ください。
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">販売価格</div>
                        <div className="md:col-span-2 text-gray-900">各決済画面に表示された金額（寄付形式のため任意設定可能）</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">商品代金以外の必要料金</div>
                        <div className="md:col-span-2 text-gray-900">インターネット接続料金、通信料金</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">代金の支払時期および方法</div>
                        <div className="md:col-span-2 text-gray-900">クレジットカード決済（Stripe）。購入時即時に決済されます。</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">商品の引渡時期</div>
                        <div className="md:col-span-2 text-gray-900">決済完了後、即時にダウンロードまたは機能が有効化されます。</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="font-bold text-gray-500">返品・キャンセルについて</div>
                        <div className="md:col-span-2 text-gray-900">デジタルコンテンツの性質上、決済完了後の返品・キャンセルはお受けできません。</div>
                    </div>
                </div>
            </div>
            <Footer setPage={setPage} onCreate={() => setPage('create')} user={user} setShowAuth={setShowAuth} />
        </div>
    );
};

// ====================================
// プライバシーポリシー
// ====================================
export const PrivacyPage = ({ 
    onBack, 
    setPage, 
    user, 
    onLogout, 
    setShowAuth, 
    isAdmin 
}: {
    onBack: () => void;
    setPage: (page: string) => void;
    user: { email?: string } | null;
    onLogout: () => void;
    setShowAuth: (show: boolean) => void;
    isAdmin?: boolean;
}) => {
    useEffect(() => { 
        document.title = "プライバシーポリシー | 集客メーカー"; 
        window.scrollTo(0, 0);
    }, []);
    
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} />
            <div className="py-12 px-4 max-w-3xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-orange-600">
                    <ArrowLeft size={16}/> 戻る
                </button>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
                    <Shield className="text-gray-400"/> プライバシーポリシー
                </h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-sm leading-relaxed space-y-6 text-gray-700">
                    <p>集客メーカー（以下、「当サービス」）は、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」）を定めます。</p>
                    
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">1. 個人情報の収集</h3>
                        <p>当サービスは、ユーザー登録時や決済時に、メールアドレス、クレジットカード情報（決済代行会社が管理）等の情報を収集する場合があります。また、作成されたコンテンツを通じて収集される回答者のメールアドレス等の情報は、コンテンツ作成者の責任において管理されます。</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">2. 利用目的</h3>
                        <p>収集した情報は、サービスの提供、本人確認、決済処理、お問い合わせ対応、およびサービスの改善のために利用します。</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">3. 第三者への提供</h3>
                        <p>当サービスは、法令に基づく場合を除き、あらかじめユーザーの同意を得ることなく、個人情報を第三者に提供しません。</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">4. 決済情報の取扱い</h3>
                        <p>クレジットカード決済には「Stripe」を使用しており、当サービスがカード情報を直接保持することはありません。</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">5. お問い合わせ</h3>
                        <p>本ポリシーに関するお問い合わせは、お問い合わせフォームよりお願いいたします。</p>
                    </section>
                </div>
            </div>
            <Footer setPage={setPage} onCreate={() => setPage('create')} user={user} setShowAuth={setShowAuth} />
        </div>
    );
};

// エクスポート用のエイリアス
export const PricePage = FaqPage;
















































