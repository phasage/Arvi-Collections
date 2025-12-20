const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo-cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo-secret',
  secure: true
});

class ImageService {
  constructor() {
    this.isCloudinaryConfigured = this.checkCloudinaryConfig();
    this.uploadDir = path.join(__dirname, '../uploads');
    this.ensureUploadDir();
  }

  /**
   * Check if Cloudinary is properly configured
   */
  checkCloudinaryConfig() {
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    return cloud_name && api_key && api_secret && 
           cloud_name !== 'demo-cloud' && 
           api_key !== 'demo-key' && 
           api_secret !== 'demo-secret';
  }

  /**
   * Ensure upload directory exists
   */
  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Configure multer for file uploads
   */
  getMulterConfig() {
    const storage = multer.memoryStorage();
    
    const fileFilter = (req, file, cb) => {
      // Check file type
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Maximum 10 files
      }
    });
  }

  /**
   * Optimize image using Sharp
   */
  async optimizeImage(buffer, options = {}) {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg'
    } = options;

    try {
      let sharpInstance = sharp(buffer);

      // Get image metadata
      const metadata = await sharpInstance.metadata();
      
      // Resize if image is larger than specified dimensions
      if (metadata.width > width || metadata.height > height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert and optimize
      switch (format) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality, progressive: true });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        default:
          sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
      }

      return await sharpInstance.toBuffer();
    } catch (error) {
      console.error('Image optimization error:', error);
      return buffer; // Return original if optimization fails
    }
  }

  /**
   * Generate multiple image sizes
   */
  async generateImageSizes(buffer, filename) {
    const sizes = {
      thumbnail: { width: 150, height: 150, quality: 70 },
      small: { width: 300, height: 300, quality: 75 },
      medium: { width: 600, height: 600, quality: 80 },
      large: { width: 1200, height: 1200, quality: 85 }
    };

    const results = {};

    for (const [sizeName, options] of Object.entries(sizes)) {
      try {
        const optimizedBuffer = await this.optimizeImage(buffer, options);
        const sizeFilename = `${filename}_${sizeName}`;
        
        if (this.isCloudinaryConfigured) {
          // Upload to Cloudinary
          const result = await this.uploadToCloudinary(optimizedBuffer, sizeFilename);
          results[sizeName] = result;
        } else {
          // Save locally
          const localPath = path.join(this.uploadDir, `${sizeFilename}.jpg`);
          await fs.writeFile(localPath, optimizedBuffer);
          results[sizeName] = {
            public_id: sizeFilename,
            url: `/uploads/${sizeFilename}.jpg`,
            secure_url: `/uploads/${sizeFilename}.jpg`,
            width: options.width,
            height: options.height
          };
        }
      } catch (error) {
        console.error(`Error generating ${sizeName} size:`, error);
      }
    }

    return results;
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadToCloudinary(buffer, filename, options = {}) {
    if (!this.isCloudinaryConfigured) {
      throw new Error('Cloudinary not configured');
    }

    const uploadOptions = {
      public_id: filename,
      folder: options.folder || 'arvis-collection',
      resource_type: 'image',
      format: options.format || 'jpg',
      transformation: options.transformation || [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              public_id: result.public_id,
              url: result.secure_url,
              secure_url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
          }
        }
      ).end(buffer);
    });
  }

  /**
   * Upload single image with multiple sizes
   */
  async uploadImage(file, options = {}) {
    try {
      const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Optimize original image
      const optimizedBuffer = await this.optimizeImage(file.buffer, {
        width: 1200,
        height: 1200,
        quality: 85
      });

      let mainImage;
      
      if (this.isCloudinaryConfigured) {
        // Upload main image to Cloudinary
        mainImage = await this.uploadToCloudinary(optimizedBuffer, filename, options);
      } else {
        // Save locally
        const localPath = path.join(this.uploadDir, `${filename}.jpg`);
        await fs.writeFile(localPath, optimizedBuffer);
        mainImage = {
          public_id: filename,
          url: `/uploads/${filename}.jpg`,
          secure_url: `/uploads/${filename}.jpg`
        };
      }

      // Generate additional sizes
      const sizes = await this.generateImageSizes(file.buffer, filename);

      return {
        main: mainImage,
        sizes: sizes,
        original: {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(files, options = {}) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadImage(file, options);
        results.push(result);
      } catch (error) {
        console.error(`Error uploading ${file.originalname}:`, error);
        results.push({ error: error.message, filename: file.originalname });
      }
    }

    return results;
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId) {
    if (!this.isCloudinaryConfigured) {
      // Delete local file
      try {
        const localPath = path.join(this.uploadDir, `${publicId}.jpg`);
        await fs.unlink(localPath);
        return { result: 'ok' };
      } catch (error) {
        console.error('Local file deletion error:', error);
        return { result: 'not found' };
      }
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Cloudinary deletion error:', error);
      throw error;
    }
  }

  /**
   * Generate image URL with transformations
   */
  generateImageUrl(publicId, transformations = {}) {
    if (!this.isCloudinaryConfigured) {
      return `/uploads/${publicId}.jpg`;
    }

    const {
      width,
      height,
      crop = 'fill',
      quality = 'auto:good',
      format = 'auto'
    } = transformations;

    const transformation = [];
    
    if (width || height) {
      transformation.push({
        width,
        height,
        crop,
        quality,
        fetch_format: format
      });
    }

    return cloudinary.url(publicId, {
      transformation,
      secure: true
    });
  }

  /**
   * Get image info
   */
  async getImageInfo(publicId) {
    if (!this.isCloudinaryConfigured) {
      return { message: 'Cloudinary not configured' };
    }

    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Get image info error:', error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      cloudinaryConfigured: this.isCloudinaryConfigured,
      uploadDirectory: this.uploadDir,
      supportedFormats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
      maxFileSize: '10MB',
      maxFiles: 10
    };
  }
}

// Create singleton instance
const imageService = new ImageService();

module.exports = imageService;