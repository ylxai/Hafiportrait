/**
 * DSLR Configuration Management
 * Centralized configuration with environment support
 */

const path = require('path');
const os = require('os');

// Load environment variables (with fallback)
try {
  require('dotenv').config();
} catch (error) {
  console.warn('⚠️ dotenv not available, using process.env directly');
}

/**
 * Get camera folder based on OS and camera model
 */
function getCameraFolder(cameraModel = 'NIKON_D7100') {
  const platform = os.platform();
  
  const cameraFolders = {
    NIKON_D7100: {
      win32: ['C:/DCIM/100NIKON', 'D:/DCIM/100NIKON', 'E:/DCIM/100NIKON'],
      darwin: ['/Volumes/NIKON D7100/DCIM/100NIKON', '/Volumes/NO NAME/DCIM/100NIKON'],
      linux: ['/media/NIKON/DCIM/100NIKON', '/mnt/camera/DCIM/100NIKON']
    },
    CANON_EOS: {
      win32: ['C:/DCIM/100CANON', 'D:/DCIM/100CANON'],
      darwin: ['/Volumes/EOS_DIGITAL/DCIM/100CANON'],
      linux: ['/media/CANON/DCIM/100CANON']
    },
    SONY_ALPHA: {
      win32: ['C:/DCIM/100MSDCF', 'D:/DCIM/100MSDCF'],
      darwin: ['/Volumes/SONY/DCIM/100MSDCF'],
      linux: ['/media/SONY/DCIM/100MSDCF']
    }
  };

  const folders = cameraFolders[cameraModel]?.[platform] || cameraFolders.NIKON_D7100[platform];
  
  // Return first existing folder or default
  return folders?.[0] || 'C:/DCIM/100NIKON';
}

/**
 * Performance profiles for different scenarios
 */
const PERFORMANCE_PROFILES = {
  DEVELOPMENT: {
    stabilityThreshold: 1000,
    pollInterval: 500,
    retryDelay: 3000,
    maxRetries: 2,
    batchSize: 1,
    compressionQuality: 0.8
  },
  PRODUCTION: {
    stabilityThreshold: 2000,
    pollInterval: 100,
    retryDelay: 5000,
    maxRetries: 3,
    batchSize: 3,
    compressionQuality: 0.9
  },
  HIGH_VOLUME: {
    stabilityThreshold: 3000,
    pollInterval: 50,
    retryDelay: 2000,
    maxRetries: 5,
    batchSize: 5,
    compressionQuality: 0.85
  },
  LOW_BANDWIDTH: {
    stabilityThreshold: 5000,
    pollInterval: 200,
    retryDelay: 10000,
    maxRetries: 2,
    batchSize: 1,
    compressionQuality: 0.7
  }
};

/**
 * Main configuration object
 */
const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Camera Configuration
  CAMERA: {
    MODEL: process.env.DSLR_CAMERA_MODEL || 'NIKON_D7100',
    WATCH_FOLDER: process.env.DSLR_WATCH_FOLDER || getCameraFolder(),
    AUTO_DETECT: process.env.DSLR_AUTO_DETECT === 'true',
    CONNECTION_CHECK_INTERVAL: parseInt(process.env.DSLR_CONNECTION_CHECK_INTERVAL) || 30000
  },

  // Storage Configuration - Cloudflare R2 + Google Drive
  STORAGE: {
    // Multi-tier storage strategy (NO SUPABASE STORAGE)
    STRATEGY: process.env.DSLR_STORAGE_STRATEGY || 'cloudflare-google', // 'cloudflare-google', 'cloudflare-only'
    
    // Tier 1: Cloudflare R2 (Primary storage - 10GB free)
    CLOUDFLARE_R2: {
      MAX_SIZE_GB: parseFloat(process.env.DSLR_CLOUDFLARE_R2_MAX_GB) || 8, // 80% of 10GB free limit
      PRIORITY_TYPES: ['homepage', 'premium', 'featured', 'standard', 'event'],
      ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
      ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'hafiportrait-photos',
      CUSTOM_DOMAIN: process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN // Optional custom domain
    },
    
    // Tier 2: Google Drive (Secondary storage - 15GB free)
    GOOGLE_DRIVE: {
      MAX_SIZE_GB: parseFloat(process.env.DSLR_GOOGLE_DRIVE_MAX_GB) || 12, // 80% of 15GB free limit
      PRIORITY_TYPES: ['backup', 'archive', 'overflow'],
      CLIENT_ID: process.env.GOOGLE_DRIVE_CLIENT_ID,
      CLIENT_SECRET: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      ROOT_FOLDER_ID: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
      REDIRECT_URI: process.env.GOOGLE_DRIVE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
    },
    
    // Tier 3: Local Backup (Emergency fallback)
    LOCAL: {
      BACKUP_FOLDER: process.env.DSLR_BACKUP_FOLDER || './dslr-backup',
      RAW_FOLDER: process.env.DSLR_RAW_FOLDER || './dslr-backup/raw',
      JPG_FOLDER: process.env.DSLR_JPG_FOLDER || './dslr-backup/jpg',
      MAX_SIZE_GB: parseInt(process.env.DSLR_MAX_BACKUP_SIZE_GB) || 50
    },
    
    // General settings
    ENABLE_BACKUP: process.env.DSLR_ENABLE_BACKUP !== 'false',
    CLEANUP_OLD_FILES: process.env.DSLR_CLEANUP_OLD_FILES === 'true',
    CLEANUP_DAYS: parseInt(process.env.DSLR_CLEANUP_DAYS) || 30,
    
    // Compression settings per tier
    COMPRESSION: {
      PREMIUM: { quality: 0.95, maxWidth: 4000 },   // Homepage, featured photos
      STANDARD: { quality: 0.85, maxWidth: 2000 },  // Regular event photos
      THUMBNAIL: { quality: 0.75, maxWidth: 800 }   // Thumbnails for fast loading
    }
  },

  // API Configuration
  API: {
    BASE_URL: process.env.DSLR_API_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    TIMEOUT: parseInt(process.env.DSLR_API_TIMEOUT) || 30000,
    HEALTH_CHECK_TIMEOUT: parseInt(process.env.DSLR_HEALTH_CHECK_TIMEOUT) || 3000,
    RETRY_ATTEMPTS: parseInt(process.env.DSLR_API_RETRY_ATTEMPTS) || 3,
    RETRY_DELAY: parseInt(process.env.DSLR_API_RETRY_DELAY) || 5000
  },

  // Event Configuration
  EVENT: {
    ID: process.env.DSLR_EVENT_ID || 'default-event',
    UPLOADER_NAME: process.env.DSLR_UPLOADER_NAME || 'Official Photographer',
    ALBUM_NAME: process.env.DSLR_ALBUM_NAME || 'Official',
    AUTO_CREATE_EVENT: process.env.DSLR_AUTO_CREATE_EVENT === 'true'
  },

  // File Processing
  FILES: {
    JPG_PATTERN: /\.(jpg|jpeg)$/i,
    RAW_PATTERN: /\.(nef|raw|cr2|arw|dng)$/i,
    VIDEO_PATTERN: /\.(mp4|mov|avi)$/i,
    SUPPORTED_EXTENSIONS: process.env.DSLR_SUPPORTED_EXTENSIONS?.split(',') || ['.jpg', '.jpeg', '.nef', '.raw'],
    MAX_FILE_SIZE_MB: parseInt(process.env.DSLR_MAX_FILE_SIZE_MB) || 100,
    PROCESS_RAW_FILES: process.env.DSLR_PROCESS_RAW_FILES === 'true',
    PROCESS_VIDEO_FILES: process.env.DSLR_PROCESS_VIDEO_FILES === 'true'
  },

  // Performance Profile
  PERFORMANCE: (() => {
    const profile = process.env.DSLR_PERFORMANCE_PROFILE || 'PRODUCTION';
    return {
      PROFILE: profile,
      ...PERFORMANCE_PROFILES[profile] || PERFORMANCE_PROFILES.PRODUCTION
    };
  })(),

  // Notification Configuration
  NOTIFICATIONS: {
    ENABLED: process.env.DSLR_NOTIFICATIONS_ENABLED !== 'false',
    LOCAL_LOGGING: process.env.DSLR_LOCAL_LOGGING !== 'false',
    LOG_FILE: process.env.DSLR_LOG_FILE || './dslr-notifications.log',
    MILESTONE_NOTIFICATIONS: process.env.DSLR_MILESTONE_NOTIFICATIONS !== 'false',
    MILESTONES: process.env.DSLR_MILESTONES?.split(',').map(Number) || [10, 25, 50, 100, 250, 500, 1000],
    CLIENT_NOTIFICATIONS: process.env.DSLR_CLIENT_NOTIFICATIONS === 'true',
    CLIENT_MILESTONE_THRESHOLD: parseInt(process.env.DSLR_CLIENT_MILESTONE_THRESHOLD) || 50
  },

  // Security
  SECURITY: {
    API_KEY: process.env.DSLR_API_KEY,
    ENABLE_AUTH: process.env.DSLR_ENABLE_AUTH === 'true',
    ALLOWED_IPS: process.env.DSLR_ALLOWED_IPS?.split(',') || [],
    RATE_LIMIT_REQUESTS: parseInt(process.env.DSLR_RATE_LIMIT_REQUESTS) || 100,
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.DSLR_RATE_LIMIT_WINDOW_MS) || 60000
  },

  // Monitoring
  MONITORING: {
    ENABLE_METRICS: process.env.DSLR_ENABLE_METRICS === 'true',
    METRICS_INTERVAL: parseInt(process.env.DSLR_METRICS_INTERVAL) || 60000,
    LOG_LEVEL: process.env.DSLR_LOG_LEVEL || 'info',
    ENABLE_DEBUG: process.env.DSLR_DEBUG === 'true',
    HEALTH_CHECK_ENDPOINT: process.env.DSLR_HEALTH_CHECK_ENDPOINT || '/api/test/db'
  },

  // Watermark Configuration
  WATERMARK: {
    ENABLED: process.env.DSLR_WATERMARK_ENABLED === 'true',
    LOGO_PATH: process.env.DSLR_WATERMARK_LOGO_PATH || './assets/logo.png',
    POSITION: process.env.DSLR_WATERMARK_POSITION || 'bottom-center',
    OFFSET_Y: parseInt(process.env.DSLR_WATERMARK_OFFSET_Y) || 50,
    OPACITY: parseFloat(process.env.DSLR_WATERMARK_OPACITY) || 0.7,
    SIZE_RATIO: parseFloat(process.env.DSLR_WATERMARK_SIZE_RATIO) || 0.15,
    QUALITY: parseInt(process.env.DSLR_WATERMARK_QUALITY) || 95
  },

  // Advanced Features
  ADVANCED: {
    ENABLE_COMPRESSION: process.env.DSLR_ENABLE_COMPRESSION === 'true',
    COMPRESSION_QUALITY: parseFloat(process.env.DSLR_COMPRESSION_QUALITY) || 0.9,
    ENABLE_METADATA_EXTRACTION: process.env.DSLR_ENABLE_METADATA_EXTRACTION === 'true',
    PARALLEL_UPLOADS: parseInt(process.env.DSLR_PARALLEL_UPLOADS) || 3,
    QUEUE_SIZE_LIMIT: parseInt(process.env.DSLR_QUEUE_SIZE_LIMIT) || 100
  }
};

/**
 * Validate configuration
 */
function validateConfig() {
  const errors = [];

  // Required fields
  if (!config.EVENT.ID || config.EVENT.ID === 'default-event') {
    errors.push('DSLR_EVENT_ID is required and should not be default value');
  }

  if (!config.API.BASE_URL) {
    errors.push('DSLR_API_BASE_URL is required');
  }

  // File size validation
  if (config.FILES.MAX_FILE_SIZE_MB > 500) {
    errors.push('DSLR_MAX_FILE_SIZE_MB should not exceed 500MB');
  }

  // Performance validation
  if (config.PERFORMANCE.batchSize > 10) {
    errors.push('Batch size should not exceed 10 for stability');
  }

  return errors;
}

/**
 * Get configuration for specific environment
 */
function getEnvironmentConfig(env = config.NODE_ENV) {
  const envConfigs = {
    development: {
      MONITORING: { ...config.MONITORING, ENABLE_DEBUG: true, LOG_LEVEL: 'debug' },
      PERFORMANCE: { ...config.PERFORMANCE, ...PERFORMANCE_PROFILES.DEVELOPMENT },
      NOTIFICATIONS: { ...config.NOTIFICATIONS, LOCAL_LOGGING: true }
    },
    production: {
      MONITORING: { ...config.MONITORING, ENABLE_DEBUG: false, LOG_LEVEL: 'info' },
      PERFORMANCE: { ...config.PERFORMANCE, ...PERFORMANCE_PROFILES.PRODUCTION },
      SECURITY: { ...config.SECURITY, ENABLE_AUTH: true }
    },
    test: {
      CAMERA: { ...config.CAMERA, WATCH_FOLDER: './test-camera-folder' },
      STORAGE: { ...config.STORAGE, BACKUP_FOLDER: './test-backup' },
      API: { ...config.API, BASE_URL: 'http://localhost:3001' }
    }
  };

  return {
    ...config,
    ...envConfigs[env]
  };
}

/**
 * Dynamic configuration updates
 */
function updateConfig(updates) {
  Object.keys(updates).forEach(key => {
    if (config[key] && typeof config[key] === 'object') {
      config[key] = { ...config[key], ...updates[key] };
    } else {
      config[key] = updates[key];
    }
  });
  
  console.log('📝 Configuration updated:', Object.keys(updates));
}

/**
 * Get camera-specific configuration
 */
function getCameraConfig(cameraModel) {
  const cameraConfigs = {
    NIKON_D7100: {
      WATCH_FOLDER: getCameraFolder('NIKON_D7100'),
      RAW_EXTENSION: '.nef',
      METADATA_SUPPORT: true,
      MAX_BURST_SIZE: 100
    },
    CANON_EOS: {
      WATCH_FOLDER: getCameraFolder('CANON_EOS'),
      RAW_EXTENSION: '.cr2',
      METADATA_SUPPORT: true,
      MAX_BURST_SIZE: 150
    },
    SONY_ALPHA: {
      WATCH_FOLDER: getCameraFolder('SONY_ALPHA'),
      RAW_EXTENSION: '.arw',
      METADATA_SUPPORT: true,
      MAX_BURST_SIZE: 200
    }
  };

  return cameraConfigs[cameraModel] || cameraConfigs.NIKON_D7100;
}

/**
 * Export configuration
 */
module.exports = {
  config: getEnvironmentConfig(),
  validateConfig,
  updateConfig,
  getCameraConfig,
  getEnvironmentConfig,
  PERFORMANCE_PROFILES
};