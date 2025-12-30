/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 型エラーがあってもビルドを完了させる
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLintのエラーも無視する
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;


