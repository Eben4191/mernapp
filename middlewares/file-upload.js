const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/webp': 'webp'
};

const fileUpload = multer({
  limits: { fileSize: 500000 },
  storage: multer.memoryStorage(), // 🔥 IMPORTANT
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    if (!isValid) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  }
});

module.exports = fileUpload;
