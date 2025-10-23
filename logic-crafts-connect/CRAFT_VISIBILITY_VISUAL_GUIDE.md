# Artisan Craft Visibility - Visual Flow

## 🎨 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ARTISAN JOURNEY                                │
└─────────────────────────────────────────────────────────────────────────┘

1. ARTISAN LOGS IN
   │
   ├─► Navigate to "Upload Craft" page
   │
   ├─► Fill Form:
   │   ├─ Title: "Handwoven Basket"
   │   ├─ Category: "Basketry"
   │   ├─ Price: ₹1500
   │   ├─ Location: "Jaipur, Rajasthan"
   │   ├─ Description: "Beautiful handwoven basket..."
   │   ├─ Story: "3 generations of tradition..."
   │   └─ Image: [Upload]
   │
   ├─► Click "Upload Craft"
   │
   ├─► API Call: POST /api/crafts
   │   {
   │     name: "Handwoven Basket",
   │     price: 1500,
   │     category: "Basketry",
   │     status: "pending",  ← Initial status
   │     user_id: 123,
   │     is_new_arrival: true
   │   }
   │
   ├─► Database: INSERT INTO crafts
   │   ✅ Craft saved with status = "pending"
   │
   └─► Success Message:
       "Craft uploaded successfully! It will be visible after admin approval."
       → Redirect to Artisan Dashboard


┌─────────────────────────────────────────────────────────────────────────┐
│                           ADMIN JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────────┘

1. ADMIN LOGS IN
   │
   ├─► Navigate to Admin Dashboard
   │
   ├─► View "Pending Crafts" section
   │   [Handwoven Basket] - Pending
   │   By: Priya Sharma (Artisan)
   │   Price: ₹1500
   │
   ├─► Click "Approve"
   │
   ├─► API Call: PATCH /api/crafts/456/status
   │   { status: "approved" }
   │
   ├─► Database: UPDATE crafts SET status = 'approved'
   │
   └─► ✅ Craft is now VISIBLE to all buyers!


┌─────────────────────────────────────────────────────────────────────────┐
│                           BUYER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────────┘

1. BUYER VISITS HOME PAGE (/)
   │
   ├─► API Call: GET /api/crafts
   │   Returns: All approved crafts
   │
   ├─► "New Arrivals from Our Artisans" Section
   │   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │   │ [Image]    │ │ [Image]    │ │ [Image]    │
   │   │ Basket     │ │ Pottery    │ │ Textile    │
   │   │ ₹1500      │ │ ₹800       │ │ ₹2000      │
   │   │ Jaipur     │ │ Delhi      │ │ Mumbai     │
   │   │ [Details]  │ │ [Details]  │ │ [Details]  │
   │   └────────────┘ └────────────┘ └────────────┘
   │   Shows first 6 approved crafts
   │
   └─► [View All Crafts] Button → Navigate to /explore

2. BUYER LOGS IN
   │
   ├─► Redirect to Buyer Dashboard
   │
   ├─► API Call: GET /api/crafts
   │   Returns: All approved crafts
   │
   ├─► "Browse Available Crafts" Section
   │   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
   │   │ [Image]    │ │ [Image]    │ │ [Image]    │ │ [Image]    │
   │   │ Basket     │ │ Pottery    │ │ Textile    │ │ Jewelry    │
   │   │ ₹1500      │ │ ₹800       │ │ ₹2000      │ │ ₹3500      │
   │   │ 🛒 Cart    │ │ 🛒 Cart    │ │ 🛒 Cart    │ │ 🛒 Cart    │
   │   │ 🤍 Wish    │ │ 🤍 Wish    │ │ 🤍 Wish    │ │ 🤍 Wish    │
   │   └────────────┘ └────────────┘ └────────────┘ └────────────┘
   │   Shows first 8 approved crafts
   │
   ├─► Click "Add to Cart"
   │   ├─► API Call: POST /api/cart
   │   │   { craft_id: 456, quantity: 1 }
   │   └─► ✅ "Added to cart!"
   │
   ├─► Click Wishlist Heart
   │   ├─► API Call: POST /api/wishlist
   │   │   { craft_id: 456 }
   │   └─► ✅ "Added to wishlist!"
   │
   └─► [View All] Button → Navigate to /explore

3. BUYER VISITS EXPLORE PAGE (/explore)
   │
   ├─► Shows ALL approved crafts
   │   with filters:
   │   ├─ Category (All, Pottery, Basketry, etc.)
   │   ├─ Location (All, Jaipur, Delhi, etc.)
   │   ├─ Artisan Name (Search)
   │   └─ Verified Only (Checkbox)
   │
   └─► Full catalog browsing experience


┌─────────────────────────────────────────────────────────────────────────┐
│                        GUEST USER JOURNEY                               │
└─────────────────────────────────────────────────────────────────────────┘

1. GUEST VISITS HOME PAGE (Not logged in)
   │
   ├─► Can VIEW all approved crafts
   │   in "New Arrivals" section
   │
   ├─► Can click "View All Crafts"
   │   → Navigate to /explore
   │
   ├─► Can VIEW all crafts on Explore page
   │
   ├─► Try to click "Add to Cart"
   │   └─► ⚠️ Alert: "Please login to add items to cart"
   │
   └─► Try to click Wishlist
       └─► ⚠️ Alert: "Please login to add items to wishlist"
```

---

## 📊 Database Schema Overview

```
┌──────────────────────────────────────────────────────────────┐
│ CRAFTS TABLE                                                 │
├──────────────┬──────────────────────────────────────────────┤
│ Column       │ Description                                  │
├──────────────┼──────────────────────────────────────────────┤
│ id           │ Primary key (auto-increment)                 │
│ user_id      │ Foreign key to users table (artisan)         │
│ name         │ Craft title (e.g., "Handwoven Basket")       │
│ description  │ Detailed description                         │
│ category     │ Basketry, Pottery, Textiles, etc.            │
│ craft_type   │ Type of craft                                │
│ price        │ Price in INR                                 │
│ location     │ City/Region                                  │
│ image_url    │ Main image URL/base64                        │
│ images       │ Array of additional images                   │
│ story        │ Artisan's story about the craft              │
│ status       │ 'pending' | 'approved' | 'rejected'         │
│ stock        │ Available quantity                           │
│ delivery_days│ Estimated delivery time                      │
│ is_new_arrival│ Boolean flag                                │
│ created_at   │ Timestamp                                    │
│ updated_at   │ Timestamp                                    │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 🔄 API Endpoints Flow

```
┌───────────────────────────────────────────────────────────────┐
│ CRAFT MANAGEMENT APIs                                         │
└───────────────────────────────────────────────────────────────┘

CREATE CRAFT (Artisan Only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST /api/crafts
Headers: Authorization: Bearer <token>
Body: {
  name, description, category, price, location, 
  image_url, images, story, stock, delivery_days
}
Response: { success: true, data: { craft: {...} } }
Status: "pending" by default


GET ALL APPROVED CRAFTS (Public)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /api/crafts
No auth required
Returns: Only crafts where status = 'approved'
Response: { 
  success: true, 
  count: 25,
  data: { 
    crafts: [
      {
        id, name, price, location, image_url,
        artisan_name, artisan_phone, status: 'approved'
      }
    ] 
  } 
}


APPROVE CRAFT (Admin Only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATCH /api/crafts/:id/status
Headers: Authorization: Bearer <admin_token>
Body: { status: "approved" }
Response: { success: true, data: { craft: {...} } }


GET MY CRAFTS (Artisan Only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /api/crafts/my-crafts
Headers: Authorization: Bearer <artisan_token>
Returns: All crafts by logged-in artisan (all statuses)
```

---

## 🎯 Key Features Implemented

```
✅ ARTISAN FEATURES
  ├─ Upload craft with details
  ├─ Upload image (base64)
  ├─ Add story/heritage
  ├─ View own crafts
  └─ See approval status

✅ BUYER FEATURES
  ├─ View approved crafts on Home page
  ├─ View approved crafts on Buyer Dashboard
  ├─ Browse all crafts on Explore page
  ├─ Add crafts to cart
  ├─ Add crafts to wishlist
  ├─ View craft details
  └─ Filter and search crafts

✅ ADMIN FEATURES
  ├─ View all pending crafts
  ├─ Approve crafts
  ├─ Reject crafts
  └─ View all crafts (all statuses)

✅ GUEST FEATURES
  ├─ View approved crafts on Home
  ├─ View approved crafts on Explore
  └─ Prompted to login for cart/wishlist
```

---

## 🌐 Page-wise Craft Display

```
┌─────────────────────────────────────────────────────────────┐
│ HOME PAGE (/)                                               │
├─────────────────────────────────────────────────────────────┤
│ Hero Section                                                │
│ ↓                                                           │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ "New Arrivals from Our Artisans"                    │    │
│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐          │    │
│ │ │ C1 │ │ C2 │ │ C3 │ │ C4 │ │ C5 │ │ C6 │          │    │
│ │ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘          │    │
│ │ [View All Crafts →]                                 │    │
│ └─────────────────────────────────────────────────────┘    │
│ ↓                                                           │
│ Features Section                                            │
│ Testimonials                                                │
└─────────────────────────────────────────────────────────────┘
Displays: First 6 approved crafts


┌─────────────────────────────────────────────────────────────┐
│ BUYER DASHBOARD (/buyer/dashboard)                         │
├─────────────────────────────────────────────────────────────┤
│ Welcome Header                                              │
│ Stats Cards (Orders, Wishlist, Cart, Messages)             │
│ Recent Orders Section                                       │
│ ↓                                                           │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ "Recommended for You" (if available)                │    │
│ │ [Personalized recommendations]                      │    │
│ └─────────────────────────────────────────────────────┘    │
│ ↓                                                           │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ "Browse Available Crafts"                           │    │
│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐                         │    │
│ │ │ C1 │ │ C2 │ │ C3 │ │ C4 │                         │    │
│ │ └────┘ └────┘ └────┘ └────┘                         │    │
│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐                         │    │
│ │ │ C5 │ │ C6 │ │ C7 │ │ C8 │                         │    │
│ │ └────┘ └────┘ └────┘ └────┘                         │    │
│ │ [View All →]                                        │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
Displays: First 8 approved crafts
Features: Add to Cart, Wishlist on each card


┌─────────────────────────────────────────────────────────────┐
│ EXPLORE PAGE (/explore)                                     │
├─────────────────────────────────────────────────────────────┤
│ Page Title & Description                                    │
│ ↓                                                           │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Filters Panel                                       │    │
│ │ Category: [Dropdown]  Location: [Dropdown]          │    │
│ │ Artisan: [Search]     ☑ Verified Only               │    │
│ │ [Clear Filters]                                     │    │
│ └─────────────────────────────────────────────────────┘    │
│ ↓                                                           │
│ Showing 25 of 25 crafts                                     │
│ ↓                                                           │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                         │
│ │ C1 │ │ C2 │ │ C3 │ │ C4 │ │ C5 │                         │
│ └────┘ └────┘ └────┘ └────┘ └────┘                         │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                         │
│ │ C6 │ │ C7 │ │ C8 │ │ C9 │ │ C10│                         │
│ └────┘ └────┘ └────┘ └────┘ └────┘                         │
│ ... (all approved crafts)                                   │
└─────────────────────────────────────────────────────────────┘
Displays: ALL approved crafts
Features: Filtering, Search, Verified badges
```

---

## 🔐 Security & Permissions

```
┌──────────────────────────────────────────────────────────┐
│ ROLE-BASED ACCESS CONTROL                               │
└──────────────────────────────────────────────────────────┘

GUEST (Not Logged In)
  ✅ View approved crafts (Home, Explore)
  ❌ Upload crafts
  ❌ Add to cart
  ❌ Add to wishlist
  ❌ Place orders

BUYER
  ✅ View approved crafts
  ✅ Add to cart
  ✅ Add to wishlist
  ✅ Place orders
  ✅ Review crafts
  ❌ Upload crafts
  ❌ Approve crafts

ARTISAN
  ✅ Upload crafts
  ✅ View own crafts (all statuses)
  ✅ Edit own crafts
  ✅ View artisan dashboard
  ❌ Add to cart (can't buy own crafts)
  ❌ Approve crafts

ADMIN
  ✅ View all crafts (all statuses)
  ✅ Approve/Reject crafts
  ✅ Delete any craft
  ✅ Manage users
  ✅ Full system access
```

---

## 📱 Responsive Design

```
DESKTOP (> 1024px)
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ C1 │ │ C2 │ │ C3 │ │ C4 │
└────┘ └────┘ └────┘ └────┘
4 columns grid

TABLET (768px - 1024px)
┌────┐ ┌────┐ ┌────┐
│ C1 │ │ C2 │ │ C3 │
└────┘ └────┘ └────┘
3 columns grid

MOBILE (< 768px)
┌────┐
│ C1 │
└────┘
┌────┐
│ C2 │
└────┘
1 column stack
```

---

## 🎨 Craft Card Components

```
┌─────────────────────────┐
│  [Product Image]        │ ← imageUrl
├─────────────────────────┤
│  Handwoven Basket       │ ← name
│  ₹1,500                 │ ← price
│  Basketry • Jaipur      │ ← category • location
├─────────────────────────┤
│  [🛒 Add to Cart]       │ ← Only for buyers
│  [Details →]            │ ← All users
└─────────────────────────┘
     🤍 Wishlist          ← Heart icon overlay
```

---

## ✨ This Implementation Enables:

```
1. DISCOVERY
   Buyers can discover crafts from artisans easily

2. VISIBILITY
   Artisan crafts reach wider audience

3. QUALITY CONTROL
   Admin approval ensures quality

4. USER EXPERIENCE
   Seamless browsing on multiple pages

5. CONVERSION
   Direct path from view → cart → purchase

6. TRUST
   Verified badges build confidence

7. SCALABILITY
   Ready for thousands of crafts
```

---

**Implementation Complete! 🎉**
