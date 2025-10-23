import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import axios from "axios";

export default function Navbar({ user, logout }) {
  const { language, toggleLanguage } = useContext(LanguageContext);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetchCartCount();
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartCount(response.data.data.total_items || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Brand / Logo */}
        <div className="brand">
          <div className="logo">LC</div>
          <span className="title">Logic Crafts Connect</span>
        </div>

        {/* Navigation Links - Role-Based */}
        <div className="nav-links">
          <Link to="/">Home</Link>
          
          {/* Explore - Only for Buyers and Public (non-logged users) */}
          {(!user || user.role === 'buyer') && <Link to="/explore">Explore</Link>}
          
          {/* Upload - Only for Artisans */}
          {user && user.role === 'artisan' && <Link to="/upload">Upload Craft</Link>}
          
          {/* Events - For all logged in users and public */}
          <Link to="/events">Events</Link>
          
          {/* Cart - Only for Buyers */}
          {user && user.role === 'buyer' && (
            <Link to="/cart" className="cart-link">
              🛒 Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}
          
          {/* Dashboard - All logged in users */}
          {user && <Link to="/dashboard">Dashboard</Link>}
          
          {/* Admin - Only for Admins */}
          {user && user.role === 'admin' && <Link to="/admin">Admin</Link>}
          
          {/* Auth Links - Only for non-logged users */}
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/register">Register</Link>}
          
          {/* Logout - Only for logged in users */}
          {user && <button onClick={logout} className="btn" style={{marginLeft: '8px'}}>Logout</button>}
        </div>

        {/* Language Toggle */}
        <button className="lang-btn" onClick={toggleLanguage}>
          {language === "en" ? "EN" : "తెలుగు"}
        </button>
      </div>
    </nav>
  );
}
