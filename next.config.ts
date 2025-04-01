import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = {
  async redirects() {
    return [
      {
        source: '/api/engine',
        destination: '/api/engine',
        permanent: true,
      },
    ];
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, tls: false, net: false };
    }
    return config;
  },
};
export default nextConfig;
