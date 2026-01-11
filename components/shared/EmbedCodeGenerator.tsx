'use client';

import React, { useState } from 'react';
import { Copy, Check, Code, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface EmbedCodeGeneratorProps {
  campaignId: string;
  campaignTitle: string;
  type: 'gacha' | 'slot' | 'scratch' | 'fukubiki';
}

export default function EmbedCodeGenerator({ 
  campaignId, 
  campaignTitle, 
  type 
}: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600');

  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}` 
    : 'https://makers.tokyo';

  // 各種URL/コード
  const directUrl = `${baseUrl}/embed/${type}/${campaignId}?theme=${theme}`;
  const gameUrl = `${baseUrl}/${type}/${campaignId}`;
  const iframeCode = `<iframe 
  src="${directUrl}" 
  width="${width}" 
  height="${height}px" 
  frameborder="0" 
  allow="clipboard-read; clipboard-write"
  style="border-radius: 16px; overflow: hidden;"
  title="${campaignTitle}"
></iframe>`;

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-600" />
          埋め込みコード
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          外部サイトにこのゲームを埋め込むことができます
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* 方式1: 直接リンク */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            方式1: 直接リンク（簡単）
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            このURLをリンクとして共有します。ユーザーはクリックでゲームページに移動します。
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={gameUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
            />
            <button
              onClick={() => handleCopy(gameUrl, 'direct')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              {copied === 'direct' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'direct' ? 'コピー済み' : 'コピー'}
            </button>
            <a
              href={gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              開く
            </a>
          </div>
        </div>

        {/* 方式2: iframe埋め込み */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Code className="w-4 h-4" />
            方式2: iframe埋め込み（高度）
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            このコードをHTMLに貼り付けると、ページ内にゲームを埋め込めます。
          </p>

          {/* 設定オプション */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">テーマ</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="dark">ダーク</option>
                <option value="light">ライト</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">幅</label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="100%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">高さ (px)</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="600"
              />
            </div>
          </div>

          {/* コード表示 */}
          <div className="relative">
            <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm font-mono">
              {iframeCode}
            </pre>
            <button
              onClick={() => handleCopy(iframeCode, 'iframe')}
              className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              {copied === 'iframe' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'iframe' ? 'コピー済み' : 'コピー'}
            </button>
          </div>
        </div>

        {/* プレビュー */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">プレビュー</h4>
          <div className={`rounded-lg overflow-hidden border ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
            <iframe
              src={directUrl}
              width={width}
              height={`${height}px`}
              style={{ border: 'none', borderRadius: '8px' }}
              title={`${campaignTitle} プレビュー`}
            />
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">📝 注意事項</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 未ログインユーザーはデモプレイとなります（ポイント消費なし）</li>
            <li>• 実際にポイントを消費してプレイするにはログインが必要です</li>
            <li>• iframe内でのログインはサポートしていません</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
















