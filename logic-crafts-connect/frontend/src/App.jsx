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
import Login from './pages/Login';
import Register from './pages/Register';
import ArtisanDashboard from './pages/ArtisanDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard_Role from './pages/AdminDashboard_Role';
import ArtisanProfile from './pages/ArtisanProfile';
import Events from './pages/Events';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import BuyerOrders from './pages/BuyerOrders';

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

            {/* Protected Routes - Require Authentication */}
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadCraft />
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
