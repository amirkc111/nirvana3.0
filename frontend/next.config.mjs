/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['swisseph'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // In the browser, swisseph is useless and can't be bundled
      config.resolve.alias['swisseph'] = false;
      config.resolve.alias['swisseph-loader'] = false;
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/panchang-celestial',
        destination: process.env.PANCHANG_API_URL
          ? `${process.env.PANCHANG_API_URL}/api/panchang`
          : (process.env.NODE_ENV === 'production'
            ? 'http://panchang-api:5002/api/panchang'
            : 'http://localhost:5002/api/panchang'),
      },
    ];
  },
};

export default nextConfig;
