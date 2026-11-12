import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { orderAPI } from '../services/api';
import OrderTracking from '../components/OrderTracking';
import QuickReorder from '../components/QuickReorder';
import OrderInvoice from '../components/OrderInvoice';
import './OrderDetails.css';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const text = {
    en: {
      orderDetails: 'Order Details',
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      status: 'Status',
      items: 'Items',
      shippingAddress: 'Shipping Address',
      paymentMethod: 'Payment Method',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      total: 'Total',
      cancelOrder: 'Cancel Order',
      returnOrder: 'Return Order',
      confirmCancel: 'Are you sure you want to cancel this order?',
      confirmReturn: 'Are you sure you want to return this order?',
      cancelReason: 'Please provide a reason for cancellation:',
      returnReason: 'Please provide a reason for return:',
      orderTimeline: 'Order Timeline',
      placed: 'Order Placed',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      outForDelivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
      by: 'by',
      quantity: 'Qty',
      loading: 'Loading order details...',
      backToOrders: '← Back to Orders',
      cannotCancel: 'Order cannot be cancelled at this stage',
      cannotReturn: 'Order can only be returned after delivery',
      orderCancelled: 'Order cancelled successfully',
      returnRequested: 'Return requested successfully'
    },
    te: {
      orderDetails: 'ఆర్డర్ వివరాలు',
      orderNumber: 'ఆర్డర్ నంబర్',
      orderDate: 'ఆర్డర్ తేదీ',
      status: 'స్థితి',
      items: 'వస్తువులు',
      shippingAddress: 'షిప్పింగ్ చిరునామా',
      paymentMethod: 'చెల్లింపు పద్ధతి',
      orderSummary: 'ఆర్డర్ సారాంశం',
      subtotal: 'ఉప మొత్తం',
      shipping: 'షిప్పింగ్',
      total: 'మొత్తం',
      cancelOrder: 'ఆర్డర్ రద్దు చేయండి',
      returnOrder: 'ఆర్డర్ తిరిగి ఇవ్వండి',
      confirmCancel: 'మీరు ఈ ఆర్డర్‌ను రద్దు చేయాలనుకుంటున్నారా?',
      confirmReturn: 'మీరు ఈ ఆర్డర్‌ను తిరిగి ఇవ్వాలనుకుంటున్నారా?',
      cancelReason: 'రద్దు చేయడానికి కారణం తెలపండి:',
      returnReason: 'తిరిగి ఇవ్వడానికి కారణం తెలపండి:',
      orderTimeline: 'ఆర్డర్ టైమ్‌లైన్',
      placed: 'ఆర్డర్ చేయబడింది',
      confirmed: 'నిర్ధారించబడింది',
      processing: 'ప్రాసెస్ అవుతోంది',
      shipped: 'షిప్ చేయబడింది',
      outForDelivery: 'డెలివరీకి బయలుదేరింది',
      delivered: 'డెలివరీ అయింది',
      cancelled: 'రద్దు చేయబడింది',
      returned: 'తిరిగి ఇవ్వబడింది',
      by: 'ద్వారా',
      quantity: 'పరిమాణం',
      loading: 'ఆర్డర్ వివరాలు లోడ్ అవుతున్నాయి...',
      backToOrders: '← ఆర్డర్లకు తిరిగి వెళ్లండి',
      cannotCancel: 'ఈ దశలో ఆర్డర్‌ను రద్దు చేయలేము',
      cannotReturn: 'డెలివరీ తర్వాత మాత్రమే ఆర్డర్‌ను తిరిగి ఇవ్వవచ్చు',
      orderCancelled: 'ఆర్డర్ విజయవంతంగా రద్దు చేయబడింది',
      returnRequested: 'రిటర్న్ విజయవంతంగా అభ్యర్థించబడింది'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user && user.role === 'buyer' && orderId) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderAPI.getById(orderId);
      setOrder(response.data?.order);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm(t.confirmCancel)) return;

    const reason = prompt(t.cancelReason);
    if (!reason) return;

    setActionLoading(true);
    try {
      await orderAPI.cancel(orderId, reason);
      toast.success(t.orderCancelled);
      await fetchOrderDetails();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.message || 'Failed to cancel order');
    }
    setActionLoading(false);
  };

  const handleReturnOrder = async () => {
    if (!window.confirm(t.confirmReturn)) return;

    const reason = prompt(t.returnReason);
    if (!reason) return;

    setActionLoading(true);
    try {
      await orderAPI.return(orderId, reason);
      toast.success(t.returnRequested);
      await fetchOrderDetails();
    } catch (error) {
      console.error('Error requesting return:', error);
      toast.error(error.message || 'Failed to request return');
    }
    setActionLoading(false);
  };

  const getStatusSteps = () => {
    const allSteps = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    if (order.status === 'cancelled' || order.status === 'returned') {
      return ['placed', order.status];
    }
    const currentIndex = allSteps.indexOf(order.status);
    return allSteps.slice(0, currentIndex + 1);
  };

  const canCancelOrder = () => {
    return order && ['placed', 'confirmed'].includes(order.status);
  };

  const canReturnOrder = () => {
    return order && order.status === 'delivered';
  };

  if (!user || user.role !== 'buyer') {
    return (
      <div className="order-details-page">
        <div className="message">Please login as a buyer to view order details</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="loading">{t.loading}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="message">Order not found</div>
      </div>
    );
  }

  const completedSteps = getStatusSteps();

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        {/* Header */}
        <div className="details-header">
          <button onClick={() => navigate('/buyer/orders')} className="back-btn">
            {t.backToOrders}
          </button>
          <h1>{t.orderDetails}</h1>
        </div>

        {/* Order Info Bar */}
        <div className="order-info-bar">
          <div className="info-item">
            <span className="label">{t.orderNumber}</span>
            <span className="value">{order.order_number}</span>
          </div>
          <div className="info-item">
            <span className="label">{t.orderDate}</span>
            <span className="value">{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <span className="label">{t.status}</span>
            <span className={`status-badge status-${order.status}`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Order Tracking Timeline */}
        <div className="order-tracking-section">
          <h2>{t.orderTimeline}</h2>
          <OrderTracking order={order} />
          
          {(order.status === 'cancelled' || order.status === 'returned') && (
            <div className="timeline-alert">
              <span className={`alert-badge status-${order.status}`}>
                {order.status.toUpperCase()}
              </span>
              {order.cancel_reason && <p>Reason: {order.cancel_reason}</p>}
              {order.return_reason && <p>Reason: {order.return_reason}</p>}
            </div>
          )}
          
          {order.status === 'delivered' && (
            <div className="reorder-section">
              <QuickReorder order={order} />
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="order-section">
          <h2>{t.items}</h2>
          <div className="order-items-list">
            {order.items && order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <img src={item.craft_images?.[0] || '/placeholder.jpg'} alt={item.craft_title} loading="lazy" />
                </div>
                <div className="item-details">
                  <h3>{item.craft_title}</h3>
                  <p className="artisan-name">{t.by} {item.artisan_name}</p>
                  <p className="item-quantity">{t.quantity}: {item.quantity}</p>
                </div>
                <div className="item-price">
                  <span className="unit-price">₹{item.price}</span>
                  <span className="total-price">₹{item.subtotal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="two-column-layout">
          {/* Shipping Address */}
          <div className="order-section">
            <h2>{t.shippingAddress}</h2>
            <div className="address-box">
              <p>{order.shipping_address}</p>
            </div>
            
            <h3 style={{ marginTop: '1.5rem' }}>{t.paymentMethod}</h3>
            <div className="payment-box">
              <p>{order.payment_method || 'Cash on Delivery'}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-section">
            <h2>{t.orderSummary}</h2>
            <div className="summary-box">
              <div className="summary-row">
                <span>{t.subtotal}:</span>
                <span>₹{order.total_amount}</span>
              </div>
              <div className="summary-row">
                <span>{t.shipping}:</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>{t.total}:</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-actions">
          {canCancelOrder() && (
            <button 
              onClick={handleCancelOrder} 
              className="cancel-btn"
              disabled={actionLoading}
            >
              {t.cancelOrder}
            </button>
          )}
          {canReturnOrder() && (
            <button 
              onClick={handleReturnOrder} 
              className="return-btn"
              disabled={actionLoading}
            >
              {t.returnOrder}
            </button>
          )}
        </div>

        {/* Order Invoice */}
        {order.status === 'delivered' && (
          <div className="order-section invoice-section">
            <h2>{language === 'ta' ? 'விலைப்பட்டியல்' : 'Invoice'}</h2>
            <OrderInvoice order={{
              ...order,
              orderNumber: order.order_number,
              createdAt: order.created_at,
              totalAmount: order.total_amount,
              items: order.items?.map(item => ({
                name: item.craft_title,
                price: item.price,
                quantity: item.quantity,
                image: item.craft_images?.[0]
              })),
              shippingAddress: {
                name: order.buyer_name,
                addressLine1: order.shipping_address,
                city: '',
                state: '',
                pincode: ''
              }
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
