/**
 * Watermark Processor
 * Handles intelligent watermark placement on photos
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class WatermarkProcessor {
  constructor(config = {}) {
    this.config = {
      enabled: config.enabled !== false,
      logoPath: config.logoPath || './assets/logo.png',
      position: config.position || 'bottom-center',
      offsetY: config.offsetY || 50,
      sizeRatio: config.sizeRatio || 0.15,
      opacity: config.opacity || 0.7,
      quality: config.quality || 95,
      ...config
    };
  }

  async isEnabled() {
    return this.config.enabled;
  }

  async processImage(inputPath, outputPath = null) {
    if (!await this.isEnabled()) {
      console.log('🏷️ Watermark disabled, skipping processing');
      return inputPath;
    }

    try {
      // Check if logo exists
      const logoExists = await this.checkLogoExists();
      if (!logoExists) {
        console.warn('⚠️ Logo not found, skipping watermark');
        return inputPath;
      }

      const finalOutputPath = outputPath || inputPath;
      
      // Load the main image
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      // Calculate watermark size
      const watermarkWidth = Math.round(metadata.width * this.config.sizeRatio);
      
      // Prepare watermark
      const watermark = await sharp(this.config.logoPath)
        .resize(watermarkWidth, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png()
        .toBuffer();

      // Get watermark dimensions
      const watermarkMeta = await sharp(watermark).metadata();
      
      // Calculate position
      const position = this.calculatePosition(
        metadata.width,
        metadata.height,
        watermarkMeta.width,
        watermarkMeta.height
      );

      // Apply watermark
      await image
        .composite([{
          input: watermark,
          top: position.top,
          left: position.left,
          blend: 'over'
        }])
        .jpeg({ quality: this.config.quality })
        .toFile(finalOutputPath);

      console.log(`🏷️ Watermark applied: ${path.basename(inputPath)}`);
      return finalOutputPath;

    } catch (error) {
      console.error('❌ Watermark processing failed:', error.message);
      // Return original path on error
      return inputPath;
    }
  }

  calculatePosition(imageWidth, imageHeight, watermarkWidth, watermarkHeight) {
    let left, top;

    switch (this.config.position) {
      case 'bottom-center':
        left = Math.round((imageWidth - watermarkWidth) / 2);
        top = imageHeight - watermarkHeight - this.config.offsetY;
        break;
        
      case 'bottom-right':
        left = imageWidth - watermarkWidth - this.config.offsetY;
        top = imageHeight - watermarkHeight - this.config.offsetY;
        break;
        
      case 'bottom-left':
        left = this.config.offsetY;
        top = imageHeight - watermarkHeight - this.config.offsetY;
        break;
        
      case 'center':
        left = Math.round((imageWidth - watermarkWidth) / 2);
        top = Math.round((imageHeight - watermarkHeight) / 2);
        break;
        
      default:
        // Default to bottom-center
        left = Math.round((imageWidth - watermarkWidth) / 2);
        top = imageHeight - watermarkHeight - this.config.offsetY;
    }

    // Ensure watermark stays within image bounds
    left = Math.max(0, Math.min(left, imageWidth - watermarkWidth));
    top = Math.max(0, Math.min(top, imageHeight - watermarkHeight));

    return { left, top };
  }

  async checkLogoExists() {
    try {
      await fs.access(this.config.logoPath);
      return true;
    } catch {
      return false;
    }
  }

  async updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig() {
    return { ...this.config };
  }
}

module.exports = {
  WatermarkProcessor
};