# 🛍️ Logic Craft Connect - Buyer Features Implementation Plan

## 📋 Project Overview

Extending the Logic Craft Connect platform with modern buyer-centric features including order tracking, recommendations, communication, reviews, and analytics.

---

## 🎯 Feature Breakdown & Implementation Order

### **Phase 1: Core Order Management** (Priority: HIGH)
- ✅ Database schema for orders, order items, cart
- ✅ Order placement and management
- ✅ Order status tracking system
- ✅ Cart functionality (add, update, remove items)

### **Phase 2: Order Tracking & Notifications** (Priority: HIGH)
- ✅ Visual order tracking with progress indicators
- ✅ Order status updates (Placed → Delivered)
- ✅ Email notifications on status change
- ✅ Cancel/Return order functionality

### **Phase 3: Reviews & Ratings** (Priority: MEDIUM)
- ✅ Review and rating system
- ✅ Product and artisan ratings
- ✅ Review moderation (optional)
- ✅ Average rating calculations

### **Phase 4: Communication System** (Priority: MEDIUM)
- ✅ Buyer-Artisan messaging
- ✅ Chat history storage
- ✅ Read receipts and timestamps
- ✅ Real-time notifications

### **Phase 5: Smart Features** (Priority: MEDIUM)
- ✅ Wishlist functionality
- ✅ Recently viewed products
- ✅ Product recommendations
- ✅ Favorite artisans tracking

### **Phase 6: Analytics & Dashboard** (Priority: LOW)
- ✅ Buyer analytics dashboard
- ✅ Spending trends
- ✅ Order history visualization
- ✅ Category preferences

### **Phase 7: Unique Craft Experience** (Priority: LOW)
- ✅ Meet the Artisan section
- ✅ Custom order requests
- ✅ Loyalty badges
- ✅ Support local artisan features

---

## 🗄️ Database Schema Design

### **New Tables Required:**

1. **orders**
   - Order management and tracking

2. **order_items**
   - Individual items in each order

3. **cart**
   - Shopping cart items

4. **reviews**
   - Product and artisan reviews

5. **messages**
   - Buyer-artisan communication

6. **wishlist**
   - User wishlist items

7. **recently_viewed**
   - Track recently viewed products

8. **notifications**
   - System notifications

9. **custom_orders**
   - Custom order requests

---

## 📊 Detailed Database Schema

```sql
-- Orders Table
CREATE TABLE orders (
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
);

-- Order Items Table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shopping Cart Table
CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(buyer_id, craft_id)
);

-- Reviews Table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
  artisan_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  images TEXT[], -- Array of image URLs
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table (Buyer-Artisan Chat)
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  craft_id INTEGER REFERENCES crafts(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist Table
CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(buyer_id, craft_id)
);

-- Recently Viewed Table
CREATE TABLE recently_viewed (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  craft_id INTEGER NOT NULL REFERENCES crafts(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(buyer_id, craft_id)
);

-- Notifications Table
CREATE TABLE notifications (
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
);

-- Custom Orders Table
CREATE TABLE custom_orders (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artisan_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  reference_images TEXT[], -- Array of image URLs
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
);

-- Favorite Artisans Table
CREATE TABLE favorite_artisans (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artisan_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(buyer_id, artisan_id)
);

-- Buyer Analytics Table (Aggregated Data)
CREATE TABLE buyer_analytics (
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
);
```

---

## 🔧 Backend Structure

### **New Models:**

```
backend/models/
├── orderModel.js          # Order CRUD operations
├── cartModel.js           # Cart management
├── reviewModel.js         # Reviews and ratings
├── messageModel.js        # Messaging system
├── wishlistModel.js       # Wishlist operations
├── notificationModel.js   # Notifications
├── customOrderModel.js    # Custom order requests
└── analyticsModel.js      # Buyer analytics
```

### **New Controllers:**

```
backend/controllers/
├── orderController.js      # Order management
├── cartController.js       # Cart operations
├── reviewController.js     # Review handling
├── messageController.js    # Chat functionality
├── wishlistController.js   # Wishlist management
├── recommendationController.js  # Smart recommendations
└── analyticsController.js  # Analytics data
```

### **New Routes:**

```
backend/routes/
├── orderRoutes.js         # /api/orders
├── cartRoutes.js          # /api/cart
├── reviewRoutes.js        # /api/reviews
├── messageRoutes.js       # /api/messages
├── wishlistRoutes.js      # /api/wishlist
├── recommendationRoutes.js # /api/recommendations
└── analyticsRoutes.js     # /api/analytics
```

---

## 🎨 Frontend Structure

### **New Pages:**

```
frontend/src/pages/
├── buyer/
│   ├── BuyerOrders.jsx          # Order list and tracking
│   ├── OrderTracking.jsx        # Individual order tracking
│   ├── Cart.jsx                 # Shopping cart
│   ├── Checkout.jsx             # Checkout process
│   ├── Wishlist.jsx             # Wishlist page
│   ├── BuyerMessages.jsx        # Chat with artisans
│   ├── BuyerAnalytics.jsx       # Analytics dashboard
│   ├── CustomOrderRequest.jsx   # Request custom orders
│   └── ArtisanProfile.jsx       # Enhanced artisan profile
```

### **New Components:**

```
frontend/src/components/
├── buyer/
│   ├── OrderCard.jsx            # Order display card
│   ├── OrderTracker.jsx         # Visual tracking bar
│   ├── CartItem.jsx             # Cart item component
│   ├── ReviewForm.jsx           # Review submission
│   ├── ReviewDisplay.jsx        # Review list
│   ├── ChatWindow.jsx           # Chat interface
│   ├── RecommendedProducts.jsx  # Product recommendations
│   ├── WishlistButton.jsx       # Add to wishlist
│   └── NotificationBell.jsx     # Notification icon
```

---

## 🔐 API Endpoints Design

### **Order Management**

```
POST   /api/orders              # Create new order
GET    /api/orders              # Get buyer's orders
GET    /api/orders/:id          # Get specific order
PUT    /api/orders/:id/status   # Update order status (artisan)
PUT    /api/orders/:id/cancel   # Cancel order (buyer)
PUT    /api/orders/:id/return   # Request return
GET    /api/orders/:id/track    # Get tracking info
```

### **Cart**

```
GET    /api/cart                # Get cart items
POST   /api/cart                # Add to cart
PUT    /api/cart/:id            # Update quantity
DELETE /api/cart/:id            # Remove from cart
DELETE /api/cart                # Clear cart
```

### **Reviews**

```
POST   /api/reviews             # Submit review
GET    /api/reviews/craft/:id   # Get product reviews
GET    /api/reviews/artisan/:id # Get artisan reviews
PUT    /api/reviews/:id         # Update review
DELETE /api/reviews/:id         # Delete review
POST   /api/reviews/:id/helpful # Mark review helpful
```

### **Messages**

```
GET    /api/messages            # Get conversations
GET    /api/messages/:userId    # Get chat with specific user
POST   /api/messages            # Send message
PUT    /api/messages/:id/read   # Mark as read
GET    /api/messages/unread     # Get unread count
```

### **Wishlist**

```
GET    /api/wishlist            # Get wishlist items
POST   /api/wishlist            # Add to wishlist
DELETE /api/wishlist/:id        # Remove from wishlist
```

### **Recommendations**

```
GET    /api/recommendations     # Get personalized recommendations
GET    /api/recommendations/trending  # Trending products
GET    /api/recommendations/similar/:id  # Similar products
```

### **Analytics**

```
GET    /api/analytics/buyer     # Get buyer analytics
GET    /api/analytics/spending  # Spending trends
GET    /api/analytics/categories # Category preferences
```

---

## 🚀 Implementation Timeline

### **Week 1: Core Infrastructure**
- Database schema creation
- Base models and migrations
- Order and cart functionality

### **Week 2: Order Management**
- Order placement system
- Order tracking UI
- Status updates and notifications

### **Week 3: Reviews & Communication**
- Review system
- Messaging functionality
- Real-time notifications

### **Week 4: Smart Features**
- Wishlist and recently viewed
- Recommendation engine
- Analytics dashboard

### **Week 5: Unique Features**
- Custom orders
- Artisan profiles enhancement
- Loyalty system

### **Week 6: Testing & Polish**
- End-to-end testing
- Performance optimization
- UI/UX refinements

---

## 📦 Technology Stack

### **Backend:**
- Node.js + Express.js
- PostgreSQL with pg library
- JWT for authentication
- Nodemailer for email notifications
- Socket.io for real-time messaging (optional)

### **Frontend:**
- React with Vite
- React Router for navigation
- Axios for API calls
- Chart.js or Recharts for analytics
- TailwindCSS or custom CSS (earthy tones)

---

## 🎨 UI/UX Design Guidelines

### **Color Scheme:**
- Primary: Brown (#8b5a2b)
- Secondary: Beige (#d4a574)
- Accent: Gold
- Success: Green
- Warning: Orange
- Error: Red

### **Components Style:**
- Minimal, clean design
- Mobile-responsive (mobile-first)
- Smooth transitions
- Accessible (WCAG compliant)

---

## ✅ Success Metrics

1. **Order Completion Rate:** > 80%
2. **Average Order Value:** Track and improve
3. **Review Submission Rate:** > 30%
4. **Repeat Purchase Rate:** > 40%
5. **Customer Satisfaction:** Average rating > 4.0
6. **Message Response Time:** < 24 hours

---

## 🔒 Security Considerations

1. **Authentication:** JWT-based with role verification
2. **Authorization:** Route-level role checks
3. **Data Validation:** Input sanitization on all endpoints
4. **SQL Injection:** Parameterized queries only
5. **XSS Prevention:** Content sanitization
6. **Rate Limiting:** Prevent abuse
7. **HTTPS:** Enforce SSL in production

---

## 📚 Documentation Deliverables

1. API Documentation (Swagger/OpenAPI)
2. Database Schema Documentation
3. User Guide for Buyers
4. Developer Setup Guide
5. Deployment Guide

---

**Next Steps:** Begin Phase 1 implementation with database schema creation and core order management system.
