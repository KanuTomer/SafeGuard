const mongoose = require('mongoose');

const env = require('./env');

const connectDB = async () => {
  if (!env.mongodbUri) {
    console.warn('MONGODB_URI is not set. Skipping MongoDB connection.');
    return null;
  }

  try {
    const connection = await mongoose.connect(env.mongodbUri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
