'use client';

import React from 'react';
import { 
  Trophy, 
  X, 
  Copy, 
  ExternalLink, 
  Share2, 
  QrCode, 
  Download,
  Heart,
  Crown
} from 'lucide-react';

// グラデーションテーマの定義
type GradientTheme = 'indigo' | 'emerald' | 'amber' | 'teal' | 'purple' | 'blue' | 'rose';

const GRADIENT_THEMES: Record<GradientTheme, { header: string; button: string }> = {
  indigo: {
    header: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
  },
  emerald: {
    header: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
  },
  amber: {
    header: 'bg-gradient-to-r from-amber-600 to-orange-600',
    button: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
  },
  teal: {
    header: 'bg-gradient-to-r from-teal-600 to-cyan-600',
    button: 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700',
  },
  purple: {
    header: 'bg-gradient-to-r from-purple-600 to-pink-600',
    button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
  },
  blue: {
    header: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    button: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
  },
  rose: {
    header: 'bg-gradient-to-r from-rose-500 to-pink-600',
    button: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
  },
};

interface CreationCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;           // 例: "診断クイズ"
  publicUrl: string;       // 公開URL（フルパス）
  contentTitle?: string;   // SNSシェア時のテキスト
  theme?: GradientTheme;   // テーマカラー
}

/**
 * 作成完了モーダル - 全ツール共通
 * 
 * レイアウト:
 * 1. 公開URL
 * 2. アクセスボタン
 * 3. SNSシェア（2x2グリッド大ボタン）
 * 4. QRコード（直接表示）
 * 5. QRコード保存ボタン
 * 6. 応援・開発支援エリア（枠で囲む）
 *    - 開発を支援するボタン → /donation
 *    - プロプランに申し込みボタン → /pricing
 *    - ※開発支援は任意です。無料でもLPの公開・シェアは可能です。
 * 7. 閉じるボタン
 */
const CreationCompleteModal: React.FC<CreationCompleteModalProps> = ({
  isOpen,
  onClose,
  title,
  publicUrl,
  contentTitle,
  theme = 'indigo',
}) => {
  if (!isOpen) return null;

  const gradientTheme = GRADIENT_THEMES[theme];
  const shareText = contentTitle || `${title}を作りました！`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`;
  const qrCodeDownloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}&format=png`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    alert('URLをコピーしました！');
  };

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  const handleShareLine = () => {
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(publicUrl)}`,
      '_blank'
    );
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`,
      '_blank'
    );
  };

  const handleShareOther = () => {
    if (navigator.share) {
      navigator.share({ title: shareText, url: publicUrl });
    } else {
      navigator.clipboard.writeText(publicUrl);
      alert('URLをコピーしました！');
    }
  };

  const handleAccessPage = () => {
    window.open(publicUrl, '_blank');
  };

  const handleQrDownload = () => {
    window.open(qrCodeDownloadUrl, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className={`sticky top-0 ${gradientTheme.header} text-white px-6 py-6 flex justify-between items-center z-10 rounded-t-2xl`}>
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Trophy size={24} /> {title}を作成しました！
            </h3>
            <p className="text-sm text-white/80 mt-1">公開URLをコピーしてシェアできます</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* 1. 公開URL */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-700 mb-2">公開URL</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={publicUrl}
                readOnly
                className="flex-1 text-xs bg-white border border-gray-300 p-2 rounded-lg text-gray-900 font-bold"
              />
              <button 
                onClick={handleCopyUrl}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-900 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <Copy size={16} /> コピー
              </button>
            </div>
          </div>

          {/* 2. アクセスボタン */}
          <button 
            onClick={handleAccessPage}
            className={`w-full ${gradientTheme.button} text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg`}
          >
            <ExternalLink size={20} /> {title}にアクセス
          </button>

          {/* 3. SNSでシェア */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">SNSでシェア</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleShareTwitter}
                className="flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                𝕏 (Twitter)
              </button>
              <button 
                onClick={handleShareLine}
                className="flex items-center justify-center gap-2 bg-[#06C755] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                LINE
              </button>
              <button 
                onClick={handleShareFacebook}
                className="flex items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Facebook
              </button>
              <button 
                onClick={handleShareOther}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors"
              >
                <Share2 size={18} /> その他
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">作成した{title}をSNSでシェアして、多くの人に見てもらいましょう！</p>
          </div>

          {/* 4. QRコード（直接表示） */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm font-bold text-gray-700 mb-3 flex items-center justify-center gap-2">
              <QrCode size={18} /> QRコード
            </p>
            <div className="inline-block bg-white p-3 rounded-lg border border-gray-200 mb-3">
              <img
                src={qrCodeUrl}
                alt="QRコード"
                className="w-40 h-40"
              />
            </div>
            {/* 5. QRコード保存ボタン */}
            <div>
              <button
                onClick={handleQrDownload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-300 transition-colors"
              >
                <Download size={16} /> QRコードを保存
              </button>
            </div>
          </div>

          {/* 6. 応援・開発支援エリア（枠で囲む） */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-5">
            <div className="text-center mb-4">
              <h4 className="font-bold text-base text-gray-900 flex items-center justify-center gap-2">
                <Heart size={18} className="text-rose-500" />
                応援・開発支援
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                サービスの継続・発展にご協力ください
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* 開発を支援するボタン */}
              <a
                href="https://makers.tokyo/donation"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-rose-600 hover:to-pink-600 transition-all shadow-md text-sm"
              >
                <Heart size={16} /> 開発を支援する
              </a>
              {/* プロプランに申し込みボタン */}
              <a
                href="https://makers.tokyo/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md text-sm"
              >
                <Crown size={16} /> プロプランに申込
              </a>
            </div>

            <p className="text-xs text-center text-gray-500">
              ※開発支援は任意です。無料でもLPの公開・シェアは可能です。
            </p>
          </div>

          {/* 7. 閉じるボタン */}
          <button 
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreationCompleteModal;
export type { CreationCompleteModalProps, GradientTheme };
