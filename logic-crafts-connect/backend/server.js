/**
 * ============================================
 * SERVER.JS - Main Entry Point
 * ============================================
 * This file:
 * - Sets up Express app
 * - Configures middleware
 * - Connects to MongoDB
 * - Registers routes
 * - Starts server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import socketHandler from './socketHandler.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import craftRoutes from './routes/craftRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import recentlyViewedRoutes from './routes/recentlyViewedRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { validateEnv, preventNoSQLInjection, preventXSS, csrfProtect } from './middleware/security.js';

// Get current directory (ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env')
];

const envPath = envPaths.find((p) => fs.existsSync(p));

dotenv.config({
  path: envPath || path.join(__dirname, '..', '.env')
});

validateEnv();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

// Create HTTP server and attach Socket.io
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});
app.set('io', io);
socketHandler(io);

// CORS setup
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse JSON
app.use(express.json({ limit: '50mb' }));

// Parse URL encoded
app.use(express.urlencoded({
  extended: true,
  limit: '50mb'
}));

// Helmet security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5000", "http://localhost:3001", "ws://localhost:3001", "http://localhost:5173"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://via.placeholder.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Throttling / Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  message: { success: false, message: 'Too many requests, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' }
});

app.use(globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Input Hardening Filters
app.use(preventNoSQLInjection);
app.use(preventXSS);
app.use(csrfProtect);

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Logic Crafts Connect API is running'
  });
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/crafts', craftRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    console.log('✓ MongoDB connected successfully');

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      console.log(`✓ API URL: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});