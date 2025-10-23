import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import axios from 'axios';
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
  const [loading, setLoading] = useState(true);

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
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch stats in parallel
      const [ordersRes, wishlistRes, cartRes, messagesRes, recommendationsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders/stats', config),
        axios.get('http://localhost:5000/api/wishlist/count', config),
        axios.get('http://localhost:5000/api/cart', config),
        axios.get('http://localhost:5000/api/messages/unread-count', config),
        axios.get('http://localhost:5000/api/recommendations/personalized?limit=4', config)
      ]);

      setStats({
        orders: ordersRes.data.data.stats,
        wishlist: wishlistRes.data.data.count,
        cart: cartRes.data.data.total_items || 0,
        unreadMessages: messagesRes.data.data.unread_count
      });

      setRecommendations(recommendationsRes.data.data.recommendations);

      // Fetch recent orders
      const recentOrdersRes = await axios.get('http://localhost:5000/api/orders?limit=5', config);
      setRecentOrders(recentOrdersRes.data.data.orders);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async (craftId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/cart',
        { craft_id: craftId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData(); // Refresh cart count
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
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
    </div>
  );
};

export default BuyerDashboard;
