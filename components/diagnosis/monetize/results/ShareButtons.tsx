'use client';

import React, { useState } from 'react';
import { Share2, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import { MonetizeAnalysis } from '../types';

interface ShareButtonsProps {
  analysis: MonetizeAnalysis;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `【才能マネタイズ診断結果】\n\n🎯 私の才能タイプ: ${analysis.authorType}\n${analysis.authorTypeDescription}\n\n${analysis.summary}\n\n▶ あなたも診断してみませんか？`;
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/diagnosis/monetize/about`
    : 'https://makers.tokyo/diagnosis/monetize/about';

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`【才能マネタイズ診断結果】\n\n🎯 私の才能タイプ: ${analysis.authorType}\n${analysis.authorTypeDescription}\n\n▶ あなたも診断してみませんか？`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  };

  const handleLineShare = () => {
    const text = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`https://social-plugins.line.me/lineit/share?text=${text}`, '_blank', 'width=600,height=400');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-200 p-5 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-5 h-5 text-violet-600" />
        <h3 className="font-bold text-gray-900 text-sm">診断結果をシェア</h3>
      </div>

      {/* シェアカード（プレビュー） */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🎯</span>
          </div>
          <div>
            <div className="font-bold text-gray-900">{analysis.authorType}</div>
            <div className="text-xs text-gray-500">{analysis.authorTypeDescription}</div>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{analysis.summary}</p>
      </div>

      {/* シェアボタン */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleTwitterShare}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-all shadow-sm"
        >
          <Twitter className="w-4 h-4" />
          X でシェア
        </button>
        <button
          type="button"
          onClick={handleLineShare}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#06C755] text-white rounded-xl font-medium text-sm hover:bg-[#05b64e] transition-all shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          LINE
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>
    </div>
  );
};
