/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScriptのビルドエラーを無視
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLintのエラーも無視
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;