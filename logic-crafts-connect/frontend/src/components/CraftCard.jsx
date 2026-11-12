import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { wishlistAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * CraftCard Component - Displays a single craft item
 * Can be used in explore, home, wishlist, and recommendations
 */
const CraftCard = ({ 
  craft, 
  showAddToCart = true,
  showWishlist = true,
  onWishlistChange = null,
  variant = 'default' // 'default', 'compact', 'featured'
}) => {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(craft?.inWishlist || false);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    if (user.role !== 'buyer') {
      toast.error('Only buyers can add items to wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(craft.id || craft._id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(craft.id || craft._id);
        setIsWishlisted(true);
        toast.success('Added to wishlist!');
      }
      if (onWishlistChange) onWishlistChange();
    } catch (error) {
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }

    if (user.role !== 'buyer') {
      toast.error('Only buyers can add items to cart');
      return;
    }

    setAddingToCart(true);
    try {
      await cartAPI.add(craft.id || craft._id, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const craftId = craft?.id || craft?._id;
  const imageUrl = craft?.images?.[0] || craft?.image_url || craft?.image || '/placeholder-craft.jpg';
  const price = craft?.price || 0;
  const title = craft?.title || craft?.name || 'Unnamed Craft';
  const artisan = craft?.artisan?.name || craft?.artisan_name || 'Unknown Artisan';
  const category = craft?.category || 'General';
  const rating = craft?.rating || craft?.average_rating || 0;
  const reviewCount = craft?.review_count || 0;

  if (variant === 'compact') {
    return (
      <Link to={`/craft/${craftId}`} className="craft-card-compact">
        <div className="compact-image">
          <img src={imageUrl} alt={title} loading="lazy" />
        </div>
        <div className="compact-info">
          <h4>{title}</h4>
          <p className="compact-price">₹{price.toLocaleString()}</p>
        </div>
        <style>{compactStyles}</style>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={`/craft/${craftId}`} className="craft-card-featured">
        <div className="featured-image">
          <img src={imageUrl} alt={title} loading="lazy" />
          {showWishlist && user?.role === 'buyer' && (
            <button 
              className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              disabled={loading}
            >
              {isWishlisted ? '❤️' : '🤍'}
            </button>
          )}
          <span className="featured-badge">Featured</span>
        </div>
        <div className="featured-content">
          <span className="featured-category">{category}</span>
          <h3>{title}</h3>
          <p className="featured-artisan">by {artisan}</p>
          <div className="featured-footer">
            <span className="featured-price">₹{price.toLocaleString()}</span>
            {showAddToCart && user?.role === 'buyer' && (
              <button 
                className="add-cart-btn"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? '...' : '🛒 Add'}
              </button>
            )}
          </div>
        </div>
        <style>{featuredStyles}</style>
      </Link>
    );
  }

  // Default variant
  return (
    <div className="craft-card">
      <Link to={`/craft/${craftId}`} className="craft-card-link">
        <div className="craft-image">
          <img src={imageUrl} alt={title} loading="lazy" />
          {showWishlist && user?.role === 'buyer' && (
            <button 
              className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              disabled={loading}
            >
              {loading ? '...' : (isWishlisted ? '❤️' : '🤍')}
            </button>
          )}
        </div>
        <div className="craft-info">
          <span className="craft-category">{category}</span>
          <h3 className="craft-title">{title}</h3>
          <p className="craft-artisan">by {artisan}</p>
          {rating > 0 && (
            <div className="craft-rating">
              <span className="stars">{'⭐'.repeat(Math.round(rating))}</span>
              <span className="rating-text">{rating.toFixed(1)} ({reviewCount})</span>
            </div>
          )}
          <div className="craft-footer">
            <span className="craft-price">₹{price.toLocaleString()}</span>
            {showAddToCart && user?.role === 'buyer' && (
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            )}
          </div>
        </div>
      </Link>
      <style>{defaultStyles}</style>
    </div>
  );
};

const defaultStyles = `
  .craft-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }
  
  .craft-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .craft-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }
  
  .craft-image {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    background: #f5f5f5;
  }
  
  .craft-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .craft-card:hover .craft-image img {
    transform: scale(1.05);
  }
  
  .wishlist-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .wishlist-btn:hover {
    transform: scale(1.1);
    background: white;
  }
  
  .wishlist-btn.active {
    animation: heartBeat 0.3s ease;
  }
  
  @keyframes heartBeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  
  .craft-info {
    padding: 16px;
  }
  
  .craft-category {
    display: inline-block;
    background: var(--bg-cream, #faf8f4);
    color: var(--muted, #6b5d52);
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  
  .craft-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text, #1f2937);
    margin: 0 0 4px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .craft-artisan {
    font-size: 13px;
    color: var(--muted, #6b7280);
    margin: 0 0 8px;
  }
  
  .craft-rating {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
  }
  
  .craft-rating .stars {
    font-size: 12px;
  }
  
  .craft-rating .rating-text {
    font-size: 12px;
    color: var(--muted, #6b7280);
  }
  
  .craft-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }
  
  .craft-price {
    font-size: 18px;
    font-weight: 700;
    color: var(--primary, #8b5a2b);
  }
  
  .add-to-cart-btn {
    background: var(--primary, #8b5a2b);
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .add-to-cart-btn:hover:not(:disabled) {
    background: var(--primary-light, #a67c52);
  }
  
  .add-to-cart-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const compactStyles = `
  .craft-card-compact {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: white;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.2s;
  }
  
  .craft-card-compact:hover {
    background: var(--bg-cream, #faf8f4);
  }
  
  .compact-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .compact-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .compact-info h4 {
    font-size: 14px;
    color: var(--text, #1f2937);
    margin: 0 0 4px;
    font-weight: 500;
  }
  
  .compact-price {
    font-size: 15px;
    font-weight: 600;
    color: var(--primary, #8b5a2b);
    margin: 0;
  }
`;

const featuredStyles = `
  .craft-card-featured {
    position: relative;
    display: block;
    text-decoration: none;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .craft-card-featured:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
  
  .featured-image {
    position: relative;
    aspect-ratio: 16/10;
    overflow: hidden;
  }
  
  .featured-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .craft-card-featured:hover .featured-image img {
    transform: scale(1.08);
  }
  
  .featured-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: linear-gradient(135deg, #f59e0b, #ea580c);
    color: white;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .featured-content {
    padding: 20px;
  }
  
  .featured-category {
    display: inline-block;
    background: var(--bg-cream, #faf8f4);
    color: var(--muted, #6b5d52);
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  
  .featured-content h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text, #1f2937);
    margin: 0 0 6px;
  }
  
  .featured-artisan {
    font-size: 14px;
    color: var(--muted, #6b7280);
    margin: 0 0 16px;
  }
  
  .featured-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .featured-price {
    font-size: 22px;
    font-weight: 700;
    color: var(--primary, #8b5a2b);
  }
  
  .add-cart-btn {
    background: var(--primary, #8b5a2b);
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .add-cart-btn:hover:not(:disabled) {
    background: var(--primary-light, #a67c52);
    transform: scale(1.05);
  }
`;

export default CraftCard;
