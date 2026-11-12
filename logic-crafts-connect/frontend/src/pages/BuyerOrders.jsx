import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { orderAPI } from '../services/api';
import QuickReorder from '../components/QuickReorder';
import './BuyerOrders.css';

const BuyerOrders = () => {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const text = {
    en: {
      myOrders: 'My Orders',
      all: 'All',
      placed: 'Placed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      orderNumber: 'Order #',
      status: 'Status',
      total: 'Total',
      items: 'items',
      viewDetails: 'View Details',
      noOrders: 'No orders found',
      startShopping: 'Start Shopping',
      loading: 'Loading orders...',
      orderedOn: 'Ordered on'
    },
    te: {
      myOrders: 'నా ఆర్డర్లు',
      all: 'అన్నీ',
      placed: 'ప్లేస్ చేయబడింది',
      processing: 'ప్రాసెస్ అవుతోంది',
      shipped: 'షిప్ చేయబడింది',
      delivered: 'డెలివరీ అయింది',
      cancelled: 'రద్దు చేయబడింది',
      orderNumber: 'ఆర్డర్ #',
      status: 'స్థితి',
      total: 'మొత్తం',
      items: 'వస్తువులు',
      viewDetails: 'వివరాలు చూడండి',
      noOrders: 'ఆర్డర్లు కనిపించలేదు',
      startShopping: 'షాపింగ్ ప్రారంభించండి',
      loading: 'ఆర్డర్లు లోడ్ అవుతున్నాయి...',
      orderedOn: 'ఆర్డర్ చేసిన తేదీ'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter]);

  const fetchOrders = async () => {
    try {
      const filters = filter === 'all' ? {} : { status: filter };
      const response = await orderAPI.getAll(filters);
      
      setOrders(response.data?.orders || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      placed: '#856404',
      confirmed: '#004085',
      processing: '#004085',
      shipped: '#0c5460',
      out_for_delivery: '#0c5460',
      delivered: '#155724',
      cancelled: '#721c24',
      returned: '#721c24'
    };
    return colors[status] || '#666';
  };

  const getStatusBg = (status) => {
    const backgrounds = {
      placed: '#fff3cd',
      confirmed: '#cce5ff',
      processing: '#cce5ff',
      shipped: '#d1ecf1',
      out_for_delivery: '#d1ecf1',
      delivered: '#d4edda',
      cancelled: '#f8d7da',
      returned: '#f8d7da'
    };
    return backgrounds[status] || '#f0f0f0';
  };

  if (!user || user.role !== 'buyer') {
    return (
      <div className="buyer-orders-page">
        <div className="message">Please login as a buyer to view orders</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="buyer-orders-page">
        <div className="loading">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="buyer-orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>📦 {t.myOrders}</h1>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            {t.all}
          </button>
          <button 
            className={filter === 'placed' ? 'active' : ''}
            onClick={() => setFilter('placed')}
          >
            {t.placed}
          </button>
          <button 
            className={filter === 'processing' ? 'active' : ''}
            onClick={() => setFilter('processing')}
          >
            {t.processing}
          </button>
          <button 
            className={filter === 'shipped' ? 'active' : ''}
            onClick={() => setFilter('shipped')}
          >
            {t.shipped}
          </button>
          <button 
            className={filter === 'delivered' ? 'active' : ''}
            onClick={() => setFilter('delivered')}
          >
            {t.delivered}
          </button>
          <button 
            className={filter === 'cancelled' ? 'active' : ''}
            onClick={() => setFilter('cancelled')}
          >
            {t.cancelled}
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>{t.noOrders}</h2>
            <button onClick={() => navigate('/explore')} className="start-shopping-btn">
              {t.startShopping} →
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <span className="order-number">
                      {t.orderNumber}{order.order_number}
                    </span>
                    <span className="order-date">
                      {t.orderedOn} {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span 
                    className="order-status"
                    style={{
                      background: getStatusBg(order.status),
                      color: getStatusColor(order.status)
                    }}
                  >
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-details">
                    <div className="detail-item">
                      <span className="label">{t.items}:</span>
                      <span className="value">{order.total_items || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">{t.total}:</span>
                      <span className="value total-amount">₹{order.total_amount}</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      onClick={() => navigate(`/buyer/orders/${order.id}`)}
                      className="view-details-btn"
                    >
                      {t.viewDetails} →
                    </button>
                    {order.status === 'delivered' && (
                      <QuickReorder order={order} onReordered={fetchOrders} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerOrders;
