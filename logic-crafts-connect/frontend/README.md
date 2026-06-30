# Logic Crafts Connect - Frontend

**A Complete Marketplace Connecting Local Artisans with Global Buyers**

![React](https://img.shields.io/badge/React-19.1.1-61dafb)
![Vite](https://img.shields.io/badge/Vite-7.1.7-646cff)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

---

## 🎨 Overview

Logic Crafts Connect is a full-stack frontend marketplace platform where artisans can upload and sell handmade crafts directly to buyers without middlemen.

Built with:

* React 19
* Vite
* React Router
* Axios
* Context API

Supports:

* Multi-role authentication
* Buyer cart & wishlist
* Order tracking
* Artisan analytics
* Admin approval system
* Bilingual support (English/Telugu)

---

## ✨ Features

### 🔐 Authentication

* JWT Login/Register
* Session persistence
* Role-based redirects
* Protected routes

### 👨‍🎨 Artisan Features

* Upload crafts
* Manage crafts
* View orders
* Order details
* Analytics dashboard
* Buyer messaging

### 🛍 Buyer Features

* Explore crafts
* Add to cart
* Wishlist management
* Place orders
* Order tracking
* View order details

### 🛠 Admin Features

* Approve/reject crafts
* Create events
* Manage users
* View reports
* Dashboard statistics

### 🌍 Additional Features

* English/Telugu language support
* Responsive UI
* Search & filters
* Image upload preview
* Local storage utils
* API service abstraction

---

## 📂 Project Structure

```bash
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleBasedRoute.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── LanguageContext.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Explore.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── UploadCraft.jsx
│   │   ├── UploadCraftEnhanced.jsx
│   │   ├── ArtisanDashboard.jsx
│   │   ├── ArtisanCrafts.jsx
│   │   ├── ArtisanOrders.jsx
│   │   ├── ArtisanOrderDetails.jsx
│   │   ├── ArtisanMessages.jsx
│   │   ├── ArtisanAnalytics.jsx
│   │   ├── ArtisanProfile.jsx
│   │   ├── BuyerDashboard.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Cart.jsx
│   │   ├── BuyerOrders.jsx
│   │   ├── OrderDetails.jsx
│   │   ├── Events.jsx
│   │   └── AdminDashboard_Role.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── utils/
│   │   ├── storage.js
│   │   ├── formatters.js
│   │   └── validators.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Installation

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

---

## 🌐 Routes

### Public Routes

| Route        | Page            |
| ------------ | --------------- |
| /            | Home            |
| /explore     | Explore Crafts  |
| /events      | Events          |
| /login       | Login           |
| /register    | Register        |
| /artisan/:id | Artisan Profile |

---

### Buyer Routes

| Route                  | Page            |
| ---------------------- | --------------- |
| /buyer-dashboard       | Buyer Dashboard |
| /cart                  | Cart            |
| /buyer/wishlist        | Wishlist        |
| /buyer/orders          | Buyer Orders    |
| /buyer/orders/:orderId | Order Details   |

---

### Artisan Routes

| Route                    | Page                  |
| ------------------------ | --------------------- |
| /artisan-dashboard       | Artisan Dashboard     |
| /artisan/crafts          | Artisan Crafts        |
| /artisan/orders          | Artisan Orders        |
| /artisan/orders/:orderId | Artisan Order Details |
| /artisan/messages        | Messages              |
| /artisan/analytics       | Analytics             |

---

### Admin Routes

| Route            | Page            |
| ---------------- | --------------- |
| /admin-dashboard | Admin Dashboard |

---

## 🔗 API Services

Located in:

```bash
src/services/api.js
```

Includes:

### Auth API

```js
authAPI.login()
authAPI.register()
authAPI.logout()
authAPI.verifyToken()
```

### Craft API

```js
craftAPI.getAll()
craftAPI.getById()
craftAPI.create()
craftAPI.update()
craftAPI.delete()
craftAPI.getMyCrafts()
```

### Cart API

```js
cartAPI.getCart()
cartAPI.addToCart()
cartAPI.updateCart()
cartAPI.removeItem()
cartAPI.clearCart()
```

### Wishlist API

```js
wishlistAPI.getWishlist()
wishlistAPI.add()
wishlistAPI.remove()
wishlistAPI.clear()
wishlistAPI.moveToCart()
```

### Orders API

```js
orderAPI.getOrders()
orderAPI.getOrderDetails()
orderAPI.cancelOrder()
orderAPI.returnOrder()
```

### Admin API

```js
adminAPI.getPendingCrafts()
adminAPI.approveCraft()
adminAPI.rejectCraft()
adminAPI.getStats()
adminAPI.createEvent()
```

---

## 🎨 UI Design

Warm earthy color palette:

```css
--primary: #8b5a2b;
--accent: #d4a574;
--bg-cream: #faf8f4;
--success: #6b8e23;
--danger: #c44536;
```

---

## 📱 Responsive Design

Supports:

* Mobile
* Tablet
* Desktop

---

## 🛠 Technologies

* React 19
* Vite 7
* Axios
* React Router DOM
* Context API
* ESLint
* Tailwind (optional)

---

## ✅ Status

Project Status: **Active Development**

Completed:

* Authentication
* Buyer flow
* Artisan flow
* Admin flow
* Cart system
* Wishlist system
* Orders system
* Upload system
* Protected routes
* Role-based routes

Pending:

* Checkout page
* Payment integration
* Live messaging
* Notification system

---

Built with ❤️ for artisans.
