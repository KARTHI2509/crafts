import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { cartAPI, wishlistAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Heart, Menu, X, User, Home, Compass } from "lucide-react";
import "./Navbar.css";

export default function Navbar({ user, logout }) {
  const { language, toggleLanguage } = useContext(LanguageContext);
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  // UI States
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user && user.role === "buyer") {
      fetchCartCount();
      fetchWishlistCount();
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const res = await cartAPI.getCart();
      setCartCount(res?.data?.data?.summary?.item_count || 0);
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const res = await wishlistAPI.getCount();
      setWishlistCount(res?.data?.data?.count || 0);
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  // Scroll behavior for hidden/sticky nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Add scrolled class if scrolled past 20px
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Handle CSS ripple effect
  const handleRipple = (e) => {
    const button = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

  // Nav Item Component for Underline Animation
  const NavItem = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className="nav-item">
        <motion.span
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          style={{ display: "inline-block" }}
        >
          {children}
        </motion.span>
        {isActive && (
          <motion.div
            layoutId="navbar-underline"
            className="nav-underline"
            transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
          />
        )}
      </Link>
    );
  };

  return (
    <>
      <div className={`navbar-wrapper ${isHidden ? "hidden" : ""}`}>
        <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
          <div className="container nav-inner">
            
            {/* Custom SVG Logo & Brand */}
            <Link to="/" className="brand">
              <motion.svg 
                className="brand-svg" 
                viewBox="0 0 24 24"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <defs>
                  <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4A373" />
                    <stop offset="100%" stopColor="#B5651D" />
                  </linearGradient>
                </defs>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </motion.svg>
              <motion.span 
                className="brand-title"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                CraftHub
              </motion.span>
            </Link>

            {/* Desktop Links */}
            <div className="nav-links">
              <NavItem to="/">Home</NavItem>
              {(!user || user.role === "buyer") && <NavItem to="/explore">Explore</NavItem>}
              {user && user.role === "artisan" && <NavItem to="/upload">Upload</NavItem>}
              <NavItem to="/events">Events</NavItem>
              {user && <NavItem to="/dashboard">Dashboard</NavItem>}
              {user && user.role === "admin" && <NavItem to="/admin">Admin</NavItem>}
            </div>

            {/* Actions & Badges */}
            <div className="nav-actions">
              
              {/* Expandable Search */}
              <div className={`search-container ${searchExpanded ? "expanded" : ""}`}>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search crafts..." 
                  onBlur={() => setSearchExpanded(false)}
                />
                <motion.button 
                  className="search-btn" 
                  onClick={() => setSearchExpanded(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Search size={20} />
                </motion.button>
              </div>

              {/* Language Pill */}
              <motion.div 
                className="lang-toggle" 
                onClick={toggleLanguage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`lang-slider ${language === 'te' ? 'te' : 'en'}`} />
                <span className={`lang-option ${language === 'en' ? 'active' : ''}`}>EN</span>
                <span className={`lang-option ${language === 'te' ? 'active' : ''}`}>తె</span>
              </motion.div>

              {/* Buyer Icons */}
              {user && user.role === "buyer" && (
                <>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link to="/buyer/wishlist" className="badge-container">
                      <Heart size={20} />
                      <AnimatePresence>
                        {wishlistCount > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            exit={{ scale: 0 }} 
                            className="badge"
                          >
                            {wishlistCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link to="/cart" className="badge-container">
                      <ShoppingCart size={20} />
                      <AnimatePresence>
                        {cartCount > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            exit={{ scale: 0 }} 
                            className="badge"
                          >
                            {cartCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.div>
                </>
              )}

              {/* Auth / Profile */}
              {!user ? (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link to="/login" className="nav-item"><User size={20} /></Link>
                </motion.div>
              ) : (
                <motion.button 
                  onClick={(e) => {
                    handleRipple(e);
                    setTimeout(logout, 300);
                  }} 
                  className="nav-item btn secondary" 
                  style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              )}

              {/* Mobile Hamburger */}
              <button 
                className={`mobile-toggle ${mobileMenuOpen ? "open" : ""}`} 
                onClick={(e) => {
                  handleRipple(e);
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
              >
                <span />
                <span />
                <span />
              </button>

            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="mobile-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="mobile-nav-links">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              {(!user || user.role === "buyer") && <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>Explore</Link>}
              {user && user.role === "artisan" && <Link to="/upload" onClick={() => setMobileMenuOpen(false)}>Upload</Link>}
              <Link to="/events" onClick={() => setMobileMenuOpen(false)}>Events</Link>
              {user && <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>}
              {user && user.role === "admin" && <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <Link to="/" className={`bottom-nav-item ${location.pathname === "/" ? "active" : ""}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link to="/explore" className={`bottom-nav-item ${location.pathname === "/explore" ? "active" : ""}`}>
          <Compass size={20} />
          <span>Explore</span>
        </Link>
        {(!user || user.role === "buyer") && (
          <>
            <Link to="/cart" className={`bottom-nav-item ${location.pathname === "/cart" ? "active" : ""}`}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="bottom-badge">{cartCount}</span>}
              </div>
              <span>Cart</span>
            </Link>
            <Link to="/buyer/wishlist" className={`bottom-nav-item ${location.pathname === "/buyer/wishlist" ? "active" : ""}`}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Heart size={20} />
                {wishlistCount > 0 && <span className="bottom-badge">{wishlistCount}</span>}
              </div>
              <span>Wishlist</span>
            </Link>
          </>
        )}
        <Link to="/dashboard" className={`bottom-nav-item ${location.pathname.includes("/dashboard") || location.pathname.includes("-dashboard") ? "active" : ""}`}>
          <User size={20} />
          <span>Profile</span>
        </Link>
      </div>
    </>
  );
}