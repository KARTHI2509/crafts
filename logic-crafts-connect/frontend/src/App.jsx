import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css'; // CSS styles for all components
import './styles/responsive.css'; // Responsive utilities

import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import ErrorBoundary from './components/ErrorBoundary';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import CraftDetail from './pages/CraftDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

import Home from './pages/Home';
import Explore from './pages/Explore';
import UploadCraft from './pages/UploadCraft';
import UploadCraftEnhanced from './pages/UploadCraftEnhanced';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import ArtisanDashboard from './pages/ArtisanDashboard';
import ArtisanCrafts from './pages/ArtisanCrafts';
import ArtisanOrders from './pages/ArtisanOrders';
import ArtisanOrderDetails from './pages/ArtisanOrderDetails';
import ArtisanMessages from './pages/ArtisanMessages';
import ArtisanAnalytics from './pages/ArtisanAnalytics';
import ArtisanProfileEdit from './pages/ArtisanProfileEdit';
import ArtisanReviews from './pages/ArtisanReviews';
import ArtisanPublicProfile from './pages/ArtisanPublicProfile';
import BuyerDashboard from './pages/BuyerDashboard';
import BuyerMessages from './pages/BuyerMessages';
import AdminDashboard_Role from './pages/AdminDashboard_Role';
import ArtisanProfile from './pages/ArtisanProfile';
import Events from './pages/Events';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import BuyerOrders from './pages/BuyerOrders';
import OrderDetails from './pages/OrderDetails';
import BackToTop from './components/BackToTop';
import MobileBottomNav from './components/MobileBottomNav';
import PageTransition from './components/PageTransition';
import ProductCompare, { CompareBar } from './components/ProductCompare';

function App() {
  const { user, logout } = useAuth();

  return (
    <ErrorBoundary>
      <div className="app-root">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: { background: '#22c55e', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#22c55e' },
            },
            error: {
              style: { background: '#ef4444', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#ef4444' },
            },
          }}
        />
        <Navbar user={user} logout={logout} />
        <main style={{ minHeight: 'calc(100vh - 160px)', paddingTop: 24, paddingBottom: 70 }}>
          <PageTransition>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/events" element={<Events />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/artisan/:id" element={<ArtisanPublicProfile />} />
            <Route path="/craft/:id" element={<CraftDetail />} />

            {/* Buyer Protected Routes */}
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/buyer/wishlist" 
              element={
                <RoleBasedRoute role="buyer">
                  <Wishlist />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/buyer/orders" 
              element={
                <RoleBasedRoute role="buyer">
                  <BuyerOrders />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/buyer/orders/:orderId" 
              element={
                <RoleBasedRoute role="buyer">
                  <OrderDetails />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/order-confirmation" 
              element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              } 
            />

            {/* Protected Routes - Require Authentication */}
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadCraft />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/upload-craft-enhanced" 
              element={
                <ProtectedRoute>
                  <UploadCraftEnhanced />
                </ProtectedRoute>
              } 
            />

            {/* Role-Based Routes - Artisan Dashboard */}
            <Route 
              path="/artisan-dashboard" 
              element={
                <RoleBasedRoute role="artisan">
                  <ArtisanDashboard />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/artisan/crafts" 
              element={
                <RoleBasedRoute role="artisan">
                  <ArtisanCrafts />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/artisan/orders" 
              element={
                <RoleBasedRoute role="artisan">
                  <ArtisanOrders />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/artisan/orders/:orderId" 
              element={
                <RoleBasedRoute role="artisan">
                  <ArtisanOrderDetails />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/artisan/messages" 
              element={
                <RoleBasedRoute role="artisan">
                  <ArtisanMessages />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/artisan/analytics" 
              element={
                <RoleBasedRoute role="artisan">
                  <ArtisanAnalytics />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/artisan/profile" 
              element={
                <RoleBasedRoute role="artisan">
                  <ArtisanProfileEdit />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/artisan/reviews" 
              element={
                <RoleBasedRoute role="artisan">
                  <ArtisanReviews />
                </RoleBasedRoute>
              } 
            />

            {/* Role-Based Routes - Buyer Dashboard */}
            <Route 
              path="/buyer-dashboard" 
              element={
                <RoleBasedRoute role="buyer">
                  <BuyerDashboard />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/buyer/messages" 
              element={
                <RoleBasedRoute role="buyer">
                  <BuyerMessages />
                </RoleBasedRoute>
              } 
            />

            {/* Role-Based Routes - Admin Dashboard */}
            <Route 
              path="/admin-dashboard" 
              element={
                <RoleBasedRoute role="admin">
                  <AdminDashboard_Role />
                </RoleBasedRoute>
              } 
            />

            {/* Backward Compatibility - Old dashboard routes */}
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  user.role === 'admin' ? <Navigate to="/admin-dashboard" /> :
                  user.role === 'buyer' ? <Navigate to="/buyer-dashboard" /> :
                  <Navigate to="/artisan-dashboard" />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/admin" 
              element={
                user && user.role === 'admin' ? 
                  <Navigate to="/admin-dashboard" /> : 
                  <Navigate to="/" />
              } 
            />

            {/* Compare Page */}
            <Route path="/compare" element={<ProductCompare />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </PageTransition>
        </main>
        <Footer />
        <CompareBar />
        <BackToTop />
        <MobileBottomNav />
      </div>
    </ErrorBoundary>
  );
}

export default App;
