import React, { useEffect, useState, useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import ProductCard from '../components/ProductCard';
// import { craftAPI } from '../utils/api';

export default function Explore() {
  const { language } = useContext(LanguageContext);
  const [crafts, setCrafts] = useState([]);
  const [filteredCrafts, setFilteredCrafts] = useState([]);
  const [filters, setFilters] = useState({ category: '', location: '', artisan: '', verifiedOnly: false });
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      title: "Explore Handmade Crafts",
      subtitle: "Discover unique handmade products from talented artisans across India",
      filterBy: "Filter By",
      category: "Category",
      location: "Location",
      artisan: "Artisan Name",
      verifiedOnly: "Verified Only",
      allCategories: "All Categories",
      allLocations: "All Locations",
      noCrafts: "No crafts match your filters. Try adjusting your search.",
      verifiedBadge: "Verified Artisan",
      clearFilters: "Clear Filters",
    },
    te: {
      title: "చేతితో తయారు చేసిన హస్తకళలను అన్వేషించండి",
      subtitle: "భారతదేశం అంతటా ప్రతిభావంతులైన కళాకారుల నుండి ప్రత్యేకమైన చేతితో తయారు చేసిన ఉత్పత్తులను కనుగొనండి",
      filterBy: "ఫిల్టర్ ద్వారా",
      category: "వర్గం",
      location: "స్థానం",
      artisan: "కళాకారుడి పేరు",
      verifiedOnly: "ధృవీకరించబడినవి మాత్రమే",
      allCategories: "అన్ని వర్గాలు",
      allLocations: "అన్ని స్థానాలు",
      noCrafts: "మీ ఫిల్టర్‌లకు సరిపోయే హస్తకళలు లేవు. మీ శోధనను సర్దుబాటు చేయడానికి ప్రయత్నించండి.",
      verifiedBadge: "ధృవీకరించబడిన కళాకారుడు",
      clearFilters: "ఫిల్టర్‌లను క్లియర్ చేయండి",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    // TODO: Replace with actual API call
    // craftAPI.getAll()
    //   .then(data => {
    //     setCrafts(data.crafts);
    //     setFilteredCrafts(data.crafts);
    //   })
    //   .catch(err => console.error(err))
    //   .finally(() => setLoading(false));

    // Mock data with verified status
    const mockCraftsData = [
      { 
        id: 1, 
        name: 'Handmade Pottery', 
        craftType: 'Pottery', 
        price: '₹500', 
        location: 'Jaipur', 
        imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop',
        contact: '919876543210',
        artisan: 'Rajesh Kumar',
        verified: true,
      },
      { 
        id: 2, 
        name: 'Wood Carving', 
        craftType: 'Woodwork', 
        price: '₹1200', 
        location: 'Kerala', 
        imageUrl: 'https://images.unsplash.com/photo-1615397349754-5e6d2e18b0b8?w=400&h=300&fit=crop',
        contact: '919876543211',
        artisan: 'Suresh Nair',
        verified: true,
      },
      { 
        id: 3, 
        name: 'Bead Jewelry', 
        craftType: 'Jewelry', 
        price: '₹350', 
        location: 'Mumbai', 
        imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
        contact: '919876543212',
        artisan: 'Anjali Mehta',
        verified: false,
      },
      { 
        id: 4, 
        name: 'Handwoven Basket', 
        craftType: 'Basketry', 
        price: '₹600', 
        location: 'Assam', 
        imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&h=300&fit=crop',
        contact: '919876543213',
        artisan: 'Priya Sharma',
        verified: true,
      },
      { 
        id: 5, 
        name: 'Clay Lamp', 
        craftType: 'Pottery', 
        price: '₹200', 
        location: 'Delhi', 
        imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=300&fit=crop',
        contact: '919876543214',
        artisan: 'Ramesh Singh',
        verified: true,
      },
      { 
        id: 6, 
        name: 'Silk Scarf', 
        craftType: 'Textiles', 
        price: '₹950', 
        location: 'andhra pradesh', 
        imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=300&fit=crop',
        contact: '919876543215',
        artisan: 'Lakshmi Devi',
        verified: true,
      },
      { 
        id: 7, 
        name: 'Brass Statue', 
        craftType: 'Metalwork', 
        price: '₹2500', 
        location: 'Jaipur', 
        imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=300&fit=crop',
        contact: '919876543216',
        artisan: 'Vikram Patel',
        verified: true,
      },
      { 
        id: 8, 
        name: 'Embroidered Cushion', 
        craftType: 'Textiles', 
        price: '₹850', 
        location: 'Lucknow', 
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
        contact: '919876543217',
        artisan: 'Fatima Khan',
        verified: false,
      },
    ];

    setTimeout(() => {
      setCrafts(mockCraftsData);
      setFilteredCrafts(mockCraftsData);
      setLoading(false);
    }, 500);
  }, []);

  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = crafts;

    if (filters.category) {
      filtered = filtered.filter(c => c.craftType === filters.category);
    }

    if (filters.location) {
      filtered = filtered.filter(c => c.location === filters.location);
    }

    if (filters.artisan) {
      filtered = filtered.filter(c => 
        c.artisan.toLowerCase().includes(filters.artisan.toLowerCase())
      );
    }

    if (filters.verifiedOnly) {
      filtered = filtered.filter(c => c.verified === true);
    }

    setFilteredCrafts(filtered);
  }, [filters, crafts]);

  // Get unique categories and locations
  const categories = [...new Set(crafts.map(c => c.craftType))];
  const locations = [...new Set(crafts.map(c => c.location))];

  const clearFilters = () => {
    setFilters({ category: '', location: '', artisan: '', verifiedOnly: false });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <p>Loading crafts...</p>
      </div>
    );
  }

  return (
    <div className="container explore-crafts">
      <h2>{t.title}</h2>
      <p style={{color: 'var(--muted)', marginBottom: '24px'}}>
        {t.subtitle}
      </p>
      
      {/* Filters Section */}
      <div className="filters-panel">
        <h3 style={{fontSize: '16px', marginBottom: '12px', fontWeight: '600'}}>{t.filterBy}</h3>
        <div className="filters-grid">
          <div className="field">
            <label>{t.category}</label>
            <select 
              className="input"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">{t.allCategories}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>{t.location}</label>
            <select 
              className="input"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="">{t.allLocations}</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>{t.artisan}</label>
            <input
              type="text"
              className="input"
              placeholder={t.artisan}
              value={filters.artisan}
              onChange={(e) => setFilters({ ...filters, artisan: e.target.value })}
            />
          </div>

          <div className="field" style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px'}}>
            <input
              type="checkbox"
              id="verifiedOnly"
              checked={filters.verifiedOnly}
              onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
              style={{width: 'auto', margin: 0}}
            />
            <label htmlFor="verifiedOnly" style={{margin: 0, cursor: 'pointer'}}>
              ✓ {t.verifiedOnly}
            </label>
          </div>
        </div>

        {(filters.category || filters.location || filters.artisan || filters.verifiedOnly) && (
          <button 
            className="btn secondary" 
            onClick={clearFilters}
            style={{marginTop: '12px', fontSize: '14px', padding: '6px 12px'}}
          >
            {t.clearFilters}
          </button>
        )}
      </div>

      {/* Results Count */}
      <p style={{margin: '20px 0', color: 'var(--muted)', fontSize: '14px'}}>
        Showing {filteredCrafts.length} of {crafts.length} crafts
      </p>
      
      {/* Crafts Grid */}
      <div className="grid">
        {filteredCrafts.length === 0 ? (
          <div className="panel" style={{gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px'}}>
            <p>{t.noCrafts}</p>
          </div>
        ) : (
          filteredCrafts.map((craft) => (
            <div key={craft.id} className="craft-with-badge">
              <ProductCard craft={craft} />
              {craft.verified && (
                <div className="verified-badge">
                  ✓ {t.verifiedBadge}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
