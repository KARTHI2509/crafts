import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import SEO from "../components/SEO";
import { trackEvent } from "../utils/analytics";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  Handshake, BookOpen, ShieldCheck, MessageCircle, Heart, Star, 
  Leaf, Truck, RefreshCw, Award, Play, CheckCircle2, ChevronRight,
  TrendingUp, Sparkles, Clock, Globe
} from "lucide-react";
import "./Home.css";

// Smooth Counting Number Component
function AnimatedCounter({ value, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = parseInt(value.replace(/\D/g, ""), 10);
          if (isNaN(end)) return;
          const incrementTime = 30;
          const totalSteps = (duration * 1000) / incrementTime;
          const step = end / totalSteps;

          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              clearInterval(timer);
              setCount(end);
            } else {
              setCount(Math.floor(start));
            }
          }, incrementTime);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  const suffix = value.replace(/[0-9]/g, "");
  return <strong ref={ref}>{count}{suffix}</strong>;
}

export default function Home() {
  const { language } = useContext(LanguageContext);

  const [featuredCrafts, setFeaturedCrafts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 32, seconds: 45 });

  // Seeds mock data if server is down
  const getMockCrafts = (category, count = 4) => {
    const artisans = ["Aarav Sharma", "Mir Yasir", "Priya Kulkarni", "Lakshmi Devi", "Devendra Singh"];
    const locations = ["Rajasthan", "Kashmir", "Varanasi", "Bengal", "Gujarat"];
    
    return Array.from({ length: count }).map((_, i) => ({
      id: `mock-${category}-${i}`,
      name: `${category} Masterpiece ${i + 1}`,
      craftType: category,
      price: Math.floor(Math.random() * 6000) + 1200,
      location: locations[i % locations.length],
      imageUrl: [
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop"
      ][i % 4],
      artisan: artisans[i % artisans.length],
      verified: i % 2 === 0,
    }));
  };

  useEffect(() => {
    trackEvent('page_visit', { page: 'home' });
    fetchHomeData();
    
    // Seed recently viewed in local storage if empty
    let viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    if (viewed.length === 0) {
      viewed = getMockCrafts("Pottery", 3);
      localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
    }
    setRecentlyViewed(viewed);

    // Seed recommended items
    setRecommended(getMockCrafts("Woodwork", 3));

    // Sticky CTA check
    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);

    // Countdown Timer for Limited Editions
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    // Auto-scroll testimonials
    const testimonialTimer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % 3);
    }, 5000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(timer);
      clearInterval(testimonialTimer);
    };
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/crafts?page=1&limit=8");
      const craftsData = res.data?.data?.crafts || [];
      
      const formatted = craftsData.map(c => ({
        id: c.id || c._id,
        name: c.name,
        craftType: c.craft_type || c.category || "Handmade",
        price: c.price || 0,
        location: c.location || "India",
        imageUrl: c.image_url || c.images?.[0] || "https://via.placeholder.com/400x300",
        artisan: c.artisan_name || "Unknown Artisan",
        verified: c.status === "approved"
      }));

      if (formatted.length > 0) {
        setFeaturedCrafts(formatted.slice(0, 4));
        setNewArrivals(formatted.slice(4, 8));
        setBestSellers(formatted.slice(2, 6));
      } else {
        setFeaturedCrafts(getMockCrafts("Ceramics", 4));
        setNewArrivals(getMockCrafts("Textiles", 4));
        setBestSellers(getMockCrafts("Metalwork", 4));
      }
    } catch (e) {
      console.warn("Using mock home data:", e);
      setFeaturedCrafts(getMockCrafts("Ceramics", 4));
      setNewArrivals(getMockCrafts("Textiles", 4));
      setBestSellers(getMockCrafts("Metalwork", 4));
    } finally {
      setLoading(false);
    }
  };

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 120]);
  const y2 = useTransform(scrollY, [0, 800], [0, -120]);

  // Testimonial Data
  const testimonials = [
    { quote: "This platform changed my life! I now sell my pottery directly to customers in Delhi and Bengaluru.", name: "Priya Sharma", role: "Master Potter, Jaipur", rating: 5, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
    { quote: "The quality of the handwoven sarees I bought is unmatched. Pure authenticity and fast delivery.", name: "Rajesh Kumar", role: "Art Collector, Mumbai", rating: 5, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" },
    { quote: "Storytelling helps me connect with buyers who appreciate the hours I put into wood carving.", name: "Lakshmi Devi", role: "Sandalwood Carver, Mysore", rating: 5, avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" }
  ];

  return (
    <div className="home-page">
      <SEO title="Direct Artisan Marketplace" />
      
      {/* Global Infinite Shipping Banner */}
      <div className="global-shipping-banner">
        <div className="marquee-container">
          <div className="marquee-content">
            <span>⚡ FREE GLOBAL SHIPPING ON ORDERS ABOVE ₹5000</span>
            <span>★ 100% HANDMADE GUARANTEE</span>
            <span>✦ DIRECT ARTISAN PAYMENTS</span>
            <span>🛡️ SECURE 30-DAY BUYER PROTECTION</span>
            <span>⚡ FREE GLOBAL SHIPPING ON ORDERS ABOVE ₹5000</span>
            <span>★ 100% HANDMADE GUARANTEE</span>
            <span>✦ DIRECT ARTISAN PAYMENTS</span>
            <span>🛡️ SECURE 30-DAY BUYER PROTECTION</span>
          </div>
        </div>
      </div>

      {/* Floating Sticky CTA */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div 
            className="sticky-cta-container glass-premium"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="sticky-cta-inner">
              <span className="text-small">Finding unique handmade crafts?</span>
              <Link to="/explore">
                <button className="btn hover-lift shine-effect">Explore All Collections</button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-bg-blobs">
          <div className="animated-blob" style={{ background: "rgba(212, 163, 115, 0.2)", width: "500px", height: "500px", top: "-150px", left: "-150px" }}></div>
          <div className="animated-blob" style={{ background: "rgba(181, 101, 29, 0.15)", width: "600px", height: "600px", bottom: "-200px", right: "-150px", animationDelay: "-6s" }}></div>
        </div>

        <div className="container hero-inner">
          <motion.div 
            className="hero-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="trust-badge badge-pulse">
              <ShieldCheck size={16} /> <span>100% Genuine Artisan Crafts</span>
            </div>

            <h1 className="text-hero gradient-text">
              {language === 'te' ? "స్థానిక కళాకారులను ప్రపంచంతో కనెక్ట్ చేయండి" : "Connect Local Artisans with the World"}
            </h1>
            <p className="hero-subtitle text-body">
              {language === 'te' 
                ? "మధ్యవర్తులు లేకుండా నేరుగా స్థానిక హస్తకళాకారుల నుండి ప్రామాణికమైన ఉత్పత్తులను కొనుగోలు చేయండి."
                : "A direct-to-artisan platform showcasing heritage craft techniques, rich cultural stories, and authentic handmade goods."
              }
            </p>

            {/* Trust Counters */}
            <div className="hero-stats">
              <div className="stat">
                <AnimatedCounter value="500+" />
                <span>Artisans Vetted</span>
              </div>
              <div className="divider"></div>
              <div className="stat">
                <AnimatedCounter value="3200+" />
                <span>Products Live</span>
              </div>
              <div className="divider"></div>
              <div className="stat">
                <AnimatedCounter value="98.4%" />
                <span>Trust Score</span>
              </div>
            </div>

            <div className="hero-cta">
              <Link to="/explore">
                <button className="btn hover-lift shine-effect">Explore Collection</button>
              </Link>
              <Link to="/register">
                <button className="btn secondary hover-lift">Sell Your Craft</button>
              </Link>
            </div>
          </motion.div>

          <div className="hero-right">
            <div className="hero-collage">
              <motion.img
                style={{ y: y1 }}
                className="collage-img img-main premium-shadow"
                src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=800&fit=crop"
                alt="Pottery Artisan at work"
              />
              <motion.img
                style={{ y: y2 }}
                className="collage-img img-sub premium-shadow"
                src="https://images.unsplash.com/photo-1588693895995-1f92c63f03b5?w=400&h=500&fit=crop"
                alt="Intricate weaving patterns"
              />
              <motion.div 
                className="floating-card premium-shadow glass-premium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                <div className="artisan-avatar"></div>
                <div>
                  <strong>Aarav Sharma</strong>
                  <span className="text-small" style={{ color: "var(--color-primary)" }}>★ Master Potter, Jaipur</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Wave Divider */}
      <div className="section-divider">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,64L120,58.7C240,53,480,43,720,48C960,53,1200,75,1320,85.3L1440,96L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z" fill="var(--color-bg-secondary)"></path>
        </svg>
      </div>

      {/* Trending Crafts Slider */}
      <section className="featured-crafts-section section-spacing" style={{ background: "var(--color-bg-secondary)", position: "relative", overflow: "hidden" }}>
        <div className="section-bg-animation pottery-theme">
          <div className="clay-shape shape-1"></div>
          <div className="clay-shape shape-2"></div>
        </div>
        <div className="container">
          <div className="section-header-flex">
            <div>
              <div className="section-label"><TrendingUp size={16} /> <span>CURATED COLLECTION</span></div>
              <h2 className="text-section-title">Trending Masterpieces</h2>
            </div>
            <Link to="/explore" className="view-all-link">
              <span>View All Collections</span> <ChevronRight size={18} />
            </Link>
          </div>

          <div className="carousel-wrapper">
            <div className="carousel-track">
              {featuredCrafts.map((craft, i) => (
                <motion.div 
                  key={craft.id} 
                  className="carousel-slide"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <ProductCard craft={craft} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Limited Edition Countdown Spotlight */}
      <section className="spotlight-section section-spacing" style={{ position: "relative", overflow: "hidden" }}>
        <div className="section-bg-animation wood-theme">
          <div className="wood-particle p-1"></div>
          <div className="wood-particle p-2"></div>
          <div className="wood-particle p-3"></div>
        </div>
        <div className="container">
          <div className="spotlight-card glass-premium">
            <div className="spotlight-badge"><Sparkles size={16} /> <span>LIMITED EDITION</span></div>
            <div className="spotlight-grid">
              <div className="spotlight-img-wrapper">
                <img src="https://images.unsplash.com/photo-1515555230216-82228b4eaa4e?w=800&h=600&fit=crop" alt="Handcrafted Sandalwood Ganesha" />
                <span className="limited-count-label">ONLY 2 PIECES REMAINING</span>
              </div>
              <div className="spotlight-content">
                <h3 className="text-card-title">Sandalwood Carved Ganesha Idol</h3>
                <p className="text-body" style={{ margin: "1rem 0 2rem", color: "var(--color-text-muted)" }}>
                  Carved out of single-block vintage Sandalwood. This collectors' edition takes 90 days of intricate hand-chiselling by master craftsman Devendra Singh of Mysore, Karnataka. Accompanied by a signed Certificate of Authenticity.
                </p>

                {/* Countdown */}
                <div className="countdown-box">
                  <div className="countdown-title"><Clock size={16} /> <span>OFFER CLOSES IN</span></div>
                  <div className="timer-values">
                    <div className="time-unit"><strong>{String(countdown.hours).padStart(2, '0')}</strong><span>Hrs</span></div>
                    <div className="time-unit"><strong>{String(countdown.minutes).padStart(2, '0')}</strong><span>Mins</span></div>
                    <div className="time-unit"><strong>{String(countdown.seconds).padStart(2, '0')}</strong><span>Secs</span></div>
                  </div>
                </div>

                <div className="spotlight-actions" style={{ marginTop: "2rem" }}>
                  <Link to="/explore">
                    <button className="btn hover-lift shine-effect">Purchase Now — ₹18,500</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals & Best Sellers */}
      <section className="new-arrivals-section section-spacing" style={{ background: "var(--color-bg-secondary)", position: "relative", overflow: "hidden" }}>
        <div className="section-bg-animation fabric-theme">
          <div className="thread-line line-1"></div>
          <div className="thread-line line-2"></div>
        </div>
        <div className="container">
          <div className="grid-2-col">
            
            {/* New Arrivals Block */}
            <div className="product-block">
              <h3 className="block-title">✨ New Arrivals</h3>
              <div className="product-vertical-list">
                {newArrivals.map((craft, i) => (
                  <motion.div 
                    key={craft.id} 
                    className="horizontal-product-card glass hover-lift"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <img src={craft.imageUrl} alt={craft.name} />
                    <div className="horizontal-info">
                      <h4>{craft.name}</h4>
                      <p className="text-small">{craft.craftType} • By {craft.artisan}</p>
                      <strong>₹{craft.price}</strong>
                    </div>
                    <Link to={`/artisan/${craft.id}`} className="block-view-arrow">
                      <ChevronRight />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Best Sellers Block */}
            <div className="product-block">
              <h3 className="block-title">🔥 Best Sellers</h3>
              <div className="product-vertical-list">
                {bestSellers.map((craft, i) => (
                  <motion.div 
                    key={craft.id} 
                    className="horizontal-product-card glass hover-lift"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <img src={craft.imageUrl} alt={craft.name} />
                    <div className="horizontal-info">
                      <h4>{craft.name}</h4>
                      <p className="text-small">{craft.craftType} • By {craft.artisan}</p>
                      <strong>₹{craft.price}</strong>
                    </div>
                    <Link to={`/artisan/${craft.id}`} className="block-view-arrow">
                      <ChevronRight />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Meet the Makers / Authentic Storytelling */}
      <section className="makers-section section-spacing" style={{ position: "relative", overflow: "hidden" }}>
        <div className="section-bg-animation story-theme">
          <div className="story-glow glow-1"></div>
          <div className="story-glow glow-2"></div>
        </div>
        <div className="container">
          <div className="story-card glass-premium premium-shadow">
            <div className="story-image">
              <img src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&h=700&fit=crop" alt="Artisan weaving threads" />
            </div>
            <div className="story-content">
              <div className="section-label"><BookOpen size={16} /> <span>OUR HERITAGE</span></div>
              <h2 className="text-section-title">Preserving Centuries of Craftsmanship</h2>
              <p className="text-body" style={{ color: "var(--color-text-muted)", margin: "1.5rem 0" }}>
                Crafts are not items of convenience—they are histories told in clay, silk, wood, and brass. We connect you directly to multi-generational artisans, ensuring fair value pricing, local economic sustainability, and authentic origin records.
              </p>
              <div className="authenticity-check-list">
                <div className="check-item"><CheckCircle2 size={18} /> <span>Admin-verified artisan identities</span></div>
                <div className="check-item"><CheckCircle2 size={18} /> <span>Geographic indication certification checks</span></div>
                <div className="check-item"><CheckCircle2 size={18} /> <span>Raw material source validation</span></div>
              </div>
              <Link to="/explore">
                <button className="btn hover-lift" style={{ marginTop: "2rem" }}>Discover Their Stories</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended & Recently Viewed */}
      <section className="recommendations-section section-spacing" style={{ background: "var(--color-bg-secondary)", position: "relative", overflow: "hidden" }}>
        <div className="section-bg-animation sparkle-theme">
          <div className="sparkle-dot sp-1"></div>
          <div className="sparkle-dot sp-2"></div>
          <div className="sparkle-dot sp-3"></div>
          <div className="sparkle-dot sp-4"></div>
        </div>
        <div className="container">
          
          {recentlyViewed.length > 0 && (
            <div style={{ marginBottom: "4rem" }}>
              <h3 className="block-title">🕒 Recently Viewed</h3>
              <div className="recommendations-grid">
                {recentlyViewed.slice(0, 3).map((craft, i) => (
                  <motion.div key={craft.id} className="small-product-item glass hover-lift" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}>
                    <img src={craft.imageUrl} alt={craft.name} />
                    <div className="small-product-details">
                      <h4>{craft.name}</h4>
                      <strong>₹{craft.price}</strong>
                      <Link to={`/artisan/${craft.id}`} className="text-small" style={{ color: "var(--color-primary)", display: "block", marginTop: "4px" }}>View details</Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="block-title">🎯 Recommended For You</h3>
            <div className="recommendations-grid">
              {recommended.slice(0, 3).map((craft, i) => (
                <motion.div key={craft.id} className="small-product-item glass hover-lift" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}>
                  <img src={craft.imageUrl} alt={craft.name} />
                  <div className="small-product-details">
                    <h4>{craft.name}</h4>
                    <strong>₹{craft.price}</strong>
                    <Link to={`/artisan/${craft.id}`} className="text-small" style={{ color: "var(--color-primary)", display: "block", marginTop: "4px" }}>View details</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Featured Artisans Grid */}
      <section className="featured-artisans section-spacing" style={{ position: "relative", overflow: "hidden" }}>
        <div className="section-bg-animation artisan-theme">
          <div className="artisan-ring ring-1"></div>
          <div className="artisan-ring ring-2"></div>
        </div>
        <div className="container">
          <div className="text-center" style={{ marginBottom: "3rem" }}>
            <div className="section-label" style={{ justifyContent: "center" }}><Award size={16} /> <span>MEET THE MASTERS</span></div>
            <h2 className="text-section-title">Featured Artisans</h2>
            <p className="text-body" style={{ color: "var(--color-text-muted)", marginTop: "8px" }}>Every creation has a name and face behind it. Connect directly.</p>
          </div>

          <div className="artisan-showcase-grid">
            {[
              { name: "Ram Swaroop", craft: "Blue Pottery", location: "Jaipur, Rajasthan", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", badge: "Vetted Master", bio: "Blue pottery expert with 25+ years carrying the heritage of royal Jaipur glazes." },
              { name: "Shabana Begum", craft: "Zardozi Embroidery", location: "Varanasi, UP", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200", badge: "National Awardee", bio: "Traditional Zari embroiderer weaving pure silver wire patterns into bridal silk." },
              { name: "Manjunath Dev", craft: "Stone Carving", location: "Mysore, Karnataka", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", badge: "Heritage Expert", bio: "Soapstone carving specialist crafting divine temple miniature figurines." }
            ].map((artisan, i) => (
              <motion.div 
                key={artisan.name}
                className="artisan-showcase-card glass hover-lift"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="artisan-avatar-large">
                  <img src={artisan.img} alt={artisan.name} />
                  <span className="artisan-badge-tag">{artisan.badge}</span>
                </div>
                <div className="artisan-card-info">
                  <h3>{artisan.name}</h3>
                  <span className="artisan-craft-type">{artisan.craft}</span>
                  <p className="text-small" style={{ margin: "12px 0" }}>{artisan.bio}</p>
                  <div className="artisan-card-footer">
                    <span>{artisan.location}</span>
                    <Link to="/explore">
                      <button className="btn secondary hover-lift" style={{ padding: "6px 12px", fontSize: "12px" }}>Visit Shop</button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Timeline: How CraftHub Works */}
      <section className="timeline-section section-spacing" style={{ background: "var(--color-bg-secondary)", position: "relative", overflow: "hidden" }}>
        <div className="section-bg-animation timeline-theme">
          <div className="drift-dot dot-1"></div>
          <div className="drift-dot dot-2"></div>
          <div className="drift-dot dot-3"></div>
        </div>
        <div className="container">
          <h2 className="text-section-title text-center" style={{ marginBottom: "4rem" }}>How CraftHub Works</h2>
          <div className="timeline-grid">
            {[
              { icon: <Handshake size={32} />, title: "1. Fair Direct Trade", desc: "No middle agents. You connect directly with certified artisans, ensuring 100% of purchase value flows back to rural craft hubs." },
              { icon: <ShieldCheck size={32} />, title: "2. Rigorous Authentication", desc: "Every item undergoes rigorous review by heritage specialists to guarantee genuine materials and technique legitimacy." },
              { icon: <Truck size={32} />, title: "3. Insured Global Shipping", desc: "Crafts are securely packaged with eco-friendly boxes and shipped globally with full tracking and transit damage insurance." }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                className="timeline-step glass hover-lift"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="timeline-icon">{step.icon}</div>
                <h3 className="text-card-title" style={{ marginTop: "1rem" }}>{step.title}</h3>
                <p className="text-small" style={{ marginTop: "8px" }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Handmade & Sustainability */}
      <section className="sustainability-section section-spacing" style={{ position: "relative", overflow: "hidden" }}>
        <div className="section-bg-animation leaf-theme">
          <div className="leaf-particle lp-1"></div>
          <div className="leaf-particle lp-2"></div>
          <div className="leaf-particle lp-3"></div>
        </div>
        <div className="container">
          <div className="grid-2-col" style={{ alignItems: "center" }}>
            <div className="sustainability-left">
              <div className="section-label"><Leaf size={16} /> <span>100% SUSTAINABLE</span></div>
              <h2 className="text-section-title">Kind to People, Kind to Planet</h2>
              <p className="text-body" style={{ color: "var(--color-text-muted)", margin: "1.5rem 0" }}>
                Unlike fast mass manufacturing, artisan craft has an exceptionally low carbon footprint. Our products are made using locally sourced organic materials, natural vegetable dyes, and zero-electricity manual tools.
              </p>
              
              <div className="sus-features-grid">
                <div className="sus-feature">
                  <div className="sus-icon"><Globe size={20} /></div>
                  <div>
                    <h4>Eco-conscious Sourcing</h4>
                    <p className="text-small">Reclaimed timber, natural organic cotton, and earth clays.</p>
                  </div>
                </div>
                <div className="sus-feature">
                  <div className="sus-icon"><Award size={20} /></div>
                  <div>
                    <h4>Carbon Neutral Shipments</h4>
                    <p className="text-small">Every shipment is offset with local forestry investments.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sustainability-right">
              <div className="premium-glass-card glass-premium">
                <div className="guarantee-header">
                  <Award size={28} color="var(--color-secondary)" />
                  <h4>Our Handmade Guarantee</h4>
                </div>
                <ul className="guarantee-list">
                  <li>✔ Zero assembly-line machinery used</li>
                  <li>✔ Fair living wages paid directly</li>
                  <li>✔ Eco-certified raw materials</li>
                  <li>✔ Free returns if authenticity is disproven</li>
                </ul>
                <div className="guarantee-footer">
                  <span className="signature-badge">CraftHub Certified Seal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video & Testimonial Carousel */}
      <section className="testimonials-section section-spacing" style={{ background: "var(--color-bg-secondary)", position: "relative", overflow: "hidden" }}>
        <div className="section-bg-animation quote-theme">
          <div className="quote-glow qg-1"></div>
          <div className="quote-glow qg-2"></div>
        </div>
        <div className="container">
          <div className="grid-2-col" style={{ alignItems: "center" }}>
            
            {/* Testimonials */}
            <div>
              <h2 className="text-section-title" style={{ marginBottom: "2rem" }}>Loved by Artisans & Buyers</h2>
              
              <div className="testimonial-slider-box">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="active-testimonial glass"
                  >
                    <div className="stars-row">
                      {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                        <Star key={i} size={16} fill="var(--color-primary)" color="var(--color-primary)" />
                      ))}
                    </div>
                    <p className="quote-text">"{testimonials[activeTestimonial].quote}"</p>
                    <div className="author-row">
                      <img src={testimonials[activeTestimonial].avatar} alt={testimonials[activeTestimonial].name} className="avatar-img" />
                      <div>
                        <h4>{testimonials[activeTestimonial].name}</h4>
                        <span className="text-small">{testimonials[activeTestimonial].role}</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                <div className="slider-dots">
                  {testimonials.map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`dot ${idx === activeTestimonial ? "active" : ""}`}
                      onClick={() => setActiveTestimonial(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Video Testimonial Card */}
            <div className="video-testimonial-block">
              <div className="video-mock-card premium-shadow">
                <img src="https://images.unsplash.com/photo-1588693895995-1f92c63f03b5?w=500" alt="Weaving Story Video" />
                <div className="video-overlay">
                  <motion.button 
                    className="video-play-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Play size={24} fill="currentColor" />
                  </motion.button>
                  <div className="video-caption">
                    <h4>Watch Shabana's Varanasi Journey</h4>
                    <p className="text-small">How digital crafts connected her weaving loom to global buyers.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Social Proof Seals Banner */}
      <section className="seals-banner-section section-spacing" style={{ position: "relative", overflow: "hidden" }}>
        <div className="section-bg-animation shield-theme">
          <div className="shield-pulse sp-1"></div>
          <div className="shield-pulse sp-2"></div>
        </div>
        <div className="container">
          <div className="trust-seals-grid">
            <div className="seal-item">
              <Award size={28} />
              <div>
                <h5>Verified Artisan Origin</h5>
                <span className="text-small">100% Vetted Profile Registry</span>
              </div>
            </div>
            <div className="seal-item">
              <ShieldCheck size={28} />
              <div>
                <h5>Secure Escrow Payments</h5>
                <span className="text-small">Funds held until successful delivery</span>
              </div>
            </div>
            <div className="seal-item">
              <RefreshCw size={28} />
              <div>
                <h5>30-Day Hassle-Free Returns</h5>
                <span className="text-small">Easy refund guarantees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Box */}
      <section className="newsletter-section section-spacing" style={{ position: "relative", overflow: "hidden" }}>
        <div className="section-bg-animation mail-theme">
          <div className="mail-wave mw-1"></div>
          <div className="mail-wave mw-2"></div>
          <div className="mail-dot md-1"></div>
          <div className="mail-dot md-2"></div>
        </div>
        <div className="container">
          <motion.div 
            className="newsletter-box premium-shadow glass-premium"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-section-title">Join the CraftHub Community</h2>
            <p className="text-body" style={{ color: "var(--color-text-muted)" }}>Subscribe to receive early drops on limited heritage creations, artisan profiles, and cultural stories.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" />
              <button className="btn hover-lift shine-effect">Subscribe</button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}