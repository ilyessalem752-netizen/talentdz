const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

// Ensure upload dirs exist
['cvs', 'logos', 'avatars'].forEach(dir => {
  const fullPath = path.join(UPLOAD_PATH, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// CV Storage
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(UPLOAD_PATH, 'cvs'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cv_${req.user.id}_${uuidv4()}${ext}`);
  },
});

// Logo/Avatar storage
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = req.user.role === 'company' ? 'logos' : 'avatars';
    cb(null, path.join(UPLOAD_PATH, dir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `img_${req.user.id}_${uuidv4()}${ext}`);
  },
});

// File filters
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont acceptés pour les CVs'), false);
  }
};

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formats acceptés: JPG, PNG, WebP'), false);
  }
};

exports.uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: pdfFilter,
});

exports.uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for images
  fileFilter: imageFilter,
});
