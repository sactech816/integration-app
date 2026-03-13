/**
 * コンシェルジュ埋め込みローダー
 * 外部サイトにフローティングチャットウィジェットを設置する
 * iframeベースでCORS問題を回避
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

  // Shadow DOMホストを作成
  var host = document.createElement('div');
  host.id = 'makers-concierge-host';
  host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
  document.body.appendChild(host);

  var shadow = host.attachShadow({ mode: 'open' });

  var isRight = position === 'bottom-right';
  var isOpen = false;

  // スタイル
  var style = document.createElement('style');
  style.textContent = '\
    .concierge-bubble {\
      position: fixed;\
      ' + (isRight ? 'right: 20px;' : 'left: 20px;') + '\
      bottom: 20px;\
      width: 56px;\
      height: 56px;\
      border-radius: 50%;\
      background: #0D9488;\
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
    }\
    .concierge-bubble:hover {\
      transform: scale(1.1);\
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);\
    }\
    .concierge-bubble svg {\
      width: 24px;\
      height: 24px;\
    }\
    .concierge-panel {\
      position: fixed;\
      ' + (isRight ? 'right: 20px;' : 'left: 20px;') + '\
      bottom: 88px;\
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
        bottom: 80px;\
      }\
    }\
  ';
  shadow.appendChild(style);

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
  bubble.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  bubble.addEventListener('click', function() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('open');
      bubble.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      bubble.setAttribute('aria-label', 'チャットを閉じる');
    } else {
      panel.classList.remove('open');
      bubble.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
      bubble.setAttribute('aria-label', 'チャットを開く');
    }
  });

  shadow.appendChild(bubble);
})();
