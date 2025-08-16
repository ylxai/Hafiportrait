/**
 * PM2 Simple Ecosystem Configuration
 * Simplified version untuk troubleshooting deployment issues
 */

module.exports = {
  apps: [
    {
      name: 'hafiportrait-socketio-simple',
      script: 'server.js',
      
      // Simple configuration
      instances: 1,
      exec_mode: 'fork', // Simple fork mode instead of cluster
      
      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 8080
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      
      // Basic settings
      autorestart: true,
      watch: false,
      max_memory_restart: '300M', // Lower memory limit
      
      // Minimal logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Simple restart policy
      max_restarts: 5,
      min_uptime: '5s',
      restart_delay: 2000,
      
      // Disable advanced features for debugging
      pmx: false,
      automation: false,
      vizion: false,
      
      // Simple error handling
      kill_timeout: 3000,
      listen_timeout: 3000,
      
      // Environment file
      env_file: '.env'
    }
  ]
};