import React, { createContext, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './RecentlyViewed.css';

// Recently Viewed Context
const RecentlyViewedContext = createContext();

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    return {
      recentItems: [],
      addToRecentlyViewed: () => {},
      clearRecentlyViewed: () => {},
      getRecentCount: () => 0
    };
  }
  return context;
};

export const RecentlyViewedProvider = ({ children }) => {
  const [recentItems, setRecentItems] = useState([]);
  const MAX_ITEMS = 10;

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recently_viewed');
    if (saved) {
      try {
        setRecentItems(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recently viewed:', e);
      }
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    localStorage.setItem('recently_viewed', JSON.stringify(recentItems));
  }, [recentItems]);

  const addToRecentlyViewed = (product) => {
    if (!product || (!product.id && !product._id)) return;

    const productId = product.id || product._id;

    setRecentItems(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.id !== productId);
      
      // Add to beginning
      const newItems = [{
        id: productId,
        name: product.name || product.title,
        price: product.price,
        image: product.images?.[0] || product.image,
        artisan: product.artisan?.name || product.artisan?.businessName || product.artisan_name,
        viewedAt: new Date().toISOString()
      }, ...filtered];

      // Keep only MAX_ITEMS
      return newItems.slice(0, MAX_ITEMS);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentItems([]);
  };

  const getRecentCount = () => recentItems.length;

  return (
    <RecentlyViewedContext.Provider value={{
      recentItems,
      addToRecentlyViewed,
      clearRecentlyViewed,
      getRecentCount
    }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

// Recently Viewed Section Component
export const RecentlyViewedSection = ({ maxItems = 6 }) => {
  const { recentItems, clearRecentlyViewed } = useRecentlyViewed();
  const langContext = useLanguage();
  const language = langContext?.language || 'en';

  const texts = {
    en: {
      title: 'Recently Viewed',
      clear: 'Clear All',
      empty: 'No recently viewed items',
      viewProduct: 'View'
    },
    ta: {
      title: 'சமீபத்தில் பார்த்தவை',
      clear: 'அனைத்தையும் அழி',
      empty: 'சமீபத்தில் பார்த்த பொருட்கள் இல்லை',
      viewProduct: 'காண்க'
    }
  };

  const t = texts[language] || texts.en;

  if (recentItems.length === 0) {
    return null; // Don't show section if empty
  }

  const displayItems = recentItems.slice(0, maxItems);

  return (
    <section className="recently-viewed-section">
      <div className="section-header">
        <h2>{t.title}</h2>
        <button className="clear-btn" onClick={clearRecentlyViewed}>
          {t.clear}
        </button>
      </div>

      <div className="recently-viewed-grid">
        {displayItems.map(item => (
          <Link 
            key={item.id} 
            to={`/craft/${item.id}`} 
            className="recent-item-card"
          >
            <div className="recent-item-image">
              <img 
                src={item.image || '/placeholder.jpg'} 
                alt={item.name}
                loading="lazy"
              />
            </div>
            <div className="recent-item-info">
              <h4>{item.name}</h4>
              {item.artisan && <p className="artisan-name">{item.artisan}</p>}
              <p className="price">₹{item.price?.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// Compact Recently Viewed Widget (for sidebar)
export const RecentlyViewedWidget = ({ maxItems = 4 }) => {
  const { recentItems } = useRecentlyViewed();
  const langContext = useLanguage();
  const language = langContext?.language || 'en';

  const texts = {
    en: {
      title: 'Recently Viewed',
      viewAll: 'View All'
    },
    ta: {
      title: 'சமீபத்தில் பார்த்தவை',
      viewAll: 'அனைத்தும் பார்'
    }
  };

  const t = texts[language] || texts.en;

  if (recentItems.length === 0) {
    return null;
  }

  const displayItems = recentItems.slice(0, maxItems);

  return (
    <div className="recently-viewed-widget">
      <h3>{t.title}</h3>
      <div className="widget-items">
        {displayItems.map(item => (
          <Link 
            key={item.id} 
            to={`/craft/${item.id}`} 
            className="widget-item"
          >
            <img 
              src={item.image || '/placeholder.jpg'} 
              alt={item.name}
            />
            <div className="widget-item-info">
              <span className="name">{item.name}</span>
              <span className="price">₹{item.price?.toLocaleString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedSection;
