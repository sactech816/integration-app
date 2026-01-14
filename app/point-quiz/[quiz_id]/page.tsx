'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase, TABLES } from '@/lib/supabase';
import { 
  getPointBalance, 
  updatePoints,
  getAdminGamificationSetting 
} from '@/app/actions/gamification';
import { Quiz } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import PointDisplay from '@/components/gamification/PointDisplay';
import { 
  Loader2, 
  AlertCircle, 
  Trophy,
  Coins,
  Check,
  X,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PointQuizPage() {
  const params = useParams();
  const quizId = params.quiz_id as string;

  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // クイズ状態
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [pointsPerCorrect, setPointsPerCorrect] = useState(10);

  // 認証状態の監視
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  // データ読み込み
  useEffect(() => {
    async function loadData() {
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }

        // クイズを取得
        const { data: quizData, error } = await supabase
          .from(TABLES.QUIZZES)
          .select('*')
          .eq('slug', quizId)
          .single();

        if (error || !quizData) {
          console.error('Quiz not found:', error);
          setLoading(false);
          return;
        }

        setQuiz(quizData);

        // ポイント設定を取得
        const settings = await getAdminGamificationSetting('point_quiz');
        if (settings?.points_per_correct) {
          setPointsPerCorrect(settings.points_per_correct as number);
        }

        // 現在のポイントを取得
        const balance = await getPointBalance();
        setCurrentPoints(balance?.current_points || 0);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [quizId]);

  // 回答を選択
  const handleSelectAnswer = async (answerIndex: number) => {
    if (isAnswered || !quiz || !user) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const options = currentQuestion.options;
    
    // テストモードの場合のみ正誤判定（各選択肢にスコアがある）
    // ※診断モードでは「正解」の概念がないため、全て正解扱い
    let isCorrect = false;
    
    if (quiz.mode === 'test') {
      // テストモード: 最初の選択肢が正解（スコアが最も高い）
      // または単純に最初の選択肢を正解とする
      isCorrect = answerIndex === 0;
    } else {
      // 診断モード・占いモード: 回答するだけでポイント獲得
      isCorrect = true;
    }

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setEarnedPoints(prev => prev + pointsPerCorrect);

      // ポイント付与
      await updatePoints(
        pointsPerCorrect,
        'quiz_correct',
        {
          userId: user.id,
          eventData: {
            quiz_id: quizId,
            question_index: currentQuestionIndex,
          },
        }
      );

      setCurrentPoints(prev => prev + pointsPerCorrect);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // 次の問題へ
  const handleNextQuestion = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // クイズ完了
      setIsCompleted(true);
      
      // 全問正解なら紙吹雪
      if (correctCount + (selectedAnswer !== null ? 1 : 0) === quiz.questions.length) {
        const duration = 3000;
        const end = Date.now() + duration;
        
        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFD700', '#FFA500', '#FF6347'],
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FFD700', '#FFA500', '#FF6347'],
          });
          
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        
        frame();
      }
    }
  };

  // リトライ
  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setEarnedPoints(0);
    setIsCompleted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <main className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </main>
        <Footer />
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-white/50 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">クイズが見つかりません</h1>
            <p className="text-white/70">指定されたクイズは存在しないか、削除されています。</p>
          </div>
        </main>
        <Footer />
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <Coins className="w-16 h-16 mx-auto text-yellow-300 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">{quiz.title}</h1>
            <p className="text-white/80 mb-6">
              クイズに答えてポイントをGET！<br />
              1問正解につき <span className="font-bold text-yellow-300">{pointsPerCorrect}pt</span> 獲得できます。
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors"
            >
              ログインして挑戦
            </button>
          </div>
        </main>
        <Footer />
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Coins className="w-6 h-6 text-yellow-300" />
              {quiz.title}
            </h1>
            <p className="text-purple-200 text-sm">
              正解で <span className="font-bold text-yellow-300">{pointsPerCorrect}pt</span> GET!
            </p>
          </div>

          {/* ポイント表示 */}
          <div className="flex justify-center mb-6">
            <PointDisplay 
              refreshTrigger={refreshTrigger} 
              size="md" 
            />
          </div>

          {/* 完了画面 */}
          {isCompleted ? (
            <div className="bg-white/10 backdrop-blur rounded-3xl p-8 text-center">
              <Trophy className="w-20 h-20 mx-auto text-yellow-300 mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">クイズ完了！</h2>
              <p className="text-purple-200 mb-6">
                {quiz.questions.length}問中 {correctCount}問正解
              </p>
              
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 mb-8">
                <p className="text-yellow-900 font-medium mb-1">獲得ポイント</p>
                <p className="text-4xl font-bold text-yellow-900 flex items-center justify-center gap-2">
                  <Sparkles className="w-8 h-8" />
                  +{earnedPoints}pt
                </p>
              </div>

              <button
                onClick={handleRetry}
                className="flex items-center gap-2 mx-auto px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                もう一度挑戦
              </button>
            </div>
          ) : (
            <>
              {/* 進捗表示 */}
              <div className="mb-6">
                <div className="flex justify-between text-white/70 text-sm mb-2">
                  <span>問題 {currentQuestionIndex + 1} / {quiz.questions.length}</span>
                  <span>獲得: +{earnedPoints}pt</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* 問題カード */}
              <div className="bg-white/10 backdrop-blur rounded-3xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  {currentQuestion.text}
                </h2>

                {/* 選択肢 */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = quiz.mode === 'test' ? index === 0 : true;
                    
                    let bgClass = 'bg-white/10 hover:bg-white/20 border-white/20';
                    if (isAnswered) {
                      if (isSelected) {
                        bgClass = isCorrect 
                          ? 'bg-green-500/30 border-green-400' 
                          : 'bg-red-500/30 border-red-400';
                      } else if (quiz.mode === 'test' && isCorrect) {
                        bgClass = 'bg-green-500/20 border-green-400';
                      }
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        disabled={isAnswered}
                        className={`
                          w-full p-4 rounded-xl border-2 text-left transition-all
                          ${bgClass}
                          ${isAnswered ? 'cursor-default' : 'cursor-pointer'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-white font-medium flex-1">
                            {option.text}
                          </span>
                          {isAnswered && isSelected && (
                            isCorrect 
                              ? <Check className="w-6 h-6 text-green-400" />
                              : <X className="w-6 h-6 text-red-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ポイント獲得表示 */}
                {isAnswered && (
                  <div className={`mt-6 p-4 rounded-xl text-center ${
                    (quiz.mode !== 'test' || selectedAnswer === 0)
                      ? 'bg-green-500/30 text-green-200'
                      : 'bg-red-500/30 text-red-200'
                  }`}>
                    {(quiz.mode !== 'test' || selectedAnswer === 0) ? (
                      <div className="flex items-center justify-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-300" />
                        <span className="font-bold">+{pointsPerCorrect}pt 獲得！</span>
                      </div>
                    ) : (
                      <span>残念...正解は A でした</span>
                    )}
                  </div>
                )}
              </div>

              {/* 次へボタン */}
              {isAnswered && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <>
                      次の問題へ
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      結果を見る
                      <Trophy className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
    </div>
  );
}

