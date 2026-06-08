/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mentora/shared'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  experimental: {
    // Allow server actions and other experimental features
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
};

export default nextConfig;
