import React, { createContext, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Wishlist.css';

// Wishlist Context
const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    // Return a safe default instead of throwing
    return {
      wishlistItems: [],
      addToWishlist: () => false,
      removeFromWishlist: () => {},
      isInWishlist: () => false,
      toggleWishlist: () => false,
      clearWishlist: () => {},
      getWishlistCount: () => 0
    };
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const authContext = useAuth();
  const user = authContext?.user;
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load wishlist from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`wishlist_${user._id || user.id}`);
      if (saved) {
        setWishlistItems(JSON.parse(saved));
      }
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`wishlist_${user._id || user.id}`, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const addToWishlist = (product) => {
    if (!isInWishlist(product._id)) {
      setWishlistItems(prev => [...prev, {
        ...product,
        addedAt: new Date().toISOString()
      }]);
      return true;
    }
    return false;
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item._id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const getWishlistCount = () => wishlistItems.length;

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
      getWishlistCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Wishlist Button Component
export const WishlistButton = ({ product, showText = false, size = 'medium' }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const authContext = useAuth();
  const user = authContext?.user;
  const langContext = useLanguage();
  const language = langContext?.language || 'en';
  const [animating, setAnimating] = useState(false);

  if (!product) return null;

  const isWishlisted = isInWishlist(product._id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert(language === 'ta' ? 'உள்நுழைக வேண்டும்' : 'Please login first');
      return;
    }

    setAnimating(true);
    toggleWishlist(product);
    setTimeout(() => setAnimating(false), 300);
  };

  const texts = {
    en: {
      add: 'Add to Wishlist',
      remove: 'Remove from Wishlist',
      saved: 'Saved'
    },
    ta: {
      add: 'விருப்பப்பட்டியலில் சேர்',
      remove: 'விருப்பப்பட்டியலிலிருந்து நீக்கு',
      saved: 'சேமிக்கப்பட்டது'
    }
  };

  const t = texts[language] || texts.en;

  return (
    <button
      className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''} ${animating ? 'animating' : ''} size-${size}`}
      onClick={handleClick}
      title={isWishlisted ? t.remove : t.add}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill={isWishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {showText && (
        <span>{isWishlisted ? t.saved : t.add}</span>
      )}
    </button>
  );
};

// Wishlist Icon for Header
export const WishlistIcon = () => {
  const { getWishlistCount } = useWishlist();
  const langContext = useLanguage();
  const language = langContext?.language || 'en';
  const count = getWishlistCount();

  return (
    <Link to="/wishlist" className="wishlist-icon-link" title={language === 'ta' ? 'விருப்பப்பட்டியல்' : 'Wishlist'}>
      <div className="wishlist-icon-container">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {count > 0 && (
          <span className="wishlist-badge">{count > 99 ? '99+' : count}</span>
        )}
      </div>
    </Link>
  );
};

// Wishlist Page Component
export const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const langContext = useLanguage();
  const language = langContext?.language || 'en';
  const authContext = useAuth();
  const user = authContext?.user;

  const texts = {
    en: {
      title: 'My Wishlist',
      empty: 'Your wishlist is empty',
      emptyDesc: 'Save items you love by clicking the heart icon',
      explore: 'Explore Products',
      clearAll: 'Clear All',
      remove: 'Remove',
      addToCart: 'Add to Cart',
      viewProduct: 'View Product',
      addedOn: 'Added on',
      items: 'items',
      loginRequired: 'Please login to view your wishlist',
      login: 'Login'
    },
    ta: {
      title: 'எனது விருப்பப்பட்டியல்',
      empty: 'உங்கள் விருப்பப்பட்டியல் காலியாக உள்ளது',
      emptyDesc: 'இதய ஐகானைக் கிளிக் செய்து நீங்கள் விரும்பும் பொருட்களைச் சேமிக்கவும்',
      explore: 'பொருட்களை ஆராயுங்கள்',
      clearAll: 'அனைத்தையும் அழி',
      remove: 'நீக்கு',
      addToCart: 'கூடையில் சேர்',
      viewProduct: 'பொருளைப் பார்',
      addedOn: 'சேர்க்கப்பட்ட நாள்',
      items: 'பொருட்கள்',
      loginRequired: 'உங்கள் விருப்பப்பட்டியலைக் காண உள்நுழையவும்',
      login: 'உள்நுழை'
    }
  };

  const t = texts[language] || texts.en;

  if (!user) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-login-required">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h2>{t.loginRequired}</h2>
          <Link to="/login" className="btn-primary">{t.login}</Link>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <h1>{t.title}</h1>
        <div className="wishlist-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h2>{t.empty}</h2>
          <p>{t.emptyDesc}</p>
          <Link to="/explore" className="btn-primary">{t.explore}</Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>{t.title}</h1>
        <div className="wishlist-actions">
          <span className="wishlist-count">{wishlistItems.length} {t.items}</span>
          <button className="btn-clear" onClick={clearWishlist}>
            {t.clearAll}
          </button>
        </div>
      </div>

      <div className="wishlist-grid">
        {wishlistItems.map(item => (
          <div key={item._id} className="wishlist-card">
            <button 
              className="wishlist-remove-btn"
              onClick={() => removeFromWishlist(item._id)}
              title={t.remove}
            >
              ×
            </button>
            
            <Link to={`/craft/${item._id}`} className="wishlist-card-image">
              <img 
                src={item.images?.[0] || item.image || '/placeholder.jpg'} 
                alt={item.name || item.title}
              />
            </Link>
            
            <div className="wishlist-card-content">
              <Link to={`/craft/${item._id}`}>
                <h3>{item.name || item.title}</h3>
              </Link>
              
              {item.artisan && (
                <p className="wishlist-artisan">
                  by {item.artisan.name || item.artisan.businessName}
                </p>
              )}
              
              <div className="wishlist-price">
                ₹{item.price?.toLocaleString()}
              </div>
              
              <p className="wishlist-added-date">
                {t.addedOn} {formatDate(item.addedAt)}
              </p>
              
              <div className="wishlist-card-actions">
                <Link to={`/craft/${item._id}`} className="btn-view">
                  {t.viewProduct}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
