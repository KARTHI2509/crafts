import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  uploadCraftImages, 
  uploadProfileImage, 
  uploadBase64Image,
  isCloudinaryConfigured 
} from '../config/cloudinary.js';

const router = express.Router();

/**
 * @route   POST /api/upload/craft-images
 * @desc    Upload craft images (up to 5)
 * @access  Private (Artisan only)
 */
router.post('/craft-images', protect, (req, res) => {
  // Check if Cloudinary is configured
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Image upload service is not configured. Please contact support.',
    });
  }

  uploadCraftImages.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload images',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images were uploaded',
      });
    }

    // Return the URLs of uploaded images
    const imageUrls = req.files.map(file => file.path);

    res.json({
      success: true,
      message: `${req.files.length} image(s) uploaded successfully`,
      data: {
        images: imageUrls,
        count: req.files.length,
      },
    });
  });
});

/**
 * @route   POST /api/upload/profile-image
 * @desc    Upload profile/avatar image
 * @access  Private
 */
router.post('/profile-image', protect, (req, res) => {
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Image upload service is not configured. Please contact support.',
    });
  }

  uploadProfileImage.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload image',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image was uploaded',
      });
    }

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageUrl: req.file.path,
      },
    });
  });
});

/**
 * @route   POST /api/upload/base64
 * @desc    Upload base64 encoded image
 * @access  Private
 */
router.post('/base64', protect, async (req, res) => {
  try {
    const { image, folder } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided',
      });
    }

    if (!isCloudinaryConfigured()) {
      // If Cloudinary is not configured, just return the base64 as-is
      // This allows the app to work without Cloudinary in development
      return res.json({
        success: true,
        message: 'Image processed (local mode)',
        data: {
          imageUrl: image,
        },
      });
    }

    const imageUrl = await uploadBase64Image(image, folder || 'logic-crafts/crafts');

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl,
      },
    });
  } catch (error) {
    console.error('Base64 upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
    });
  }
});

/**
 * @route   GET /api/upload/status
 * @desc    Check if upload service is configured
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      configured: isCloudinaryConfigured(),
      provider: isCloudinaryConfigured() ? 'cloudinary' : 'local',
    },
  });
});

export default router;
