import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './InventoryAlerts.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const InventoryAlerts = ({ compact = false }) => {
  const langContext = useLanguage();
  const language = langContext?.language || 'en';
  const authContext = useAuth();
  const user = authContext?.user;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    lowStockThreshold: 5,
    outOfStockEnabled: true,
    lowStockEnabled: true
  });

  const texts = {
    en: {
      title: 'Inventory Alerts',
      outOfStock: 'Out of Stock',
      lowStock: 'Low Stock',
      items: 'items',
      viewAll: 'View All',
      updateStock: 'Update Stock',
      noAlerts: 'No inventory alerts',
      allGood: 'All products have sufficient stock',
      threshold: 'Low stock threshold',
      settings: 'Alert Settings',
      enableOutOfStock: 'Alert for out of stock',
      enableLowStock: 'Alert for low stock',
      save: 'Save Settings',
      remaining: 'remaining',
      product: 'Product',
      stock: 'Stock',
      action: 'Action',
      restock: 'Restock',
      loading: 'Loading...'
    },
    ta: {
      title: 'இருப்பு எச்சரிக்கைகள்',
      outOfStock: 'கையிருப்பில் இல்லை',
      lowStock: 'குறைந்த இருப்பு',
      items: 'பொருட்கள்',
      viewAll: 'அனைத்தும் பார்',
      updateStock: 'இருப்பை புதுப்பி',
      noAlerts: 'இருப்பு எச்சரிக்கைகள் இல்லை',
      allGood: 'அனைத்து பொருட்களுக்கும் போதுமான இருப்பு உள்ளது',
      threshold: 'குறைந்த இருப்பு வரம்பு',
      settings: 'எச்சரிக்கை அமைப்புகள்',
      enableOutOfStock: 'கையிருப்பில் இல்லாத எச்சரிக்கை',
      enableLowStock: 'குறைந்த இருப்பு எச்சரிக்கை',
      save: 'அமைப்புகளைச் சேமி',
      remaining: 'மீதமுள்ளது',
      product: 'பொருள்',
      stock: 'இருப்பு',
      action: 'செயல்',
      restock: 'மறு இருப்பு',
      loading: 'ஏற்றுகிறது...'
    }
  };

  const t = texts[language] || texts.en;

  useEffect(() => {
    fetchProducts();
    loadSettings();
  }, [user]);

  const loadSettings = () => {
    const saved = localStorage.getItem(`inventory_settings_${user?._id || user?.id}`);
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveSettings = () => {
    localStorage.setItem(`inventory_settings_${user?._id || user?.id}`, JSON.stringify(settings));
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try to fetch artisan's products
      const response = await axios.get(`${API_URL}/crafts/my-crafts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter products with low stock - ensure it's an array
      const allProducts = response.data?.crafts || response.data?.data?.crafts || response.data || [];
      setProducts(Array.isArray(allProducts) ? allProducts : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Set empty array on error instead of demo data in production
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getAlertProducts = () => {
    // Ensure products is an array
    const productList = Array.isArray(products) ? products : [];
    
    const outOfStock = productList.filter(p => (p.stock || 0) === 0 && settings.outOfStockEnabled);
    const lowStock = productList.filter(p => 
      (p.stock || 0) > 0 && 
      (p.stock || 0) <= settings.lowStockThreshold && 
      settings.lowStockEnabled
    );
    return { outOfStock, lowStock };
  };

  const { outOfStock, lowStock } = getAlertProducts();
  const totalAlerts = outOfStock.length + lowStock.length;

  if (loading) {
    return (
      <div className={`inventory-alerts ${compact ? 'compact' : ''}`}>
        <div className="loading-state">{t.loading}</div>
      </div>
    );
  }

  // Compact widget version
  if (compact) {
    return (
      <div className="inventory-alerts compact">
        <div className="alerts-header">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {t.title}
          </h3>
          {totalAlerts > 0 && (
            <span className="alert-badge">{totalAlerts}</span>
          )}
        </div>

        {totalAlerts === 0 ? (
          <div className="no-alerts-compact">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{t.allGood}</span>
          </div>
        ) : (
          <>
            <div className="alerts-summary">
              {outOfStock.length > 0 && (
                <div className="summary-item out-of-stock">
                  <span className="count">{outOfStock.length}</span>
                  <span className="label">{t.outOfStock}</span>
                </div>
              )}
              {lowStock.length > 0 && (
                <div className="summary-item low-stock">
                  <span className="count">{lowStock.length}</span>
                  <span className="label">{t.lowStock}</span>
                </div>
              )}
            </div>

            <div className="compact-list">
              {[...outOfStock, ...lowStock].slice(0, 3).map(product => (
                <div key={product._id} className="compact-item">
                  <span className="item-name">{product.name}</span>
                  <span className={`item-stock ${product.stock === 0 ? 'out' : 'low'}`}>
                    {product.stock === 0 ? t.outOfStock : `${product.stock} ${t.remaining}`}
                  </span>
                </div>
              ))}
            </div>

            <Link to="/artisan/inventory" className="view-all-link">
              {t.viewAll} →
            </Link>
          </>
        )}
      </div>
    );
  }

  // Full page version
  return (
    <div className="inventory-alerts full">
      <div className="alerts-header">
        <h2>{t.title}</h2>
        <div className="header-stats">
          {outOfStock.length > 0 && (
            <span className="stat out-of-stock">
              {outOfStock.length} {t.outOfStock}
            </span>
          )}
          {lowStock.length > 0 && (
            <span className="stat low-stock">
              {lowStock.length} {t.lowStock}
            </span>
          )}
        </div>
      </div>

      {/* Settings Section */}
      <div className="alert-settings">
        <h3>{t.settings}</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <label>{t.threshold}</label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 5 }))}
            />
          </div>
          <div className="setting-item checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.outOfStockEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, outOfStockEnabled: e.target.checked }))}
              />
              {t.enableOutOfStock}
            </label>
          </div>
          <div className="setting-item checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.lowStockEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, lowStockEnabled: e.target.checked }))}
              />
              {t.enableLowStock}
            </label>
          </div>
          <button className="btn-save-settings" onClick={saveSettings}>
            {t.save}
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      {totalAlerts === 0 ? (
        <div className="no-alerts">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h3>{t.noAlerts}</h3>
          <p>{t.allGood}</p>
        </div>
      ) : (
        <div className="alerts-table-container">
          {/* Out of Stock Section */}
          {outOfStock.length > 0 && (
            <div className="alert-section">
              <h3 className="section-title out-of-stock">
                <span className="dot"></span>
                {t.outOfStock} ({outOfStock.length})
              </h3>
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>{t.product}</th>
                    <th>{t.stock}</th>
                    <th>{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {outOfStock.map(product => (
                    <tr key={product._id}>
                      <td className="product-cell">
                        <img 
                          src={product.images?.[0] || '/placeholder.jpg'} 
                          alt={product.name}
                        />
                        <div className="product-info">
                          <span className="product-name">{product.name}</span>
                          <span className="product-price">₹{product.price?.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="stock-cell">
                        <span className="stock-badge out">{product.stock || 0}</span>
                      </td>
                      <td className="action-cell">
                        <Link to={`/artisan/edit-craft/${product._id}`} className="btn-restock">
                          {t.restock}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Low Stock Section */}
          {lowStock.length > 0 && (
            <div className="alert-section">
              <h3 className="section-title low-stock">
                <span className="dot"></span>
                {t.lowStock} ({lowStock.length})
              </h3>
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>{t.product}</th>
                    <th>{t.stock}</th>
                    <th>{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map(product => (
                    <tr key={product._id}>
                      <td className="product-cell">
                        <img 
                          src={product.images?.[0] || '/placeholder.jpg'} 
                          alt={product.name}
                        />
                        <div className="product-info">
                          <span className="product-name">{product.name}</span>
                          <span className="product-price">₹{product.price?.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="stock-cell">
                        <span className="stock-badge low">{product.stock}</span>
                      </td>
                      <td className="action-cell">
                        <Link to={`/artisan/edit-craft/${product._id}`} className="btn-restock">
                          {t.restock}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
