/**
 * コンシェルジュ埋め込みローダー
 * 外部サイトにフローティングチャットウィジェットを設置する
 * iframeベースでCORS問題を回避
 * APIからコンフィグを取得し、バブルの色・サイズ・アバターを動的に反映
 */
(function() {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var conciergeId = script.dataset.conciergeId;
  if (!conciergeId) {
    console.error('[Concierge] data-concierge-id is required');
    return;
  }

  var position = script.dataset.position || 'bottom-right';
  var baseUrl = script.src.replace(/\/embed\/concierge\/loader\.js.*$/, '');
  var embedUrl = baseUrl + '/embed/concierge/' + conciergeId;
  var configUrl = baseUrl + '/api/concierge/public/' + conciergeId;

  // デフォルト設定
  var bubbleColor = '#0D9488';
  var bubbleSize = 56;
  var avatarImageUrl = '';

  // Shadow DOMホストを作成
  var host = document.createElement('div');
  host.id = 'makers-concierge-host';
  host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
  document.body.appendChild(host);

  var shadow = host.attachShadow({ mode: 'open' });
  var isRight = position === 'bottom-right';
  var isOpen = false;

  // チャットアイコンSVG
  var chatIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var closeIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  function buildStyles(color, size) {
    return '\
    .concierge-bubble {\
      position: fixed;\
      ' + (isRight ? 'right: 20px;' : 'left: 20px;') + '\
      bottom: 20px;\
      width: ' + size + 'px;\
      height: ' + size + 'px;\
      border-radius: 50%;\
      background: ' + color + ';\
      color: white;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      cursor: pointer;\
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);\
      transition: transform 0.2s, box-shadow 0.2s;\
      border: none;\
      padding: 0;\
      font-family: system-ui, sans-serif;\
      overflow: hidden;\
    }\
    .concierge-bubble:hover {\
      transform: scale(1.1);\
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);\
    }\
    .concierge-bubble svg {\
      width: ' + Math.round(size * 0.43) + 'px;\
      height: ' + Math.round(size * 0.43) + 'px;\
    }\
    .concierge-bubble img {\
      width: 100%;\
      height: 100%;\
      object-fit: cover;\
      border-radius: 50%;\
    }\
    .concierge-panel {\
      position: fixed;\
      ' + (isRight ? 'right: 20px;' : 'left: 20px;') + '\
      bottom: ' + (size + 32) + 'px;\
      width: 380px;\
      height: 520px;\
      border-radius: 16px;\
      overflow: hidden;\
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);\
      opacity: 0;\
      transform: translateY(16px) scale(0.95);\
      pointer-events: none;\
      transition: opacity 0.25s ease, transform 0.25s ease;\
    }\
    .concierge-panel.open {\
      opacity: 1;\
      transform: translateY(0) scale(1);\
      pointer-events: auto;\
    }\
    .concierge-panel iframe {\
      width: 100%;\
      height: 100%;\
      border: none;\
    }\
    @media (max-width: 480px) {\
      .concierge-panel {\
        width: calc(100vw - 24px);\
        height: calc(100vh - 120px);\
        ' + (isRight ? 'right: 12px;' : 'left: 12px;') + '\
        bottom: ' + (size + 24) + 'px;\
      }\
    }\
    ';
  }

  // スタイル要素
  var styleEl = document.createElement('style');
  styleEl.textContent = buildStyles(bubbleColor, bubbleSize);
  shadow.appendChild(styleEl);

  // チャットパネル
  var panel = document.createElement('div');
  panel.className = 'concierge-panel';

  var iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.title = 'AIコンシェルジュ';
  iframe.allow = 'clipboard-write';
  panel.appendChild(iframe);
  shadow.appendChild(panel);

  // バブルボタン
  var bubble = document.createElement('button');
  bubble.className = 'concierge-bubble';
  bubble.setAttribute('aria-label', 'チャットを開く');
  bubble.innerHTML = chatIconSvg;

  // バブルの中身を更新する関数
  function updateBubbleContent() {
    if (isOpen) {
      bubble.innerHTML = closeIconSvg;
      bubble.setAttribute('aria-label', 'チャットを閉じる');
    } else if (avatarImageUrl) {
      bubble.innerHTML = '<img src="' + avatarImageUrl + '" alt="コンシェルジュ" />';
      bubble.setAttribute('aria-label', 'チャットを開く');
    } else {
      bubble.innerHTML = chatIconSvg;
      bubble.setAttribute('aria-label', 'チャットを開く');
    }
  }

  bubble.addEventListener('click', function() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('open');
    } else {
      panel.classList.remove('open');
    }
    updateBubbleContent();
  });

  shadow.appendChild(bubble);

  // APIからコンフィグを取得してバブルをカスタマイズ
  fetch(configUrl)
    .then(function(res) { return res.json(); })
    .then(function(config) {
      if (!config || config.error) return;

      // テーマカラー
      var color = (config.design && config.design.headerColor) ||
                  (config.avatar_style && config.avatar_style.primaryColor) ||
                  bubbleColor;

      // バブルサイズ
      var size = (config.design && config.design.bubbleSize) || bubbleSize;

      // カスタム画像アバター
      if (config.avatar_style && config.avatar_style.type === 'custom' && config.avatar_style.customImageUrl) {
        avatarImageUrl = config.avatar_style.customImageUrl;
      }

      // スタイル再適用
      styleEl.textContent = buildStyles(color, size);

      // バブルの色を更新
      bubble.style.background = color;

      // バブル内容を更新（カスタム画像がある場合）
      updateBubbleContent();
    })
    .catch(function(err) {
      // コンフィグ取得失敗時はデフォルトのまま動作
      console.warn('[Concierge] Config fetch failed, using defaults:', err.message);
    });
})();
