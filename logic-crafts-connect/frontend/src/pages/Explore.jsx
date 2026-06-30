import React, { useEffect, useState, useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, PackageX, X } from "lucide-react";
import "./Explore.css";
import SEO from "../components/SEO";
import { trackEvent } from "../utils/analytics";

export default function Explore() {
  const { language } = useContext(LanguageContext);

  const [crafts, setCrafts] = useState([]);
  const [filteredCrafts, setFilteredCrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [priceRange, setPriceRange] = useState(10000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Mock static filter options (ideally fetched from backend)
  const categoriesList = ["Pottery & Ceramics", "Textiles & Handlooms", "Woodwork", "Metalcraft", "Jewelry", "Paintings", "Leatherwork"];
  const locationsList = ["Rajasthan", "Gujarat", "Kashmir", "Varanasi", "Bengal", "Odisha", "South India"];

  // Language content
  const content = {
    en: { title: "Explore Collections", subtitle: "Discover authentic, handcrafted masterpieces directly from the artisans who made them." },
    te: { title: "సేకరణలను అన్వేషించండి", subtitle: "వాటిని తయారు చేసిన కళాకారుల నుండి నేరుగా ప్రామాణికమైన, చేతితో తయారు చేసిన కళాఖండాలను కనుగొనండి." }
  };
  const t = content[language] || content.en;

  useEffect(() => {
    trackEvent('page_visit', { page: 'explore' });
    fetchCrafts();
  }, []);

  useEffect(() => {
    if (!search.trim()) return;
    const delayDebounceFn = setTimeout(() => {
      trackEvent('search', { query: search });
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchCrafts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/crafts?limit=50");
      const craftsData = res.data?.data?.crafts || [];
      const formatted = craftsData.map(c => ({
        id: c.id || c._id,
        name: c.name,
        craftType: c.craft_type || c.category || "Handmade",
        price: c.price || 0,
        location: c.location || "India",
        imageUrl: c.image_url || c.images?.[0] || "https://via.placeholder.com/400x300",
        artisan: c.artisan_name || "Artisan",
        verified: c.status === "approved"
      }));
      setCrafts(formatted);
      setFilteredCrafts(formatted);
    } catch (error) {
      console.error("Fetch error", error);
      // Fallback mock data if DB fails
      const mock = Array.from({length: 12}).map((_, i) => ({
        id: `mock-${i}`,
        name: `Premium Handcrafted Item ${i+1}`,
        craftType: categoriesList[i % categoriesList.length],
        price: Math.floor(Math.random() * 8000) + 500,
        location: locationsList[i % locationsList.length],
        imageUrl: `https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop&q=${i}`,
        artisan: "Master Artisan",
        verified: i % 3 === 0
      }));
      setCrafts(mock);
      setFilteredCrafts(mock);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  useEffect(() => {
    let result = [...crafts];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.craftType.toLowerCase().includes(q));
    }

    if (selectedCategories.length > 0) {
      result = result.filter(c => selectedCategories.includes(c.craftType));
    }

    if (selectedLocations.length > 0) {
      result = result.filter(c => selectedLocations.includes(c.location));
    }

    if (verifiedOnly) {
      result = result.filter(c => c.verified);
    }

    // Price filter
    result = result.filter(c => Number(c.price) <= priceRange);

    // Sorting
    if (sortBy === "price_low") result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "price_high") result.sort((a, b) => Number(b.price) - Number(a.price));
    // "newest" we can leave as is or assume array order is newest first

    setFilteredCrafts(result);
  }, [search, selectedCategories, selectedLocations, priceRange, verifiedOnly, sortBy, crafts]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleLocation = (loc) => {
    setSelectedLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLocations([]);
    setPriceRange(10000);
    setVerifiedOnly(false);
    setSearch("");
  };

  return (
    <div className="explore-page">
      <SEO title="Explore Collection" />
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div 
            className="sidebar-overlay" 
            onClick={() => setFiltersOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="container">
        
        <div className="explore-header">
          <motion.h1 className="explore-title" initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}}>{t.title}</motion.h1>
          <motion.p className="explore-subtitle" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>{t.subtitle}</motion.p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <button className="mobile-filter-toggle" onClick={() => setFiltersOpen(true)}>
          <SlidersHorizontal size={18} />
          <span>Filter & Search</span>
        </button>

        <div className="explore-layout">
          
          {/* SIDEBAR FILTERS */}
          <motion.aside 
            className={`explore-sidebar ${filtersOpen ? 'open' : ''}`}
            initial={{opacity:0, x:-50}}
            animate={{opacity:1, x:0}}
            transition={{duration:0.5}}
          >
            <div className="sidebar-header-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Filters</h3>
              <button 
                className="close-btn" 
                onClick={() => setFiltersOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-dark)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="sidebar-search">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search crafts..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-section">
              <h3>Categories <button className="filter-clear" onClick={() => setSelectedCategories([])}>Clear</button></h3>
              <div className="checkbox-group">
                {categoriesList.map(cat => (
                  <label key={cat} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Locations <button className="filter-clear" onClick={() => setSelectedLocations([])}>Clear</button></h3>
              <div className="checkbox-group">
                {locationsList.map(loc => (
                  <label key={loc} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedLocations.includes(loc)}
                      onChange={() => toggleLocation(loc)}
                    />
                    {loc}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Price Range</h3>
              <div className="price-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="20000" 
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="price-slider"
                />
                <div className="price-values">
                  <span>₹0</span>
                  <span>Up to ₹{priceRange}</span>
                </div>
              </div>
            </div>

            <div className="filter-section" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Show Verified Artisans Only</span>
              </label>
            </div>

            <button className="btn secondary" style={{width: '100%'}} onClick={() => { clearFilters(); setFiltersOpen(false); }}>Reset All Filters</button>

          </motion.aside>

          {/* MAIN CONTENT */}
          <main className="explore-main">
            
            <div className="explore-toolbar">
              <div className="toolbar-results">
                Showing <span>{filteredCrafts.length}</span> authentic crafts
              </div>
              <div className="toolbar-sort">
                <SlidersHorizontal size={18} color="var(--color-text-muted)" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Sort by: Newest Arrivals</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>Loading masterpiece collections...</div>
            ) : (
              <AnimatePresence mode="wait">
                {filteredCrafts.length === 0 ? (
                  <motion.div 
                    className="explore-empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <PackageX size={64} color="var(--color-border)" style={{marginBottom: '1rem'}} />
                    <h3>No masterpieces found</h3>
                    <p>Try adjusting your filters or search terms to discover more crafts.</p>
                    <button className="btn" onClick={clearFilters}>Clear All Filters</button>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="explore-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {filteredCrafts.map((craft, i) => (
                      <motion.div
                        key={craft.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <ProductCard craft={craft} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {filteredCrafts.length > 0 && (
              <div className="load-more-container">
                <button className="btn secondary btn-load-more">Load More Crafts</button>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}