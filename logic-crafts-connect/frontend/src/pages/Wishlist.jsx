import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import axios from 'axios';
import './Wishlist.css';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const text = {
    en: {
      wishlist: 'My Wishlist',
      empty: 'Your wishlist is empty',
      addFavorites: 'Start adding your favorite crafts',
      explore: 'Explore Crafts',
      addToCart: 'Add to Cart',
      remove: 'Remove',
      moveAllToCart: 'Move All to Cart',
      clearWishlist: 'Clear Wishlist',
      confirmClear: 'Are you sure you want to clear your wishlist?',
      items: 'items',
      by: 'by',
      outOfStock: 'Out of Stock',
      loading: 'Loading wishlist...',
      addedToCart: 'Added to cart!',
      movedToCart: 'items moved to cart',
      removed: 'Removed from wishlist'
    },
    te: {
      wishlist: 'నా విష్‌లిస్ట్',
      empty: 'మీ విష్‌లిస్ట్ ఖాళీగా ఉంది',
      addFavorites: 'మీకు ఇష్టమైన క్రాఫ్ట్‌లను జోడించడం ప్రారంభించండి',
      explore: 'క్రాఫ్ట్‌లను అన్వేషించండి',
      addToCart: 'కార్ట్‌కు జోడించండి',
      remove: 'తొలగించు',
      moveAllToCart: 'అన్నింటినీ కార్ట్‌కు తరలించండి',
      clearWishlist: 'విష్‌లిస్ట్ క్లియర్ చేయండి',
      confirmClear: 'మీరు మీ విష్‌లిస్ట్‌ను క్లియర్ చేయాలనుకుంటున్నారా?',
      items: 'వస్తువులు',
      by: 'ద్వారా',
      outOfStock: 'స్టాక్ లో లేదు',
      loading: 'విష్‌లిస్ట్ లోడ్ చేస్తోంది...',
      addedToCart: 'కార్ట్‌కు జోడించబడింది!',
      movedToCart: 'వస్తువులు కార్ట్‌కు తరలించబడ్డాయి',
      removed: 'విష్‌లిస్ట్ నుండి తొలగించబడింది'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data.data.wishlist || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setLoading(false);
    }
  };

  const addToCart = async (craftId) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/cart',
        { craft_id: craftId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t.addedToCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
    setUpdating(false);
  };

  const removeFromWishlist = async (craftId) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/wishlist/${craftId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchWishlist();
      alert(t.removed);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item');
    }
    setUpdating(false);
  };

  const moveAllToCart = async () => {
    if (wishlist.length === 0) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const craftIds = wishlist.map(item => item.craft_id);
      
      const response = await axios.post(
        'http://localhost:5000/api/wishlist/move-to-cart',
        { craft_ids: craftIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchWishlist();
      alert(`${response.data.data.moved_count} ${t.movedToCart}`);
    } catch (error) {
      console.error('Error moving to cart:', error);
      alert('Failed to move items to cart');
    }
    setUpdating(false);
  };

  const clearWishlist = async () => {
    if (!window.confirm(t.confirmClear)) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/wishlist/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      alert('Failed to clear wishlist');
    }
    setUpdating(false);
  };

  if (!user || user.role !== 'buyer') {
    return (
      <div className="wishlist-page">
        <div className="message">Please login as a buyer to view wishlist</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="loading">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <div className="header-left">
            <h1>❤️ {t.wishlist}</h1>
            <span className="item-count">{wishlist.length} {t.items}</span>
          </div>
          
          {wishlist.length > 0 && (
            <div className="header-actions">
              <button 
                onClick={moveAllToCart} 
                className="move-all-btn"
                disabled={updating}
              >
                🛒 {t.moveAllToCart}
              </button>
              <button 
                onClick={clearWishlist} 
                className="clear-btn"
                disabled={updating}
              >
                🗑️ {t.clearWishlist}
              </button>
            </div>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">❤️</div>
            <h2>{t.empty}</h2>
            <p>{t.addFavorites}</p>
            <button onClick={() => navigate('/explore')} className="explore-btn">
              {t.explore} →
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <div key={item.id} className="wishlist-card">
                <button
                  onClick={() => removeFromWishlist(item.craft_id)}
                  className="remove-heart-btn"
                  disabled={updating}
                  title={t.remove}
                >
                  ❤️
                </button>

                <div 
                  className="card-image"
                  onClick={() => navigate(`/craft/${item.craft_id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={item.images?.[0] || '/placeholder.jpg'} 
                    alt={item.title}
                  />
                  {item.stock === 0 && (
                    <div className="out-of-stock-badge">{t.outOfStock}</div>
                  )}
                </div>

                <div className="card-content">
                  <h3 onClick={() => navigate(`/craft/${item.craft_id}`)} style={{ cursor: 'pointer' }}>
                    {item.title}
                  </h3>
                  
                  <p className="artisan-info">
                    {t.by} <span className="artisan-name">{item.artisan_name}</span>
                  </p>

                  <div className="card-footer">
                    <div className="price-section">
                      <span className="price">₹{item.price}</span>
                      {item.rating && (
                        <span className="rating">⭐ {item.rating}</span>
                      )}
                    </div>

                    <button 
                      onClick={() => addToCart(item.craft_id)}
                      className="add-to-cart-btn"
                      disabled={updating || item.stock === 0}
                    >
                      {t.addToCart}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
