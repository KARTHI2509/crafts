/**
 * ============================================
 * BUYER FEATURES DATABASE SETUP
 * ============================================
 * Creates all tables required for buyer features:
 * - Orders and Order Items
 * - Shopping Cart
 * - Reviews and Ratings
 * - Messages (Buyer-Artisan Communication)
 * - Wishlist
 * - Recently Viewed
 * - Notifications
 * - Custom Orders
 * - Favorite Artisans
 * - Buyer Analytics
 * 
 * Run: npm run db:setup-buyer-features
 */

import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const setupBuyerFeatures = async () => {
  try {
    console.log('🚀 Starting Buyer Features Database Setup...\n');

    // 1. Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        artisan_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'placed' CHECK (status IN (
          'placed', 'confirmed', 'processing', 'shipped', 
          'out_for_delivery', 'delivered', 'cancelled', 'returned'
        )),
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
          'pending', 'completed', 'failed', 'refunded'
        )),
        payment_method VARCHAR(50),
        shipping_address TEXT NOT NULL,
        buyer_phone VARCHAR(20),
        notes TEXT,
        tracking_number VARCHAR(100),
        estimated_delivery DATE,
        delivered_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        cancellation_reason TEXT,
        return_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Orders table created');

    // 2. Order Items Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        price_at_purchase DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Order Items table created');

    // 3. Shopping Cart Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(buyer_id, craft_id)
      )
    `);
    console.log('✓ Cart table created');

    // 4. Reviews Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
        artisan_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        images TEXT[],
        is_verified_purchase BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Reviews table created');

    // 5. Messages Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        craft_id INTEGER REFERENCES crafts(id) ON DELETE SET NULL,
        message_text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Messages table created');

    // 6. Wishlist Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(buyer_id, craft_id)
      )
    `);
    console.log('✓ Wishlist table created');

    // 7. Recently Viewed Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recently_viewed (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(buyer_id, craft_id)
      )
    `);
    console.log('✓ Recently Viewed table created');

    // 8. Notifications Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN (
          'order_update', 'message', 'new_product', 'discount', 'review', 'general'
        )),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(500),
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Notifications table created');

    // 9. Custom Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_orders (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        artisan_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        reference_images TEXT[],
        budget_min DECIMAL(10, 2),
        budget_max DECIMAL(10, 2),
        deadline DATE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
          'pending', 'accepted', 'rejected', 'in_progress', 'completed'
        )),
        artisan_response TEXT,
        quoted_price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Custom Orders table created');

    // 10. Favorite Artisans Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorite_artisans (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        artisan_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(buyer_id, artisan_id)
      )
    `);
    console.log('✓ Favorite Artisans table created');

    // 11. Buyer Analytics Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS buyer_analytics (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_orders INTEGER DEFAULT 0,
        total_spent DECIMAL(10, 2) DEFAULT 0,
        favorite_category VARCHAR(100),
        loyalty_points INTEGER DEFAULT 0,
        loyalty_level VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_level IN (
          'bronze', 'silver', 'gold', 'platinum'
        )),
        last_purchase_date TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(buyer_id)
      )
    `);
    console.log('✓ Buyer Analytics table created');

    // Create Indexes for Performance
    console.log('\n📊 Creating indexes...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_artisan_id ON orders(artisan_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
      
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_craft_id ON order_items(craft_id);
      
      CREATE INDEX IF NOT EXISTS idx_cart_buyer_id ON cart(buyer_id);
      
      CREATE INDEX IF NOT EXISTS idx_reviews_craft_id ON reviews(craft_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_artisan_id ON reviews(artisan_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON reviews(buyer_id);
      
      CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
      
      CREATE INDEX IF NOT EXISTS idx_wishlist_buyer_id ON wishlist(buyer_id);
      
      CREATE INDEX IF NOT EXISTS idx_recently_viewed_buyer_id ON recently_viewed(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON recently_viewed(viewed_at DESC);
      
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      
      CREATE INDEX IF NOT EXISTS idx_custom_orders_buyer_id ON custom_orders(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_custom_orders_artisan_id ON custom_orders(artisan_id);
      
      CREATE INDEX IF NOT EXISTS idx_favorite_artisans_buyer_id ON favorite_artisans(buyer_id);
    `);
    console.log('✓ Indexes created');

    // Create Triggers for updated_at
    console.log('\n⚡ Creating triggers...');
    
    await pool.query(`
      DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
      CREATE TRIGGER update_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_cart_updated_at ON cart;
      CREATE TRIGGER update_cart_updated_at
        BEFORE UPDATE ON cart
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
      CREATE TRIGGER update_reviews_updated_at
        BEFORE UPDATE ON reviews
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_custom_orders_updated_at ON custom_orders;
      CREATE TRIGGER update_custom_orders_updated_at
        BEFORE UPDATE ON custom_orders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_buyer_analytics_updated_at ON buyer_analytics;
      CREATE TRIGGER update_buyer_analytics_updated_at
        BEFORE UPDATE ON buyer_analytics
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('✓ Triggers created');

    console.log('\n✅ Buyer Features Database Setup Completed Successfully!\n');
    console.log('📋 Tables Created:');
    console.log('   1. orders - Order management');
    console.log('   2. order_items - Order line items');
    console.log('   3. cart - Shopping cart');
    console.log('   4. reviews - Product & artisan reviews');
    console.log('   5. messages - Buyer-artisan communication');
    console.log('   6. wishlist - Saved items');
    console.log('   7. recently_viewed - Browsing history');
    console.log('   8. notifications - System notifications');
    console.log('   9. custom_orders - Custom craft requests');
    console.log('   10. favorite_artisans - Favorite sellers');
    console.log('   11. buyer_analytics - Purchase analytics\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

setupBuyerFeatures();
