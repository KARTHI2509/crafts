/**
 * ============================================
 * DATABASE CONFIGURATION
 * ============================================
 * This file handles MongoDB database connection
 * using Mongoose
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from possible locations
dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

/**
 * Connect to MongoDB database
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoURI) {
    console.error('❌ MONGODB_URI or DATABASE_URL environment variable is missing.');
    throw new Error('Database connection string is required (MONGODB_URI or DATABASE_URL)');
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.message.includes('querySrv ENOTFOUND')) {
      console.warn('⚠️ Tip: Your network or DNS cannot resolve the MongoDB SRV record. Use the standard replica set URI (mongodb://host1,host2/...) instead of mongodb+srv://');
    }
    if (error.message.includes('whitelist') || error.message.includes('Could not connect to any servers')) {
      console.warn('⚠️ Tip: Verify your IP address is whitelisted in MongoDB Atlas Network Access (use 0.0.0.0/0 for Render).');
    }
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
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
