/**
 * ============================================
 * SERVER.JS - Main Entry Point
 * ============================================
 * This is the main server file that:
 * - Sets up Express app
 * - Configures middleware (CORS, JSON parsing, Security)
 * - Connects to MongoDB database
 * - Registers all routes
 * - Starts the server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
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
import uploadRoutes from './routes/uploadRoutes.js';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from multiple possible locations (.env in backend or root)
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate Limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.'
  }
});
app.use('/api/auth/login', authLimiter);

// Data Sanitization - Prevent NoSQL injection
app.use(mongoSanitize());

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS - Allow frontend to make requests to this backend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) return callback(null, true);
    
    // In development or test, allow all localhost origins
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // Allow all Vercel deployment URLs (*.vercel.app)
    if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    // Check allowed origins list
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.some(allowed => allowed.replace(/\/$/, '') === normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow if FRONTEND_URL matched
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser - Parse JSON request bodies (50mb limit for base64 images)
app.use(express.json({ limit: '50mb' }));

// Body parser - Parse URL-encoded data (50mb limit for base64 images)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging (simple development logger)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'Logic Crafts Connect API', 
    status: 'running',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);      // Authentication routes (register, login)
app.use('/api/crafts', craftRoutes);   // Craft CRUD operations
app.use('/api/users', userRoutes);     // User-related operations
app.use('/api/orders', orderRoutes);   // Order management
app.use('/api/cart', cartRoutes);      // Shopping cart
app.use('/api/reviews', reviewRoutes); // Review and rating system
app.use('/api/messages', messageRoutes); // Buyer-artisan messaging
app.use('/api/wishlist', wishlistRoutes); // Wishlist management
app.use('/api/recently-viewed', recentlyViewedRoutes); // Recently viewed tracking
app.use('/api/recommendations', recommendationRoutes); // Smart recommendations
app.use('/api/upload', uploadRoutes); // Image upload routes

// 404 Handler - Route not found
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Connect to MongoDB database
    await connectDB();
    console.log('✓ Database connected successfully');
    
    // Start listening for requests
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      console.log(`✓ API URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
