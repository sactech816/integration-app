/** @type {import('next').NextConfig} */
const nextConfig = {
  // Puppeteer / Chromium をサーバーレス環境で正しくバンドルするため
  serverExternalPackages: ['@sparticuz/chromium-min', 'puppeteer-core'],

  // 画像の最適化設定
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // トレイリングスラッシュを追加しない（SEO最適化）
  trailingSlash: false,

  // ヘッダー設定（セキュリティとSEO）
  async headers() {
    return [
      {
        // 埋め込み用ページは外部サイトの iframe から読み込み可能にする
        source: '/embed/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *'
          },
        ],
      },
      {
        // それ以外は SAMEORIGIN（iframe 埋め込み不可）
        source: '/((?!embed).*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
