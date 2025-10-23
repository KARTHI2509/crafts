import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'; // CSS styles for all components

import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Explore from './pages/Explore';
import UploadCraft from './pages/UploadCraft';
import UploadCraftEnhanced from './pages/UploadCraftEnhanced';
import Login from './pages/Login';
import Register from './pages/Register';
import ArtisanDashboard from './pages/ArtisanDashboard';
import ArtisanCrafts from './pages/ArtisanCrafts';
import ArtisanOrders from './pages/ArtisanOrders';
import ArtisanOrderDetails from './pages/ArtisanOrderDetails';
import ArtisanMessages from './pages/ArtisanMessages';
import ArtisanAnalytics from './pages/ArtisanAnalytics';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard_Role from './pages/AdminDashboard_Role';
import ArtisanProfile from './pages/ArtisanProfile';
import Events from './pages/Events';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import BuyerOrders from './pages/BuyerOrders';
import OrderDetails from './pages/OrderDetails';

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app-root">
      <Navbar user={user} logout={logout} />
        <main style={{ minHeight: 'calc(100vh - 160px)', paddingTop: 24 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/events" element={<Events />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/artisan/:id" element={<ArtisanProfile />} />

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

            {/* Role-Based Routes - Buyer Dashboard */}
            <Route 
              path="/buyer-dashboard" 
              element={
                <RoleBasedRoute role="buyer">
                  <BuyerDashboard />
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

            {/* 404 Route */}
            <Route path="*" element={<div className="container"><h2>404 — Page not found</h2></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
  );
}

export default App;
