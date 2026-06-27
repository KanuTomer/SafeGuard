const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
      min: [-90, 'Latitude must be at least -90'],
      max: [90, 'Latitude cannot exceed 90'],
    },
    longitude: {
      type: Number,
      required: true,
      min: [-180, 'Longitude must be at least -180'],
      max: [180, 'Longitude cannot exceed 180'],
    },
    accuracy: {
      type: Number,
      min: [0, 'Accuracy cannot be negative'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const contactSnapshotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    relationship: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const emergencySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    initialLocation: {
      type: locationSchema,
      default: null,
    },
    lastKnownLocation: {
      type: locationSchema,
      default: null,
    },
    contactsSnapshot: {
      type: [contactSnapshotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

emergencySessionSchema.index({ user: 1, status: 1, startedAt: -1 });
emergencySessionSchema.index(
  { user: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' },
    name: 'unique_active_emergency_session_per_user',
  }
);

const EmergencySession = mongoose.model('EmergencySession', emergencySessionSchema);

module.exports = EmergencySession;
