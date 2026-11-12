import React, { useState, useContext, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import './ProductCompare.css';

// Compare Context
const CompareContext = createContext();

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);
  const MAX_COMPARE = 3;

  const addToCompare = (product) => {
    if (compareList.length >= MAX_COMPARE) {
      toast.error(`Maximum ${MAX_COMPARE} products for comparison`);
      return false;
    }
    if (compareList.find(p => p.id === product.id)) {
      toast.error('Already in comparison');
      return false;
    }
    setCompareList([...compareList, product]);
    toast.success('Added to comparison');
    return true;
  };

  const removeFromCompare = (productId) => {
    setCompareList(compareList.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (productId) => {
    return compareList.some(p => p.id === productId);
  };

  return (
    <CompareContext.Provider value={{ 
      compareList, 
      addToCompare, 
      removeFromCompare, 
      clearCompare, 
      isInCompare,
      maxCompare: MAX_COMPARE 
    }}>
      {children}
    </CompareContext.Provider>
  );
};

// Floating Compare Bar
export const CompareBar = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  const text = {
    en: {
      compare: 'Compare',
      products: 'products',
      clear: 'Clear',
      compareNow: 'Compare Now'
    },
    te: {
      compare: 'పోల్చండి',
      products: 'ఉత్పత్తులు',
      clear: 'క్లియర్',
      compareNow: 'ఇప్పుడు పోల్చండి'
    }
  };

  const t = text[language] || text.en;

  if (compareList.length === 0) return null;

  return (
    <div className="compare-bar">
      <div className="compare-bar-content">
        <div className="compare-items">
          {compareList.map((product) => (
            <div key={product.id} className="compare-item">
              <img 
                src={product.imageUrl || 'https://via.placeholder.com/40'} 
                alt={product.name} 
              />
              <button 
                className="remove-compare"
                onClick={() => removeFromCompare(product.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="compare-actions">
          <span className="compare-count">
            {compareList.length} {t.products}
          </span>
          <button className="btn-clear" onClick={clearCompare}>
            {t.clear}
          </button>
          <button 
            className="btn-compare"
            onClick={() => navigate('/compare')}
            disabled={compareList.length < 2}
          >
            {t.compareNow}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add to Compare Button
export const AddToCompareButton = ({ product, compact = false }) => {
  const { language } = useContext(LanguageContext);
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  
  const inCompare = isInCompare(product.id);

  const text = {
    en: { add: 'Compare', remove: 'Remove' },
    te: { add: 'పోల్చండి', remove: 'తొలగించు' }
  };

  const t = text[language] || text.en;

  const handleClick = () => {
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <button 
      className={`add-compare-btn ${inCompare ? 'active' : ''} ${compact ? 'compact' : ''}`}
      onClick={handleClick}
      title={inCompare ? t.remove : t.add}
    >
      <span className="compare-icon">⚖️</span>
      {!compact && <span>{inCompare ? t.remove : t.add}</span>}
    </button>
  );
};

// Compare Page Component
const ProductCompare = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  const text = {
    en: {
      title: 'Compare Products',
      empty: 'No products to compare',
      addProducts: 'Add at least 2 products to compare',
      exploreCrafts: 'Explore Crafts',
      price: 'Price',
      artisan: 'Artisan',
      category: 'Category',
      location: 'Location',
      verified: 'Verified',
      yes: 'Yes',
      no: 'No',
      addToCart: 'Add to Cart',
      viewDetails: 'View Details',
      remove: 'Remove',
      clearAll: 'Clear All'
    },
    te: {
      title: 'ఉత్పత్తులను పోల్చండి',
      empty: 'పోల్చడానికి ఉత్పత్తులు లేవు',
      addProducts: 'పోల్చడానికి కనీసం 2 ఉత్పత్తులను జోడించండి',
      exploreCrafts: 'హస్తకళలను అన్వేషించండి',
      price: 'ధర',
      artisan: 'కళాకారుడు',
      category: 'వర్గం',
      location: 'స్థానం',
      verified: 'ధృవీకరించబడింది',
      yes: 'అవును',
      no: 'లేదు',
      addToCart: 'కార్ట్‌కు జోడించండి',
      viewDetails: 'వివరాలు చూడండి',
      remove: 'తొలగించు',
      clearAll: 'అన్నీ క్లియర్ చేయండి'
    }
  };

  const t = text[language] || text.en;

  if (compareList.length < 2) {
    return (
      <div className="compare-page empty">
        <div className="empty-compare">
          <span className="empty-icon">⚖️</span>
          <h2>{t.empty}</h2>
          <p>{t.addProducts}</p>
          <button className="btn" onClick={() => navigate('/explore')}>
            {t.exploreCrafts}
          </button>
        </div>
      </div>
    );
  }

  const compareFields = [
    { key: 'price', label: t.price },
    { key: 'artisan', label: t.artisan },
    { key: 'craftType', label: t.category },
    { key: 'location', label: t.location },
    { key: 'verified', label: t.verified, format: (val) => val ? t.yes : t.no }
  ];

  return (
    <div className="compare-page">
      <div className="container">
        <div className="compare-header">
          <h1>{t.title}</h1>
          <button className="btn secondary" onClick={clearCompare}>
            {t.clearAll}
          </button>
        </div>

        <div className="compare-table">
          {/* Product Images Row */}
          <div className="compare-row images">
            <div className="row-label"></div>
            {compareList.map((product) => (
              <div key={product.id} className="product-cell">
                <img 
                  src={product.imageUrl || 'https://via.placeholder.com/200'} 
                  alt={product.name}
                  className="product-image"
                />
                <h3 className="product-name">{product.name}</h3>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCompare(product.id)}
                >
                  {t.remove}
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Fields */}
          {compareFields.map((field) => (
            <div key={field.key} className="compare-row">
              <div className="row-label">{field.label}</div>
              {compareList.map((product) => (
                <div key={product.id} className="product-cell">
                  {field.format 
                    ? field.format(product[field.key])
                    : product[field.key] || '-'
                  }
                </div>
              ))}
            </div>
          ))}

          {/* Actions Row */}
          <div className="compare-row actions">
            <div className="row-label"></div>
            {compareList.map((product) => (
              <div key={product.id} className="product-cell">
                <button 
                  className="btn"
                  onClick={() => navigate(`/craft/${product.id}`)}
                >
                  {t.viewDetails}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCompare;
