/**
 * オンボーディングモーダル ローダー (集客メーカー)
 *
 * 外部サイトに埋め込むためのバニラJSローダー。
 * Shadow DOMでスタイル隔離、localStorage で「次から表示しない」管理。
 *
 * 使い方:
 * <script src="https://makers.tokyo/embed/onboarding/loader.js"
 *   data-modal-id="YOUR_SLUG"
 *   data-trigger="immediate|delay|scroll|click"
 *   data-delay="3000"
 *   data-scroll-percent="50"
 *   data-position="bottom-right"
 *   async></script>
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var config = {
    modalId: script.dataset.modalId,
    trigger: script.dataset.trigger || 'immediate',
    delay: parseInt(script.dataset.delay) || 0,
    scrollPercent: parseInt(script.dataset.scrollPercent) || 50,
    position: script.dataset.position || 'bottom-right',
  };

  if (!config.modalId) {
    console.warn('[OnboardingModal] data-modal-id is required');
    return;
  }

  var storageKey = 'sm_onboarding_' + config.modalId;
  if (localStorage.getItem(storageKey) === 'dismissed') return;

  // API からモーダルデータ取得
  var apiBase = script.src.replace('/embed/onboarding/loader.js', '');
  fetch(apiBase + '/api/onboarding/' + config.modalId)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.error) return;
      initModal(data);
    })
    .catch(function (e) {
      console.warn('[OnboardingModal] Failed to load:', e);
    });

  // カラーマップ
  var COLORS = {
    blue: { bg: '#dbeafe', text: '#2563eb' },
    purple: { bg: '#f3e8ff', text: '#9333ea' },
    teal: { bg: '#ccfbf1', text: '#0d9488' },
    amber: { bg: '#fef3c7', text: '#d97706' },
    green: { bg: '#dcfce7', text: '#16a34a' },
    red: { bg: '#fee2e2', text: '#dc2626' },
    orange: { bg: '#ffedd5', text: '#ea580c' },
    indigo: { bg: '#e0e7ff', text: '#4f46e5' },
    violet: { bg: '#ede9fe', text: '#7c3aed' },
    rose: { bg: '#ffe4e6', text: '#e11d48' },
    pink: { bg: '#fce7f3', text: '#db2777' },
    cyan: { bg: '#cffafe', text: '#0891b2' },
  };

  // Tailwind グラデーション → CSS変換
  var GRADIENT_COLORS = {
    'from-amber-500': '#f59e0b', 'from-blue-500': '#3b82f6', 'from-indigo-600': '#4f46e5',
    'from-purple-600': '#9333ea', 'from-teal-500': '#14b8a6', 'from-emerald-500': '#10b981',
    'from-rose-500': '#f43f5e', 'from-red-500': '#ef4444', 'from-gray-700': '#374151',
    'from-sky-500': '#0ea5e9', 'from-orange-500': '#f97316', 'from-pink-500': '#ec4899',
    'from-cyan-500': '#06b6d4', 'from-violet-500': '#8b5cf6', 'from-green-500': '#22c55e',
    'to-orange-500': '#f97316', 'to-indigo-600': '#4f46e5', 'to-purple-600': '#9333ea',
    'to-pink-600': '#db2777', 'to-cyan-500': '#06b6d4', 'to-teal-600': '#0d9488',
    'to-blue-600': '#2563eb', 'to-red-500': '#ef4444', 'to-gray-900': '#111827',
    'to-sky-600': '#0284c7', 'to-amber-500': '#f59e0b', 'to-rose-600': '#e11d48',
    'to-emerald-600': '#059669', 'to-violet-600': '#7c3aed', 'to-green-600': '#16a34a',
  };

  function getGradient(from, to) {
    var c1 = GRADIENT_COLORS[from] || '#f59e0b';
    var c2 = GRADIENT_COLORS[to] || '#f97316';
    return 'linear-gradient(to right, ' + c1 + ', ' + c2 + ')';
  }

  // アイコンSVGパス（よく使うアイコンのサブセット）
  var ICON_SVGS = {
    Layout: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    Sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
    Settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    Zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    BookOpen: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    Mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    Shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
    Search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    ShoppingCart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    HelpCircle: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    Phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    Info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    Heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    Globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    Lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    Rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    CheckCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    Target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  };

  function renderIcon(iconName, color) {
    var svg = ICON_SVGS[iconName] || ICON_SVGS.Info;
    var c = COLORS[color] || COLORS.blue;
    return '<div style="width:32px;height:32px;border-radius:50%;background:' + c.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + c.text + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + svg + '</svg>' +
      '</div>';
  }

  function initModal(data) {
    var host = document.createElement('div');
    host.id = 'sm-onboarding-host';
    document.body.appendChild(host);
    var shadow = host.attachShadow({ mode: 'closed' });

    var style = document.createElement('style');
    style.textContent = [
      '*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
      '.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px}',
      '.modal{background:#fff;border-radius:16px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);width:100%;max-width:480px;overflow:hidden;animation:fadeIn .2s ease}',
      '@keyframes fadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}',
      '.header{color:#fff;padding:20px 24px}',
      '.header-title{font-size:20px;font-weight:700}',
      '.header-subtitle{font-size:14px;opacity:0.8;margin-top:4px}',
      '.header-top{display:flex;justify-content:space-between;align-items:center}',
      '.header-page{font-size:14px;opacity:0.7;font-weight:500}',
      '.progress{display:flex;gap:6px;margin-top:12px}',
      '.progress-bar{height:4px;border-radius:2px;flex:1;transition:background 0.3s}',
      '.content{padding:20px 24px}',
      '.item{display:flex;gap:12px;margin-bottom:16px}',
      '.item:last-child{margin-bottom:0}',
      '.item-title{font-weight:600;color:#111827;font-size:14px}',
      '.item-desc{font-size:13px;color:#6b7280;margin-top:2px}',
      '.footer{padding:16px 24px;border-top:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between}',
      '.check-label{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#6b7280}',
      '.check-label input{width:16px;height:16px}',
      '.btns{display:flex;gap:8px}',
      '.btn-back{padding:10px 16px;border:1px solid #d1d5db;color:#374151;border-radius:12px;font-weight:500;background:#fff;cursor:pointer;font-size:14px}',
      '.btn-back:hover{background:#f9fafb}',
      '.btn-next{padding:10px 24px;color:#fff;border-radius:12px;font-weight:500;border:none;cursor:pointer;font-size:14px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)}',
      '.btn-next:hover{opacity:0.9}',
      '.trigger-btn{position:fixed;z-index:999998;color:#fff;padding:12px 20px;border-radius:9999px;font-weight:700;border:none;cursor:pointer;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);font-size:14px}',
      '.trigger-btn:hover{opacity:0.9}',
      '.hidden{display:none}',
    ].join('\n');
    shadow.appendChild(style);

    var currentPage = 0;
    var gradient = getGradient(data.gradient_from, data.gradient_to);
    var container = document.createElement('div');
    shadow.appendChild(container);

    function render() {
      var pages = data.pages || [];
      var total = pages.length;
      var page = pages[currentPage];
      if (!page) return;

      var html = '';

      // オーバーレイ + モーダル
      html += '<div class="overlay" id="sm-overlay">';
      html += '<div class="modal">';

      // ヘッダー
      html += '<div class="header" style="background:' + gradient + '">';
      html += '<div class="header-top">';
      html += '<div><div class="header-title">' + esc(data.title) + '</div>';
      html += '<div class="header-subtitle">' + esc(page.subtitle) + '</div></div>';
      if (total > 1) html += '<span class="header-page">' + (currentPage + 1) + ' / ' + total + '</span>';
      html += '</div>';
      if (total > 1) {
        html += '<div class="progress">';
        for (var i = 0; i < total; i++) {
          html += '<div class="progress-bar" style="background:' + (i <= currentPage ? '#fff' : 'rgba(255,255,255,0.3)') + '"></div>';
        }
        html += '</div>';
      }
      html += '</div>';

      // コンテンツ
      html += '<div class="content">';
      (page.items || []).forEach(function (item) {
        html += '<div class="item">';
        html += renderIcon(item.iconName, item.iconColor);
        html += '<div><div class="item-title">' + esc(item.title) + '</div>';
        html += '<div class="item-desc">' + esc(item.description) + '</div></div>';
        html += '</div>';
      });
      html += '</div>';

      // フッター
      html += '<div class="footer">';
      if (data.show_dont_show_again) {
        html += '<label class="check-label"><input type="checkbox" id="sm-dismiss">' + esc(data.dont_show_text || '次から表示しない') + '</label>';
      } else {
        html += '<div></div>';
      }
      html += '<div class="btns">';
      if (currentPage > 0) {
        html += '<button class="btn-back" id="sm-back">' + esc(data.back_button_text || '戻る') + '</button>';
      }
      if (currentPage < total - 1) {
        html += '<button class="btn-next" id="sm-next" style="background:' + gradient + '">' + esc(data.next_button_text || '次へ') + '</button>';
      } else {
        html += '<button class="btn-next" id="sm-close-btn" style="background:' + gradient + '">' + esc(data.start_button_text || 'はじめる') + '</button>';
      }
      html += '</div></div>';

      html += '</div></div>';

      container.innerHTML = html;

      // イベントリスナー
      var overlay = shadow.getElementById('sm-overlay');
      if (overlay && data.close_on_overlay_click) {
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) closeModal();
        });
      }

      var nextBtn = shadow.getElementById('sm-next');
      if (nextBtn) nextBtn.addEventListener('click', function () { currentPage++; render(); });

      var backBtn = shadow.getElementById('sm-back');
      if (backBtn) backBtn.addEventListener('click', function () { currentPage--; render(); });

      var closeBtn = shadow.getElementById('sm-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);

      var dismissCheck = shadow.getElementById('sm-dismiss');
      if (dismissCheck) {
        dismissCheck.addEventListener('change', function () {
          if (this.checked) localStorage.setItem(storageKey, 'dismissed');
          else localStorage.removeItem(storageKey);
        });
      }
    }

    function closeModal() {
      container.innerHTML = '';
      // ボタントリガーの場合はボタンを再表示
      if (config.trigger === 'click') renderTriggerButton();
    }

    function renderTriggerButton() {
      var posMap = {
        'bottom-right': 'bottom:24px;right:24px',
        'bottom-left': 'bottom:24px;left:24px',
        'top-right': 'top:24px;right:24px',
        'top-left': 'top:24px;left:24px',
      };
      var pos = posMap[config.position] || posMap['bottom-right'];
      container.innerHTML = '<button class="trigger-btn" style="' + pos + ';background:' + gradient + '">' + esc(data.trigger_button_text || 'ヘルプ') + '</button>';
      container.querySelector('.trigger-btn').addEventListener('click', function () { render(); });
    }

    // トリガーロジック
    switch (config.trigger) {
      case 'immediate':
        render();
        break;
      case 'delay':
        setTimeout(render, config.delay);
        break;
      case 'scroll':
        var scrollHandler = function () {
          var scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
          if (scrolled >= config.scrollPercent) {
            window.removeEventListener('scroll', scrollHandler);
            render();
          }
        };
        window.addEventListener('scroll', scrollHandler);
        break;
      case 'click':
        renderTriggerButton();
        break;
      default:
        render();
    }
  }

  function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
