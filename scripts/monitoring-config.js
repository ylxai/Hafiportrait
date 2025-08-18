/**
 * Monitoring Configuration untuk HafiPortrait
 * Konfigurasi terpusat untuk semua komponen monitoring
 */

module.exports = {
  // Konfigurasi Health Monitoring
  health: {
    checkInterval: 60000, // 1 menit
    timeout: 10000, // 10 detik
    retries: 3,
    endpoints: {
      api: '/api/health',
      database: '/api/test/db',
      storage: '/api/admin/storage/status',
      websocket: '/health' // Relative to SOCKET_URL
    },
    thresholds: {
      responseTime: 3000, // 3 detik
      errorRate: 0.1, // 10%
      diskUsage: 85, // 85%
      memoryUsage: 90, // 90%
      cpuUsage: 80 // 80%
    }
  },

  // Konfigurasi Alerting
  alerts: {
    cooldownPeriod: 300000, // 5 menit
    maxHistorySize: 1000,
    levels: {
      info: { priority: 1, color: '#36a64f', emoji: 'ℹ️' },
      warning: { priority: 2, color: '#ff9500', emoji: '⚠️' },
      error: { priority: 3, color: '#ff0000', emoji: '❌' },
      critical: { priority: 4, color: '#8b0000', emoji: '🚨' }
    },
    channels: {
      slack: {
        enabled: !!process.env.SLACK_WEBHOOK,
        webhook: process.env.SLACK_WEBHOOK,
        channel: '#alerts',
        username: 'HafiPortrait Monitor'
      },
      discord: {
        enabled: !!process.env.DISCORD_WEBHOOK,
        webhook: process.env.DISCORD_WEBHOOK
      },
      email: {
        enabled: !!process.env.NOTIFICATION_EMAIL,
        to: process.env.NOTIFICATION_EMAIL,
        from: process.env.SMTP_FROM || 'noreply@hafiportrait.com'
      },
      whatsapp: {
        enabled: !!process.env.WHATSAPP_API_URL,
        apiUrl: process.env.WHATSAPP_API_URL,
        phoneNumber: process.env.WHATSAPP_PHONE_NUMBER
      }
    }
  },

  // Konfigurasi Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    maxFileSize: '10MB',
    maxFiles: 5,
    datePattern: 'YYYY-MM-DD',
    files: {
      health: 'logs/health-monitor.log',
      alerts: 'logs/alerts.log',
      system: 'logs/system-monitor.log',
      errors: 'logs/errors.log'
    }
  },

  // Konfigurasi Metrics
  metrics: {
    retention: {
      raw: 86400000, // 24 jam
      hourly: 2592000000, // 30 hari
      daily: 31536000000 // 1 tahun
    },
    aggregation: {
      intervals: [60000, 300000, 900000], // 1m, 5m, 15m
      functions: ['avg', 'min', 'max', 'count']
    }
  },

  // Konfigurasi Environment-specific
  environments: {
    development: {
      health: {
        checkInterval: 30000, // 30 detik
        thresholds: {
          responseTime: 5000,
          errorRate: 0.2
        }
      },
      alerts: {
        cooldownPeriod: 60000, // 1 menit
        channels: {
          slack: { enabled: false },
          discord: { enabled: false },
          email: { enabled: false }
        }
      }
    },
    staging: {
      health: {
        checkInterval: 45000, // 45 detik
        thresholds: {
          responseTime: 4000,
          errorRate: 0.15
        }
      },
      alerts: {
        cooldownPeriod: 180000, // 3 menit
        channels: {
          slack: { enabled: true },
          discord: { enabled: false },
          email: { enabled: false }
        }
      }
    },
    production: {
      health: {
        checkInterval: 60000, // 1 menit
        thresholds: {
          responseTime: 3000,
          errorRate: 0.05
        }
      },
      alerts: {
        cooldownPeriod: 300000, // 5 menit
        channels: {
          slack: { enabled: true },
          discord: { enabled: true },
          email: { enabled: true },
          whatsapp: { enabled: true }
        }
      }
    }
  },

  // Konfigurasi Dashboard
  dashboard: {
    refreshInterval: 30000, // 30 detik
    autoRefresh: true,
    charts: {
      responseTime: { enabled: true, timeRange: '1h' },
      errorRate: { enabled: true, timeRange: '1h' },
      systemResources: { enabled: true, timeRange: '1h' },
      alertsHistory: { enabled: true, timeRange: '24h' }
    }
  },

  // Konfigurasi Backup Monitoring
  backup: {
    checkInterval: 3600000, // 1 jam
    maxAge: 86400000, // 24 jam
    locations: [
      'database',
      'storage',
      'configuration'
    ],
    alerts: {
      missingBackup: 'critical',
      oldBackup: 'warning',
      failedBackup: 'error'
    }
  },

  // Konfigurasi Performance Monitoring
  performance: {
    apm: {
      enabled: !!process.env.APM_SERVER_URL,
      serverUrl: process.env.APM_SERVER_URL,
      serviceName: 'hafiportrait',
      environment: process.env.NODE_ENV
    },
    metrics: [
      'response_time',
      'throughput',
      'error_rate',
      'cpu_usage',
      'memory_usage',
      'disk_usage',
      'database_connections',
      'active_sessions'
    ]
  },

  // Konfigurasi Security Monitoring
  security: {
    monitoring: {
      failedLogins: { threshold: 5, window: 300000 }, // 5 attempts in 5 minutes
      suspiciousActivity: { enabled: true },
      rateLimiting: { enabled: true, threshold: 100 } // 100 requests per minute
    },
    alerts: {
      bruteForce: 'critical',
      suspiciousActivity: 'warning',
      rateLimitExceeded: 'warning'
    }
  }
};

// Helper function untuk mendapatkan konfigurasi berdasarkan environment
function getConfig(environment = process.env.NODE_ENV || 'development') {
  const baseConfig = module.exports;
  const envConfig = baseConfig.environments[environment] || {};
  
  // Merge environment-specific config dengan base config
  return mergeDeep(baseConfig, envConfig);
}

// Deep merge utility
function mergeDeep(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

module.exports.getConfig = getConfig;