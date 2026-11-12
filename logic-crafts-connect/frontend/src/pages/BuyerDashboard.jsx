import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import AddressManager from '../components/AddressManager';
import { orderAPI, wishlistAPI, cartAPI, messageAPI, recommendationAPI, craftAPI } from '../services/api';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    orders: { total: 0, pending: 0, completed: 0 },
    wishlist: 0,
    cart: 0,
    unreadMessages: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [availableCrafts, setAvailableCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    artisan: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest' // newest, price_low, price_high, popularity
  });

  const text = {
    en: {
      welcome: 'Welcome back',
      myOrders: 'My Orders',
      wishlist: 'Wishlist',
      cart: 'Shopping Cart',
      messages: 'Messages',
      totalOrders: 'Total Orders',
      pendingOrders: 'Pending',
      completedOrders: 'Completed',
      items: 'items',
      unread: 'unread',
      recentOrders: 'Recent Orders',
      recommendedForYou: 'Recommended for You',
      browseCrafts: 'Browse Available Crafts',
      newArrivals: 'New Arrivals',
      viewAll: 'View All',
      viewOrder: 'View',
      addToCart: 'Add to Cart',
      noOrders: 'No orders yet',
      startShopping: 'Start Shopping',
      orderNumber: 'Order #',
      status: 'Status',
      total: 'Total',
      loading: 'Loading your dashboard...'
    },
    te: {
      welcome: 'తిరిగి స్వాగతం',
      myOrders: 'నా ఆర్డర్లు',
      wishlist: 'విష్‌లిస్ట్',
      cart: 'షాపింగ్ కార్ట్',
      messages: 'సందేశాలు',
      totalOrders: 'మొత్తం ఆర్డర్లు',
      pendingOrders: 'పెండింగ్',
      completedOrders: 'పూర్తయింది',
      items: 'వస్తువులు',
      unread: 'చదవలేదు',
      recentOrders: 'ఇటీవలి ఆర్డర్లు',
      recommendedForYou: 'మీ కోసం సిఫార్సు చేయబడింది',
      browseCrafts: 'అందుబాటులో ఉన్న హస్తకళలను బ్రౌజ్ చేయండి',
      newArrivals: 'కొత్త రాకలు',
      viewAll: 'అన్నీ చూడండి',
      viewOrder: 'చూడండి',
      addToCart: 'కార్ట్‌కు జోడించండి',
      noOrders: 'ఇంకా ఆర్డర్లు లేవు',
      startShopping: 'షాపింగ్ ప్రారంభించండి',
      orderNumber: 'ఆర్డర్ #',
      status: 'స్థితి',
      total: 'మొత్తం',
      loading: 'మీ డాష్‌బోర్డ్ లోడ్ చేస్తోంది...'
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats and crafts data (don't fail if recommendations fail)
      const [ordersRes, wishlistRes, cartRes, messagesRes, craftsRes] = await Promise.all([
        orderAPI.getStats().catch(() => ({ data: { stats: { total: 0, pending: 0, completed: 0 } } })),
        wishlistAPI.getCount().catch(() => ({ data: { count: 0 } })),
        cartAPI.get().catch(() => ({ data: { total_items: 0 } })),
        messageAPI.getUnreadCount().catch(() => ({ data: { unread_count: 0 } })),
        craftAPI.getAll({ page: 1, limit: 8 }) // Fetch all available crafts
      ]);

      setStats({
        orders: ordersRes.data?.stats || { total: 0, pending: 0, completed: 0 },
        wishlist: wishlistRes.data?.count || 0,
        cart: cartRes.data?.total_items || 0,
        unreadMessages: messagesRes.data?.unread_count || 0
      });

      // Try to fetch recommendations, but don't fail if it errors
      try {
        const recommendationsRes = await recommendationAPI.getPersonalized(4);
        setRecommendations(recommendationsRes.data?.recommendations || []);
      } catch (recError) {
        console.log('Recommendations not available, using crafts instead');
        setRecommendations([]);
      }

      // Transform available crafts
      const craftsData = craftsRes.data?.crafts || [];
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
      setAvailableCrafts(transformedCrafts);

      // Fetch recent orders
      try {
        const recentOrdersRes = await orderAPI.getAll({ limit: 5 });
        setRecentOrders(recentOrdersRes.data?.orders || []);
      } catch (orderError) {
        console.log('No orders found');
        setRecentOrders([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async (craftId) => {
    try {
      await cartAPI.add(craftId, 1);
      fetchDashboardData(); // Refresh cart count
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="buyer-dashboard">
        <div className="loading">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="buyer-dashboard">
      <div className="dashboard-header">
        <h1>{t.welcome}, {user?.name}!</h1>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/buyer/orders')}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{t.myOrders}</h3>
            <div className="stat-number">{stats.orders.total}</div>
            <div className="stat-details">
              <span>{stats.orders.pending} {t.pendingOrders}</span>
              <span>{stats.orders.completed} {t.completedOrders}</span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/buyer/wishlist')}>
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <h3>{t.wishlist}</h3>
            <div className="stat-number">{stats.wishlist}</div>
            <div className="stat-details">{stats.wishlist} {t.items}</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/cart')}>
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>{t.cart}</h3>
            <div className="stat-number">{stats.cart}</div>
            <div className="stat-details">{stats.cart} {t.items}</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/buyer/messages')}>
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>{t.messages}</h3>
            <div className="stat-number">{stats.unreadMessages}</div>
            <div className="stat-details">{stats.unreadMessages} {t.unread}</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>{t.recentOrders}</h2>
          <button onClick={() => navigate('/buyer/orders')} className="view-all-btn">
            {t.viewAll} →
          </button>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <p>{t.noOrders}</p>
            <button onClick={() => navigate('/explore')} className="primary-btn">
              {t.startShopping}
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {recentOrders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <span className="order-number">{t.orderNumber}{order.order_number}</span>
                  <span className={`order-status status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-details">
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  <span className="order-total">
                    {t.total}: ₹{order.total_amount}
                  </span>
                </div>
                <button 
                  onClick={() => navigate(`/buyer/orders/${order.id}`)}
                  className="view-order-btn"
                >
                  {t.viewOrder}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>{t.recommendedForYou}</h2>
            <button onClick={() => navigate('/explore')} className="view-all-btn">
              {t.viewAll} →
            </button>
          </div>
          
          <div className="recommendations-grid">
            {recommendations.map(item => (
              <div key={item.id} className="recommendation-card">
                <div className="recommendation-image">
                  <img 
                    src={item.images?.[0] || '/placeholder.jpg'} 
                    alt={item.title}
                  />
                </div>
                <div className="recommendation-content">
                  <h3>{item.title}</h3>
                  <p className="price">₹{item.price}</p>
                  <div className="rating">
                    ⭐ {item.rating || 'New'}
                  </div>
                  <button 
                    onClick={() => handleAddToCart(item.id)}
                    className="add-to-cart-btn"
                  >
                    {t.addToCart}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Saved Addresses */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>{language === 'ta' ? 'சேமித்த முகவரிகள்' : 'Saved Addresses'}</h2>
        </div>
        <AddressManager />
      </section>

      {/* Available Crafts - New Arrivals from Artisans */}
      {availableCrafts.length > 0 && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>{t.browseCrafts}</h2>
            <button onClick={() => navigate('/explore')} className="view-all-btn">
              {t.viewAll} →
            </button>
          </div>
          
          {/* Filters */}
          <div className="filters-panel" style={{marginBottom: '20px'}}>
            <div className="filters-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
              <div className="field">
                <label>Category</label>
                <select 
                  className="input"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  <option value="Pottery">Pottery</option>
                  <option value="Woodwork">Woodwork</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Metalwork">Metalwork</option>
                  <option value="Basketry">Basketry</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="field">
                <label>Artisan</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Search artisan..."
                  value={filters.artisan}
                  onChange={(e) => setFilters({ ...filters, artisan: e.target.value })}
                />
              </div>
              
              <div className="field">
                <label>Sort By</label>
                <select 
                  className="input"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginTop: '20px'}}>
            {availableCrafts.map(craft => (
              <ProductCard key={craft.id} craft={craft} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BuyerDashboard;
