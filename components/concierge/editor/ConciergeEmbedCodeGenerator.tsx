'use client';

import React, { useState } from 'react';
import { Copy, Check, Code, Link as LinkIcon, ExternalLink, Terminal } from 'lucide-react';

interface ConciergeEmbedCodeGeneratorProps {
  slug: string;
  name: string;
}

export default function ConciergeEmbedCodeGenerator({
  slug,
  name,
}: ConciergeEmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600');
  const [position, setPosition] = useState('bottom-right');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://makers.tokyo';

  const directUrl = `${baseUrl}/concierge/${slug}`;
  const embedUrl = `${baseUrl}/embed/concierge/${slug}`;

  const iframeCode = `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}px"
  frameborder="0"
  style="border-radius: 16px; overflow: hidden;"
  title="${name}"
></iframe>`;

  const jsSnippetCode = `<!-- AI Concierge by 集客メーカー -->
<script>
(function() {
  var s = document.createElement('script');
  s.src = '${baseUrl}/embed/concierge/loader.js';
  s.async = true;
  s.dataset.conciergeId = '${slug}';
  s.dataset.position = '${position}';
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
          <Code className="w-5 h-5 text-teal-600" />
          埋め込みコード
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          外部サイトにこのコンシェルジュを埋め込むことができます
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
            このURLをリンクとして共有します。クリックでコンシェルジュページに移動します。
          </p>
          <div className="flex gap-2">
            <input type="text" value={directUrl} readOnly className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-900" />
            <button onClick={() => handleCopy(directUrl, 'direct')} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm">
              {copied === 'direct' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'direct' ? 'コピー済み' : 'コピー'}
            </button>
            <a href={directUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
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
            HTMLに貼り付けると、ページ内にチャットウィジェットを埋め込めます。
          </p>

          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">幅</label>
              <input type="text" value={width} onChange={(e) => setWidth(e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">高さ (px)</label>
              <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
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
            HTMLの&lt;head&gt;または&lt;body&gt;末尾に貼り付けるだけで、外部サイト上にチャットウィジェットがフローティング表示されます。
          </p>

          <div className="flex gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">表示位置</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              >
                <option value="bottom-right">右下</option>
                <option value="bottom-left">左下</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">{jsSnippetCode}</pre>
            <button onClick={() => handleCopy(jsSnippetCode, 'js')} className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm">
              {copied === 'js' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'js' ? 'コピー済み' : 'コピー'}
            </button>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h4 className="font-medium text-teal-800 mb-2">注意事項</h4>
          <ul className="text-sm text-teal-700 space-y-1">
            <li>・JSスニペットはShadow DOMでCSSが隔離されるため、サイトのデザインに影響しません</li>
            <li>・チャット履歴はブラウザ（localStorage）のvisitorIDで管理されます</li>
            <li>・コンシェルジュが「公開」状態でないと埋め込み先で表示されません</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
