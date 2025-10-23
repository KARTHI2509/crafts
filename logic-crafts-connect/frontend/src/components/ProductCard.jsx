import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function ProductCard({ craft }){
  const { user } = useContext(AuthContext);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    if (user.role !== 'buyer') {
      alert('Only buyers can add items to cart');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/cart',
        { craft_id: craft.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    }
    setLoading(false);
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      alert('Please login to add items to wishlist');
      return;
    }
    if (user.role !== 'buyer') {
      alert('Only buyers can add items to wishlist');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(`http://localhost:5000/api/wishlist/${craft.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsInWishlist(false);
        alert('Removed from wishlist');
      } else {
        // Add to wishlist
        await axios.post(
          'http://localhost:5000/api/wishlist',
          { craft_id: craft.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsInWishlist(true);
        alert('Added to wishlist!');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert(error.response?.data?.message || 'Failed to update wishlist');
    }
    setLoading(false);
  };

  return (
    <article className="card product-card">
      <div className="card-image-wrapper">
        <img className="card-img" src={craft.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'} alt={craft.name} />
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
          <Link to={`/artisan/${craft.id}`} className="btn secondary">Details</Link>
        </div>
      </div>
    </article>
  );
}
