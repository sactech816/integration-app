import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Trophy, ExternalLink, MessageCircle, QrCode, RefreshCw, Home, Twitter, Share2, CheckCircle, XCircle, Sparkles, Mail } from 'lucide-react';
import SEO from './SEO';
import { supabase } from '../../lib/supabase';
import { calculateResult } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { getQuizTheme } from '../../constants/quizThemes';

const ResultView = ({ quiz, result, onRetry, onBack, playableQuestions, answers, theme }) => {
  const [showHistory, setShowHistory] = useState(true);
  
  useEffect(() => { 
      document.title = `${result.title} | 結果発表`;
      // ★削除: 完了数カウントは showResultOrEmail で実行済み
      if (quiz.mode === 'test' && result.score / result.total >= 0.8) {
          fireConfetti();
      }
  }, []);

  const fireConfetti = () => {
      const duration = 3000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
  };

  const handleLinkClick = async () => {
    if(supabase) await supabase.rpc('increment_clicks', { row_id: quiz.id });
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?id=${quiz.slug || quiz.id}` : '';
  const shareText = `${quiz.title} | 結果は「${result.title}」でした！ #診断クイズメーカー`;
  
  const handleShareX = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  const handleShareLine = () => window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`, '_blank');

  return (
    <div 
      className="max-w-xl mx-auto rounded-3xl shadow-xl overflow-hidden my-8 animate-fade-in flex flex-col min-h-[80vh]"
      style={{ backgroundColor: theme.cardBg, border: theme.cardBorder }}
    >
        <div 
          className="text-white p-10 text-center relative overflow-hidden transition-colors duration-500"
          style={{ backgroundColor: theme.accentColor }}
        >
            {quiz.image_url && <img src={quiz.image_url} className="absolute inset-0 w-full h-full object-cover opacity-20"/>}
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            <Trophy className="mx-auto mb-4 text-yellow-300 relative z-10 animate-bounce" size={56} />
            {quiz.mode === 'test' && (
                <div className="relative z-10 mb-2 text-2xl font-bold bg-white/20 inline-block px-4 py-1 rounded-full">
                    {result.score} / {result.total} 問正解
                </div>
            )}
            <h2 className="text-3xl font-extrabold mt-2 relative z-10">{result.title}</h2>
        </div>
        <div className="p-8 md:p-10 flex-grow">
            <div 
              className="prose leading-relaxed whitespace-pre-wrap mb-6 text-sm md:text-base"
              style={{ color: theme.textPrimary }}
            >
                {result.description}
            </div>
            <div className="text-center mb-8 pb-6 border-b border-gray-100">
                <p className="text-xs text-gray-400">診断クイズメーカーで作成しました</p>
            </div>
            
            {/* 診断履歴セクション */}
            {playableQuestions && answers && (
                <div className="mb-8">
                    <label className="flex items-center gap-2 cursor-pointer mb-4 text-sm font-bold text-gray-700">
                        <input 
                            type="checkbox" 
                            checked={showHistory} 
                            onChange={(e) => setShowHistory(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>診断履歴を表示する</span>
                    </label>
                    
                    {showHistory && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                            <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <Sparkles size={16} className="text-indigo-600"/>
                                あなたの回答履歴
                            </h3>
                            <div className="space-y-3">
                                {playableQuestions.map((q, idx) => {
                                    const userAnswer = answers[idx];
                                    return (
                                        <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                            <div className="flex items-start gap-2 mb-2">
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full flex-shrink-0">
                                                    Q{idx + 1}
                                                </span>
                                                <p className="text-sm font-bold text-gray-800 leading-relaxed flex-grow">
                                                    {q.text}
                                                </p>
                                            </div>
                                            {userAnswer && (
                                                <div className="flex items-center gap-2 ml-2 mt-2 pl-4 border-l-2 border-green-400">
                                                    <CheckCircle size={16} className="text-green-600 flex-shrink-0"/>
                                                    <span className="text-sm text-gray-700 font-medium">
                                                        {userAnswer.label}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-xl mb-8 text-center border border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-3">結果をシェアする</p>
                <div className="flex justify-center gap-3">
                    <button onClick={handleShareX} className="bg-black text-white p-3 rounded-full shadow hover:scale-110 transition-transform"><Twitter size={20}/></button>
                    <button onClick={handleShareLine} className="bg-[#06C755] text-white p-3 rounded-full shadow hover:scale-110 transition-transform"><MessageCircle size={20}/></button>
                    <button onClick={()=>{navigator.clipboard.writeText(shareUrl); alert('URLをコピーしました');}} className="bg-gray-200 text-gray-600 p-3 rounded-full shadow hover:scale-110 transition-transform"><Share2 size={20}/></button>
                </div>
            </div>

            {/* スクリーンショット案内 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-indigo-100 mb-8">
                <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    📱 この結果を保存・シェアする
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed mb-3">
                    スクリーンショットで簡単に保存できます
                </p>
                <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                        <span className="font-bold min-w-[60px]">iPhone:</span>
                        <span>サイドボタン + 音量上げボタン</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="font-bold min-w-[60px]">Android:</span>
                        <span>電源ボタン + 音量下げボタン</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                {result.link_url && (
                    <a href={result.link_url} onClick={handleLinkClick} target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-center font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-95">
                        <ExternalLink size={20}/> {result.link_text || "詳しく見る"}
                    </a>
                )}
                {result.line_url && (
                    <a href={result.line_url} onClick={handleLinkClick} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#06C755] hover:bg-[#05b34c] text-white text-center font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-95">
                        <MessageCircle size={20}/> {result.line_text || "LINE公式アカウント"}
                    </a>
                )}
                {result.qr_url && (
                    <a href={result.qr_url} onClick={handleLinkClick} target="_blank" rel="noopener noreferrer" className="block w-full bg-gray-800 hover:bg-gray-900 text-white text-center font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-95">
                        <QrCode size={20}/> {result.qr_text || "QRコードを表示"}
                    </a>
                )}
            </div>

            <div className="flex gap-4 border-t pt-6">
                <button onClick={onRetry} className="flex-1 py-3 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                    <RefreshCw size={18}/> 再診断
                </button>
                <button onClick={onBack} className="flex-1 py-3 rounded-lg bg-gray-800 font-bold text-white hover:bg-gray-900 flex items-center justify-center gap-2 transition-colors">
                    <Home size={18}/> TOP
                </button>
            </div>
        </div>
        <div className="bg-gray-50 p-6 text-center border-t">
            <a href="https://makers.tokyo/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-indigo-600 font-bold">
                &copy; 2025 診断クイズメーカー
            </a>
        </div>
    </div>
  );
};

const QuizPlayer = ({ quiz, onBack, isPreview = false }: { quiz: any, onBack?: () => void, isPreview?: boolean }) => {
  useEffect(() => { 
    if (!isPreview) {
      document.title = `${quiz.title} | 診断中`; 
    }
  }, [quiz.title, isPreview]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [playableQuestions, setPlayableQuestions] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  
  // テーマを取得
  const theme = getQuizTheme(quiz.theme);
  
  // レイアウト固有の初期配色（theme が 'standard' または未設定の場合に使用）
  const useDefaultLayoutColors = !quiz.theme || quiz.theme === 'standard';
  
  // ★修正: タイマーIDと「次の処理」を保存するRefを追加
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const nextActionRef = useRef(null);
  
  useEffect(() => {
    // プレビューモードではビュー数をカウントしない
    if(!isPreview && supabase) supabase.rpc('increment_views', { row_id: quiz.id }).then(({error})=> error && console.error(error));

    const rawQuestions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
    
    // 選択肢の表示順を処理する関数
    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };
    
    const processOptions = (options) => {
        const order = quiz.option_order || 'random';
        if (order === 'desc') return [...options].reverse();
        if (order === 'random') return shuffleArray(options);
        return options; // 'asc' または未指定は登録順のまま
    };
    
    setPlayableQuestions(rawQuestions.map(q => ({ ...q, options: processOptions(q.options) })));
  }, []);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping, currentStep, feedback, showEmailForm]);

  useEffect(() => {
      if (playableQuestions && currentStep === 0 && chatHistory.length === 0 && quiz.layout === 'chat') {
          setIsTyping(true);
          setTimeout(() => {
              setIsTyping(false);
              setChatHistory([{ type: 'bot', text: playableQuestions[0].text, qNum: 1 }]);
          }, 800);
      }
  }, [playableQuestions, quiz.layout]);

  const results = typeof quiz.results === 'string' ? JSON.parse(quiz.results) : quiz.results;

  const showResultOrEmail = async (finalAnswers) => {
      // ★修正: 完了数を必ずここでカウント（メールフォーム表示の前に実行）
      // プレビューモードではカウントしない
      if(!isPreview && supabase) {
          const { error } = await supabase.rpc('increment_completions', { row_id: quiz.id });
          if(error) console.error('完了数カウントエラー:', error);
      }

      if (quiz.collect_email && !showEmailForm) {
          setShowEmailForm(true);
          if (quiz.layout === 'chat') {
              setTimeout(() => {
                  setChatHistory(prev => [...prev, { type: 'bot', text: "診断結果が出ました！\n結果を受け取るメールアドレスを入力してください。" }]);
              }, 300);
          }
      } else {
          setResult(calculateResult(finalAnswers, results, quiz.mode));
      }
  };

  const proceedToNext = (newAnswers) => {
      setFeedback(null);
      // タイマーリセット
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      nextActionRef.current = null;

      if (currentStep + 1 < playableQuestions.length) {
          if (quiz.layout === 'chat') {
              setIsTyping(true);
              setTimeout(() => {
                  setIsTyping(false);
                  setChatHistory(prev => [...prev, { type: 'bot', text: playableQuestions[currentStep + 1].text, qNum: currentStep + 2 }]);
                  setCurrentStep(currentStep + 1);
              }, 600);
          } else {
              setCurrentStep(currentStep + 1);
          }
      } else {
          if (quiz.layout === 'chat') {
              setIsTyping(true);
              setTimeout(() => {
                  setIsTyping(false);
                  setChatHistory(prev => [...prev, { type: 'bot', text: "お疲れ様でした！\n結果を集計しています..." }]);
                  setTimeout(() => {
                      showResultOrEmail(newAnswers);
                  }, 1000);
              }, 800);
          } else {
              showResultOrEmail(newAnswers);
          }
      }
  };

  const handleAnswer = (option) => {
    if (feedback || showEmailForm) return;

    const newAnswers = { ...answers, [currentStep]: option };
    setAnswers(newAnswers);

    if (quiz.layout === 'chat') {
        setChatHistory(prev => [...prev, { type: 'user', text: option.label }]);
    }

    if (quiz.mode === 'test') {
        const isCorrect = option.score && option.score.A === 1;
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        
        // ★修正: 「次に進む処理」をRefに保存し、タイマーで実行
        nextActionRef.current = () => proceedToNext(newAnswers);
        timerRef.current = setTimeout(() => {
            if (nextActionRef.current) nextActionRef.current();
        }, 1200);
    } else {
        proceedToNext(newAnswers);
    }
  };

  // ★追加: フィードバックをクリックしたらスキップする処理
  const handleSkipFeedback = () => {
      if (timerRef.current && nextActionRef.current) {
          clearTimeout(timerRef.current);
          nextActionRef.current(); // 即実行
      }
  };

  const handleEmailSubmit = async (e) => {
      e.preventDefault();
      if(!email || !email.includes('@')) return alert('正しいメールアドレスを入力してください');
      setEmailSubmitting(true);
      
      try {
          if(supabase) {
              await supabase.from('quiz_leads').insert([{ quiz_id: quiz.id, email: email }]);
          }
          setShowEmailForm(false);
          setResult(calculateResult(answers, results, quiz.mode));
      } catch(err) {
          console.error(err);
          alert('エラーが発生しました');
      } finally {
          setEmailSubmitting(false);
      }
  };

  if (!playableQuestions || !results) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

  if (result) { 
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.background }}>
            <SEO title={`${result.title} | 結果`} description={result.description.substring(0, 100)} image={quiz.image_url} />
            <ResultView 
                quiz={quiz} 
                result={result} 
                playableQuestions={playableQuestions}
                answers={answers}
                onRetry={() => {setResult(null); setCurrentStep(0); setAnswers({}); setChatHistory([]); setShowEmailForm(false); setEmail('');}} 
                onBack={onBack}
                theme={theme}
            />
        </div>
      ); 
  }
  
  const question = playableQuestions[currentStep];
  const progress = Math.round(((currentStep)/playableQuestions.length)*100);

  // ★修正: オーバーレイ全体にクリックイベントを追加
  const FeedbackOverlay = () => {
      if (!feedback) return null;
      return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in cursor-pointer" 
            onClick={handleSkipFeedback} // クリックでスキップ
          >
              <div className={`bg-white p-8 rounded-3xl shadow-2xl transform scale-110 flex flex-col items-center animate-bounce-quick ${feedback==='correct' ? 'border-4 border-green-500' : 'border-4 border-red-500'}`}>
                  {feedback === 'correct' ? (
                      <>
                          <CheckCircle size={80} className="text-green-500 mb-4"/>
                          <h2 className="text-3xl font-extrabold text-green-600">正解！</h2>
                      </>
                  ) : (
                      <>
                          <XCircle size={80} className="text-red-500 mb-4"/>
                          <h2 className="text-3xl font-extrabold text-red-600">残念...</h2>
                      </>
                  )}
                  {/* ガイド文を追加 */}
                  <p className="text-xs text-gray-400 mt-2 font-bold animate-pulse">Tap to skip ▶</p>
              </div>
          </div>
      );
  };

  if (showEmailForm) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
              <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-slide-up text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={32}/>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">診断完了！</h2>
                  <p className="text-gray-500 mb-6 text-sm">結果を表示するために、<br/>メールアドレスを入力してください。</p>
                  
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <input 
                          type="email" 
                          required
                          placeholder="your@email.com" 
                          className="w-full border-2 border-gray-200 p-4 rounded-xl text-lg font-bold outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-center text-gray-900 bg-white"
                          value={email}
                          onChange={e=>setEmail(e.target.value)}
                      />
                      <button type="submit" disabled={emailSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2">
                          {emailSubmitting ? <Loader2 className="animate-spin"/> : "結果を見る"}
                      </button>
                  </form>
                  <p className="text-[10px] text-gray-400 mt-4">※入力いただいたアドレスにメルマガをお送りする場合があります。</p>
              </div>
          </div>
      );
  }

  if (quiz.layout === 'chat') {
      // チャットレイアウトの初期配色（緑系LINE風）
      const chatColors = useDefaultLayoutColors ? {
          background: '#e5e5e5',
          headerBg: 'linear-gradient(135deg, #00B900 0%, #00C851 100%)',
          headerColor: '#00B900',
          cardBg: '#f0f0f0',
          messageBg: '#ffffff',
          userMessageBg: '#00B900',
          buttonBorder: '#00B900',
          buttonText: '#00B900',
          textPrimary: '#333333',
          textSecondary: '#888888',
      } : null;

      return (
        <div className="min-h-screen flex items-center justify-center font-sans" style={{ background: useDefaultLayoutColors ? chatColors.background : theme.background }}>
            <FeedbackOverlay />
            <div className="w-full max-w-md h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden" style={{ backgroundColor: useDefaultLayoutColors ? chatColors.cardBg : theme.cardBg }}>
                <div 
                    className="p-4 text-white text-center relative shadow-sm z-10 shrink-0"
                    style={{ background: useDefaultLayoutColors ? chatColors.headerBg : theme.accentColor }}
                >
                    <div className="text-xs opacity-90 absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer" onClick={onBack}><ArrowLeft size={20}/></div>
                    <h1 className="font-bold text-sm">{quiz.title}</h1>
                    <div className="text-[10px] opacity-80">{quiz.mode === 'test' ? '検定中' : 'オンライン'}</div>
                    <div className="h-1 mt-2 rounded-full overflow-hidden w-1/2 mx-auto" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                        <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="flex-grow p-4 overflow-y-auto pb-72" style={{ backgroundColor: useDefaultLayoutColors ? chatColors.cardBg : theme.optionBg }}>
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex mb-4 animate-fade-in-up ${msg.type === 'user' ? 'justify-end' : 'items-start gap-2'}`}>
                            {msg.type === 'bot' && (
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 text-xl shadow-sm"
                                    style={{ background: useDefaultLayoutColors ? chatColors.headerBg : theme.accentColor }}
                                >🤖</div>
                            )}
                            <div 
                                className={`relative max-w-[85%] p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed whitespace-pre-wrap ${msg.type === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                                style={{ 
                                    backgroundColor: msg.type === 'user' 
                                        ? (useDefaultLayoutColors ? chatColors.userMessageBg : theme.accentColor)
                                        : (useDefaultLayoutColors ? chatColors.messageBg : theme.cardBg),
                                    color: msg.type === 'user' ? '#ffffff' : (useDefaultLayoutColors ? chatColors.textPrimary : theme.textPrimary)
                                }}
                            >
                                {msg.qNum && <div className="text-[10px] mb-1" style={{ color: useDefaultLayoutColors ? chatColors.textSecondary : theme.textSecondary }}>質問 {msg.qNum} / {playableQuestions.length}</div>}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-start gap-2 mb-4 animate-fade-in">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 text-xl shadow-sm"
                                style={{ background: useDefaultLayoutColors ? chatColors.headerBg : theme.accentColor }}
                            >🤖</div>
                            <div className="p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center h-[52px]" style={{ backgroundColor: useDefaultLayoutColors ? chatColors.messageBg : theme.cardBg }}>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div 
                    className="absolute bottom-0 left-0 w-full border-t p-4 z-20 pb-8 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)]"
                    style={{ backgroundColor: useDefaultLayoutColors ? '#ffffff' : theme.cardBg, borderColor: useDefaultLayoutColors ? '#e0e0e0' : theme.optionBorder }}
                >
                    <div className="max-w-md mx-auto space-y-2">
                        {(!isTyping && !feedback && (chatHistory.length === 0 || chatHistory[chatHistory.length-1].type === 'bot')) && (
                            question.options.map((opt, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => handleAnswer(opt)} 
                                    className="w-full border-2 font-bold py-3 rounded-full transition-all active:scale-95 shadow-sm text-sm bg-white"
                                    style={{ 
                                        borderColor: useDefaultLayoutColors ? chatColors.buttonBorder : theme.accentColor,
                                        color: useDefaultLayoutColors ? chatColors.buttonText : theme.accentColor
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = useDefaultLayoutColors ? chatColors.userMessageBg : theme.accentColor;
                                        e.currentTarget.style.color = '#ffffff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                        e.currentTarget.style.color = useDefaultLayoutColors ? chatColors.buttonText : theme.accentColor;
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // ポップレイアウト
  if (quiz.layout === 'pop') {
    // ポップレイアウトの初期配色（カラフル）
    const popDefaultColors = useDefaultLayoutColors ? {
        background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8eaf6 100%)',
        cardBg: '#ffffff',
        cardBorder: '#1a1a1a',
        badgeBg: '#fbbf24',
        badgeText: '#1a1a1a',
        progressActive: '#ec4899',
        progressInactive: '#d1d5db',
        textPrimary: '#1a1a1a',
        textSecondary: '#6b7280',
        optionColors: ['#a0f0f0', '#ffb6d9'], // 水色とピンクの交互
    } : null;
    
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center py-6 font-sans"
        style={{ background: useDefaultLayoutColors ? popDefaultColors.background : theme.background }}
      >
        <FeedbackOverlay />
        <SEO title={`${quiz.title} | 診断中`} description={quiz.description} image={quiz.image_url} />
        
        <div className="max-w-md lg:max-w-xl mx-auto w-full px-4">
          {/* タイトル・説明文 */}
          <div className="text-center mb-4">
            <h1 
              className="text-xl font-bold mb-2"
              style={{ color: useDefaultLayoutColors ? popDefaultColors.textPrimary : theme.textPrimary }}
            >
              {quiz.title}
            </h1>
            {quiz.description && (
              <p 
                className="text-sm"
                style={{ color: useDefaultLayoutColors ? popDefaultColors.textSecondary : theme.textSecondary }}
              >
                {quiz.description}
              </p>
            )}
          </div>

          {/* メインカード */}
          <div 
            className="rounded-3xl border-4 shadow-2xl overflow-hidden"
            style={{ 
                backgroundColor: useDefaultLayoutColors ? popDefaultColors.cardBg : theme.cardBg, 
                borderColor: useDefaultLayoutColors ? popDefaultColors.cardBorder : theme.textPrimary 
            }}
          >
            {/* ヘッダー */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                {/* Q番号バッジ */}
                <div 
                  className="font-black text-sm px-4 py-2 rounded-lg shadow-md"
                  style={{ 
                      backgroundColor: useDefaultLayoutColors ? popDefaultColors.badgeBg : theme.accentColor, 
                      color: useDefaultLayoutColors ? popDefaultColors.badgeText : '#ffffff' 
                  }}
                >
                  Q.{currentStep + 1}
                </div>
                {/* 進捗ドット */}
                <div className="flex gap-1">
                  {playableQuestions.map((_, idx) => (
                    <div 
                      key={idx}
                      className="w-3 h-3 rounded-full transition-all"
                      style={{ 
                          backgroundColor: idx <= currentStep 
                              ? (useDefaultLayoutColors ? popDefaultColors.progressActive : theme.progressFill)
                              : (useDefaultLayoutColors ? popDefaultColors.progressInactive : theme.progressBg)
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* 質問文 */}
              <h3 
                className="text-xl font-bold text-center leading-relaxed mb-2"
                style={{ color: useDefaultLayoutColors ? popDefaultColors.textPrimary : theme.textPrimary }}
              >
                {question.text}
              </h3>
            </div>
            
            {/* 選択肢 */}
            <div className="px-6 pb-6 space-y-3">
              {!feedback && question.options.map((opt, idx) => {
                const bgColor = useDefaultLayoutColors 
                    ? popDefaultColors.optionColors[idx % 2]
                    : (idx % 2 === 0 ? theme.optionBg : theme.optionHoverBg);
                return (
                  <button 
                    key={idx} 
                    onClick={() => handleAnswer(opt)} 
                    className="w-full p-4 rounded-xl font-bold transition-all active:scale-95 hover:shadow-lg text-center text-base"
                    style={{ 
                      backgroundColor: bgColor,
                      borderWidth: '3px',
                      borderColor: useDefaultLayoutColors ? popDefaultColors.cardBorder : theme.optionBorder,
                      color: useDefaultLayoutColors ? popDefaultColors.textPrimary : theme.textPrimary
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
              {feedback && <div className="text-center text-sm py-4" style={{ color: useDefaultLayoutColors ? popDefaultColors.textSecondary : theme.textSecondary }}>判定中...</div>}
            </div>
          </div>
          
          {/* 戻るボタン */}
          <div className="mt-4 text-center">
            <button 
              onClick={onBack} 
              className="font-bold text-sm flex items-center gap-1 mx-auto transition-colors"
              style={{ color: useDefaultLayoutColors ? popDefaultColors.textSecondary : theme.textSecondary }}
            >
              <ArrowLeft size={14}/> 戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // グリッドレイアウト
  if (quiz.layout === 'grid') {
    // グリッドレイアウトの初期配色（紫系グラデーション）
    const gridDefaultColors = useDefaultLayoutColors ? {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        progressActive: '#f472b6',
        progressInactive: 'rgba(255,255,255,0.3)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.7)',
        optionBg: 'rgba(139, 92, 246, 0.4)',
        optionBorder: 'rgba(255,255,255,0.3)',
        optionHoverBg: 'rgba(255,255,255,0.3)',
    } : null;

    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center py-6 font-sans"
        style={{ background: useDefaultLayoutColors ? gridDefaultColors.background : theme.background }}
      >
        <FeedbackOverlay />
        <SEO title={`${quiz.title} | 診断中`} description={quiz.description} image={quiz.image_url} />
        
        <div className="max-w-lg lg:max-w-2xl mx-auto w-full px-4">
          {/* タイトル・説明文 */}
          <div className="text-center mb-6">
            <h1 
              className="text-2xl font-bold mb-2 drop-shadow-lg"
              style={{ color: useDefaultLayoutColors ? gridDefaultColors.textPrimary : theme.textPrimary }}
            >
              {quiz.title}
            </h1>
            {quiz.description && (
              <p 
                className="text-sm"
                style={{ color: useDefaultLayoutColors ? gridDefaultColors.textSecondary : theme.textSecondary }}
              >
                {quiz.description}
              </p>
            )}
          </div>

          {/* 進捗バー */}
          <div className="mb-6">
            <div className="flex gap-1 justify-center mb-2">
              {playableQuestions.map((_, idx) => (
                <div 
                  key={idx}
                  className="h-1 rounded-full transition-all"
                  style={{ 
                    backgroundColor: idx <= currentStep 
                        ? (useDefaultLayoutColors ? gridDefaultColors.progressActive : theme.progressFill)
                        : (useDefaultLayoutColors ? gridDefaultColors.progressInactive : theme.progressBg),
                    width: idx <= currentStep ? '2rem' : '1rem'
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* 質問文 */}
          <h3 
            className="text-2xl font-bold text-center leading-relaxed mb-8 drop-shadow-lg"
            style={{ color: useDefaultLayoutColors ? gridDefaultColors.textPrimary : theme.textPrimary }}
          >
            {question.text}
          </h3>
          
          {/* 2x2グリッド選択肢 */}
          <div className="grid grid-cols-2 gap-4">
            {!feedback && question.options.map((opt, idx) => {
              return (
                <button 
                  key={idx} 
                  onClick={() => handleAnswer(opt)} 
                  className="aspect-square rounded-2xl font-bold border-2 transition-all active:scale-95 flex flex-col items-center justify-center p-4 text-center"
                  style={{ 
                    backgroundColor: useDefaultLayoutColors ? gridDefaultColors.optionBg : theme.optionBg,
                    borderColor: useDefaultLayoutColors ? gridDefaultColors.optionBorder : theme.optionBorder,
                    color: useDefaultLayoutColors ? gridDefaultColors.textPrimary : theme.textPrimary
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = useDefaultLayoutColors ? gridDefaultColors.optionHoverBg : theme.optionHoverBg;
                    if (!useDefaultLayoutColors) e.currentTarget.style.borderColor = theme.accentColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = useDefaultLayoutColors ? gridDefaultColors.optionBg : theme.optionBg;
                    e.currentTarget.style.borderColor = useDefaultLayoutColors ? gridDefaultColors.optionBorder : theme.optionBorder;
                  }}
                >
                  <span className="text-base leading-relaxed">{opt.label}</span>
                </button>
              );
            })}
          </div>
          {feedback && <div className="text-center text-sm py-4" style={{ color: useDefaultLayoutColors ? gridDefaultColors.textSecondary : theme.textSecondary }}>判定中...</div>}
          
          {/* 戻るボタン */}
          <div className="mt-6 text-center">
            <button 
              onClick={onBack} 
              className="font-bold text-sm flex items-center gap-1 mx-auto transition-colors"
              style={{ color: useDefaultLayoutColors ? gridDefaultColors.textSecondary : theme.textSecondary }}
            >
              <ArrowLeft size={14}/> 戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Card Mode
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center py-6 font-sans"
      style={{ background: theme.background }}
    >
      <FeedbackOverlay />
      <SEO title={`${quiz.title} | 診断中`} description={quiz.description} image={quiz.image_url} />
      <div className="w-full max-w-md lg:max-w-2xl mb-4 px-4">
          <button 
            onClick={onBack} 
            className="font-bold flex items-center gap-1 transition-colors"
            style={{ color: theme.textSecondary }}
          >
            <ArrowLeft size={16}/> 戻る
          </button>
      </div>
      <div className="max-w-md lg:max-w-2xl mx-auto w-full px-4">
        <div 
          className="text-white rounded-t-3xl text-center shadow-lg transition-colors duration-500 relative overflow-hidden"
          style={{ backgroundColor: theme.accentColor }}
        >
             <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '15px 15px'}}></div>
             {quiz.image_url ? (
                 <div className="w-full h-48 relative">
                     <img src={quiz.image_url} alt="" className="w-full h-full object-cover opacity-90"/>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-6">
                        <div>
                            <h2 className="text-xl font-bold mb-1 relative z-10">{quiz.title}</h2>
                            <p className="text-xs opacity-90 relative z-10 line-clamp-2">{quiz.description}</p>
                        </div>
                     </div>
                 </div>
             ) : (
                 <div className="p-6">
                    <h2 className="text-xl font-bold mb-2 relative z-10">{quiz.title}</h2>
                    <p className="text-xs opacity-90 relative z-10 whitespace-pre-wrap">{quiz.description}</p>
                 </div>
             )}
        </div>

        <div 
          className="rounded-b-3xl shadow-xl p-8 border-t-0 mb-8 animate-slide-up"
          style={{ 
            backgroundColor: theme.cardBg, 
            border: theme.cardBorder,
            borderTop: 'none'
          }}
        >
            <div className="mb-4 flex justify-between text-xs font-bold" style={{ color: theme.textSecondary }}>
                <span>Q{currentStep+1} / {playableQuestions.length}</span>
                <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full mb-8 overflow-hidden" style={{ backgroundColor: theme.progressBg }}>
                <div 
                  className="h-full transition-all duration-300 ease-out" 
                  style={{ width: `${((currentStep+1)/playableQuestions.length)*100}%`, backgroundColor: theme.progressFill }}
                ></div>
            </div>

            <h3 
              className="text-lg font-bold mb-8 text-center leading-relaxed"
              style={{ color: theme.textPrimary }}
            >
              {question.text}
            </h3>
            <div className="space-y-4">
                {!feedback && question.options.map((opt, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleAnswer(opt)} 
                      className="w-full p-4 text-left border-2 rounded-xl font-bold transition-all flex justify-between items-center group active:scale-95"
                      style={{
                        backgroundColor: theme.optionBg,
                        borderColor: theme.optionBorder,
                        color: theme.textPrimary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.optionHoverBg;
                        e.currentTarget.style.borderColor = theme.accentColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.optionBg;
                        e.currentTarget.style.borderColor = theme.optionBorder;
                      }}
                    >
                        <span className="flex-grow">{opt.label}</span>
                        <div 
                          className="w-5 h-5 rounded-full border-2 flex-shrink-0 ml-4"
                          style={{ borderColor: theme.optionBorder }}
                        ></div>
                    </button>
                ))}
                {feedback && <div className="text-center text-sm py-4" style={{ color: theme.textSecondary }}>判定中...</div>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;