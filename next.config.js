/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable experimental features for better performance
  experimental: {
    appDir: false, // Set to true if using app directory
  },

  // Image optimization configuration
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // PWA-like configuration for mobile app feel
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // Audio file caching headers
      {
        source: '/audio/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Enable CORS for audio files if serving from external sources
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Webpack configuration for audio file handling
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle audio files with asset/resource (webpack 5 way)
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a|flac|aac)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/audio/[name].[hash][ext]',
      },
    });

    // Add fallback for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          audio: {
            name: 'audio-libs',
            test: /[\\/]node_modules[\\/](howler|web-audio-api|audio-context)[\\\/]/,
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }

    return config;
  },

  // Compress responses for better mobile performance
  compress: true,

  // Disable trailing slash for consistent routing
  trailingSlash: false,

  // Optimize for mobile devices
  poweredByHeader: false,

  // Custom page extensions
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  // Asset prefix for CDN or static file serving
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX || '' : '',

  // Enable source maps in development
  productionBrowserSourceMaps: false,

  // Optimize for mobile performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Output configuration for static export if needed
  // output: 'export', // Uncomment for static export
  // distDir: 'build', // Uncomment to change build directory
};

module.exports = nextConfig;