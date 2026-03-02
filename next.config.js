/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // 重い依存関係をサーバーレス関数バンドルから除外（デプロイサイズ削減）
  serverExternalPackages: [
    '@sparticuz/chromium',
    'puppeteer-core',
  ],

  // ヘッダー設定（セキュリティとSEO）
  async headers() {
    return [
      {
        source: '/:path*',
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
