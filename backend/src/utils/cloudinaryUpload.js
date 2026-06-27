const { Readable } = require('stream');

const cloudinary = require('../config/cloudinary');
const env = require('../config/env');

const uploadBufferToCloudinary = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinaryUploadFolder,
        resource_type: options.resourceType || 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

module.exports = {
  uploadBufferToCloudinary,
};
