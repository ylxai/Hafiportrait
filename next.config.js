/** @type {import('next').NextConfig} */
const path = require('path')

// Load polyfills early
try {
  require('./src/lib/polyfills.js')
} catch (e) {
  console.warn('Polyfills loading failed:', e.message)
}

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Prefer webpack alias from tsconfig paths too (safety)
    // Note: We already set '@' above, keeping consistent

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    }
    
    // Server-side optimizations
    if (isServer) {
      // Exclude problematic client-side libraries from server bundle
      config.externals = config.externals || []
      config.externals.push({
        'socket.io-client': 'socket.io-client',
        'framer-motion': 'framer-motion',
        'yet-another-react-lightbox': 'yet-another-react-lightbox',
        'lodash.merge': 'lodash.merge',
      })
      
      // Add global polyfill at webpack level
      const webpack = require('webpack')
      config.plugins.push(
        new webpack.ProvidePlugin({
          'global': 'global',
          'self': 'global',
        })
      )
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
        global: false,
      }
      
      // Add global variable definition
      config.plugins.push(
        new webpack.DefinePlugin({
          global: 'globalThis',
        })
      )
    }
    
    // Production optimizations
    if (process.env.NODE_ENV === 'production') {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
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
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },
  // CloudRun configuration
  images: {
    domains: ['localhost', 'api.qrserver.com', 'azspktldiblhrwebzmwq.supabase.co', 'bwpwwtphgute.ap-southeast-1.clawcloudrun.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Updated external packages configuration
  serverExternalPackages: ['@neondatabase/serverless'],
  // Updated Turbopack configuration
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    }
  },
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

module.exports = {
  ...nextConfig,
  allowedDevOrigins: [
    // Development origins
    'localhost',
    '127.0.0.1',
    '147.251.255.227',
    'local-origin.dev', 
    '*.local-origin.dev',
    
    // CloudRun development
    'bwpwwtphgute.ap-southeast-1.clawcloudrun.com',
    '*.ap-southeast-1.clawcloudrun.com',
    '*.clawcloudrun.com',
    
    // Vercel staging
    'hafiportrait-staging.vercel.app',
    '*.vercel.app',
    
    // Production domain
    'hafiportrait.photography',
    '*.hafiportrait.photography',
    
    // Supabase domains
    'azspktldiblhrwebzmwq.supabase.co',
    '*.supabase.co',
    
    // Cloudflare R2 domains
    'photos.hafiportrait.photography',
    '*.r2.cloudflarestorage.com',
    
    // Allow all for development flexibility
    '*'
  ],

  // External WebSocket Configuration
  env: {
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_SOCKETIO_URL: process.env.NEXT_PUBLIC_SOCKETIO_URL,
    NEXT_PUBLIC_USE_SOCKETIO: process.env.NEXT_PUBLIC_USE_SOCKETIO,
  },
  
  // WebSocket proxy for development
  async rewrites() {
    return [
      {
        source: '/ws/:path*',
        destination: 'https://xcyrexmwrwjq.ap-southeast-1.clawcloudrun.com/ws/:path*',
      },
    ];
  },
}