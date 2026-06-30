import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, MapPin, Heart, ShoppingBag, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import ProductCard from "../components/ProductCard";
import "./ArtisanProfile.css";

export default function ArtisanProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [craft, setCraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Accordion state
  const [activeAccordion, setActiveAccordion] = useState('description');

  const API_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchCraftDetails();
  }, [id]);

  const fetchCraftDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/crafts/${id}`);
      setCraft(res.data?.data?.craft || res.data?.craft);
    } catch (error) {
      console.error("Error fetching craft:", error);
      // Fallback to mock data if API doesn't support fetching by ID yet or returns 404
      setCraft({
        id,
        name: "Handwoven Silk Saree",
        price: 4500,
        craftType: "Textile & Weaving",
        location: "Varanasi, India",
        description: "An authentic handwoven Banarasi silk saree, meticulously crafted by master weavers. This piece takes over 15 days to complete and features intricate zari work.",
        artisan: {
          name: "Rajesh Kumar",
          bio: "Master weaver specializing in traditional Banarasi silk. My family has been weaving for three generations.",
          experience: "15 years"
        },
        images: [
          "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1588693895995-1f92c63f03b5?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&h=800&fit=crop"
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) return alert("Please login to add items to cart");
    if (user.role !== "buyer") return alert("Only buyers can add items to cart");

    try {
      setCartLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/cart`,
        { craft_id: id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add item to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  if (loading) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Loading...</div>;
  if (!craft) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Craft not found.</div>;

  const images = craft.images || [craft.imageUrl || "https://via.placeholder.com/800x800"];
  const artisanName = craft.artisan?.name || craft.artisan_name || "Master Artisan";

  return (
    <div className="product-detail-page">
      <div className="container">
        
        {/* Floating Back Button */}
        <button className="floating-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back to Explore
        </button>

        <div className="product-split">
          
          {/* LEFT: Image Gallery */}
          <div className="product-gallery">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeImage}
                className="main-image-container"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img src={images[activeImage]} alt={craft.name} className="main-image" />
              </motion.div>
            </AnimatePresence>

            <div className="thumbnail-strip">
              {images.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt="thumbnail" 
                  className={`thumbnail ${activeImage === idx ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Product Details */}
          <div className="product-info">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="product-title">{craft.name}</h1>
              
              <div className="product-meta-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                  <Star fill="#fbbf24" size={16} /> 4.8 (120 reviews)
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={16} /> {craft.location || "India"}
                </span>
                <span>•</span>
                <span>{craft.craftType || craft.category || "Handmade"}</span>
              </div>

              <div className="product-price">₹{craft.price}</div>

              {/* Sticky Cart Box */}
              <div className="sticky-cart-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#15803d', fontWeight: 600 }}>
                  <ShieldCheck size={20} /> Authenticity Guaranteed
                </div>
                
                <div className="cart-actions">
                  <button 
                    className="btn shine-effect" 
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                  >
                    <ShoppingBag size={20} /> {cartLoading ? "Adding..." : "Add to Cart"}
                  </button>
                  <button className="wishlist-circle-btn">
                    <Heart size={24} color="#666" />
                  </button>
                </div>
              </div>

              {/* Expandable Accordion */}
              <div className="accordion">
                
                {/* Description */}
                <div className="accordion-item">
                  <div className="accordion-header" onClick={() => toggleAccordion('description')}>
                    <span>Product Description</span>
                    {activeAccordion === 'description' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  <AnimatePresence>
                    {activeAccordion === 'description' && (
                      <motion.div 
                        className="accordion-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="accordion-inner">
                          {craft.description || "A beautiful handcrafted product made with love and precision."}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Artisan Story */}
                <div className="accordion-item">
                  <div className="accordion-header" onClick={() => toggleAccordion('artisan')}>
                    <span>Meet the Artisan</span>
                    {activeAccordion === 'artisan' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  <AnimatePresence>
                    {activeAccordion === 'artisan' && (
                      <motion.div 
                        className="accordion-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="accordion-inner">
                          <div className="artisan-mini-profile">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Avatar" className="artisan-mini-avatar" />
                            <div>
                              <strong style={{ color: 'var(--color-dark)', display: 'block' }}>{artisanName}</strong>
                              <span style={{ fontSize: '0.9rem' }}>{craft.artisan?.experience || "10+ years"} Experience</span>
                            </div>
                          </div>
                          <p>{craft.artisan?.bio || "A dedicated craftsman preserving traditional heritage."}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Shipping */}
                <div className="accordion-item">
                  <div className="accordion-header" onClick={() => toggleAccordion('shipping')}>
                    <span>Shipping & Returns</span>
                    {activeAccordion === 'shipping' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  <AnimatePresence>
                    {activeAccordion === 'shipping' && (
                      <motion.div 
                        className="accordion-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="accordion-inner">
                          Ships directly from the artisan's workshop in {craft.location || "India"}. Please allow 5-7 business days for standard delivery. Returns accepted within 7 days of delivery for damaged items.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

            </motion.div>
          </div>
        </div>

        {/* Similar Products (Mocked for UI) */}
        <div className="similar-products">
          <h2>You May Also Like</h2>
          <div className="carousel-wrapper">
             <div className="carousel-track">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="carousel-slide">
                    <ProductCard craft={{
                      id: `sim-${i}`,
                      name: "Traditional Handcrafted Item",
                      price: "2500",
                      craftType: craft.craftType,
                      location: craft.location,
                      imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop"
                    }} />
                 </div>
               ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}