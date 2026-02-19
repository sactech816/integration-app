'use client';

import React, { useState } from 'react';
import { Copy, Check, Code, Link as LinkIcon, ExternalLink, Terminal } from 'lucide-react';

interface OnboardingEmbedCodeGeneratorProps {
  modalSlug: string;
  modalTitle: string;
  triggerType: string;
  triggerDelay: number;
  triggerScrollPercent: number;
  triggerButtonPosition: string;
}

export default function OnboardingEmbedCodeGenerator({
  modalSlug,
  modalTitle,
  triggerType,
  triggerDelay,
  triggerScrollPercent,
  triggerButtonPosition,
}: OnboardingEmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://makers.tokyo';

  const directUrl = `${baseUrl}/onboarding/${modalSlug}`;
  const embedUrl = `${baseUrl}/embed/onboarding/${modalSlug}`;

  const iframeCode = `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}px"
  frameborder="0"
  style="border-radius: 16px; overflow: hidden;"
  title="${modalTitle}"
></iframe>`;

  const jsSnippetCode = `<!-- Onboarding Modal by 集客メーカー -->
<script>
(function() {
  var s = document.createElement('script');
  s.src = '${baseUrl}/embed/onboarding/loader.js';
  s.async = true;
  s.dataset.modalId = '${modalSlug}';
  s.dataset.trigger = '${triggerType}';
  s.dataset.delay = '${triggerDelay}';
  s.dataset.scrollPercent = '${triggerScrollPercent}';
  s.dataset.position = '${triggerButtonPosition}';
  document.head.appendChild(s);
})();
</script>`;

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
          <Code className="w-5 h-5 text-amber-600" />
          埋め込みコード
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          外部サイトにこのはじめかたガイドを埋め込むことができます
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
            このURLをリンクとして共有します。クリックでモーダルページに移動します。
          </p>
          <div className="flex gap-2">
            <input type="text" value={directUrl} readOnly className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono" />
            <button onClick={() => handleCopy(directUrl, 'direct')} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2">
              {copied === 'direct' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'direct' ? 'コピー済み' : 'コピー'}
            </button>
            <a href={directUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> 開く
            </a>
          </div>
        </div>

        {/* 方式2: iframe */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Code className="w-4 h-4" />
            方式2: iframe埋め込み
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            HTMLに貼り付けると、ページ内にモーダルを埋め込めます。
          </p>

          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">幅</label>
              <input type="text" value={width} onChange={(e) => setWidth(e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">高さ (px)</label>
              <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm font-mono">{iframeCode}</pre>
            <button onClick={() => handleCopy(iframeCode, 'iframe')} className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm">
              {copied === 'iframe' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'iframe' ? 'コピー済み' : 'コピー'}
            </button>
          </div>
        </div>

        {/* 方式3: JSスニペット */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            方式3: JavaScriptスニペット（推奨）
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            HTMLの&lt;head&gt;または&lt;body&gt;末尾に貼り付けるだけで、モーダルがオーバーレイ表示されます。
            トリガー設定やデザインも自動的に適用されます。
          </p>

          <div className="relative">
            <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">{jsSnippetCode}</pre>
            <button onClick={() => handleCopy(jsSnippetCode, 'js')} className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm">
              {copied === 'js' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'js' ? 'コピー済み' : 'コピー'}
            </button>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">注意事項</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>・JSスニペットはShadow DOMでCSSが隔離されるため、サイトのデザインに影響しません</li>
            <li>・「次から表示しない」はブラウザ（localStorage）単位で記録されます</li>
            <li>・埋め込み先のドメインごとに表示状態が独立します</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
