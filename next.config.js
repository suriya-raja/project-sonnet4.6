/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/landing.html',
        permanent: false,
      },
      {
        source: '/documentation',
        destination: '/documentation.html',
        permanent: false,
      }
    ];
  },
};

module.exports = nextConfig;
