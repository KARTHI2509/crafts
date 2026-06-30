import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const UploadCraft = lazy(() => import("./pages/UploadCraft"));
const UploadCraftEnhanced = lazy(() => import("./pages/UploadCraftEnhanced"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Reset = lazy(() => import("./pages/Reset"));

const ArtisanDashboard = lazy(() => import("./pages/ArtisanDashboard"));
const ArtisanCrafts = lazy(() => import("./pages/ArtisanCrafts"));
const ArtisanOrders = lazy(() => import("./pages/ArtisanOrders"));
const ArtisanOrderDetails = lazy(() => import("./pages/ArtisanOrderDetails"));
const ArtisanMessages = lazy(() => import("./pages/ArtisanMessages"));
const ArtisanAnalytics = lazy(() => import("./pages/ArtisanAnalytics"));
const ArtisanProfile = lazy(() => import("./pages/ArtisanProfile"));

const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const BuyerOrders = lazy(() => import("./pages/BuyerOrders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));

const AdminDashboard_Role = lazy(() => import("./pages/AdminDashboard_Role"));
const Events = lazy(() => import("./pages/Events"));

// Elegant shimmering page loader
function SkeletonPageLoader() {
  return (
    <div className="container" style={{ padding: "80px 20px", minHeight: "80vh" }}>
      <div className="skeleton-shimmer" style={{ height: "48px", width: "40%", marginBottom: "24px", borderRadius: "12px" }}></div>
      <div className="skeleton-shimmer" style={{ height: "20px", width: "100%", marginBottom: "16px", borderRadius: "8px" }}></div>
      <div className="skeleton-shimmer" style={{ height: "20px", width: "90%", marginBottom: "16px", borderRadius: "8px" }}></div>
      <div className="skeleton-shimmer" style={{ height: "20px", width: "95%", marginBottom: "48px", borderRadius: "8px" }}></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "32px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-premium" style={{ borderRadius: "28px", padding: "24px" }}>
            <div className="skeleton-shimmer" style={{ height: "220px", borderRadius: "18px", marginBottom: "20px" }}></div>
            <div className="skeleton-shimmer" style={{ height: "28px", width: "70%", marginBottom: "16px", borderRadius: "8px" }}></div>
            <div className="skeleton-shimmer" style={{ height: "18px", width: "40%", borderRadius: "8px" }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Wrapper to animate page transitions
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", flexGrow: 1 }}
  >
    {children}
  </motion.div>
);

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-root">
      {/* Navbar */}
      <Navbar user={user} logout={logout} />

      {/* Main Content */}
      <main className="app-main" style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Suspense fallback={<SkeletonPageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/explore" element={<PageWrapper><Explore /></PageWrapper>} />
              <Route path="/events" element={<PageWrapper><Events /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
              <Route path="/reset" element={<PageWrapper><Reset /></PageWrapper>} />
              <Route path="/artisan/:id" element={<PageWrapper><ArtisanProfile /></PageWrapper>} />

              {/* Protected Routes */}
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <PageWrapper><UploadCraft /></PageWrapper>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/upload-craft-enhanced"
                element={
                  <ProtectedRoute>
                    <PageWrapper><UploadCraftEnhanced /></PageWrapper>
                  </ProtectedRoute>
                }
              />

              {/* Buyer Routes */}
              <Route
                path="/buyer-dashboard"
                element={
                  <RoleBasedRoute role="buyer">
                    <PageWrapper><BuyerDashboard /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/cart"
                element={
                  <RoleBasedRoute role="buyer">
                    <PageWrapper><Cart /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/buyer/wishlist"
                element={
                  <RoleBasedRoute role="buyer">
                    <PageWrapper><Wishlist /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/buyer/orders"
                element={
                  <RoleBasedRoute role="buyer">
                    <PageWrapper><BuyerOrders /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/buyer/orders/:orderId"
                element={
                  <RoleBasedRoute role="buyer">
                    <PageWrapper><OrderDetails /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              {/* Artisan Routes */}
              <Route
                path="/artisan-dashboard"
                element={
                  <RoleBasedRoute role="artisan">
                    <PageWrapper><ArtisanDashboard /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/artisan/crafts"
                element={
                  <RoleBasedRoute role="artisan">
                    <PageWrapper><ArtisanCrafts /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/artisan/orders"
                element={
                  <RoleBasedRoute role="artisan">
                    <PageWrapper><ArtisanOrders /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/artisan/orders/:orderId"
                element={
                  <RoleBasedRoute role="artisan">
                    <PageWrapper><ArtisanOrderDetails /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/artisan/messages"
                element={
                  <RoleBasedRoute role="artisan">
                    <PageWrapper><ArtisanMessages /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/artisan/analytics"
                element={
                  <RoleBasedRoute role="artisan">
                    <PageWrapper><ArtisanAnalytics /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <RoleBasedRoute role="admin">
                    <PageWrapper><AdminDashboard_Role /></PageWrapper>
                  </RoleBasedRoute>
                }
              />

              {/* Dynamic Dashboard Redirect */}
              <Route
                path="/dashboard"
                element={
                  user ? (
                    user.role === "admin" ? (
                      <Navigate to="/admin-dashboard" replace />
                    ) : user.role === "buyer" ? (
                      <Navigate to="/buyer-dashboard" replace />
                    ) : (
                      <Navigate to="/artisan-dashboard" replace />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Old Admin Route Redirect */}
              <Route
                path="/admin"
                element={
                  user?.role === "admin" ? (
                    <Navigate to="/admin-dashboard" replace />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <PageWrapper>
                    <div className="container not-found" style={{ padding: "80px 20px", textAlign: "center" }}>
                      <h2>404 — Page not found</h2>
                    </div>
                  </PageWrapper>
                }
              />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;