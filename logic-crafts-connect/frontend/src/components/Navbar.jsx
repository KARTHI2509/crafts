import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { cartAPI, wishlistAPI } from "../services/api";
import { NotificationBell } from "./Notifications";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ user, logout }) {
  const { language, toggleLanguage } = useContext(LanguageContext);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetchCartCount();
      fetchWishlistCount();
    }
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const fetchCartCount = async () => {
    try {
      const response = await cartAPI.get();
      setCartCount(response.data?.total_items || response.data?.items?.length || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const response = await wishlistAPI.get();
      setWishlistCount(response.data?.items?.length || response.data?.wishlist?.length || 0);
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          {/* Brand / Logo */}
          <Link to="/" className="brand">
            <div className="logo">🎨</div>
            <span className="title">Logic Crafts</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links desktop-nav">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            
            {(!user || user.role === 'buyer') && (
              <Link to="/explore" className={location.pathname === '/explore' ? 'active' : ''}>
                Explore
              </Link>
            )}
            
            {user && user.role === 'artisan' && (
              <Link to="/upload" className={location.pathname === '/upload' ? 'active' : ''}>
                Upload Craft
              </Link>
            )}
            
            <Link to="/events" className={location.pathname === '/events' ? 'active' : ''}>
              Events
            </Link>
            
            {user && user.role === 'buyer' && (
              <Link to="/wishlist" className={`wishlist-link ${location.pathname === '/wishlist' ? 'active' : ''}`}>
                ❤️ Wishlist
                {wishlistCount > 0 && <span className="wishlist-badge">{wishlistCount}</span>}
              </Link>
            )}
            
            {user && user.role === 'buyer' && (
              <Link to="/cart" className={`cart-link ${location.pathname === '/cart' ? 'active' : ''}`}>
                🛒 Cart
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            )}
            
            {user && (
              <Link to="/dashboard" className={location.pathname.includes('dashboard') ? 'active' : ''}>
                Dashboard
              </Link>
            )}
            
            {user && user.role === 'admin' && (
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                Admin
              </Link>
            )}
            
            {!user && <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>}
            {!user && (
              <Link to="/register" className={`btn-register ${location.pathname === '/register' ? 'active' : ''}`}>
                Register
              </Link>
            )}
            
            {user && (
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            )}
          </div>

          {/* Right side: Theme + Notifications + Language + Mobile Menu Button */}
          <div className="nav-right">
            <ThemeToggle />
            {user && <NotificationBell />}
            
            <button className="lang-btn" onClick={toggleLanguage}>
              {language === "en" ? "EN" : "తెలుగు"}
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Mobile Menu Slide-in Panel */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Menu</span>
          <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>✕</button>
        </div>
        
        {user && (
          <div className="mobile-user-info">
            <div className="mobile-user-avatar">{user.name?.charAt(0).toUpperCase() || '👤'}</div>
            <div className="mobile-user-details">
              <span className="mobile-user-name">{user.name}</span>
              <span className="mobile-user-role">{user.role}</span>
            </div>
          </div>
        )}
        
        <div className="mobile-nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            <span className="menu-icon">🏠</span> Home
          </Link>
          
          {(!user || user.role === 'buyer') && (
            <Link to="/explore" className={location.pathname === '/explore' ? 'active' : ''}>
              <span className="menu-icon">🔍</span> Explore
            </Link>
          )}
          
          {user && user.role === 'artisan' && (
            <Link to="/upload" className={location.pathname === '/upload' ? 'active' : ''}>
              <span className="menu-icon">➕</span> Upload Craft
            </Link>
          )}
          
          <Link to="/events" className={location.pathname === '/events' ? 'active' : ''}>
            <span className="menu-icon">📅</span> Events
          </Link>
          
          {user && user.role === 'buyer' && (
            <>
              <Link to="/cart" className={location.pathname === '/cart' ? 'active' : ''}>
                <span className="menu-icon">🛒</span> Cart
                {cartCount > 0 && <span className="cart-badge-mobile">{cartCount}</span>}
              </Link>
              <Link to="/wishlist" className={location.pathname === '/wishlist' ? 'active' : ''}>
                <span className="menu-icon">💝</span> Wishlist
              </Link>
              <Link to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>
                <span className="menu-icon">📦</span> My Orders
              </Link>
            </>
          )}
          
          {user && (
            <Link to="/dashboard" className={location.pathname.includes('dashboard') ? 'active' : ''}>
              <span className="menu-icon">📊</span> Dashboard
            </Link>
          )}

          {user && (
            <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
              <span className="menu-icon">👤</span> My Profile
            </Link>
          )}
          
          {user && user.role === 'admin' && (
            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
              <span className="menu-icon">⚙️</span> Admin Panel
            </Link>
          )}
        </div>
        
        <div className="mobile-menu-footer">
          {!user ? (
            <>
              <Link to="/login" className="mobile-login-btn">Login</Link>
              <Link to="/register" className="mobile-register-btn">Create Account</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="mobile-logout-btn">
              <span className="menu-icon">🚪</span> Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Styles */}
      <style>{`
        .nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 28px;
          height: 20px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 60;
        }
        
        .mobile-menu-btn span {
          display: block;
          width: 100%;
          height: 3px;
          background: var(--primary, #8b5a2b);
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        
        .mobile-menu-btn.open span:nth-child(1) {
          transform: translateY(8.5px) rotate(45deg);
        }
        
        .mobile-menu-btn.open span:nth-child(2) {
          opacity: 0;
        }
        
        .mobile-menu-btn.open span:nth-child(3) {
          transform: translateY(-8.5px) rotate(-45deg);
        }
        
        .mobile-menu-overlay {
          display: none;
        }
        
        .mobile-menu {
          display: none;
        }
        
        .desktop-nav .active {
          color: var(--accent, #d4a574) !important;
          font-weight: 600;
        }
        
        .btn-register {
          background: var(--primary, #8b5a2b);
          color: white !important;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .btn-register:hover {
          background: var(--primary-light, #a67c52);
          transform: translateY(-2px);
        }
        
        .btn-logout {
          background: transparent;
          border: 1px solid var(--danger, #c44536);
          color: var(--danger, #c44536);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        
        .btn-logout:hover {
          background: var(--danger, #c44536);
          color: white;
        }
        
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-menu-btn {
            display: flex;
          }
          
          .mobile-menu-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 50;
            animation: fadeIn 0.3s ease;
          }
          
          .mobile-menu {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            right: -300px;
            width: 280px;
            height: 100vh;
            background: white;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
            z-index: 55;
            transition: right 0.3s ease;
            overflow-y: auto;
          }
          
          .mobile-menu.open {
            right: 0;
          }
          
          .mobile-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .mobile-menu-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--primary, #8b5a2b);
          }
          
          .mobile-close-btn {
            background: none;
            border: none;
            font-size: 20px;
            color: #6b7280;
            cursor: pointer;
            padding: 4px 8px;
          }
          
          .mobile-user-info {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            background: var(--bg-cream, #faf8f4);
            border-bottom: 1px solid #e5e7eb;
          }
          
          .mobile-user-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary, #8b5a2b), var(--accent, #d4a574));
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 600;
          }
          
          .mobile-user-details {
            display: flex;
            flex-direction: column;
          }
          
          .mobile-user-name {
            font-weight: 600;
            color: var(--text, #1f2937);
          }
          
          .mobile-user-role {
            font-size: 12px;
            color: #6b7280;
            text-transform: capitalize;
          }
          
          .mobile-nav-links {
            flex: 1;
            padding: 16px 0;
          }
          
          .mobile-nav-links a {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 20px;
            color: var(--text, #1f2937);
            text-decoration: none;
            font-size: 15px;
            transition: all 0.2s;
          }
          
          .mobile-nav-links a:hover,
          .mobile-nav-links a.active {
            background: var(--bg-cream, #faf8f4);
            color: var(--primary, #8b5a2b);
          }
          
          .mobile-nav-links a.active {
            border-left: 3px solid var(--primary, #8b5a2b);
            font-weight: 600;
          }
          
          .menu-icon {
            font-size: 18px;
          }
          
          .cart-badge-mobile {
            background: var(--danger, #c44536);
            color: white;
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 12px;
            margin-left: auto;
          }
          
          .mobile-menu-footer {
            padding: 20px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .mobile-login-btn {
            display: block;
            text-align: center;
            padding: 12px;
            border: 1px solid var(--primary, #8b5a2b);
            color: var(--primary, #8b5a2b);
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
          }
          
          .mobile-login-btn:hover {
            background: var(--primary, #8b5a2b);
            color: white;
          }
          
          .mobile-register-btn {
            display: block;
            text-align: center;
            padding: 12px;
            background: var(--primary, #8b5a2b);
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
          }
          
          .mobile-register-btn:hover {
            background: var(--primary-light, #a67c52);
          }
          
          .mobile-logout-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 12px;
            background: transparent;
            border: 1px solid var(--danger, #c44536);
            color: var(--danger, #c44536);
            border-radius: 8px;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .mobile-logout-btn:hover {
            background: var(--danger, #c44536);
            color: white;
          }
          
          .brand .title {
            font-size: 16px !important;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
