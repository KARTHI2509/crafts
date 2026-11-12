/**
 * ============================================
 * DATABASE CONFIGURATION (MongoDB / Mongoose)
 * ============================================
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from possible locations
dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

let isConnected = false;
let lastError = null;

export const getDbStatus = () => ({
  isConnected,
  error: lastError ? lastError.message : null,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null
});

/**
 * Connect to MongoDB database with non-blocking retry mechanism
 */
export const connectDB = async (retryCount = 0) => {
  const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoURI) {
    const msg = 'MONGODB_URI or DATABASE_URL environment variable is missing in Render settings!';
    console.error('❌ ' + msg);
    lastError = new Error(msg);
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    
    isConnected = true;
    lastError = null;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host} / ${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    lastError = error;
    console.error(`❌ Database connection failed (attempt ${retryCount + 1}):`, error.message);

    if (error.message.includes('querySrv ENOTFOUND')) {
      console.warn('⚠️ Tip: DNS SRV resolution failed. Use the multi-host replica set connection string instead of mongodb+srv://');
    }
    if (error.message.includes('whitelist') || error.message.includes('Could not connect to any servers')) {
      console.warn('⚠️ Tip: Your IP is not whitelisted. In MongoDB Atlas > Network Access, add 0.0.0.0/0 (Allow Access from Anywhere) for Render.');
    }

    // Auto-retry connection every 8 seconds in the background without crashing the server
    setTimeout(() => {
      console.log('🔄 Retrying MongoDB connection in background...');
      connectDB(retryCount + 1);
    }, 8000);

    return false;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  isConnected = true;
  lastError = null;
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  lastError = err;
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});

export default mongoose;
