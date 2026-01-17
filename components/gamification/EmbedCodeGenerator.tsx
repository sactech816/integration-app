'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Code, QrCode as QrCodeIcon, Eye } from 'lucide-react';
import QRCode from 'qrcode';

interface EmbedCodeGeneratorProps {
  campaignId: string;
  gameType: 'slot' | 'fukubiki' | 'scratch' | 'gacha';
  isOpen: boolean;
  onClose: () => void;
}

export default function EmbedCodeGenerator({
  campaignId,
  gameType,
  isOpen,
  onClose,
}: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [options, setOptions] = useState({
    width: 800,
    height: 600,
    hidePoints: false,
    hideHeader: false,
    theme: 'default' as 'default' | 'dark' | 'light',
  });
  const [activeTab, setActiveTab] = useState<'iframe' | 'script' | 'qr'>('iframe');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `${baseUrl}/embed/game/${gameType}/${campaignId}?hidePoints=${options.hidePoints}&hideHeader=${options.hideHeader}&theme=${options.theme}`;

  // iframeコード
  const iframeCode = `<iframe
  src="${embedUrl}"
  width="${options.width}"
  height="${options.height}"
  frameborder="0"
  style="border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  allow="fullscreen"
></iframe>`;

  // JavaScriptコード
  const scriptCode = `<!-- ゲーム埋め込み -->
<div id="gamification-embed-${campaignId}"></div>
<script>
  (function() {
    const iframe = document.createElement('iframe');
    iframe.src = '${embedUrl}';
    iframe.width = '${options.width}';
    iframe.height = '${options.height}';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '16px';
    iframe.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    iframe.allow = 'fullscreen';
    
    // メッセージ受信（結果通知など）
    window.addEventListener('message', function(event) {
      if (event.data.source === 'gamification-embed') {
        console.log('ゲーム結果:', event.data);
        // ここにカスタムロジックを追加可能
      }
    });
    
    document.getElementById('gamification-embed-${campaignId}').appendChild(iframe);
  })();
</script>`;

  // QRコード生成
  const generateQRCode = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(embedUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('[EmbedCodeGenerator] Error generating QR code:', error);
    }
  };

  React.useEffect(() => {
    if (isOpen && activeTab === 'qr') {
      generateQRCode();
    }
  }, [isOpen, activeTab, embedUrl]);

  const handleCopy = async () => {
    const code = activeTab === 'iframe' ? iframeCode : scriptCode;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('[EmbedCodeGenerator] Error copying to clipboard:', error);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.download = `game-qrcode-${campaignId}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            ゲーム埋め込みコード
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('iframe')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'iframe'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            iframeコード
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'script'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            JavaScriptコード
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'qr'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            QRコード
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* オプション設定 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-3">埋め込みオプション</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  幅（px）
                </label>
                <input
                  type="number"
                  value={options.width}
                  onChange={(e) => setOptions({ ...options, width: parseInt(e.target.value) || 800 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  高さ（px）
                </label>
                <input
                  type="number"
                  value={options.height}
                  onChange={(e) => setOptions({ ...options, height: parseInt(e.target.value) || 600 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  テーマ
                </label>
                <select
                  value={options.theme}
                  onChange={(e) => setOptions({ ...options, theme: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="default">デフォルト</option>
                  <option value="dark">ダーク</option>
                  <option value="light">ライト</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.hidePoints}
                    onChange={(e) => setOptions({ ...options, hidePoints: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">ポイント非表示</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.hideHeader}
                    onChange={(e) => setOptions({ ...options, hideHeader: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">ヘッダー非表示</span>
                </label>
              </div>
            </div>
          </div>

          {/* コード表示 */}
          {activeTab !== 'qr' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">
                  {activeTab === 'iframe' ? 'iframeコード' : 'JavaScriptコード'}
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      コードをコピー
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
                <code>{activeTab === 'iframe' ? iframeCode : scriptCode}</code>
              </pre>

              {/* 説明 */}
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  {activeTab === 'iframe' ? (
                    <>
                      このコードをHTMLに貼り付けると、ゲームを埋め込むことができます。
                      レスポンシブ対応する場合は、親要素で幅を制御してください。
                    </>
                  ) : (
                    <>
                      このコードはJavaScriptで動的に埋め込みを行います。
                      メッセージイベントを受信して、ゲーム結果に応じたカスタム処理が可能です。
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            // QRコード表示
            <div className="text-center">
              <h3 className="font-semibold text-gray-800 mb-4">QRコード</h3>
              {qrCodeDataUrl ? (
                <div className="inline-block">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    className="mx-auto mb-4 border-4 border-gray-200 rounded-xl"
                  />
                  <button
                    onClick={handleDownloadQR}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <QrCodeIcon className="w-5 h-5" />
                    QRコードをダウンロード
                  </button>
                  <p className="mt-4 text-sm text-gray-600">
                    このQRコードをスキャンすると、ゲームページにアクセスできます。
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-400">QRコードを生成中...</div>
                </div>
              )}
            </div>
          )}

          {/* プレビューリンク */}
          <div className="mt-6">
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              <Eye className="w-5 h-5" />
              新しいタブでプレビュー
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
