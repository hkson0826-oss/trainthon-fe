import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_BASE_URL;
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';
    if (useMock || !api) return [];
    return [
      {
        source: '/backend/:path*',
        destination: `${api.replace(/\/api\/v1\/?$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
