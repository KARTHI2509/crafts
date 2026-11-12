import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { cartAPI, wishlistAPI } from '../services/api';

const QuickViewModal = ({ craft, isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  if (!isOpen || !craft) return null;

  const images = craft.images || [craft.image_url || craft.imageUrl] || [];
  const price = typeof craft.price === 'string' 
    ? parseFloat(craft.price.replace('₹', '').replace(',', '')) 
    : craft.price || 0;

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (user.role !== 'buyer') {
      toast.error('Only buyers can add items to cart');
      return;
    }

    setAddingToCart(true);
    try {
      await cartAPI.add(craft.id, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Please login to save items');
      navigate('/login');
      return;
    }

    setAddingToWishlist(true);
    try {
      await wishlistAPI.add(craft.id);
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error(error.message || 'Failed to add to wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="quickview-overlay" onClick={handleOverlayClick}>
      <div className="quickview-modal">
        <button className="quickview-close" onClick={onClose}>✕</button>
        
        <div className="quickview-content">
          {/* Image Gallery */}
          <div className="quickview-gallery">
            <div className="quickview-main-image">
              <img 
                src={images[selectedImage] || 'https://via.placeholder.com/400x400?text=No+Image'} 
                alt={craft.name || craft.title}
              />
              {craft.verified && (
                <span className="verified-badge">✓ Verified</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="quickview-thumbnails">
                {images.slice(0, 4).map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`View ${index + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="quickview-info">
            <span className="category-tag">{craft.craftType || craft.category || craft.craft_type || 'Handmade'}</span>
            <h2 className="product-title">{craft.name || craft.title}</h2>
            
            <div className="artisan-row">
              <span className="artisan-name">By {craft.artisan || craft.artisan_name || 'Local Artisan'}</span>
              <span className="location">📍 {craft.location || craft.artisan_location || 'India'}</span>
            </div>

            {craft.rating && (
              <div className="rating-row">
                <span className="stars">{'⭐'.repeat(Math.round(craft.rating))}</span>
                <span className="rating-text">{craft.rating.toFixed(1)} ({craft.review_count || 0} reviews)</span>
              </div>
            )}

            <div className="price-row">
              <span className="price">₹{price.toLocaleString()}</span>
              {craft.original_price && craft.original_price > price && (
                <span className="original-price">₹{craft.original_price.toLocaleString()}</span>
              )}
            </div>

            <p className="description">
              {craft.description?.substring(0, 150) || 'Beautiful handcrafted product made with love and tradition.'}
              {craft.description?.length > 150 && '...'}
            </p>

            {/* Quantity Selector */}
            {user?.role === 'buyer' && (
              <div className="quantity-row">
                <span className="quantity-label">Quantity:</span>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              {user?.role === 'buyer' ? (
                <>
                  <button 
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                  </button>
                  <button 
                    className="wishlist-btn"
                    onClick={handleAddToWishlist}
                    disabled={addingToWishlist}
                  >
                    {addingToWishlist ? '...' : '❤️'}
                  </button>
                </>
              ) : !user ? (
                <Link to="/login" className="login-btn" onClick={onClose}>
                  Login to Purchase
                </Link>
              ) : null}
            </div>

            <Link 
              to={`/craft/${craft.id}`} 
              className="view-details-link"
              onClick={onClose}
            >
              View Full Details →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .quickview-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .quickview-modal {
          background: white;
          border-radius: 16px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .quickview-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.1);
          color: #374151;
          font-size: 18px;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
        }

        .quickview-close:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        .quickview-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }

        .quickview-gallery {
          padding: 24px;
          background: #f9fafb;
        }

        .quickview-main-image {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }

        .quickview-main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .verified-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #22c55e;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .quickview-thumbnails {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .quickview-thumbnails .thumbnail {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          border: 2px solid transparent;
          padding: 0;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .quickview-thumbnails .thumbnail.active {
          border-color: #8b5a2b;
        }

        .quickview-thumbnails .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .quickview-info {
          padding: 32px;
          overflow-y: auto;
          max-height: 90vh;
        }

        .category-tag {
          display: inline-block;
          background: rgba(139, 90, 43, 0.1);
          color: #8b5a2b;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .product-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 12px;
          line-height: 1.3;
        }

        .artisan-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #6b7280;
        }

        .artisan-name {
          font-weight: 500;
          color: #374151;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .rating-text {
          font-size: 14px;
          color: #6b7280;
        }

        .price-row {
          margin-bottom: 16px;
        }

        .price {
          font-size: 28px;
          font-weight: 700;
          color: #8b5a2b;
        }

        .original-price {
          font-size: 18px;
          color: #9ca3af;
          text-decoration: line-through;
          margin-left: 12px;
        }

        .description {
          font-size: 14px;
          line-height: 1.6;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .quantity-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .quantity-label {
          font-weight: 500;
          color: #374151;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          overflow: hidden;
        }

        .quantity-controls button {
          width: 36px;
          height: 36px;
          border: none;
          background: #f3f4f6;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .quantity-controls button:hover {
          background: #e5e7eb;
        }

        .quantity-controls span {
          width: 48px;
          text-align: center;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .add-to-cart-btn {
          flex: 1;
          padding: 14px 24px;
          background: linear-gradient(135deg, #8b5a2b, #a0522d);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 90, 43, 0.4);
        }

        .add-to-cart-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .wishlist-btn {
          width: 52px;
          height: 52px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .wishlist-btn:hover:not(:disabled) {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .login-btn {
          flex: 1;
          padding: 14px 24px;
          background: #1f2937;
          color: white;
          border-radius: 8px;
          text-decoration: none;
          text-align: center;
          font-weight: 600;
        }

        .view-details-link {
          display: block;
          text-align: center;
          color: #8b5a2b;
          font-weight: 500;
          text-decoration: none;
        }

        .view-details-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .quickview-content {
            grid-template-columns: 1fr;
          }

          .quickview-gallery {
            padding: 16px;
          }

          .quickview-info {
            padding: 20px;
          }

          .product-title {
            font-size: 20px;
          }

          .price {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default QuickViewModal;
