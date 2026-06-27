const multer = require('multer');

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/aac',
  'audio/webm',
];

const maxFileSize = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }

    return cb(null, true);
  },
});

const uploadEvidenceFile = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      error.statusCode = 400;
      error.message = 'File size cannot exceed 10 MB';
      return next(error);
    }

    error.statusCode = 400;
    return next(error);
  });
};

module.exports = {
  allowedMimeTypes,
  maxFileSize,
  uploadEvidenceFile,
};
