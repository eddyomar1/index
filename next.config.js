/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  agentRules: false,
  // The compiler API avoids a CLI stdout-capture issue seen in constrained CI shells.
  experimental: {
    useTypeScriptCli: false,
  },
};

module.exports = nextConfig;
