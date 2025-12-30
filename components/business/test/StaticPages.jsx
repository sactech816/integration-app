import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, CheckCircle, ChevronDown, ChevronUp, 
    Briefcase, GraduationCap, Sparkles, TrendingUp, 
    Share2, Search, Megaphone, Lightbulb, Target, Heart,
    QrCode, Users, Repeat, Smartphone, Eye, Zap, Lock, Unlock,
    Download, Code, FileText, Image as ImageIcon, BarChart2,
    Mail, Shield, Scale, ExternalLink, Smile, MessageCircle
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import SEO from './SEO';

// --- Effective Use Page ---
export const EffectiveUsePage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { 
        document.title = "効果的な使い方・メリット | 診断クイズメーカー"; 
        window.scrollTo(0, 0);
    }, []);
    
    const tips = [
        { icon: Share2, color: "text-blue-600", bg: "bg-blue-100", title: "1. SNS拡散（UGC）を狙う", text: "診断結果は「自分語り」ができる最高のコンテンツです。面白い結果はX(Twitter)やInstagramでシェアされやすく、広告費をかけずに認知が広がります。" },
        { icon: Search, color: "text-purple-600", bg: "bg-purple-100", title: "2. SEO & AI検索対策", text: "このポータルに掲載されることで、あなたのビジネスへの被リンク効果が期待できます。また、構造化データによりChatGPTなどのAI検索からの流入も狙えます。" },
        { icon: Megaphone, color: "text-green-600", bg: "bg-green-100", title: "3. 自然なリスト獲得", text: "いきなり売り込むのではなく、「診断結果のアドバイスを受け取る」という名目でLINE登録やメールアドレス入力を促すことで、登録率が劇的に向上します。" },
        { icon: Target, color: "text-red-600", bg: "bg-red-100", title: "4. あなたのサービスを告知できる", text: "診断結果ページに「詳しく見る」「LINE公式アカウント」「QRコード」などのボタンを設置できます。診断を通じて興味を持った見込み客に、自然な流れでサービスを紹介できます。" },
        { icon: TrendingUp, color: "text-yellow-600", bg: "bg-yellow-100", title: "5. 集客のテストができる", text: "どんな診断が人気なのか、どんな導線でクリック率が高いのかをリアルタイムに分析できます。本格的な広告投資の前に、低コストで顧客の反応をテストしましょう。" },
        { icon: QrCode, color: "text-gray-800", bg: "bg-gray-100", title: "6. リアル店舗・イベントでの活用", text: "QRコードを発行してチラシや店頭に掲示しましょう。「待ち時間の暇つぶし」として診断を楽しんでもらいつつ、クーポン配布や会員登録へ誘導できます。" },
        { icon: Users, color: "text-indigo-600", bg: "bg-indigo-100", title: "7. 顧客のセグメント分析", text: "「Aタイプ（初心者）」が多ければ初心者向けセミナーを、「Bタイプ（上級者）」が多ければ個別相談を案内するなど、属性に合わせた最適なセールスが可能になります。" },
        { icon: GraduationCap, color: "text-orange-600", bg: "bg-orange-100", title: "8. 教育・社内研修ツールとして", text: "「学習モード」を使えば、楽しみながら知識定着を図るテストが作れます。お客様への啓蒙コンテンツや、社内マニュアルの理解度チェックにも最適です。" },
        { icon: Repeat, color: "text-pink-600", bg: "bg-pink-100", title: "9. リピート訪問の促進", text: "「占いモード」で「今日の運勢」や「日替わりランチ診断」を作成すれば、ユーザーが毎日サイトを訪れる習慣（リテンション）を作ることができます。" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="bg-indigo-900 text-white py-16 px-6 text-center">
                <h1 className="text-3xl font-extrabold mb-4">診断クイズの<span className="text-yellow-300">効果的な活用法 9選</span></h1>
                <p className="text-indigo-200 max-w-xl mx-auto">作成したコンテンツを最大限に活かし、集客と売上につなげるための具体的なアイデアをご紹介します。あなたのビジネスを加速させるヒントが満載です。</p>
            </div>
            <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600 mb-4"><ArrowLeft size={16}/> 戻る</button>
                <div className="grid md:grid-cols-2 gap-6">
                    {tips.map((tip, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 p-3 rounded-full ${tip.bg} ${tip.color}`}><tip.icon size={24}/></div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{tip.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-100 mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Sparkles className="text-yellow-500"/> このポータルサイトで診断を作るメリット
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>無料で始められる:</strong> アカウント登録だけで、すぐに高品質な診断コンテンツを作成できます。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>即座にシェア可能:</strong> 作成した診断は自動的に公開され、URLが発行されます。SNSで即座にシェアして拡散できます。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>ポータルサイトに掲載:</strong> 人気ランキングに掲載されることで、あなたの診断が多くのユーザーの目に触れ、自然な流入が期待できます。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>被リンク効果:</strong> このポータルから外部サイトへのリンクを設置できるため、SEO効果も期待できます。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>アクセス解析付き:</strong> 閲覧数、完了率、クリック率をリアルタイムで確認でき、改善のヒントが得られます。</span>
                        </li>
                    </ul>
                </div>
                <div className="text-center pt-8">
                    <button onClick={()=>setPage('editor')} className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105">さっそく診断を作ってみる</button>
                </div>
            </div>
            <Footer setPage={setPage} onCreate={()=>setPage('editor')} user={user} setShowAuth={setShowAuth} variant="light" />
        </div>
    );
};

// --- Quiz Logic Page ---
export const QuizLogicPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { 
        document.title = "バズる診断の作り方 | 診断クイズメーカー"; 
        window.scrollTo(0, 0);
    }, []);
    
    const logics = [
        { icon: Target, title: "1. ターゲットの「不安」を特定する", text: "「誰の、どんな悩みを解決するか」を明確にします。単なる「性格診断」ではなく、「起業に失敗したくない人のための適性診断」のようにベネフィットを提示しましょう。" },
        { icon: Heart, title: "2. バーナム効果で信頼させる", text: "誰にでも当てはまることを「自分のことだ」と思わせる心理テクニックです。「一見大胆ですが、繊細な一面も…」のような多面的な記述が共感を呼びます。" },
        { icon: Megaphone, title: "3. 具体的なアクションへ誘導", text: "結果を見て終わりではなく、「このタイプにおすすめの商品」「解決策がわかるLINE」など、次の行動（CTA）を必ずボタンとして設置しましょう。" },
        { icon: Sparkles, title: "4. 「シェアしたくなる」タイトル", text: "「○○力」「○○度」といった数値化や、「実は…」といった意外性をタイトルに入れると、SNSでのクリック率が大幅に上がります。" },
        { icon: ImageIcon, title: "5. 視覚的なインパクト", text: "文字だけでなく、魅力的なメイン画像を設定しましょう。特にチャット形式の場合、アイコンやテンポの良い会話設計が離脱を防ぎます。" },
        { icon: Smartphone, title: "6. 入力ハードルを下げる", text: "質問数は3〜5問がベストです。多すぎると途中で離脱されます。スマホでサクサク答えられるボリューム感を意識しましょう。" },
        { icon: Eye, title: "7. 承認欲求を満たす結果", text: "悪い結果が出ても、必ずポジティブなフォローを入れましょう。「あなたはダメです」ではなく「伸びしろがあります」と伝えることで、シェアされやすくなります。" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="bg-orange-500 text-white py-16 px-6 text-center">
                <h1 className="text-3xl font-extrabold mb-4">思わずシェアしたくなる！<br/><span className="text-yellow-200">「売れる診断」</span>の鉄板ロジック</h1>
                <p className="text-orange-100 max-w-xl mx-auto">人が動く心理トリガーを押さえた、効果的な診断コンテンツの作り方を伝授します。</p>
            </div>
            <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-500 font-bold hover:text-orange-600 mb-4"><ArrowLeft size={16}/> 戻る</button>
                <div className="space-y-6">
                    {logics.map((logic, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                            <div className="flex-shrink-0 bg-orange-100 text-orange-600 p-3 rounded-full h-fit"><logic.icon size={24}/></div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{logic.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{logic.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center pt-8">
                    <button onClick={()=>setPage('editor')} className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all transform hover:scale-105">このロジックで作ってみる</button>
                </div>
            </div>
            <Footer setPage={setPage} onCreate={()=>setPage('editor')} user={user} setShowAuth={setShowAuth} variant="light" />
        </div>
    );
};

// --- HowTo Page (Updated) ---
export const HowToPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { 
        document.title = "使い方・機能一覧 | 診断クイズメーカー"; 
        window.scrollTo(0, 0);
    }, []);
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="py-12 px-4 max-w-4xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">機能一覧・使い方ガイド</h1>
                
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-xl">
                            <Unlock size={24} className="text-blue-500"/> 基本機能 (無料)
                        </div>
                        <ul className="space-y-4 text-sm text-gray-800">
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Zap size={16}/></span><span><strong>ステップ形式エディタ:</strong> 初心者でも迷わない4ステップ作成</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Sparkles size={16}/></span><span><strong>AI自動生成:</strong> テーマ入力で質問・結果を自動作成</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><FileText size={16}/></span><span><strong>豊富なテンプレート:</strong> ビジネス・教育・占いの3カテゴリ</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><ImageIcon size={16}/></span><span><strong>画像機能:</strong> アップロード・自動選択・URL指定</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Smile size={16}/></span><span><strong>5種類のデザインテーマ:</strong> 和風・サイバー・パステルなど</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><MessageCircle size={16}/></span><span><strong>レイアウト切替:</strong> カード型 / チャット型(LINE風)</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Eye size={16}/></span><span><strong>リアルタイムプレビュー:</strong> 作成中に見た目を確認</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><TrendingUp size={16}/></span><span><strong>人気ランキング:</strong> プレイ回数・急上昇の2軸表示</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><BarChart2 size={16}/></span><span><strong>アクセス解析:</strong> 閲覧数・完了率・CTRをグラフ化</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Mail size={16}/></span><span><strong>リード獲得:</strong> 結果表示前にメールアドレス収集</span></li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">DONATION</div>
                        <div className="flex items-center gap-2 mb-4 text-indigo-900 font-bold text-xl">
                            <Lock size={24} className="text-orange-500"/> Pro機能 (寄付で開放)
                        </div>
                        <p className="text-xs text-indigo-700 mb-4">※クイズごとに任意の金額(500円〜)を寄付いただくと開放されます。</p>
                        {/* ★修正: 文字色を濃く修正 */}
                        <ul className="space-y-4 text-sm text-gray-800">
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Download size={16}/></span><span><strong>HTML書き出し:</strong> 自社サーバーに設置可能なファイルをDL</span></li>
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Code size={16}/></span><span><strong>埋め込みタグ発行:</strong> ブログやHPに診断を埋め込み</span></li>
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><FileText size={16}/></span><span><strong>リストCSV出力:</strong> 獲得したメールアドレスを一括DL</span></li>
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Heart size={16}/></span><span><strong>開発者支援:</strong> ツールの継続的なアップデートを支援</span></li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-8 text-gray-800 leading-relaxed border-t pt-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Zap className="text-indigo-600"/> 診断作成の4ステップ
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
                                <h3 className="font-bold text-lg mb-3 text-indigo-900">ステップ1: クイズの種類を選択</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                    <li><strong>ビジネス診断:</strong> 性格・タイプ診断（配点方式）</li>
                                    <li><strong>学習テスト:</strong> 正解・不正解のクイズ</li>
                                    <li><strong>占い:</strong> ランダム結果表示</li>
                                </ul>
                                <p className="mt-3 text-sm text-indigo-700">💡 テンプレート選択、AI自動生成、ゼロから作成の3つの方法から選べます</p>
                            </div>
                            
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                <h3 className="font-bold text-lg mb-3 text-blue-900">ステップ2: 基本設定</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                    <li><strong>タイトル・説明文:</strong> SEOを意識したキャッチーな文言を</li>
                                    <li><strong>デザインテーマ:</strong> 和風・サイバー・パステルなど5種類</li>
                                    <li><strong>レイアウト:</strong> カード型 or チャット型</li>
                                    <li><strong>メイン画像:</strong> アップロード・URL・自動選択</li>
                                    <li><strong>高度な設定:</strong> リード獲得機能のON/OFF</li>
                                </ul>
                            </div>
                            
                            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                                <h3 className="font-bold text-lg mb-3 text-green-900">ステップ3: 質問作成</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                    <li><strong>質問数:</strong> 最大10問（推奨は3〜5問）</li>
                                    <li><strong>選択肢:</strong> 各質問に2〜6個の選択肢</li>
                                    <li><strong>スコア配分:</strong> レスポンシブグリッドで見やすく入力</li>
                                    <li><strong>テストモード:</strong> 正解にチェックを入れるだけ</li>
                                </ul>
                            </div>
                            
                            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                                <h3 className="font-bold text-lg mb-3 text-orange-900">ステップ4: 結果ページ</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                    <li><strong>結果パターン:</strong> 最大10パターン（A〜J）</li>
                                    <li><strong>誘導ボタン:</strong> リンク・LINE・QRコードの3種類</li>
                                    <li><strong>完成・公開:</strong> URLが自動発行され、即座にシェア可能</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Briefcase className="text-indigo-600"/> ビジネス診断の作り方</h2>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <p className="mb-2 text-sm font-bold text-indigo-800">例：「あなたのリーダータイプ診断」</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                <li><strong>配点方式:</strong> 選択肢ごとにA, B, C...のタイプに点数を割り振ります。</li>
                                <li><strong>結果判定:</strong> 最終的に最も点数が高かったタイプの結果が表示されます。</li>
                                <li><strong>複数パターン:</strong> 最大10タイプまで設定可能（A〜J）</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><GraduationCap className="text-orange-500"/> 2. 学習・検定の作り方</h2>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <p className="mb-2 text-sm font-bold text-orange-800">例：「中学歴史マスター検定」</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                <li><strong>正解設定:</strong> 正解の選択肢にチェックを入れます。</li>
                                <li><strong>結果判定:</strong> 正解数に応じて、自動的にランク（S〜Cなど）が判定されます。</li>
                                <li><strong>演出:</strong> 回答時に「正解！」のフィードバックや、満点時の紙吹雪演出があります。</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Sparkles className="text-purple-600"/> 3. 占いの作り方</h2>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <p className="mb-2 text-sm font-bold text-purple-800">例：「今日のラッキーアイテム占い」</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                <li><strong>ランダム:</strong> 質問への回答に関わらず、用意した結果の中からランダムに一つが表示されます。</li>
                                <li><strong>手軽さ:</strong> 複雑なロジックなしで、おみくじのようなコンテンツが作れます。</li>
                            </ul>
                        </div>
                    </section>

                    <div className="border-t pt-8 mt-8">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">利用規約・免責事項</h2>
                        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">1. サービスの利用について</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>本サービスは、無料で診断クイズを作成・公開できるプラットフォームです。</li>
                                    <li>ユーザー登録により、作成した診断の管理・編集・分析機能をご利用いただけます。</li>
                                    <li>本サービスを利用するには、本規約に同意いただく必要があります。</li>
                                </ul>
                            </section>
                            
                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">2. コンテンツの権利と責任</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>作成者の権利:</strong> ユーザーが作成した診断クイズの著作権は作成者に帰属します。</li>
                                    <li><strong>商用利用:</strong> 作成したコンテンツは個人・商用を問わず自由にご利用いただけます。</li>
                                    <li><strong>コピーライト表記:</strong> 診断結果画面のフッターにある「© Shindan Quiz Maker」の表記は削除しないでください。</li>
                                    <li><strong>禁止事項:</strong> 公序良俗に反する内容、第三者の権利を侵害する内容、違法な内容を含む診断の作成・公開は禁止します。</li>
                                    <li><strong>コンテンツの削除:</strong> 規約に違反する診断や、権利侵害の申し立てがあった診断は、予告なく削除する場合があります。</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">3. 著作権について</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>診断クイズ内で使用する画像・テキスト等は、ご自身が権利を有するもの、または適切なライセンスのもとで使用可能なものをご利用ください。</li>
                                    <li>第三者の著作物を無断で使用した場合、使用者が一切の責任を負うものとします。</li>
                                    <li>本プラットフォームのシステム・デザイン・ロゴ等の著作権は運営者に帰属します。</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">4. Pro機能（寄付）について</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Pro機能は、クイズごとに任意の金額（500円〜）を寄付いただくことで開放されます。</li>
                                    <li><strong>返金について:</strong> デジタルコンテンツの性質上、寄付完了後の返金・キャンセルには応じられません。</li>
                                    <li>寄付いただいた金額は、サービスの維持・改善に使用されます。</li>
                                    <li>決済はStripeを通じて安全に行われ、当サービスがクレジットカード情報を保持することはありません。</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">5. 免責事項</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>本サービスは現状のまま提供され、運営者はサービスの正確性・完全性・有用性について一切保証しません。</li>
                                    <li>本サービスの利用によって生じたいかなる損害（直接・間接を問わず）についても、運営者は一切の責任を負いません。</li>
                                    <li>サービスの中断・終了・データの消失等により生じた損害についても、運営者は責任を負いません。</li>
                                    <li>診断を通じて収集した個人情報の管理責任は、診断作成者に帰属します。</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">6. サービスの変更・終了</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>運営者は、ユーザーへの事前通知なしに、サービス内容の変更・追加・削除を行うことができます。</li>
                                    <li>運営者は、やむを得ない事情がある場合、サービスの全部または一部を終了することができます。</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">7. 規約の変更</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>本規約は、必要に応じて予告なく変更される場合があります。</li>
                                    <li>変更後もサービスを継続してご利用いただくことで、変更後の規約に同意したものとみなします。</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">8. 準拠法・管轄裁判所</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>本規約は日本法に準拠し、解釈されます。</li>
                                    <li>本サービスに関する紛争については、運営者の所在地を管轄する裁判所を専属的合意管轄とします。</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            <Footer setPage={setPage} onCreate={()=>setPage('editor')} user={user} setShowAuth={setShowAuth} variant="light" />
        </div>
    );
};

// --- FAQ Page ---
export const FaqPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { 
        document.title = "よくある質問 | 診断クイズメーカー"; 
        window.scrollTo(0, 0);
    }, []);
    const [openIndex, setOpenIndex] = useState(null);
    const faqs = [
        { category: "一般", q: "無料で使えますか？", a: "はい、作成・公開・分析の基本機能はすべて無料でご利用いただけます。ステップ形式エディタ、AI自動生成、テンプレート、プレビュー、アクセス解析、人気ランキングなど、すべて無料です。" },
        { category: "一般", q: "商用利用は可能ですか？", a: "可能です。作成したコンテンツは、ご自身のビジネス（LINE誘導、集客、リード獲得）や教育現場で自由にご活用ください。" },
        { category: "機能", q: "ステップ形式エディタとは？", a: "2024年12月に実装された新機能です。①クイズの種類選択 → ②基本設定 → ③質問作成 → ④結果ページ の4ステップで、初心者でも迷わず診断を作成できます。" },
        { category: "機能", q: "AI自動生成の精度は？", a: "テーマを入力するだけで、質問5問・結果3パターンを自動生成します。生成後に自由に編集できるため、たたき台として非常に便利です。" },
        { category: "機能", q: "デザインテーマは何種類？", a: "スタンダード、サイバーパンク、和風・雅、パステルポップ、モノトーンの5種類から選べます。それぞれ異なる雰囲気で診断を演出できます。" },
        { category: "機能", q: "プレビュー機能はありますか？", a: "はい、ヘッダーの「プレビュー」ボタンから、作成中の診断をリアルタイムで確認できます。保存前に見た目をチェックできるので安心です。" },
        { category: "機能", q: "人気ランキングとは？", a: "トップページに「今週のプレイ回数ランキング」と「急上昇ランキング」が表示されます。人気の診断が可視化され、新規ユーザーの参考になります。" },
        { category: "機能", q: "リード獲得機能とは？", a: "結果表示の前にメールアドレスの入力を求める機能です。診断を通じて自然な流れで顧客リストを獲得できます。" },
        { category: "Pro機能", q: "Pro機能（寄付）とは？", a: "クイズごとに任意の金額（500円〜）を寄付いただくことで、「HTMLダウンロード」「埋め込みコード発行」「収集したメールアドレスのCSVダウンロード」機能が開放されます。" },
        { category: "技術", q: "スマホでも使えますか？", a: "はい、完全レスポンシブ対応です。作成も閲覧もスマホで快適に行えます。" },
        { category: "技術", q: "SEO対策はされていますか？", a: "はい、構造化データ、メタタグ、適切なタイトル設定など、基本的なSEO対策は実装済みです。" },
    ];
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="max-w-3xl mx-auto py-12 px-4">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">よくある質問</h1>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full px-6 py-4 text-left font-bold text-gray-800 flex justify-between items-center hover:bg-gray-50">
                                <span className="flex items-center gap-3"><span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">{faq.category}</span>{faq.q}</span>
                                {openIndex === i ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                            </button>
                            {openIndex === i && <div className="px-6 py-4 bg-gray-50 text-gray-600 text-sm leading-relaxed border-t border-gray-100">{faq.a}</div>}
                        </div>
                    ))}
                </div>
            </div>
            <Footer setPage={setPage} onCreate={()=>window.location.href='/business/dashboard'} user={user} setShowAuth={setShowAuth} variant="light" />
        </div>
    );
};

export const PricePage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    return <FaqPage onBack={onBack} setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />;
};

// --- Contact Page ---
export const ContactPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { 
        document.title = "お問い合わせ | 診断クイズメーカー"; 
        window.scrollTo(0, 0);
    }, []);
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="py-12 px-4 max-w-2xl mx-auto text-center">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600 mx-auto"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">お問い合わせ</h1>
                <p className="text-gray-600 mb-8">
                    機能へのご要望、不具合のご報告、その他ご質問は以下のフォームよりお問い合わせください。<br/>
                    原則として3営業日以内にご返信いたします。
                </p>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSd8euNVubqlITrCF2_W7VVBjLd2mVxzOIcJ67pNnk3GPLnT_A/viewform" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105">
                    <Mail size={20}/> お問い合わせフォームを開く
                </a>
            </div>
            <Footer setPage={setPage} onCreate={()=>setPage('editor')} user={user} setShowAuth={setShowAuth} variant="light" />
        </div>
    );
};

// --- Legal Page ---
export const LegalPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { 
        document.title = "特定商取引法に基づく表記 | 診断クイズメーカー"; 
        window.scrollTo(0, 0);
    }, []);
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="py-12 px-4 max-w-3xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2"><Scale className="text-gray-400"/> 特定商取引法に基づく表記</h1>
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
                            [電話番号]<br/>
                            [メールアドレス]<br/>
                            またはお問い合わせフォームよりご連絡ください。
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
            <Footer setPage={setPage} onCreate={()=>setPage('editor')} user={user} setShowAuth={setShowAuth} variant="light" />
        </div>
    );
};

// --- Privacy Page ---
export const PrivacyPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { 
        document.title = "プライバシーポリシー | プロフィールLPメーカー"; 
        window.scrollTo(0, 0);
    }, []);
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="py-12 px-4 max-w-3xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2"><Shield className="text-gray-400"/> プライバシーポリシー</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-sm leading-relaxed space-y-6 text-gray-700">
                    <p>プロフィールLPメーカー（以下、「当サービス」）は、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」）を定めます。</p>
                    
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">1. 個人情報の収集</h3>
                        <p>当サービスは、ユーザー登録時や決済時に、メールアドレス、クレジットカード情報（決済代行会社が管理）等の情報を収集する場合があります。また、作成されたクイズを通じて収集される回答者のメールアドレス等の情報は、クイズ作成者の責任において管理されます。</p>
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
            <Footer setPage={setPage} onCreate={()=>setPage('editor')} user={user} setShowAuth={setShowAuth} variant="light" />
        </div>
    );
};

// --- Profile LP Maker用のページ ---

// --- Profile Effective Use Page ---
export const ProfileEffectiveUsePage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { 
        document.title = "効果的な使い方・メリット | LPチラシメーカー（エルチラ）"; 
        window.scrollTo(0, 0);
    }, []);
    
    const tips = [
        { icon: Share2, color: "text-blue-600", bg: "bg-blue-100", title: "1. SNS拡散で集客", text: "ビジネスLPは「シェアしやすい」コンテンツです。魅力的なLPはX(Twitter)やInstagramでシェアされやすく、広告費をかけずに認知が広がります。" },
        { icon: Search, color: "text-purple-600", bg: "bg-purple-100", title: "2. SEO & AI検索対策", text: "LPに外部サイトへのリンクを設置することで、SEO効果が期待できます。また、構造化データによりChatGPTなどのAI検索からの流入も狙えます。" },
        { icon: Megaphone, color: "text-green-600", bg: "bg-green-100", title: "3. 自然な集客導線", text: "いきなり売り込むのではなく、「LPを見る」という自然な流れで、あなたのサービスや商品への導線を強化できます。" },
        { icon: Target, color: "text-red-600", bg: "bg-red-100", title: "4. サービスを効果的に告知", text: "LPに「問い合わせ」「予約」「LINE登録」などのCTAボタンを設置できます。LPを通じて興味を持った見込み客に、自然な流れでサービスを紹介できます。" },
        { icon: TrendingUp, color: "text-yellow-600", bg: "bg-yellow-100", title: "5. 集客のテストができる", text: "どんなLPが人気なのか、どんな導線でクリック率が高いのかをリアルタイムに分析できます。本格的な広告投資の前に、低コストで顧客の反応をテストしましょう。" },
        { icon: QrCode, color: "text-gray-800", bg: "bg-gray-100", title: "6. リアル店舗・イベントでの活用", text: "QRコードを発行してチラシや店頭に掲示しましょう。「待ち時間の暇つぶし」としてLPを見てもらいつつ、会員登録や予約へ誘導できます。" },
        { icon: Users, color: "text-indigo-600", bg: "bg-indigo-100", title: "7. コンサル・士業の集客に", text: "サービス内容や実績、お客様の声をまとめて、見込み客へ訴求。問い合わせや相談予約へスムーズに誘導できます。" },
        { icon: GraduationCap, color: "text-orange-600", bg: "bg-orange-100", title: "8. 店舗のリンク集に", text: "メニュー、料金、アクセス、予約リンクを1ページに集約。顧客が迷わず必要な情報にアクセスできます。" },
        { icon: Repeat, color: "text-pink-600", bg: "bg-pink-100", title: "9. フリーランスの営業資料に", text: "実績やスキル、サービス内容を魅力的に提示し、仕事の依頼を増やす。LPを営業資料として使うことで、印象を残せます。" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="bg-indigo-900 text-white py-16 px-6 text-center">
                <h1 className="text-3xl font-extrabold mb-4">ビジネスLPの<span className="text-yellow-300">効果的な活用法 9選</span></h1>
                <p className="text-indigo-200 max-w-xl mx-auto">作成したLPを最大限に活かし、集客と売上につなげるための具体的なアイデアをご紹介します。あなたのビジネスを加速させるヒントが満載です。</p>
            </div>
            <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600 mb-4"><ArrowLeft size={16}/> 戻る</button>
                <div className="grid md:grid-cols-2 gap-6">
                    {tips.map((tip, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 p-3 rounded-full ${tip.bg} ${tip.color}`}><tip.icon size={24}/></div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{tip.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-100 mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Sparkles className="text-yellow-500"/> このプラットフォームでビジネスLPを作るメリット
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>無料で始められる:</strong> アカウント登録なしで、すぐに美しいビジネスLPを作成できます。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>即座にシェア可能:</strong> 作成したLPは自動的に公開され、URLが発行されます。SNSで即座にシェアして拡散できます。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>AIアシスタント:</strong> ビジネス内容・ターゲット・強みを入力するだけで、キャッチコピーや説明文、CTA構成を自動生成します。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>被リンク効果:</strong> LPから外部サイトへのリンクを設置できるため、SEO効果も期待できます。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>HTMLダウンロード:</strong> ログインして寄付（購入）することで、HTMLファイルをダウンロードして自社サーバーに設置できます。</span>
                        </li>
                    </ul>
                </div>
                <div className="text-center pt-8">
                    <button onClick={()=>window.location.href='/business/dashboard'} className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105">さっそくビジネスLPを作ってみる</button>
                </div>
            </div>
            <Footer setPage={setPage} onCreate={()=>window.location.href='/business/dashboard'} user={user} setShowAuth={setShowAuth} variant="light" />
        </div>
    );
};

// --- Profile HowTo Page ---
export const ProfileHowToPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { 
        document.title = "使い方・機能一覧 | LPチラシメーカー（エルチラ）"; 
        window.scrollTo(0, 0);
    }, []);
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="py-12 px-4 max-w-4xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">機能一覧・使い方ガイド</h1>
                
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-xl">
                            <Unlock size={24} className="text-blue-500"/> 基本機能 (無料)
                        </div>
                        <ul className="space-y-4 text-sm text-gray-800">
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Zap size={16}/></span><span><strong>ブロック形式エディタ:</strong> ヘッダー・テキスト・画像・YouTube・リンク集を自由に配置</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Sparkles size={16}/></span><span><strong>AI自動生成:</strong> 職業・ターゲット・強みから自動でコンテンツ生成</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><FileText size={16}/></span><span><strong>背景カスタマイズ:</strong> 5種類の動くグラデーション or カスタム画像</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><ImageIcon size={16}/></span><span><strong>画像アップロード:</strong> Supabase Storageで安全に画像を管理</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Eye size={16}/></span><span><strong>リアルタイムプレビュー:</strong> 作成中に見た目を確認</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Smartphone size={16}/></span><span><strong>完全レスポンシブ:</strong> スマホ・PCどちらでも美しく表示</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Share2 size={16}/></span><span><strong>即座に公開:</strong> URLが自動発行され、すぐにシェア可能</span></li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">DONATION</div>
                        <div className="flex items-center gap-2 mb-4 text-indigo-900 font-bold text-xl">
                            <Lock size={24} className="text-orange-500"/> Pro機能 (寄付で開放)
                        </div>
                        <p className="text-xs text-indigo-700 mb-4">※LPごとに任意の金額(500円〜)を寄付いただくと開放されます。</p>
                        <ul className="space-y-4 text-sm text-gray-800">
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Download size={16}/></span><span><strong>HTML書き出し:</strong> 自社サーバーに設置可能なファイルをDL</span></li>
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Code size={16}/></span><span><strong>埋め込みタグ発行:</strong> ブログやHPにLPを埋め込み</span></li>
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Heart size={16}/></span><span><strong>開発者支援:</strong> ツールの継続的なアップデートを支援</span></li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-8 text-gray-800 leading-relaxed border-t pt-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Zap className="text-indigo-600"/> ビジネスLP作成の流れ
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
                                <h3 className="font-bold text-lg mb-3 text-indigo-900">ステップ1: ブロックを追加</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                    <li><strong>ヘッダー:</strong> プロフィール画像・名前・キャッチコピー</li>
                                    <li><strong>テキストカード:</strong> 自己紹介やメインメッセージ</li>
                                    <li><strong>画像:</strong> 作品や実績の画像</li>
                                    <li><strong>YouTube:</strong> 動画コンテンツの埋め込み</li>
                                    <li><strong>リンク集:</strong> SNSや外部サイトへのリンク</li>
                                </ul>
                                <p className="mt-3 text-sm text-indigo-700">💡 AIで自動生成ボタンから、職業・ターゲット・強みを入力するだけで自動でコンテンツが生成されます</p>
                            </div>
                            
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                <h3 className="font-bold text-lg mb-3 text-blue-900">ステップ2: 背景をカスタマイズ</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                    <li><strong>背景パターン:</strong> 5種類の動くグラデーションから選択</li>
                                    <li><strong>背景画像:</strong> カスタム画像をアップロード</li>
                                </ul>
                            </div>
                            
                            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                                <h3 className="font-bold text-lg mb-3 text-green-900">ステップ3: プレビューで確認</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                    <li><strong>リアルタイムプレビュー:</strong> 作成中に見た目を確認</li>
                                    <li><strong>スマホ・PC表示:</strong> レスポンシブデザインで自動調整</li>
                                </ul>
                            </div>
                            
                            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                                <h3 className="font-bold text-lg mb-3 text-orange-900">ステップ4: 保存・公開</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                    <li><strong>保存:</strong> プロフィールを保存するとURLが自動発行</li>
                                    <li><strong>公開URL:</strong> コピーしてSNSでシェア</li>
                                    <li><strong>ログイン:</strong> ログインすると編集・削除・HTMLダウンロードが可能</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Shield className="text-indigo-600"/> 利用規約・免責事項
                        </h2>
                        <div className="space-y-4 text-sm text-gray-700">
                            <p>「LPチラシメーカー（エルチラ）」（以下、本サービス）をご利用いただく際の基本的なルールと免責事項です。ご利用前に必ずご確認ください。</p>
                            <ol className="space-y-3 list-decimal list-inside">
                                <li><strong>サービスの利用について:</strong> 本サービスは無料でビジネスLPを作成・公開できるプラットフォームです。利用には本規約への同意が必要です。</li>
                                <li><strong>コンテンツの権利と責任:</strong> 作成したLPの著作権は作成者に帰属します。個人・商用を問わず利用可能ですが、公序良俗違反・権利侵害・違法な内容の掲載は禁止します。違反コンテンツは予告なく削除する場合があります。</li>
                                <li><strong>著作権について:</strong> 使用する画像・テキスト等は適切な権利を有するものをご利用ください。第三者素材の無断使用による責任は利用者が負います。本サービスのシステム・デザイン等の著作権は運営者に帰属します。</li>
                                <li><strong>Pro機能（寄付）について:</strong> 500円〜の任意の寄付でPro機能が開放されます。デジタルコンテンツの性質上、寄付後の返金・キャンセルはできません。決済はStripeを通じて安全に行われます。</li>
                                <li><strong>免責事項:</strong> 本サービスは現状有姿で提供され、正確性・完全性・有用性を保証しません。利用により生じる損害やサービス中断・データ消失等について運営者は責任を負いません。収集した個人情報の管理はLP作成者の責任とします。</li>
                                <li><strong>サービスの変更・終了:</strong> 運営者は予告なくサービス内容の変更・追加・削除、または全部・一部の終了を行うことがあります。</li>
                                <li><strong>規約の変更:</strong> 必要に応じて本規約を変更します。変更後も利用を継続した場合、変更後の規約に同意したものとみなします。</li>
                                <li><strong>準拠法・管轄:</strong> 本規約は日本法に準拠し、紛争は運営者所在地を管轄する裁判所を専属管轄とします。</li>
                            </ol>
                        </div>
                    </section>
                </div>
            </div>
            <Footer setPage={setPage} onCreate={()=>window.location.href='/business/dashboard'} user={user} setShowAuth={setShowAuth} variant="light" />
        </div>
    );
};

// --- Profile Logic Page (売れるLPの作り方) ---
export const ProfileLogicPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { 
        document.title = "売れるLPの作り方 | LPチラシメーカー（エルチラ）"; 
        window.scrollTo(0, 0);
    }, []);
    
    const logics = [
        { icon: Target, title: "1. ターゲットの「悩み」を明確にする", text: "「誰の、どんな課題を解決するか」を最初に決めます。「なんでも対応」ではなく、「起業初期の集客に悩む個人事業主向け」のように具体的に絞ることで、刺さるLPが作れます。" },
        { icon: Heart, title: "2. ベネフィットを最初に伝える", text: "サービスの特徴ではなく、「お客様が得られる未来」を最初に見せましょう。「Web制作します」より「24時間働く営業マンを手に入れませんか？」の方が心に響きます。" },
        { icon: Megaphone, title: "3. キャッチコピーで心を掴む", text: "最初の3秒で離脱されるか決まります。「○○で悩んでいませんか？」「たった○日で○○を実現」など、読み手の感情を動かすフレーズを冒頭に置きましょう。" },
        { icon: Sparkles, title: "4. 実績・お客様の声で信頼を獲得", text: "「○○件の実績」「お客様満足度○%」など、数字で示せる実績は強力です。お客様の声は「Before→After」形式で、具体的な変化を伝えると効果的です。" },
        { icon: ImageIcon, title: "5. ビジュアルで世界観を作る", text: "プロフィール写真、サービスイメージ、実績写真など、視覚的な要素でブランドイメージを統一しましょう。文字だけのLPより、画像があるLPの方が滞在時間が長くなります。" },
        { icon: Smartphone, title: "6. スマホファーストで設計する", text: "LPの閲覧の7割以上はスマホからです。長すぎる文章は避け、スクロールしやすいブロック構成を心がけましょう。CTAボタンは親指で押しやすい位置に配置します。" },
        { icon: Eye, title: "7. CTAは複数回、具体的に配置", text: "「お問い合わせはこちら」ではなく「無料相談を予約する」「LINEで質問する」など、次のアクションが明確なボタンを、ページ内に複数回配置しましょう。" },
        { icon: TrendingUp, title: "8. 限定性・緊急性を演出する", text: "「先着○名様限定」「○月○日まで」など、今すぐ行動する理由を作りましょう。ただし、嘘の限定性は信頼を損なうので、本当の限定オファーを用意することが大切です。" },
        { icon: Users, title: "9. FAQ・不安解消セクションを設ける", text: "「料金は？」「どのくらいで効果が出る？」「キャンセルは？」など、見込み客が抱く疑問に先回りして答えましょう。不安を解消することで、問い合わせのハードルが下がります。" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="bg-orange-500 text-white py-16 px-6 text-center">
                <h1 className="text-3xl font-extrabold mb-4">思わず問い合わせたくなる！<br/><span className="text-yellow-200">「売れるLP」</span>の鉄板ロジック</h1>
                <p className="text-orange-100 max-w-xl mx-auto">人が動く心理トリガーを押さえた、効果的なビジネスLPの作り方を伝授します。</p>
            </div>
            <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-500 font-bold hover:text-orange-600 mb-4"><ArrowLeft size={16}/> 戻る</button>
                <div className="space-y-6">
                    {logics.map((logic, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                            <div className="flex-shrink-0 bg-orange-100 text-orange-600 p-3 rounded-full h-fit"><logic.icon size={24}/></div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{logic.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{logic.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-8 rounded-2xl border border-orange-100 mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Sparkles className="text-yellow-500"/> LPチラシメーカーなら簡単に実現
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>AIアシスタント:</strong> ビジネス内容を入力するだけで、キャッチコピーや説明文を自動生成。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>ブロック形式:</strong> ヘッダー・テキスト・画像・リンク集をドラッグ&ドロップで自由に配置。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>即座に公開:</strong> 保存するだけでURLが発行され、すぐにシェア可能。</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            <span><strong>完全レスポンシブ:</strong> スマホでもPCでも美しく表示されるデザイン。</span>
                        </li>
                    </ul>
                </div>
                <div className="text-center pt-8">
                    <button onClick={()=>window.location.href='/business/dashboard/editor/new'} className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all transform hover:scale-105">このロジックでLPを作ってみる</button>
                </div>
            </div>
            <Footer setPage={setPage} onCreate={()=>window.location.href='/business/dashboard/editor/new'} user={user} setShowAuth={setShowAuth} variant="light" />
        </div>
    );
};

// --- Profile FAQ Page ---
export const ProfileFaqPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { 
        document.title = "よくある質問 | LPチラシメーカー（エルチラ）"; 
        window.scrollTo(0, 0);
    }, []);
    const [openIndex, setOpenIndex] = useState(null);
    const faqs = [
        { category: "一般", q: "無料で使えますか？", a: "はい、プロフィールLPの作成・公開の基本機能はすべて無料でご利用いただけます。ブロック形式エディタ、AI自動生成、背景カスタマイズ、リアルタイムプレビューなど、すべて無料です。" },
        { category: "一般", q: "商用利用は可能ですか？", a: "可能です。作成したプロフィールLPは、ご自身のビジネス（SNS拡散、集客、サービス紹介）で自由にご活用ください。" },
        { category: "一般", q: "ログインは必要ですか？", a: "プロフィールLPの作成・公開はログインなしでも可能です。ただし、編集・削除・HTMLダウンロード機能を使用する場合はログインが必要です。" },
        { category: "機能", q: "ブロック形式エディタとは？", a: "ヘッダー、テキストカード、画像、YouTube、リンク集などのブロックを自由に配置してプロフィールLPを作成できるエディタです。ドラッグ&ドロップで簡単にレイアウトを変更できます。" },
        { category: "機能", q: "AI自動生成の精度は？", a: "職業・ターゲット・強みを入力するだけで、キャッチコピーや自己紹介文、リンク構成を自動生成します。生成後に自由に編集できるため、たたき台として非常に便利です。" },
        { category: "機能", q: "背景はカスタマイズできますか？", a: "はい、5種類の動くグラデーションパターンから選択するか、カスタム画像をアップロードできます。プロフィールの雰囲気に合わせて自由に設定できます。" },
        { category: "機能", q: "プレビュー機能はありますか？", a: "はい、作成中のプロフィールLPをリアルタイムで確認できます。保存前に見た目をチェックできるので安心です。" },
        { category: "機能", q: "スマホでも見れますか？", a: "はい、完全レスポンシブ対応です。作成も閲覧もスマホで快適に行えます。" },
        { category: "機能", q: "画像はどこに保存されますか？", a: "アップロードした画像はSupabase Storageで安全に管理されます。画像URLを直接指定することも可能です。" },
        { category: "Pro機能", q: "Pro機能（寄付）とは？", a: "プロフィールごとに任意の金額（500円〜）を寄付いただくことで、「HTMLダウンロード」「埋め込みコード発行」機能が開放されます。自社サーバーに設置したい場合に便利です。" },
        { category: "技術", q: "SEO対策はされていますか？", a: "はい、構造化データ、メタタグ、適切なタイトル設定など、基本的なSEO対策は実装済みです。" },
        { category: "技術", q: "URLは変更できますか？", a: "プロフィールLPのURLは自動生成されますが、ログインして編集することで再生成することも可能です。" },
    ];
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="max-w-3xl mx-auto py-12 px-4">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">よくある質問</h1>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full px-6 py-4 text-left font-bold text-gray-800 flex justify-between items-center hover:bg-gray-50">
                                <span className="flex items-center gap-3"><span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">{faq.category}</span>{faq.q}</span>
                                {openIndex === i ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                            </button>
                            {openIndex === i && <div className="px-6 py-4 bg-gray-50 text-gray-600 text-sm leading-relaxed border-t border-gray-100">{faq.a}</div>}
                        </div>
                    ))}
                </div>
            </div>
            <Footer setPage={setPage} onCreate={()=>window.location.href='/business/dashboard'} user={user} setShowAuth={setShowAuth} variant="light" />
        </div>
    );
};