import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { craftAPI, cartAPI, wishlistAPI, reviewAPI } from '../services/api';
import { PageLoader } from '../components/Loader';
import { EmptyReviews } from '../components/EmptyStates';
import ProductCard from '../components/ProductCard';
import SocialShare from '../components/SocialShare';
import { AddToCompareButton } from '../components/ProductCompare';
import { WishlistButton } from '../components/Wishlist';
import { useRecentlyViewed } from '../components/RecentlyViewed';
import { InlineStockNotify } from '../components/StockNotification';

const CraftDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  const [craft, setCraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedCrafts, setRelatedCrafts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchCraft();
    fetchReviews();
    fetchRelatedCrafts();
  }, [id]);

  const fetchCraft = async () => {
    try {
      setLoading(true);
      const response = await craftAPI.getById(id);
      const craftData = response.data?.craft || response.data?.data?.craft || response.data;
      setCraft(craftData);
      
      // Add to recently viewed
      if (craftData) {
        addToRecentlyViewed({
          id: craftData.id,
          title: craftData.title,
          image: craftData.images?.[0] || '/placeholder.jpg',
          price: craftData.price,
          artisan_name: craftData.artisan_name
        });
      }
    } catch (error) {
      console.error('Error fetching craft:', error);
      toast.error('Failed to load craft details');
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedCrafts = async () => {
    try {
      setRelatedLoading(true);
      const response = await craftAPI.getRelated(id);
      const crafts = response.data?.crafts || response.data?.data?.crafts || [];
      setRelatedCrafts(crafts.slice(0, 4)); // Max 4 related crafts
    } catch (error) {
      console.error('Error fetching related crafts:', error);
    } finally {
      setRelatedLoading(false);
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = craft?.name || 'Check out this craft';
    const text = `${title} - ₹${craft?.price} | Handmade with love`;
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      copy: url
    };
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link');
      }
    } else if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await reviewAPI.getForCraft(id);
      setReviews(response.data?.reviews || response.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

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
      await cartAPI.add(id, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    if (user.role !== 'buyer') {
      toast.error('Only buyers can add items to wishlist');
      return;
    }

    setAddingToWishlist(true);
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(id);
        setIsWishlisted(true);
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewAPI.create({
        craft_id: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      toast.success('Review submitted successfully!');
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading craft details..." />;
  }

  if (!craft) {
    return (
      <div className="container" style={{ padding: '48px 16px', textAlign: 'center' }}>
        <h2>Craft not found</h2>
        <Link to="/explore" className="btn">Browse All Crafts</Link>
      </div>
    );
  }

  const images = craft.images || [craft.image_url] || [];
  const price = craft.price || 0;
  const artisan = craft.artisan || {};

  return (
    <div className="craft-detail-page">
      <div className="craft-detail-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/explore">Explore</Link>
          <span>/</span>
          <span className="current">{craft.name || craft.title}</span>
        </nav>

        <div className="craft-detail-grid">
          {/* Image Gallery */}
          <div className="image-section">
            <div className="main-image">
              <img 
                src={images[selectedImage] || 'https://via.placeholder.com/600x400?text=No+Image'} 
                alt={craft.name || craft.title}
              />
              {craft.status === 'approved' && (
                <span className="verified-badge">✓ Verified</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="thumbnail-gallery">
                {images.map((img, index) => (
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
          <div className="info-section">
            <span className="category-badge">{craft.category || craft.craft_type || 'Handmade'}</span>
            <h1 className="craft-title">{craft.name || craft.title}</h1>
            
            <div className="artisan-info">
              <Link to={`/artisan/${artisan.id || craft.artisan_id}`} className="artisan-link">
                <div className="artisan-avatar">
                  {artisan.profile_image ? (
                    <img src={artisan.profile_image} alt={artisan.name} loading="lazy" />
                  ) : (
                    <span>{(artisan.name || 'A').charAt(0)}</span>
                  )}
                </div>
                <div className="artisan-details">
                  <span className="artisan-name">{artisan.name || craft.artisan_name || 'Unknown Artisan'}</span>
                  <span className="artisan-location">📍 {craft.location || artisan.location || 'India'}</span>
                </div>
              </Link>
            </div>

            {/* Rating */}
            {(craft.average_rating || craft.rating) && (
              <div className="rating-display">
                <span className="stars">{'⭐'.repeat(Math.round(craft.average_rating || craft.rating))}</span>
                <span className="rating-text">
                  {(craft.average_rating || craft.rating).toFixed(1)} 
                  ({craft.review_count || reviews.length} reviews)
                </span>
              </div>
            )}

            <div className="price-section">
              <span className="price">₹{price.toLocaleString()}</span>
              {craft.original_price && craft.original_price > price && (
                <span className="original-price">₹{craft.original_price.toLocaleString()}</span>
              )}
            </div>

            <p className="description">{craft.description || 'No description available.'}</p>

            {/* Quantity Selector */}
            {user?.role === 'buyer' && (
              <div className="quantity-section">
                <label>Quantity:</label>
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
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={handleToggleWishlist}
                    disabled={addingToWishlist}
                  >
                    {isWishlisted ? '❤️' : '🤍'}
                  </button>
                  <AddToCompareButton 
                    product={{
                      id: craft.id,
                      name: craft.name,
                      price: `₹${craft.price}`,
                      imageUrl: craft.images?.[0] || craft.image_url,
                      artisan: craft.artisan_name,
                      craftType: craft.craft_type,
                      location: craft.location,
                      verified: craft.status === 'approved'
                    }} 
                    compact 
                  />
                </>
              ) : !user ? (
                <Link to="/login" className="login-prompt-btn">
                  Login to Purchase
                </Link>
              ) : null}
            </div>

            {/* Share Buttons */}
            <div className="share-section">
              <span className="share-label">Share:</span>
              <div className="share-buttons">
                <button onClick={() => handleShare('whatsapp')} className="share-btn whatsapp" title="Share on WhatsApp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </button>
                <button onClick={() => handleShare('facebook')} className="share-btn facebook" title="Share on Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button onClick={() => handleShare('twitter')} className="share-btn twitter" title="Share on X/Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                <button onClick={() => handleShare('copy')} className="share-btn copy" title="Copy Link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                </button>
                {navigator.share && (
                  <button onClick={() => handleShare('native')} className="share-btn native" title="More options">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="product-details">
              <h3>Product Details</h3>
              <ul>
                {craft.materials && <li><strong>Materials:</strong> {craft.materials}</li>}
                {craft.dimensions && <li><strong>Dimensions:</strong> {craft.dimensions}</li>}
                {craft.weight && <li><strong>Weight:</strong> {craft.weight}</li>}
                {craft.craft_type && <li><strong>Craft Type:</strong> {craft.craft_type}</li>}
                <li><strong>Handmade:</strong> Yes</li>
                <li><strong>Shipping:</strong> Available across India</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Story Section */}
        {craft.story && (
          <div className="story-section">
            <h2>📖 The Story Behind This Craft</h2>
            <p>{craft.story}</p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h2>⭐ Customer Reviews</h2>
            {user?.role === 'buyer' && (
              <button 
                className="write-review-btn"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? 'Cancel' : '✏️ Write a Review'}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <div className="rating-input">
                <label>Your Rating:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${newReview.rating >= star ? 'active' : ''}`}
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div className="comment-input">
                <label>Your Review:</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this craft..."
                  rows={4}
                  required
                />
              </div>
              <button type="submit" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <EmptyReviews />
          ) : (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={review.id || index} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span className="reviewer-name">{review.user?.name || 'Anonymous'}</span>
                        <span className="review-date">
                          {new Date(review.created_at || review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="review-rating">
                      {'⭐'.repeat(review.rating)}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Crafts Section */}
        {relatedCrafts.length > 0 && (
          <div className="related-section">
            <h2>🎨 You May Also Like</h2>
            <div className="related-grid">
              {relatedLoading ? (
                <p>Loading recommendations...</p>
              ) : (
                relatedCrafts.map((relatedCraft) => (
                  <ProductCard 
                    key={relatedCraft.id} 
                    craft={{
                      id: relatedCraft.id,
                      name: relatedCraft.name,
                      craftType: relatedCraft.craft_type || relatedCraft.category,
                      price: `₹${relatedCraft.price}`,
                      location: relatedCraft.location || relatedCraft.artisan_location,
                      imageUrl: relatedCraft.image_url || relatedCraft.images?.[0],
                      artisan: relatedCraft.artisan_name,
                      verified: relatedCraft.status === 'approved'
                    }} 
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .craft-detail-page {
          min-height: calc(100vh - 160px);
          background: var(--bg-cream, #faf8f4);
          padding: 24px 16px;
        }

        .craft-detail-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .breadcrumb a {
          color: var(--muted, #6b7280);
          text-decoration: none;
        }

        .breadcrumb a:hover {
          color: var(--primary, #8b5a2b);
        }

        .breadcrumb span {
          color: var(--muted, #9ca3af);
        }

        .breadcrumb .current {
          color: var(--text, #1f2937);
          font-weight: 500;
        }

        .craft-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: var(--shadow, 0 4px 12px rgba(89,67,53,0.08));
        }

        .image-section {
          position: sticky;
          top: 100px;
          align-self: start;
        }

        .main-image {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          background: #f5f5f5;
          margin-bottom: 16px;
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .verified-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: var(--success, #22c55e);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .thumbnail-gallery {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
          background: none;
        }

        .thumbnail.active {
          border-color: var(--primary, #8b5a2b);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .category-badge {
          display: inline-block;
          background: var(--bg-cream, #faf8f4);
          color: var(--muted, #6b5d52);
          font-size: 12px;
          padding: 6px 14px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: fit-content;
        }

        .craft-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--text, #1f2937);
          margin: 0;
          line-height: 1.2;
        }

        .artisan-info {
          margin: 8px 0;
        }

        .artisan-link {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .artisan-link:hover {
          background: var(--bg-cream, #faf8f4);
        }

        .artisan-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary, #8b5a2b), var(--accent, #d4a574));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
          overflow: hidden;
        }

        .artisan-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .artisan-details {
          display: flex;
          flex-direction: column;
        }

        .artisan-name {
          font-weight: 600;
          color: var(--text, #1f2937);
        }

        .artisan-location {
          font-size: 13px;
          color: var(--muted, #6b7280);
        }

        .rating-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rating-display .stars {
          font-size: 16px;
        }

        .rating-display .rating-text {
          font-size: 14px;
          color: var(--muted, #6b7280);
        }

        .price-section {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .price {
          font-size: 36px;
          font-weight: 700;
          color: var(--primary, #8b5a2b);
        }

        .original-price {
          font-size: 20px;
          color: var(--muted, #9ca3af);
          text-decoration: line-through;
        }

        .description {
          font-size: 15px;
          line-height: 1.7;
          color: var(--text, #374151);
        }

        .quantity-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .quantity-section label {
          font-weight: 500;
          color: var(--text, #1f2937);
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .quantity-controls button {
          width: 40px;
          height: 40px;
          border: none;
          background: var(--bg-cream, #faf8f4);
          font-size: 18px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .quantity-controls button:hover {
          background: #e5e7eb;
        }

        .quantity-controls span {
          width: 50px;
          text-align: center;
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .add-to-cart-btn {
          flex: 1;
          padding: 16px 32px;
          background: var(--primary, #8b5a2b);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background: var(--primary-light, #a67c52);
          transform: translateY(-2px);
        }

        .add-to-cart-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .wishlist-btn {
          width: 56px;
          height: 56px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 10px;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .wishlist-btn:hover {
          border-color: var(--primary, #8b5a2b);
        }

        .wishlist-btn.active {
          background: #fef2f2;
          border-color: #ef4444;
        }

        .login-prompt-btn {
          flex: 1;
          padding: 16px 32px;
          background: var(--primary, #8b5a2b);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          transition: all 0.2s;
        }

        .login-prompt-btn:hover {
          background: var(--primary-light, #a67c52);
        }

        .product-details {
          background: var(--bg-cream, #faf8f4);
          padding: 20px;
          border-radius: 12px;
          margin-top: 16px;
        }

        .product-details h3 {
          margin: 0 0 12px;
          font-size: 16px;
          color: var(--text, #1f2937);
        }

        .product-details ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .product-details li {
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
          color: var(--text, #374151);
        }

        .product-details li:last-child {
          border-bottom: none;
        }

        .product-details strong {
          color: var(--text, #1f2937);
        }

        .story-section {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-top: 32px;
          box-shadow: var(--shadow, 0 4px 12px rgba(89,67,53,0.08));
        }

        .story-section h2 {
          margin: 0 0 16px;
          font-size: 24px;
          color: var(--text, #1f2937);
        }

        .story-section p {
          font-size: 15px;
          line-height: 1.8;
          color: var(--text, #374151);
        }

        .reviews-section {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-top: 32px;
          box-shadow: var(--shadow, 0 4px 12px rgba(89,67,53,0.08));
        }

        .reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .reviews-header h2 {
          margin: 0;
          font-size: 24px;
          color: var(--text, #1f2937);
        }

        .write-review-btn {
          padding: 10px 20px;
          background: var(--primary, #8b5a2b);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .write-review-btn:hover {
          background: var(--primary-light, #a67c52);
        }

        .review-form {
          background: var(--bg-cream, #faf8f4);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .rating-input {
          margin-bottom: 16px;
        }

        .rating-input label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .star-rating {
          display: flex;
          gap: 4px;
        }

        .star-rating .star {
          font-size: 24px;
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.3;
          transition: opacity 0.2s;
        }

        .star-rating .star.active {
          opacity: 1;
        }

        .comment-input {
          margin-bottom: 16px;
        }

        .comment-input label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .comment-input textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
          box-sizing: border-box;
        }

        .review-form button[type="submit"] {
          padding: 12px 24px;
          background: var(--primary, #8b5a2b);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .review-form button[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-card {
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reviewer-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary, #8b5a2b), var(--accent, #d4a574));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }

        .reviewer-name {
          font-weight: 500;
          color: var(--text, #1f2937);
          display: block;
        }

        .review-date {
          font-size: 12px;
          color: var(--muted, #9ca3af);
        }

        .review-rating {
          font-size: 14px;
        }

        .review-comment {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text, #374151);
        }

        /* Share Section */
        .share-section {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 0;
          border-top: 1px solid var(--border, #e5e7eb);
        }

        .share-label {
          font-size: 14px;
          color: var(--muted, #6b7280);
          font-weight: 500;
        }

        .share-buttons {
          display: flex;
          gap: 8px;
        }

        .share-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }

        .share-btn:hover {
          transform: scale(1.1);
          opacity: 0.9;
        }

        .share-btn.whatsapp {
          background: #25D366;
          color: white;
        }

        .share-btn.facebook {
          background: #1877F2;
          color: white;
        }

        .share-btn.twitter {
          background: #000;
          color: white;
        }

        .share-btn.copy {
          background: var(--primary, #8b5a2b);
          color: white;
        }

        .share-btn.native {
          background: #6b7280;
          color: white;
        }

        /* Related Crafts Section */
        .related-section {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 2px solid var(--border, #e5e7eb);
        }

        .related-section h2 {
          font-size: 24px;
          font-weight: 600;
          color: var(--text, #1f2937);
          margin-bottom: 24px;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .craft-detail-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 20px;
          }

          .image-section {
            position: static;
          }

          .craft-title {
            font-size: 24px;
          }

          .price {
            font-size: 28px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .wishlist-btn {
            width: 100%;
          }

          .reviews-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .related-grid {
            grid-template-columns: 1fr;
          }

          .share-section {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default CraftDetail;
