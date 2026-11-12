# Deployment Guide: Render & Vercel for Logic Crafts Connect

This guide provides end-to-end instructions for deploying **Logic Crafts Connect** to production using **Render** (Backend API) and **Vercel** (Frontend SPA), utilizing **MongoDB Atlas** for the database.

---

## 1. System Architecture & Comparison Overview

### A. Comparison: GitHub (`https://github.com/KARTHI2509/crafts`) vs Local Workspace

| Feature / File | GitHub Repository (`KARTHI2509/crafts`) | Local Workspace (`logic-crafts-connect`) | Status & Resolution Applied |
| :--- | :--- | :--- | :--- |
| **Commit History** | 1 Commit (`ff8c637`, June 2026) | December 2025 development tree | Both branches evaluated and reconciled. |
| **Backend Models** | Named `Craft.js`, `User.js`, `Cart.js`, etc. | Named `craftModel.js`, `userModel.js`, etc. | **Fixed**: Added cross-compatible re-export aliases (`Craft.js -> craftModel.js`, `User.js -> userModel.js`) so both conventions work seamlessly. |
| **Database Setup Scripts** | Converted to MongoDB Mongoose | Had legacy PostgreSQL `pool.query` calls that crashed | **Fixed**: Rewritten all setup scripts (`setupDatabase.js`, `migrateRoles.js`, `setupBuyerFeatures.js`, etc.) to native Mongoose operations. |
| **Frontend Routing** | Basic routes | 16+ extra components (`QuickViewModal`, `OrderTimeline`, `BackToTop`, `MobileBottomNav`, etc.) | **Verified**: Production build tested and compiles cleanly in 8 seconds. |
| **Frontend API Clients** | Mixed | Hardcoded `http://localhost:5000/api` in `src/utils/api.js` | **Fixed**: Updated `src/utils/api.js` to dynamic `import.meta.env.VITE_API_URL`. |
| **Vercel SPA Config** | Missing `vercel.json` | Missing `vercel.json` | **Created**: `frontend/vercel.json` with SPA catch-all rewrite rule (`/(.*) -> /index.html`). |
| **Render Dockerfile** | None | None | **Created**: `backend/Dockerfile`, `.dockerignore`, and `render.yaml`. |

---

## 2. Database Setup (MongoDB Atlas)

The Logic Crafts platform is built on **MongoDB (Mongoose)**.

> [!IMPORTANT]
> **MongoDB Atlas Network Whitelist (Required for Render)**:
> 1. Log in to your [MongoDB Atlas Console](https://cloud.mongodb.com/).
> 2. Go to **Network Access** under Security in the left sidebar.
> 3. Click **Add IP Address** -> Select **Allow Access From Anywhere** (`0.0.0.0/0`).
>    *(Render outbound IPs are dynamic; without `0.0.0.0/0`, Render cannot reach MongoDB Atlas).*
> 4. Ensure your Database User `karthikthalipineni_db_user` has `readWriteAnyDatabase` or `readWrite` on `logic_crafts_db`.

### Connection String Options:
- **Direct Multi-Host URI (Recommended - Prevents DNS SRV Lookup Errors)**:
  ```text
  mongodb://karthikthalipineni_db_user:KARTHI_23@ac-uwjymoo-shard-00-00.lfie4sj.mongodb.net:27017,ac-uwjymoo-shard-00-01.lfie4sj.mongodb.net:27017,ac-uwjymoo-shard-00-02.lfie4sj.mongodb.net:27017/logic_crafts_db?ssl=true&replicaSet=atlas-yk3siz-shard-0&authSource=admin&retryWrites=true&w=majority&appName=craft
  ```
- **Standard SRV URI**:
  ```text
  mongodb+srv://karthikthalipineni_db_user:KARTHI_23@craft.lfie4sj.mongodb.net/logic_crafts_db?retryWrites=true&w=majority&appName=craft
  ```

---

## 3. Backend Deployment on Render

### Method A: Web Service via Render Dashboard (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
2. Connect your GitHub repository: `https://github.com/KARTHI2509/crafts` (or your updated repo).
3. Fill in the service configuration:
   - **Name**: `logic-crafts-backend`
   - **Region**: Singapore (`ap-southeast-1`) or Frankfurt/Oregon
   - **Branch**: `main`
   - **Root Directory**: `backend` (or `logic-crafts-connect/backend` depending on repo structure)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
4. Set **Environment Variables**:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & logs |
| `PORT` | `10000` | Render assigns dynamically, fallback 10000 |
| `MONGODB_URI` | *(Your MongoDB Atlas URI)* | Database connection string |
| `JWT_SECRET` | `lc_s3cr3t_k3y_2024_pr0duct10n_r34dy_x7k9m2p5q8w1` | Token signing secret |
| `JWT_EXPIRE` | `7d` | Token expiration time |
| `FRONTEND_URL` | `https://<your-vercel-app>.vercel.app` | CORS authorization for frontend |
| `SMTP_HOST` | `smtp.gmail.com` | Email service |
| `SMTP_PORT` | `587` | Email TLS port |
| `SMTP_USER` | `karthikthalipineni@gmail.com` | Email dispatcher username |
| `SMTP_PASS` | `rnos dmdx wgnm nsby` | Email dispatcher app password |
| `CLOUDINARY_CLOUD_NAME` | *(Optional, if using Cloudinary)* | Cloudinary cloud |
| `CLOUDINARY_API_KEY` | *(Optional)* | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | *(Optional)* | Cloudinary API Secret |

5. Under **Advanced**, set **Health Check Path** to `/api/health`.
6. Click **Create Web Service**. Once deployed, copy your Render URL: `https://logic-crafts-backend.onrender.com`.

---

## 4. Frontend Deployment on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** > **Project**.
2. Import the Git repository.
3. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend` (or `logic-crafts-connect/frontend`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Configure **Environment Variables**:
   - `VITE_API_URL`: `https://<your-backend-app>.onrender.com/api` (e.g., `https://logic-crafts-backend.onrender.com/api`).
5. Click **Deploy**.
6. Vercel will build the project and assign a production domain (e.g. `https://logic-crafts-connect.vercel.app`).
7. Update `FRONTEND_URL` in your Render Backend environment variables with this Vercel domain.

---

## 5. Summary of Files Configured for Deployment

1. `frontend/vercel.json`: Handles SPA routing rewrites.
2. `frontend/.env.production`: Template for production Vercel builds.
3. `frontend/.env.example`: Template for local development.
4. `frontend/src/utils/api.js`: Updated to read `import.meta.env.VITE_API_URL`.
5. `backend/server.js`: Enhanced CORS for `*.vercel.app`, health check `/api/health`, and `0.0.0.0` binding.
6. `backend/config/db.js`: Enhanced connection handler with DNS fallback guidance.
7. `backend/config/setupDatabase.js`, `migrateRoles.js`, `setupBuyerFeatures.js`: Converted to native Mongoose.
8. `backend/Dockerfile` & `.dockerignore`: Ready for containerized deployment.
9. `render.yaml`: Infrastructure as Code blueprint for 1-click Render deployment.

