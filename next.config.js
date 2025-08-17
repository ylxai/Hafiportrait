/** @type {import('next').NextConfig} */
const path = require('path')

// Polyfills moved to client-side only to avoid server-side window errors

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Minimal webpack configuration to avoid conflicts
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    }
    
    // Server-side optimizations only
    if (isServer) {
      // Exclude problematic client-side libraries from server bundle
      config.externals = config.externals || []
      config.externals.push({
        'socket.io-client': 'socket.io-client',
        'framer-motion': 'framer-motion',
        'yet-another-react-lightbox': 'yet-another-react-lightbox',
        'embla-carousel-react': 'embla-carousel-react',
        'googleapis': 'googleapis',
        'googleapis-common': 'googleapis-common',
      })
    }
    
    return config
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Performance optimizations (disabled optimizeCss due to critters dependency issue)
  experimental: {
    // optimizeCss: true, // Disabled - causes critters module not found error
  },
  // CloudRun configuration
  images: {
    domains: ['localhost', 'api.qrserver.com', 'azspktldiblhrwebzmwq.supabase.co', 'bwpwwtphgute.ap-southeast-1.clawcloudrun.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // External packages configuration (removed for compatibility)
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // CloudRun optimizations
  poweredByHeader: false,
  compress: true,
  // Custom server configuration for CloudRun
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/test/db',
      },
    ];
  },
}

module.exports = nextConfig