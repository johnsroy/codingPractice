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
  // Optional same-origin API proxy: when API_PROXY_TARGET is set (and the web app
  // is built with NEXT_PUBLIC_API_URL=""), /api/* is proxied to the backend, so
  // the whole app can be served behind a single origin/tunnel without CORS.
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    return target
      ? { beforeFiles: [{ source: '/api/:path*', destination: `${target}/api/:path*` }], afterFiles: [], fallback: [] }
      : { beforeFiles: [], afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
