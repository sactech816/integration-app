'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Coffee, Gift, Sparkles, CreditCard, CheckCircle, ArrowRight, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DonationAmount {
  value: number | 'custom';
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface DonationPageProps {
  user?: { id?: string; email?: string } | null;
}

const DONATION_AMOUNTS: DonationAmount[] = [
  { value: 500, label: '¥500', description: 'コーヒー1杯分', icon: Coffee },
  { value: 1000, label: '¥1,000', description: 'ランチ1回分', icon: Coffee },
  { value: 3000, label: '¥3,000', description: '応援の気持ち', icon: Heart },
  { value: 5000, label: '¥5,000', description: '大きな応援', icon: Gift },
  { value: 10000, label: '¥10,000', description: 'スペシャルサポート', icon: Sparkles },
  { value: 'custom', label: 'カスタム', description: '金額を入力', icon: CreditCard },
];

const DonationPageContent: React.FC<DonationPageProps> = ({ user }) => {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom' | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalUrl] = useState('https://paypal.me/keishoinc');
  const [donationStatus, setDonationStatus] = useState<'success' | 'cancel' | null>(null);

  // ページタイトル設定とURLパラメータから決済結果を確認
  useEffect(() => {
    // ブラウザタブのタイトルを設定
    document.title = "応援ありがとうございます | 集客メーカー";
    window.scrollTo(0, 0);
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      if (status === 'success' || status === 'cancel') {
        setDonationStatus(status as 'success' | 'cancel');
        // URLをクリーンアップ（パラメータを除去）
        window.history.replaceState(null, '', '/donation');
      }
    }
  }, []);

  // 決済金額を取得
  const getDonationAmount = (): number | null => {
    if (selectedAmount === 'custom') {
      const amount = parseInt(customAmount);
      if (isNaN(amount) || amount < 500 || amount > 100000) {
        return null;
      }
      return amount;
    }
    return selectedAmount as number | null;
  };

  // Stripe決済を開始
  const handleStripeDonation = async () => {
    const amount = getDonationAmount();
    if (!amount) {
      alert('500円〜100,000円の範囲で金額を選択してください。');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          userId: user?.id || null,
          email: user?.email || null,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || '決済URLの取得に失敗しました');
      }
    } catch (error) {
      console.error('Stripe決済エラー:', error);
      alert('決済の開始に失敗しました。もう一度お試しください。');
    } finally {
      setIsProcessing(false);
    }
  };

  // PayPal決済ページへ移動
  const handlePaypalDonation = () => {
    if (paypalUrl) {
      window.open(paypalUrl, '_blank');
    } else {
      alert('PayPalでの寄付リンクは現在準備中です。');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <main className="flex-grow">
        {/* 決済結果の表示 */}
        {donationStatus === 'success' && (
          <div className="bg-green-50 border-b border-green-200 py-6 px-4">
            <div className="max-w-3xl mx-auto flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-lg">ご寄付ありがとうございます！</h3>
                <p className="text-green-700 text-sm">皆さまからのご支援が、サービスの改善と発展を支えています。</p>
              </div>
              <button 
                onClick={() => setDonationStatus(null)}
                className="ml-auto text-green-600 hover:text-green-800 text-sm font-bold"
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        {donationStatus === 'cancel' && (
          <div className="bg-amber-50 border-b border-amber-200 py-6 px-4">
            <div className="max-w-3xl mx-auto flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <XCircle className="text-amber-600" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 text-lg">決済がキャンセルされました</h3>
                <p className="text-amber-700 text-sm">別の方法でのご寄付も可能です。ご検討いただけると嬉しいです。</p>
              </div>
              <button 
                onClick={() => setDonationStatus(null)}
                className="ml-auto text-amber-600 hover:text-amber-800 text-sm font-bold"
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* ヒーローセクション */}
        <div className="relative py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400 via-pink-500 to-orange-400 opacity-90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
          
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Heart className="text-white" size={20} />
              <span className="text-white font-bold text-sm">応援・サポート</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-relaxed mb-6 drop-shadow-lg">
              <span className="text-yellow-300">応援</span>ありがとうございます
            </h1>
            
            <p className="text-base sm:text-lg text-white/95 mb-8 leading-relaxed drop-shadow-md max-w-2xl mx-auto">
              皆さまからの温かいご支援が、<br className="sm:hidden" />
              より良いサービスの開発・運営につながります。<br />
              <span className="font-bold">ログイン不要</span>でどなたでもご寄付いただけます。
            </p>
          </div>
        </div>

        {/* 寄付セクション */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* なぜ寄付が必要か */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border border-rose-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Heart className="text-rose-500" size={20} />
              </span>
              ご寄付のお願い
            </h2>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                集客メーカーは、<span className="font-bold text-rose-600">誰でも無料で</span>集客コンテンツを作成できるサービスとして運営しています。
              </p>
              <p>
                サーバー費用、AI API利用料、機能開発など、サービスの維持・改善には費用がかかります。
              </p>
              <p>
                皆さまからのご寄付が、サービスの継続と新機能の開発を支えています。
                <span className="font-bold">少額でも大変ありがたく思います。</span>
              </p>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <Gift className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-bold text-amber-800 mb-1">ご寄付の使い道</p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• サーバー・インフラ費用</li>
                    <li>• AI機能のAPI利用料</li>
                    <li>• 新機能の開発</li>
                    <li>• サービスの安定運用</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Stripe決済セクション */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border border-indigo-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <CreditCard className="text-indigo-600" size={20} />
              </span>
              クレジットカードで寄付
            </h2>

            <p className="text-gray-600 mb-6 text-sm">
              Stripeによる安全な決済。500円〜100,000円の範囲で金額を選べます。
            </p>

            {/* 金額選択グリッド */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {DONATION_AMOUNTS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedAmount === item.value;
                
                return (
                  <button
                    key={String(item.value)}
                    onClick={() => setSelectedAmount(item.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent 
                        size={18} 
                        className={isSelected ? 'text-indigo-600' : 'text-gray-400'} 
                      />
                      <span className={`font-bold text-lg ${isSelected ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {item.label}
                      </span>
                    </div>
                    <p className={`text-xs ${isSelected ? 'text-indigo-500' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                    {isSelected && (
                      <CheckCircle className="absolute top-2 right-2 text-indigo-500" size={16} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* カスタム金額入力 */}
            {selectedAmount === 'custom' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  金額を入力（500円〜100,000円）
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-bold text-lg">¥</span>
                  <input
                    type="number"
                    min="500"
                    max="100000"
                    step="100"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="1000"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-bold text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* Stripe決済ボタン */}
            <button
              onClick={handleStripeDonation}
              disabled={isProcessing || !getDonationAmount()}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                isProcessing || !getDonationAmount()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  処理中...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  {getDonationAmount() 
                    ? `¥${getDonationAmount()?.toLocaleString()} を寄付する`
                    : '金額を選択してください'
                  }
                  {getDonationAmount() && <ArrowRight size={18} />}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Stripeによる安全な決済処理。カード情報は当サイトに保存されません。
            </p>
          </div>

          {/* PayPalセクション */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border border-blue-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">PP</span>
              </span>
              PayPalで寄付
            </h2>

            <p className="text-gray-600 mb-6 text-sm">
              PayPalアカウントをお持ちの方は、任意の金額をご寄付いただけます。<br />
              リンク先で金額を入力し、送金してください。
            </p>

            <button
              onClick={handlePaypalDonation}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-[#0070BA] text-white hover:bg-[#005ea6] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <span className="font-bold">PayPal</span>
              で寄付する
              <ExternalLink size={18} />
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              PayPal.Meのページに移動します。任意の金額を入力して送金できます。
            </p>
          </div>

          {/* サンキューメッセージ */}
          <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl p-6 sm:p-8 border border-rose-200 text-center">
            <Heart className="text-rose-500 mx-auto mb-4" size={40} />
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              ご支援ありがとうございます
            </h3>
            <p className="text-gray-600 leading-relaxed">
              皆さまからの温かいご支援が、<br className="sm:hidden" />
              サービスの継続と発展を支えています。<br />
              心より感謝申し上げます。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonationPageContent;





































