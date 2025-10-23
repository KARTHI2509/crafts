import React, { useEffect, useState, useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import ProductCard from '../components/ProductCard';
import axios from 'axios';

export default function Explore() {
  const { language } = useContext(LanguageContext);
  const [crafts, setCrafts] = useState([]);
  const [filteredCrafts, setFilteredCrafts] = useState([]);
  const [filters, setFilters] = useState({ category: '', location: '', artisan: '', verifiedOnly: false, search: '' });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

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
    // Fetch real crafts from backend
    const fetchCrafts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/crafts?page=${pagination.currentPage}&limit=12`);
        const craftsData = response.data.data.crafts || [];
        
        // Transform data to match expected format
        const transformedCrafts = craftsData.map(craft => ({
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
        
        setCrafts(transformedCrafts);
        setFilteredCrafts(transformedCrafts);
        setPagination(response.data.data.pagination);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crafts:', error);
        // Fallback to empty array on error
        setCrafts([]);
        setFilteredCrafts([]);
        setLoading(false);
      }
    };

    fetchCrafts();
  }, [pagination.currentPage]);

  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = crafts;

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(craft => 
        craft.name.toLowerCase().includes(searchTerm) ||
        craft.artisan.toLowerCase().includes(searchTerm) ||
        craft.craftType.toLowerCase().includes(searchTerm) ||
        craft.location.toLowerCase().includes(searchTerm)
      );
    }

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

          <div className="field">
            <label>Search</label>
            <input
              type="text"
              className="input"
              placeholder="Search crafts, artisans..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', margin: '32px 0' }}>
          <button 
            className="btn secondary" 
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={!pagination.hasPrev}
          >
            ← Previous
          </button>
          
          <span style={{ margin: '0 12px' }}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button 
            className="btn secondary" 
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={!pagination.hasNext}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
