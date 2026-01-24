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
  
  // 静的生成の強制
  output: 'standalone',
  
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
