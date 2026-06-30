import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { MapPin, Star, Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import "./ProductCard.css";
import { trackEvent } from "../utils/analytics";

export default function ProductCard({ craft }) {
  const { user } = useContext(AuthContext);

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const API_URL = "http://localhost:5000/api";
  const craftId = craft._id || craft.id;

  // Add product to cart
  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }
    if (user.role !== "buyer") {
      alert("Only buyers can add items to cart");
      return;
    }

    try {
      setCartLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/cart`,
        { craft_id: craftId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      trackEvent('cart_add', { productId: craftId, name: craft.name, price: craft.price });
      alert("Added to cart successfully!");
    } catch (error) {
      console.error("Cart Error:", error);
      alert(error.response?.data?.message || "Failed to add item to cart");
    } finally {
      setCartLoading(false);
    }
  };

  // Toggle wishlist
  const handleToggleWishlist = async () => {
    if (!user) {
      alert("Please login to manage wishlist");
      return;
    }
    if (user.role !== "buyer") {
      alert("Only buyers can manage wishlist");
      return;
    }

    try {
      setWishlistLoading(true);
      const token = localStorage.getItem("token");

      if (isInWishlist) {
        await axios.delete(`${API_URL}/wishlist/${craftId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsInWishlist(false);
      } else {
        await axios.post(
          `${API_URL}/wishlist`,
          { craft_id: craftId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        trackEvent('wishlist_add', { productId: craftId, name: craft.name, price: craft.price });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error("Wishlist Error:", error);
      alert(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  // Generate random rating for demo purposes since API might not have it yet
  const rating = (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1);
  const reviews = Math.floor(Math.random() * 120) + 10;

  return (
    <motion.article 
      className="product-card"
      whileHover={{ 
        y: -10, 
        scale: 1.01,
        rotateX: 1.5, 
        rotateY: -1.5,
        boxShadow: "var(--premium-shadow)"
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
    >
      {/* Product Image Section */}
      <div className="card-image-wrapper">
        <img
          className="card-img"
          src={craft.imageUrl || craft.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={craft.name}
          loading="lazy"
        />

        {/* Artisan Bubble */}
        <div className="artisan-bubble">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" 
            alt="Artisan" 
          />
          {craft.artisan || "Master Artisan"}
        </div>

        {/* Wishlist Floating Heart */}
        {(!user || user.role === "buyer") && (
          <motion.button
            className={`wishlist-fab ${isInWishlist ? "active" : ""}`}
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
          >
            <motion.div
              animate={isInWishlist ? { scale: [1, 1.5, 1.2, 1] } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 10 }}
            >
              <Heart size={18} color={isInWishlist ? "#ef4444" : "#666"} fill={isInWishlist ? "#ef4444" : "none"} />
            </motion.div>
          </motion.button>
        )}
      </div>

      {/* Product Details Section */}
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title" title={craft.name}>
            {craft.name.length > 25 ? craft.name.substring(0, 25) + '...' : craft.name}
          </h3>
          <div className="card-price">₹{craft.price?.toString().replace('₹', '')}</div>
        </div>

        {/* Ratings */}
        <div className="card-rating">
          <Star size={14} fill="#fbbf24" color="#fbbf24" />
          {rating} <span>({reviews})</span>
        </div>

        {/* Location Pin */}
        <div className="card-location">
          <MapPin size={14} />
          {craft.location || "India"}
        </div>

        {/* Action Buttons */}
        <div className="card-actions">
          {(!user || user.role === "buyer") ? (
            <>
              <Link 
                to={`/artisan/${craftId}`} 
                className="btn secondary hover-lift"
                onClick={() => trackEvent('product_click', { productId: craftId, name: craft.name, price: craft.price })}
              >
                View
              </Link>
              <motion.button
                className="btn btn-icon-slide"
                onClick={handleAddToCart}
                disabled={cartLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag size={18} />
                <span>{cartLoading ? "Adding..." : "Add to Cart"}</span>
              </motion.button>
            </>
          ) : (
            <Link 
              to={`/artisan/${craftId}`} 
              className="btn" 
              style={{width: '100%'}}
              onClick={() => trackEvent('product_click', { productId: craftId, name: craft.name, price: craft.price })}
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}