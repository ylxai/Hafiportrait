module.exports = {
  apps: [
    {
      name: 'hafiportrait-dev',
      script: 'pnpm',
      args: 'dev',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: ['../dev-workspace/src', '../dev-workspace/public'],
      ignore_watch: ['node_modules', '.next', 'logs'],
      max_memory_restart: '2G',
      cwd: '../dev-workspace',
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
        HOST: '0.0.0.0'
      },
      env_file: '.env.local',
      log_file: './logs/dev-combined.log',
      out_file: './logs/dev-out.log',
      error_file: './logs/dev-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'hafiportrait-socketio-dev',
      script: 'node',
      args: 'socketio-server.js',
      instances: 1,
      autorestart: true,
      watch: ['../dev-workspace/socketio-server.js'],
      max_memory_restart: '1G',
      cwd: '../dev-workspace',
      env: {
        NODE_ENV: 'development',
        SOCKETIO_PORT: 3003,
        HOST: '0.0.0.0'
      },
      log_file: './logs/socketio-dev-combined.log',
      out_file: './logs/socketio-dev-out.log',
      error_file: './logs/socketio-dev-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};