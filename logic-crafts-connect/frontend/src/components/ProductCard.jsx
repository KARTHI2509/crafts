import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { cartAPI, wishlistAPI } from '../services/api';

export default function ProductCard({ craft, onQuickView }){
  const { user } = useContext(AuthContext);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (user.role !== 'buyer') {
      toast.error('Only buyers can add items to cart');
      return;
    }

    setLoading(true);
    try {
      await cartAPI.add(craft.id, 1);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    }
    setLoading(false);
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    if (user.role !== 'buyer') {
      toast.error('Only buyers can add items to wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        await wishlistAPI.remove(craft.id);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        await wishlistAPI.add(craft.id);
        setIsInWishlist(true);
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(error.message || 'Failed to update wishlist');
    }
    setLoading(false);
  };

  return (
    <article className="card product-card">
      <div className="card-image-wrapper">
        <img 
          className="card-img" 
          src={craft.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={craft.name}
          loading="lazy"
        />
        {onQuickView && (
          <button 
            className="quick-view-btn"
            onClick={() => onQuickView(craft)}
            title="Quick View"
          >
            👁️ Quick View
          </button>
        )}
        {user && user.role === 'buyer' && (
          <button 
            className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
            onClick={handleToggleWishlist}
            disabled={loading}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      <div className="card-content">
        <div className="card-title">{craft.name}</div>
        <div className="card-price">{craft.price}</div>
        <div className="card-meta">{craft.craftType} • {craft.location}</div>
        <div className="card-actions">
          {user && user.role === 'buyer' && (
            <button 
              className="btn add-to-cart-btn" 
              onClick={handleAddToCart}
              disabled={loading}
            >
              🛒 Add to Cart
            </button>
          )}
          <Link to={`/craft/${craft.id}`} className="btn secondary">View Details</Link>
        </div>
      </div>
    </article>
  );
}
