const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    emergencySession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencySession',
      required: [true, 'Emergency session is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['image', 'audio'],
      required: [true, 'Evidence type is required'],
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: [1, 'File size must be greater than 0'],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary public id is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    secureUrl: {
      type: String,
      required: [true, 'Secure URL is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

evidenceSchema.index({ emergencySession: 1, createdAt: -1 });
evidenceSchema.index({ user: 1, emergencySession: 1, createdAt: -1 });

const Evidence = mongoose.model('Evidence', evidenceSchema);

module.exports = Evidence;
