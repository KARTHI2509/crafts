import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// Cloudinary storage configuration for craft images
const craftStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'logic-crafts/crafts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto' }
    ],
  },
});

// Cloudinary storage configuration for profile images
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'logic-crafts/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' }
    ],
  },
});

// File filter for image validation
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer upload configurations
const uploadCraftImages = multer({
  storage: craftStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5, // Max 5 files at once
  },
});

const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max for profile images
    files: 1,
  },
});

// Local file storage (fallback when Cloudinary is not configured)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const uploadLocal = multer({
  storage: localStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const filename = parts.pop();
  const folder = parts.slice(-2).join('/');
  return folder + '/' + filename.split('.')[0];
};

// Helper function to upload base64 image to Cloudinary
const uploadBase64Image = async (base64String, folder = 'logic-crafts/crafts') => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      transformation: [
        { width: 800, height: 600, crop: 'limit', quality: 'auto' }
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    throw error;
  }
};

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );
};

export {
  cloudinary,
  uploadCraftImages,
  uploadProfileImage,
  uploadLocal,
  deleteImage,
  getPublicIdFromUrl,
  uploadBase64Image,
  isCloudinaryConfigured,
};
