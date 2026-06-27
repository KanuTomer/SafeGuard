const mongoose = require('mongoose');

const locationPointSchema = new mongoose.Schema(
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
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be at least -90'],
      max: [90, 'Latitude cannot exceed 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be at least -180'],
      max: [180, 'Longitude cannot exceed 180'],
    },
    accuracy: {
      type: Number,
      min: [0, 'Accuracy cannot be negative'],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

locationPointSchema.index({ emergencySession: 1, recordedAt: 1 });
locationPointSchema.index({ user: 1, emergencySession: 1, recordedAt: 1 });

const LocationPoint = mongoose.model('LocationPoint', locationPointSchema);

module.exports = LocationPoint;
