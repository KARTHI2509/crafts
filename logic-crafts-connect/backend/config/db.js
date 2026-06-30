/**
 * ============================================
 * DATABASE CONFIGURATION
 * ============================================
 * This file handles MongoDB database connection
 * using Mongoose
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 */
export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not defined. Make sure your .env file is loaded and contains MONGODB_URI.'
    );
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});

export default mongoose;