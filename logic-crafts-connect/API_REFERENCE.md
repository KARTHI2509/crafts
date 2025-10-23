# 📚 Logic Crafts Connect - Complete API Reference

## 🌐 Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication Endpoints

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "phone": "+1234567890",
  "location": "New York",
  "role": "buyer"  // or "artisan"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

---

## 🛍️ Craft Endpoints

### Get All Crafts (Public)
```http
GET /api/crafts
```

### Get Craft by ID (Public)
```http
GET /api/crafts/:id
```

### Create Craft (Artisan Only)
```http
POST /api/crafts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Handwoven Basket",
  "description": "Beautiful handmade basket...",
  "price": 49.99,
  "category": "Home Decor",
  "images": ["image1.jpg", "image2.jpg"],
  "stock": 10
}
```

### Update Craft (Artisan Only)
```http
PUT /api/crafts/:id
Authorization: Bearer <token>
```

### Delete Craft (Artisan Only)
```http
DELETE /api/crafts/:id
Authorization: Bearer <token>
```

---

## 🛒 Shopping Cart Endpoints (Buyer Only)

### Get My Cart
```http
GET /api/cart
Authorization: Bearer <buyer_token>

Response:
{
  "success": true,
  "data": {
    "cart_items": [
      {
        "id": 1,
        "craft_id": 5,
        "craft_title": "Handwoven Basket",
        "price": 49.99,
        "quantity": 2,
        "subtotal": 99.98
      }
    ],
    "total_items": 2,
    "total_amount": 99.98
  }
}
```

### Add to Cart
```http
POST /api/cart
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "craft_id": 5,
  "quantity": 2
}
```

### Update Cart Item Quantity
```http
PUT /api/cart/:id
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /api/cart/:id
Authorization: Bearer <buyer_token>
```

### Clear Cart
```http
DELETE /api/cart/clear
Authorization: Bearer <buyer_token>
```

### Get Cart by Artisan (for multi-seller checkout)
```http
GET /api/cart/by-artisan
Authorization: Bearer <buyer_token>

Response:
{
  "success": true,
  "data": {
    "cart_by_artisan": [
      {
        "artisan_id": 2,
        "artisan_name": "Jane Smith",
        "items": [...],
        "artisan_total": 149.97
      }
    ]
  }
}
```

### Validate Cart
```http
GET /api/cart/validate
Authorization: Bearer <buyer_token>
```

---

## 📦 Order Endpoints

### Place Order (Buyer Only)
```http
POST /api/orders
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "artisan_id": 2,
  "items": [
    {
      "craft_id": 5,
      "quantity": 2,
      "price": 49.99
    }
  ],
  "total_amount": 99.98,
  "shipping_address": "123 Main St, New York, NY 10001",
  "payment_method": "card",
  "clear_cart": true
}

Response:
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD-20251023-00001",
      "status": "placed",
      "total_amount": 99.98
    }
  }
}
```

### Get My Orders
```http
GET /api/orders?status=placed&limit=10&offset=0
Authorization: Bearer <token>

// Buyer sees their orders
// Artisan sees orders for their crafts
```

### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### Update Order Status (Artisan Only)
```http
PUT /api/orders/:id/status
Authorization: Bearer <artisan_token>
Content-Type: application/json

{
  "status": "confirmed"  // placed, confirmed, processing, shipped, out_for_delivery, delivered
}
```

### Cancel Order (Buyer Only)
```http
PUT /api/orders/:id/cancel
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "cancel_reason": "Changed my mind"
}
```

### Return Order (Buyer Only)
```http
PUT /api/orders/:id/return
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "return_reason": "Product damaged",
  "return_images": ["image1.jpg"]
}
```

### Get Order Tracking
```http
GET /api/orders/:id/tracking
Authorization: Bearer <token>
```

### Get Order Statistics (Buyer Only)
```http
GET /api/orders/stats
Authorization: Bearer <buyer_token>

Response:
{
  "success": true,
  "data": {
    "stats": {
      "total_orders": 15,
      "total_spent": 1250.50,
      "pending_orders": 2,
      "completed_orders": 13
    }
  }
}
```

---

## ⭐ Review Endpoints

### Submit Review (Buyer Only)
```http
POST /api/reviews
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "craft_id": 5,
  "order_id": 1,
  "rating": 5,
  "review_text": "Absolutely beautiful craftsmanship! Highly recommended.",
  "images": ["review1.jpg", "review2.jpg"]
}
```

### Get Reviews for Craft (Public)
```http
GET /api/reviews/craft/:craftId?sortBy=recent&limit=10&offset=0&rating_filter=5
// sortBy: recent, highest, lowest, helpful
// rating_filter: 1-5 (optional)

Response:
{
  "success": true,
  "data": {
    "reviews": [...],
    "stats": {
      "total_reviews": 45,
      "average_rating": "4.6",
      "rating_distribution": {
        "5": 30,
        "4": 10,
        "3": 3,
        "2": 1,
        "1": 1
      }
    }
  }
}
```

### Get Review Statistics (Public)
```http
GET /api/reviews/craft/:craftId/stats
```

### Get My Reviews (Buyer Only)
```http
GET /api/reviews/my-reviews
Authorization: Bearer <buyer_token>
```

### Update Review (Buyer Only - own review)
```http
PUT /api/reviews/:id
Authorization: Bearer <buyer_token>
Content-Type: application/json

{
  "rating": 4,
  "review_text": "Updated review text"
}
```

### Delete Review (Buyer Only - own review)
```http
DELETE /api/reviews/:id
Authorization: Bearer <buyer_token>
```

### Mark Review as Helpful (Any authenticated user)
```http
POST /api/reviews/:id/helpful
Authorization: Bearer <token>
```

### Artisan Reply to Review (Artisan Only)
```http
POST /api/reviews/:id/reply
Authorization: Bearer <artisan_token>
Content-Type: application/json

{
  "reply_text": "Thank you so much for your wonderful feedback!"
}
```

---

## 💬 Messaging Endpoints (All require authentication)

### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiver_id": 2,
  "craft_id": 5,  // optional
  "message_text": "Hi! Is this item customizable?",
  "message_type": "text"  // text, image, file
}
```

### Get Inbox (All Conversations)
```http
GET /api/messages/inbox
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "conversations": [
      {
        "other_user_id": 2,
        "other_user_name": "Jane Smith",
        "other_user_role": "artisan",
        "message_text": "Yes, I can customize it!",
        "craft_title": "Handwoven Basket",
        "unread_count": 2,
        "created_at": "2025-10-23T10:30:00.000Z"
      }
    ]
  }
}
```

### Get Conversation with User
```http
GET /api/messages/conversation/:userId?limit=50&offset=0&craft_id=5
Authorization: Bearer <token>
```

### Mark Messages as Read
```http
PUT /api/messages/mark-read/:senderId
Authorization: Bearer <token>
```

### Get Unread Count
```http
GET /api/messages/unread-count
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "unread_count": 5
  }
}
```

### Search Messages
```http
GET /api/messages/search?q=customization
Authorization: Bearer <token>
```

### Get Message Statistics
```http
GET /api/messages/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "stats": {
      "sent_count": 25,
      "received_count": 30,
      "unread_count": 5,
      "conversation_count": 8
    }
  }
}
```

### Delete Message
```http
DELETE /api/messages/:id
Authorization: Bearer <token>
```

---

## 👤 User Endpoints

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+9876543210",
  "location": "Los Angeles"
}
```

### Get User by ID (Public - basic info)
```http
GET /api/users/:id
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🔑 Authentication

All protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Get token from `/api/auth/login` or `/api/auth/register` response.

---

## 🎯 Role-Based Access

- **Public**: Anyone can access
- **Authenticated**: Any logged-in user
- **Buyer Only**: Only users with role "buyer"
- **Artisan Only**: Only users with role "artisan"
- **Admin Only**: Only users with role "admin"

---

## 📈 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

---

## 🧪 Testing with cURL

### Example: Place an Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "artisan_id": 2,
    "items": [
      {"craft_id": 5, "quantity": 1, "price": 49.99}
    ],
    "total_amount": 49.99,
    "shipping_address": "123 Main St",
    "payment_method": "card"
  }'
```

### Example: Get Cart
```bash
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example: Submit Review
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "craft_id": 5,
    "rating": 5,
    "review_text": "Excellent product!"
  }'
```

---

## 📚 Additional Resources

- **Phase 2 Documentation**: `BUYER_FEATURES_PHASE2_COMPLETE.md`
- **Phase 3 Documentation**: `BUYER_FEATURES_PHASE3_COMPLETE.md`
- **Implementation Plan**: `BUYER_FEATURES_IMPLEMENTATION_PLAN.md`
- **Current Status**: `BUYER_FEATURES_STATUS.md`

---

**Total Endpoints**: 33  
**Server**: Running on port 5000  
**Last Updated**: 2025-10-23
