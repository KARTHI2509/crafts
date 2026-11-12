import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { craftAPI, userAPI } from '../services/api';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import Newsletter from '../components/Newsletter';
import { RecentlyViewedSection } from '../components/RecentlyViewed';

export default function Home() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [featuredCrafts, setFeaturedCrafts] = useState([]);
  const [trendingCrafts, setTrendingCrafts] = useState([]);
  const [topArtisans, setTopArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const categories = [
    { id: 'pottery', icon: '🏺', name: { en: 'Pottery', te: 'కుండల తయారీ' } },
    { id: 'textiles', icon: '🧵', name: { en: 'Textiles', te: 'వస్త్రాలు' } },
    { id: 'jewelry', icon: '💎', name: { en: 'Jewelry', te: 'ఆభరణాలు' } },
    { id: 'woodwork', icon: '🪵', name: { en: 'Woodwork', te: 'చెక్క పని' } },
    { id: 'paintings', icon: '🎨', name: { en: 'Paintings', te: 'చిత్రలేఖనం' } },
    { id: 'metalwork', icon: '⚙️', name: { en: 'Metalwork', te: 'లోహ పని' } },
    { id: 'leather', icon: '👜', name: { en: 'Leather', te: 'తోలు వస్తువులు' } },
    { id: 'bamboo', icon: '🎋', name: { en: 'Bamboo', te: 'వెదురు' } },
  ];
  
  const content = {
    en: {
      heroTitle: "Connect Local Artisans with the World",
      heroSub: "A platform where local craftsmen can showcase their handmade products and reach real buyers without middlemen. Support tradition. Support local talent.",
      exploreCrafts: "Explore Crafts",
      uploadCraft: "Upload Craft",
      whyChooseUs: "Why Choose Logic Crafts Connect?",
      featuredCrafts: "Featured Crafts",
      newArrivals: "New Arrivals from Our Artisans",
      trendingNow: "Trending Now 🔥",
      topArtisans: "Top Artisans",
      shopByCategory: "Shop by Category",
      viewAllCrafts: "View All Crafts",
      viewAll: "View All",
      crafts: "crafts",
      rating: "rating",
      empowerTitle: "Empower Local Artisans",
      empowerDesc: "Direct connection between artisans and buyers, eliminating middlemen and ensuring fair prices.",
      storytellingTitle: "Share Your Story",
      storytellingDesc: "Every craft has a story. Share your heritage, passion, and journey with the world.",
      verifiedTitle: "Verified Quality",
      verifiedDesc: "Admin-verified crafts ensure authenticity and quality for buyers worldwide.",
      communityTitle: "Community Support",
      communityDesc: "Reviews, ratings, and appreciation messages build trust and community.",
      testimonialsTitle: "What Our Artisans Say",
      testimonial1: "This platform changed my life! I can now reach customers globally without any middleman.",
      testimonial1Author: "Priya Sharma, Textile Artist",
      testimonial2: "Easy to use and great support. My pottery is now appreciated by people worldwide.",
      testimonial2Author: "Rajesh Kumar, Potter",
      testimonial3: "The storytelling feature helps me connect emotionally with my buyers. Highly recommended!",
      testimonial3Author: "Lakshmi Devi, Handicraft Artist",
      eventsTitle: "Upcoming Events & Exhibitions",
      eventsDesc: "Join us at craft fairs and exhibitions to showcase your work.",
      viewEvents: "View All Events",
      joinTitle: "Join Our Community Today",
      joinDesc: "Whether you're an artisan or a buyer, become part of our growing community.",
      getStarted: "Get Started",
    },
    te: {
      heroTitle: "స్థానిక కళాకారులను ప్రపంచంతో కనెక్ట్ చేయండి",
      heroSub: "స్థానిక హస్తకళాకారులు తమ చేతితో తయారు చేసిన ఉత్పత్తులను ప్రదర్శించి, మధ్యవర్తులు లేకుండా నిజమైన కొనుగోలుదారులను చేరుకోగల వేదిక. సంప్రదాయానికి మద్దతు ఇవ్వండి. స్థానిక ప్రతిభకు మద్దతు ఇవ్వండి.",
      exploreCrafts: "హస్తకళలను అన్వేషించండి",
      uploadCraft: "హస్తకళను అప్‌లోడ్ చేయండి",
      whyChooseUs: "లాజిక్ క్రాఫ్ట్స్ కనెక్ట్‌ను ఎందుకు ఎంచుకోవాలి?",
      featuredCrafts: "ఫీచర్ చేసిన హస్తకళలు",
      newArrivals: "మా కళాకారుల నుండి కొత్త రాకలు",
      trendingNow: "ట్రెండింగ్ 🔥",
      topArtisans: "టాప్ కళాకారులు",
      shopByCategory: "వర్గం ద్వారా షాపింగ్",
      viewAllCrafts: "అన్ని హస్తకళలను చూడండి",
      viewAll: "అన్నీ చూడండి",
      crafts: "హస్తకళలు",
      rating: "రేటింగ్",
      empowerTitle: "స్థానిక కళాకారులకు శక్తినివ్వండి",
      empowerDesc: "కళాకారులు మరియు కొనుగోలుదారుల మధ్య ప్రత్యక్ష సంబంధం, మధ్యవర్తులను తొలగించి న్యాయమైన ధరలను నిర్ధారిస్తుంది.",
      storytellingTitle: "మీ కథను పంచుకోండి",
      storytellingDesc: "ప్రతి హస్తకళకు ఒక కథ ఉంటుంది. మీ వారసత్వం, అభిరుచి మరియు ప్రయాణాన్ని ప్రపంచంతో పంచుకోండి.",
      verifiedTitle: "ధృవీకరించబడిన నాణ్యత",
      verifiedDesc: "అడ్మిన్ ధృవీకరించిన హస్తకళలు ప్రపంచవ్యాప్తంగా కొనుగోలుదారులకు ప్రామాణికత మరియు నాణ్యతను నిర్ధారిస్తాయి.",
      communityTitle: "సమాజ మద్దతు",
      communityDesc: "సమీక్షలు, రేటింగ్‌లు మరియు ప్రశంస సందేశాలు విశ్వాసం మరియు సమాజాన్ని నిర్మిస్తాయి.",
      testimonialsTitle: "మా కళాకారులు చెప్పేది",
      testimonial1: "ఈ వేదిక నా జీవితాన్ని మార్చింది! నేను ఇప్పుడు మధ్యవర్తి లేకుండా ప్రపంచవ్యాప్తంగా కస్టమర్‌లను చేరుకోగలను.",
      testimonial1Author: "ప్రియ శర్మ, వస్త్ర కళాకారిణి",
      testimonial2: "ఉపయోగించడానికి సులభం మరియు గొప్ప మద్దతు. నా కుండలు ఇప్పుడు ప్రపంచవ్యాప్తంగా ప్రజలచే ప్రశంసించబడుతున్నాయి.",
      testimonial2Author: "రాజేష్ కుమార్, కుమ్మరి",
      testimonial3: "కథ చెప్పే ఫీచర్ నా కొనుగోలుదారులతో భావోద్వేగంగా కనెక్ట్ అవ్వడానికి సహాయపడుతుంది. బాగా సిఫార్సు చేస్తున్నాను!",
      testimonial3Author: "లక్ష్మీ దేవి, హస్తకళా కళాకారిణి",
      eventsTitle: "రాబోయే ఈవెంట్‌లు & ప్రదర్శనలు",
      eventsDesc: "మీ పనిని ప్రదర్శించడానికి క్రాఫ్ట్ ఫెయిర్‌లు మరియు ప్రదర్శనలలో మాతో చేరండి.",
      viewEvents: "అన్ని ఈవెంట్‌లను చూడండి",
      joinTitle: "ఈరోజే మా కమ్యూనిటీలో చేరండి",
      joinDesc: "మీరు కళాకారుడైనా లేదా కొనుగోలుదారుడైనా, మా పెరుగుతున్న కమ్యూనిటీలో భాగం అవ్వండి.",
      getStarted: "ప్రారంభించండి",
    },
  };
  
  const t = content[language] || content.en;
  
  // Fetch featured crafts on component mount
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch featured crafts, trending crafts, and top artisans in parallel
        const [featuredRes, trendingRes, artisansRes] = await Promise.all([
          craftAPI.getAll({ page: 1, limit: 6 }),
          craftAPI.getAll({ page: 1, limit: 4, sortBy: 'popular' }).catch(() => ({ data: { crafts: [] } })),
          userAPI.getTopArtisans ? userAPI.getTopArtisans(4).catch(() => ({ data: { artisans: [] } })) : Promise.resolve({ data: { artisans: [] } })
        ]);
        
        const featuredData = featuredRes.data?.crafts || [];
        const trendingData = trendingRes.data?.crafts || featuredData.slice(0, 4);
        
        // Transform featured crafts
        const transformedFeatured = featuredData.map(craft => ({
          id: craft.id,
          name: craft.name,
          craftType: craft.craft_type || craft.category || 'Handmade',
          price: `₹${craft.price || 0}`,
          location: craft.location || craft.artisan_location || 'India',
          imageUrl: craft.image_url || (craft.images && craft.images.length > 0 ? craft.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'),
          contact: craft.contact || craft.artisan_phone || '919876543210',
          artisan: craft.artisan_name || 'Unknown Artisan',
          verified: craft.status === 'approved',
        }));
        
        // Transform trending crafts
        const transformedTrending = trendingData.map(craft => ({
          id: craft.id,
          name: craft.name,
          craftType: craft.craft_type || craft.category || 'Handmade',
          price: `₹${craft.price || 0}`,
          location: craft.location || craft.artisan_location || 'India',
          imageUrl: craft.image_url || (craft.images && craft.images.length > 0 ? craft.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'),
          contact: craft.contact || craft.artisan_phone || '919876543210',
          artisan: craft.artisan_name || 'Unknown Artisan',
          artisanId: craft.artisan_id,
          verified: craft.status === 'approved',
        }));
        
        setFeaturedCrafts(transformedFeatured);
        setTrendingCrafts(transformedTrending);
        setTopArtisans(artisansRes.data?.artisans || []);
        setPagination(featuredRes.data?.data?.pagination || pagination);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setFeaturedCrafts([]);
        setTrendingCrafts([]);
        setTopArtisans([]);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);
  
  const handleCategoryClick = (categoryId) => {
    navigate(`/explore?category=${categoryId}`);
  };
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="container hero-inner">
          <div className="hero-left">
            <h1 className="hero-title">{t.heroTitle}</h1>
            <p className="hero-sub">{t.heroSub}</p>
            <div className="hero-cta">
              <Link to="/explore">
                <button className="btn">{t.exploreCrafts}</button>
              </Link>
              <Link to="/register">
                <button className="btn secondary">{t.uploadCraft}</button>
              </Link>
            </div>
          </div>
          <div className="hero-right">
            <img
              src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=350&fit=crop"
              alt="Handmade Crafts"
              style={{ borderRadius: "12px", boxShadow: "var(--shadow)" }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/500x350?text=Handmade+Crafts'; }}
            />
          </div>
        </div>
      </div>

      {/* Shop by Category */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">{t.shopByCategory}</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <div 
                key={category.id} 
                className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.id)}
                onMouseEnter={() => setActiveCategory(category.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name[language]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now Section */}
      {trendingCrafts.length > 0 && (
        <section className="trending-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">{t.trendingNow}</h2>
              <Link to="/explore?sort=popular" className="view-all-link">{t.viewAll} →</Link>
            </div>
            <div className="grid" style={{marginTop: '24px'}}>
              {trendingCrafts.map((craft) => (
                <ProductCard key={craft.id} craft={craft} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Artisans Section */}
      {topArtisans.length > 0 && (
        <section className="top-artisans-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">{t.topArtisans}</h2>
              <Link to="/explore" className="view-all-link">{t.viewAll} →</Link>
            </div>
            <div className="artisans-grid">
              {topArtisans.map((artisan) => (
                <Link to={`/artisan/${artisan.id}`} key={artisan.id} className="artisan-card">
                  <div className="artisan-avatar">
                    {artisan.profile_photo ? (
                      <img src={artisan.profile_photo} alt={artisan.name} />
                    ) : (
                      <span>{artisan.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <h4 className="artisan-name">{artisan.name}</h4>
                  <p className="artisan-specialty">{artisan.specialty || 'Handmade Crafts'}</p>
                  <div className="artisan-stats">
                    <span>⭐ {artisan.rating?.toFixed(1) || '4.5'} {t.rating}</span>
                    <span>📦 {artisan.total_crafts || 0} {t.crafts}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Crafts Section */}
      <section className="featured-crafts-section">
        <div className="container">
          <h2 className="section-title">{t.newArrivals}</h2>
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : featuredCrafts.length > 0 ? (
            <>
              <div className="grid" style={{marginTop: '32px'}}>
                {featuredCrafts.map((craft) => (
                  <ProductCard key={craft.id} craft={craft} />
                ))}
              </div>
              <div style={{textAlign: 'center', marginTop: '32px'}}>
                <Link to="/explore">
                  <button className="btn">{t.viewAllCrafts}</button>
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">{t.whyChooseUs}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>{t.empowerTitle}</h3>
              <p>{t.empowerDesc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📖</div>
              <h3>{t.storytellingTitle}</h3>
              <p>{t.storytellingDesc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>{t.verifiedTitle}</h3>
              <p>{t.verifiedDesc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>{t.communityTitle}</h3>
              <p>{t.communityDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - New Animated Carousel */}
      <TestimonialsCarousel />

      {/* Events Teaser */}
      <section className="events-teaser">
        <div className="container">
          <div className="events-content">
            <h2>{t.eventsTitle}</h2>
            <p>{t.eventsDesc}</p>
            <Link to="/events">
              <button className="btn">{t.viewEvents}</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      <section className="recently-viewed-wrapper">
        <div className="container">
          <RecentlyViewedSection />
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="newsletter-wrapper">
        <div className="container">
          <Newsletter />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>{t.joinTitle}</h2>
          <p>{t.joinDesc}</p>
          <Link to="/register">
            <button className="btn">{t.getStarted}</button>
          </Link>
        </div>
      </section>

      {/* Future-ready placeholders (commented) */}
      {/* 
      <section className="ai-recommendations">
        <div className="container">
          <h2>AI-Powered Recommendations</h2>
          <p>Personalized craft suggestions based on your preferences (Coming Soon)</p>
        </div>
      </section>
      
      <section className="voice-search">
        <div className="container">
          <h2>Voice Search in Local Languages</h2>
          <p>Search for crafts using voice commands in Telugu, Hindi, and more (Coming Soon)</p>
        </div>
      </section>
      */}
    </div>
  );
}
