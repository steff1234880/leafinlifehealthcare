import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// Default upload directory for product images
const uploadDir = path.resolve('uploads/products');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with secure unique randomized filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `prod_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

// Allowed image formats
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// File filter to prevent malicious file uploads
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type! Only JPG, JPEG, PNG, and WEBP images are allowed.');
    err.statusCode = 400;
    cb(err, false);
  }
};

// Max file size: 5MB per image
export const uploadProductImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // Max 10 images per upload batch
  },
  fileFilter,
});

