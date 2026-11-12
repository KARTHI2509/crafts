import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { useDebounce } from '../hooks/useDebounce';
import { craftAPI } from '../services/api';
import QuickViewModal from '../components/QuickViewModal';

export default function Explore() {
  const { language } = useContext(LanguageContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [crafts, setCrafts] = useState([]);
  const [filteredCrafts, setFilteredCrafts] = useState([]);
  const [filters, setFilters] = useState({ 
    category: searchParams.get('category') || '', 
    location: '', 
    artisan: '', 
    verifiedOnly: false, 
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: ''
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [loading, setLoading] = useState(true);
  const [quickViewCraft, setQuickViewCraft] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchRef = useRef(null);
  
  // Debounce search input for better performance
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedArtisan = useDebounce(filters.artisan, 300);
  
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
      sortBy: "Sort By",
      newest: "Newest First",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to Low",
      nameAZ: "Name: A-Z",
      popular: "Most Popular",
      searchPlaceholder: "Search crafts, artisans...",
      priceRange: "Price Range",
      minPrice: "Min ₹",
      maxPrice: "Max ₹",
      recentSearches: "Recent Searches",
      suggestions: "Suggestions",
      clearHistory: "Clear",
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
      sortBy: "క్రమబద్ధీకరించు",
      newest: "కొత్తవి ముందుగా",
      priceLow: "ధర: తక్కువ నుండి ఎక్కువ",
      priceHigh: "ధర: ఎక్కువ నుండి తక్కువ",
      nameAZ: "పేరు: A-Z",
      popular: "అత్యంత ప్రజాదరణ",
      searchPlaceholder: "హస్తకళలు, కళాకారులను శోధించండి...",
      priceRange: "ధర పరిధి",
      minPrice: "కనిష్ట ₹",
      maxPrice: "గరిష్ట ₹",
      recentSearches: "ఇటీవలి శోధనలు",
      suggestions: "సూచనలు",
      clearHistory: "క్లియర్",
    },
  };

  const t = content[language] || content.en;

  // Load search history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  // Save search to history
  const saveToHistory = (term) => {
    if (!term.trim()) return;
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  // Clear search history
  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  // Get search suggestions based on input
  const suggestions = useMemo(() => {
    if (!filters.search || filters.search.length < 2) return [];
    const term = filters.search.toLowerCase();
    const craftSuggestions = crafts
      .filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.craftType.toLowerCase().includes(term) ||
        c.artisan.toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map(c => ({ type: 'craft', text: c.name, id: c.id }));
    
    const artisanSuggestions = [...new Set(
      crafts
        .filter(c => c.artisan.toLowerCase().includes(term))
        .map(c => c.artisan)
    )]
      .slice(0, 3)
      .map(a => ({ type: 'artisan', text: a }));
    
    return [...craftSuggestions, ...artisanSuggestions];
  }, [filters.search, crafts]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Fetch real crafts from backend
    const fetchCrafts = async () => {
      try {
        const response = await craftAPI.getAll({ page: pagination.currentPage, limit: 12 });
        const craftsData = response.data?.crafts || [];
        
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

  // Apply filters whenever filter state changes (using debounced values)
  useEffect(() => {
    let filtered = crafts;

    // Apply search filter with debounced value
    if (debouncedSearch) {
      const searchTerm = debouncedSearch.toLowerCase();
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

    if (debouncedArtisan) {
      filtered = filtered.filter(c => 
        c.artisan.toLowerCase().includes(debouncedArtisan.toLowerCase())
      );
    }

    if (filters.verifiedOnly) {
      filtered = filtered.filter(c => c.verified === true);
    }

    // Apply price range filter
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(c => {
        const price = parseFloat(c.price.replace('₹', '').replace(',', ''));
        return price >= minPrice;
      });
    }
    
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(c => {
        const price = parseFloat(c.price.replace('₹', '').replace(',', ''));
        return price <= maxPrice;
      });
    }

    // Apply sorting
    const sortedFiltered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'priceLow':
          return parseFloat(a.price.replace('₹', '').replace(',', '')) - parseFloat(b.price.replace('₹', '').replace(',', ''));
        case 'priceHigh':
          return parseFloat(b.price.replace('₹', '').replace(',', '')) - parseFloat(a.price.replace('₹', '').replace(',', ''));
        case 'nameAZ':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return 0; // Keep original order for newest
      }
    });

    setFilteredCrafts(sortedFiltered);
  }, [debouncedSearch, debouncedArtisan, filters.category, filters.location, filters.verifiedOnly, filters.minPrice, filters.maxPrice, sortBy, crafts]);

  // Get unique categories and locations
  const categories = [...new Set(crafts.map(c => c.craftType))];
  const locations = [...new Set(crafts.map(c => c.location))];

  const clearFilters = () => {
    setFilters({ category: '', location: '', artisan: '', verifiedOnly: false, search: '', minPrice: '', maxPrice: '' });
    setSearchParams({});
  };

  const handleSearchSelect = (suggestion) => {
    if (suggestion.type === 'craft') {
      setFilters({ ...filters, search: suggestion.text });
    } else if (suggestion.type === 'artisan') {
      setFilters({ ...filters, artisan: suggestion.text });
    }
    saveToHistory(suggestion.text);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filters.search.trim()) {
      saveToHistory(filters.search);
    }
    setShowSuggestions(false);
  };

  if (loading) {
    return (
      <div className="container explore-crafts">
        <h2>{t.title}</h2>
        <p style={{color: 'var(--muted)', marginBottom: '24px'}}>
          {t.subtitle}
        </p>
        <ProductGridSkeleton count={8} />
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
            <div className="search-autocomplete" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  className="input"
                  placeholder={t.searchPlaceholder}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onFocus={() => setShowSuggestions(true)}
                />
              </form>
              
              {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
                <div className="suggestions-dropdown">
                  {/* Search History */}
                  {searchHistory.length > 0 && !filters.search && (
                    <div className="suggestion-group">
                      <div className="suggestion-header">
                        <span>🕐 {t.recentSearches}</span>
                        <button onClick={clearHistory}>{t.clearHistory}</button>
                      </div>
                      {searchHistory.map((term, idx) => (
                        <div 
                          key={idx} 
                          className="suggestion-item history"
                          onClick={() => setFilters({ ...filters, search: term })}
                        >
                          {term}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Autocomplete Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="suggestion-group">
                      <div className="suggestion-header">
                        <span>✨ {t.suggestions}</span>
                      </div>
                      {suggestions.map((suggestion, idx) => (
                        <div 
                          key={idx} 
                          className={`suggestion-item ${suggestion.type}`}
                          onClick={() => handleSearchSelect(suggestion)}
                        >
                          <span className="suggestion-icon">
                            {suggestion.type === 'craft' ? '🎨' : '👤'}
                          </span>
                          <span>{suggestion.text}</span>
                          <span className="suggestion-type">{suggestion.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="field">
            <label>{t.priceRange}</label>
            <div className="price-range-inputs">
              <input
                type="number"
                className="input price-input"
                placeholder={t.minPrice}
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                min="0"
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                className="input price-input"
                placeholder={t.maxPrice}
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                min="0"
              />
            </div>
          </div>

          <div className="field">
            <label>{t.sortBy}</label>
            <select 
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">{t.newest}</option>
              <option value="priceLow">{t.priceLow}</option>
              <option value="priceHigh">{t.priceHigh}</option>
              <option value="nameAZ">{t.nameAZ}</option>
            </select>
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
              <ProductCard craft={craft} onQuickView={setQuickViewCraft} />
              {craft.verified && (
                <div className="verified-badge">
                  ✓ {t.verifiedBadge}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal 
        craft={quickViewCraft} 
        isOpen={!!quickViewCraft} 
        onClose={() => setQuickViewCraft(null)} 
      />

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
