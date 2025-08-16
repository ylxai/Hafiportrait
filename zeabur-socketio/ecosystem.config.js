/**
 * PM2 Ecosystem Configuration for HafiPortrait Socket.IO
 * Optimized for Zeabur deployment with production settings
 */

module.exports = {
  apps: [
    {
      name: 'hafiportrait-socketio',
      script: 'server.js',
      
      // Instance configuration
      instances: process.env.PM2_INSTANCES || 1,
      exec_mode: 'cluster',
      
      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 8080
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      
      // Performance & Memory
      max_memory_restart: '500M',
      node_args: '--max-old-space-size=512',
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto restart configuration
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      watch_options: {
        followSymlinks: false
      },
      
      // Restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Process management
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Advanced PM2 features
      source_map_support: true,
      instance_var: 'INSTANCE_ID',
      
      // Zeabur specific optimizations
      exp_backoff_restart_delay: 100,
      vizion: false,
      automation: false,
      pmx: false,
      
      // Environment variables
      env_file: '.env',
      
      // Graceful shutdown
      kill_retry_time: 100,
      
      // Custom startup script for Socket.IO
      post_update: ['npm install'],
      
      // Monitoring
      monitoring: false
    }
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'node',
      host: 'wbs.zeabur.app',
      ref: 'origin/main',
      repo: 'git@github.com:username/hafiportrait-socketio.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};