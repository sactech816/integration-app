'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { supabase } from '@/lib/supabase';
import { Brain, Users, Target, Heart, Zap, Compass, Star, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function BigFiveAboutPage() {
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('bigfive');

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  const toggleSection = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  return (
    <>
      <Header
        user={user}
        onLogout={async () => {
          await supabase?.auth.signOut();
          setUser(null);
        }}
        setShowAuth={setShowAuth}
      />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* 戻るリンク */}
          <Link
            href="/bigfive"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            診断ページに戻る
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              性格診断の科学的背景
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
              当サービスで使用している4つの診断フレームワークについて詳しく解説します
            </p>
          </div>

          <div className="space-y-4">
            {/* ==================== Big Five ==================== */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
              <button
                onClick={() => toggleSection('bigfive')}
                className="w-full flex items-center gap-4 p-5 sm:p-6 text-left hover:bg-gray-50 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">Big Five（ビッグファイブ）</h2>
                  <p className="text-sm text-gray-500">心理学で最も広く認められた性格モデル</p>
                </div>
                {expandedSection === 'bigfive' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {expandedSection === 'bigfive' && (
                <div className="px-5 sm:px-6 pb-6 border-t border-gray-100">
                  <div className="mt-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">概要</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        ビッグファイブ（Big Five）は、人間の性格を5つの基本特性で説明する心理学モデルです。
                        「OCEAN モデル」とも呼ばれ、数十年にわたる実証研究に基づいています。
                        文化や言語を超えて一貫した結果が得られることが確認されており、
                        現代の性格心理学で最も信頼性の高いフレームワークとされています。
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">5つの性格特性</h3>
                      <div className="space-y-3">
                        {[
                          { icon: Brain, label: '開放性（Openness）', color: 'from-purple-500 to-violet-500', desc: '新しい経験、芸術、知的好奇心への開放度。高い人は創造的で想像力豊か、低い人は現実的で慣習を好みます。' },
                          { icon: Target, label: '誠実性（Conscientiousness）', color: 'from-blue-500 to-cyan-500', desc: '計画性、責任感、自己規律の度合い。高い人は目標志向で組織的、低い人は柔軟で自発的です。' },
                          { icon: Users, label: '外向性（Extraversion）', color: 'from-amber-500 to-orange-500', desc: '社交性、活動性、ポジティブな感情の強さ。高い人はエネルギッシュで社交的、低い人は内省的で落ち着いています。' },
                          { icon: Heart, label: '協調性（Agreeableness）', color: 'from-green-500 to-emerald-500', desc: '思いやり、協力、信頼の度合い。高い人は親切で協力的、低い人は競争的で分析的です。' },
                          { icon: Zap, label: '情緒安定性（Neuroticism）', color: 'from-rose-500 to-pink-500', desc: '感情の不安定さ、ストレスへの反応性。高い人は感受性が強く繊細、低い人はストレスに強く冷静です。' },
                        ].map(({ icon: Icon, label, color, desc }) => (
                          <div key={label} className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mt-0.5`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{label}</p>
                              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">30のファセット</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        各特性はさらに6つのファセット（下位尺度）に分かれます。
                        本格診断（50問）以上では、この30のファセットを個別に分析し、
                        より立体的な性格プロファイルを提供します。
                        例えば「外向性」は、社交性・自己主張・活動性・刺激追求・ポジティブ感情・親しみやすさの6つに分かれます。
                      </p>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                      <p className="text-sm text-indigo-700">
                        <span className="font-bold">出典:</span> IPIP（International Personality Item Pool）の公開ドメイン質問項目を使用。
                        Costa & McCrae (1992) のNEO-PI-R理論に基づき、独自に日本語化しています。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ==================== 16パーソナリティ ==================== */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
              <button
                onClick={() => toggleSection('personality16')}
                className="w-full flex items-center gap-4 p-5 sm:p-6 text-left hover:bg-gray-50 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">16パーソナリティタイプ</h2>
                  <p className="text-sm text-gray-500">Big Five から導き出す16の性格タイプ</p>
                </div>
                {expandedSection === 'personality16' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {expandedSection === 'personality16' && (
                <div className="px-5 sm:px-6 pb-6 border-t border-gray-100">
                  <div className="mt-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">概要</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Big Five の5つの特性を4つの次元（外向/内向、直感/感覚、思考/感情、判断/知覚）に変換し、
                        16の性格タイプ（INTJ、ENFPなど）に分類するシステムです。
                        ユング心理学の類型論を科学的なBig Five理論で裏付けています。
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">4つの次元</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { dim: 'E / I', label: '外向型 / 内向型', desc: '外向性スコアに基づく', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                          { dim: 'N / S', label: '直感型 / 感覚型', desc: '開放性スコアに基づく', color: 'bg-purple-50 border-purple-200 text-purple-700' },
                          { dim: 'T / F', label: '思考型 / 感情型', desc: '協調性スコアに基づく', color: 'bg-green-50 border-green-200 text-green-700' },
                          { dim: 'J / P', label: '判断型 / 知覚型', desc: '誠実性スコアに基づく', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                        ].map(({ dim, label, desc, color }) => (
                          <div key={dim} className={`${color} border rounded-xl p-3`}>
                            <p className="font-bold text-sm">{dim}</p>
                            <p className="text-xs font-medium">{label}</p>
                            <p className="text-xs opacity-70 mt-0.5">{desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">16タイプ一覧</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { code: 'INTJ', name: '建築家' }, { code: 'INTP', name: '論理学者' },
                          { code: 'ENTJ', name: '指揮官' }, { code: 'ENTP', name: '討論者' },
                          { code: 'INFJ', name: '提唱者' }, { code: 'INFP', name: '仲介者' },
                          { code: 'ENFJ', name: '主人公' }, { code: 'ENFP', name: '広報運動家' },
                          { code: 'ISTJ', name: '管理者' }, { code: 'ISFJ', name: '擁護者' },
                          { code: 'ESTJ', name: '幹部' }, { code: 'ESFJ', name: '領事官' },
                          { code: 'ISTP', name: '巨匠' }, { code: 'ISFP', name: '冒険家' },
                          { code: 'ESTP', name: '起業家' }, { code: 'ESFP', name: 'エンターテイナー' },
                        ].map(({ code, name }) => (
                          <div key={code} className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs font-bold text-gray-900">{code}</p>
                            <p className="text-xs text-gray-500">{name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ==================== DISC ==================== */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
              <button
                onClick={() => toggleSection('disc')}
                className="w-full flex items-center gap-4 p-5 sm:p-6 text-left hover:bg-gray-50 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">DISC 行動スタイル</h2>
                  <p className="text-sm text-gray-500">ビジネスで広く活用される行動特性モデル</p>
                </div>
                {expandedSection === 'disc' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {expandedSection === 'disc' && (
                <div className="px-5 sm:px-6 pb-6 border-t border-gray-100">
                  <div className="mt-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">概要</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        DISC理論は、心理学者ウィリアム・マーストン（1928年）が提唱した行動特性モデルです。
                        人間の行動を4つの基本スタイルに分類し、
                        特にビジネスシーンでのコミュニケーション改善やチームビルディングに活用されています。
                        当サービスでは、Big Five のスコアから DISC スタイルを自動算出しています。
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">4つの行動スタイル</h3>
                      <div className="space-y-3">
                        {[
                          { letter: 'D', name: '主導型（Dominance）', color: 'bg-red-50 border-red-200', textColor: 'text-red-700', badge: 'bg-red-500', desc: '結果志向で決断力がある。挑戦を好み、直接的なコミュニケーションスタイル。リーダーシップを発揮し、目標達成に向けて推進します。' },
                          { letter: 'I', name: '感化型（Influence）', color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-700', badge: 'bg-yellow-500', desc: '社交的で楽観的。人を巻き込む力があり、チームの雰囲気を明るくします。コラボレーションとアイデア共有を重視します。' },
                          { letter: 'S', name: '安定型（Steadiness）', color: 'bg-green-50 border-green-200', textColor: 'text-green-700', badge: 'bg-green-500', desc: '忍耐強く協力的。安定した環境を好み、チームのサポート役として活躍します。信頼性が高く、着実に物事を進めます。' },
                          { letter: 'C', name: '慎重型（Conscientiousness）', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', badge: 'bg-blue-500', desc: '分析的で正確性を重視。データと事実に基づいて判断し、品質の高い成果を追求します。緻密な計画と論理的思考が得意です。' },
                        ].map(({ letter, name, color, textColor, badge, desc }) => (
                          <div key={letter} className={`${color} border rounded-xl p-4`}>
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-8 h-8 rounded-full ${badge} flex items-center justify-center`}>
                                <span className="text-white font-bold">{letter}</span>
                              </div>
                              <p className={`font-bold ${textColor}`}>{name}</p>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">ビジネスでの活用</h3>
                      <ul className="space-y-1.5 text-sm text-gray-700">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">+</span>チームメンバーの強みと弱みの把握</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">+</span>効果的なコミュニケーション方法の理解</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">+</span>適材適所の人材配置</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">+</span>営業・マネジメントスタイルの改善</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ==================== エニアグラム ==================== */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
              <button
                onClick={() => toggleSection('enneagram')}
                className="w-full flex items-center gap-4 p-5 sm:p-6 text-left hover:bg-gray-50 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">エニアグラム</h2>
                  <p className="text-sm text-gray-500">9つの性格タイプと深層心理の分析</p>
                </div>
                {expandedSection === 'enneagram' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {expandedSection === 'enneagram' && (
                <div className="px-5 sm:px-6 pb-6 border-t border-gray-100">
                  <div className="mt-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">概要</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        エニアグラムは、人間の性格を9つの基本タイプに分類する性格類型論です。
                        各タイプには固有の動機、恐れ、成長の方向性があり、
                        表面的な行動だけでなく、その背後にある深層的な心理パターンを理解できます。
                        古代の知恵と現代心理学を融合した、自己理解と他者理解のためのツールです。
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">9つのタイプ</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { num: 1, name: '改革する人', triad: 'gut' },
                          { num: 2, name: '助ける人', triad: 'heart' },
                          { num: 3, name: '達成する人', triad: 'heart' },
                          { num: 4, name: '個性的な人', triad: 'heart' },
                          { num: 5, name: '調べる人', triad: 'head' },
                          { num: 6, name: '忠実な人', triad: 'head' },
                          { num: 7, name: '熱中する人', triad: 'head' },
                          { num: 8, name: '挑戦する人', triad: 'gut' },
                          { num: 9, name: '平和をもたらす人', triad: 'gut' },
                        ].map(({ num, name, triad }) => {
                          const triadColors = {
                            gut: 'bg-red-50 border-red-200 text-red-700',
                            heart: 'bg-pink-50 border-pink-200 text-pink-700',
                            head: 'bg-blue-50 border-blue-200 text-blue-700',
                          };
                          return (
                            <div key={num} className={`${triadColors[triad]} border rounded-xl p-3 text-center`}>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-1">
                                <span className="text-white font-bold text-sm">{num}</span>
                              </div>
                              <p className="text-xs font-bold">{name}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">3つのセンター（トライアド）</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { name: '本能センター', types: '1, 8, 9', color: 'bg-red-50 text-red-700', desc: '怒りと本能に関わる' },
                          { name: '感情センター', types: '2, 3, 4', color: 'bg-pink-50 text-pink-700', desc: '恥と自己イメージに関わる' },
                          { name: '思考センター', types: '5, 6, 7', color: 'bg-blue-50 text-blue-700', desc: '恐れと安全に関わる' },
                        ].map(({ name, types, color, desc }) => (
                          <div key={name} className={`${color} rounded-xl p-3 text-center`}>
                            <p className="text-xs font-bold">{name}</p>
                            <p className="text-xs mt-1">タイプ {types}</p>
                            <p className="text-xs opacity-70 mt-0.5">{desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">ウィング</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        各タイプには隣接する2つのタイプの影響を受ける「ウィング」があります。
                        例えば、タイプ4の人は「4w3（達成する個性派）」または「4w5（探究する個性派）」のいずれかのウィングを持ちます。
                        ウィングにより、同じタイプでも異なる表現パターンが生まれます。
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm text-amber-700">
                        <span className="font-bold">注:</span> エニアグラム診断は詳細診断（145問）コースでのみ実施されます。
                        Big Five の100問に加え、エニアグラム専用の45問に回答いただきます。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTAボタン */}
          <div className="text-center mt-10">
            <Link
              href="/bigfive"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Brain className="w-5 h-5" />
              診断を始める
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
