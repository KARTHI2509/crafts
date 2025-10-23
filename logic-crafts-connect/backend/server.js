/**
 * ============================================
 * SERVER.JS - Main Entry Point
 * ============================================
 * This is the main server file that:
 * - Sets up Express app
 * - Configures middleware (CORS, JSON parsing)
 * - Connects to PostgreSQL database
 * - Registers all routes
 * - Starts the server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS - Allow frontend to make requests to this backend
// Allow multiple frontend URLs (Vite can use different ports)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser - Parse JSON request bodies
app.use(express.json());

// Body parser - Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Request logging (simple development logger)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Logic Crafts Connect API', 
    status: 'running',
    version: '1.0.0'
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
    // Connect to PostgreSQL database
    await connectDB();
    console.log('✓ Database connected successfully');
    
    // Start listening for requests
    app.listen(PORT, () => {
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
