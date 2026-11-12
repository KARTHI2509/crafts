import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
      {/* Success Animation */}
      <div style={{
        width: '100px',
        height: '100px',
        margin: '0 auto 1.5rem',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'popIn 0.5s ease-out'
      }}>
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
        Order Placed Successfully! 🎉
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.125rem' }}>
        Thank you for supporting handmade crafts!
      </p>

      {/* Order Details Card */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        textAlign: 'left',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Order ID</div>
            <div style={{ fontWeight: '600', color: '#1f2937', fontFamily: 'monospace' }}>#{order.id || order._id}</div>
          </div>
          <div style={{
            padding: '0.5rem 1rem',
            background: '#fef3c7',
            color: '#92400e',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {order.status || 'Processing'}
          </div>
        </div>

        {/* Order Items */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>Items Ordered</h3>
          {order.items?.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 0',
              borderBottom: index < order.items.length - 1 ? '1px solid #f3f4f6' : 'none'
            }}>
              <img
                src={item.image || 'https://placehold.co/60x60?text=Craft'}
                alt={item.name}
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: '#1f2937' }}>{item.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Qty: {item.quantity}</div>
              </div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Shipping Address */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          padding: '1.5rem 0',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div>
            <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📍 Delivery Address
            </h3>
            {order.shipping_address && (
              <p style={{ color: '#6b7280', margin: 0, lineHeight: '1.6' }}>
                {order.shipping_address.fullName}<br />
                {order.shipping_address.address}<br />
                {order.shipping_address.city}, {order.shipping_address.state}<br />
                {order.shipping_address.pincode}<br />
                📞 {order.shipping_address.phone}
              </p>
            )}
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💳 Payment
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
            </p>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.875rem' }}>
                <span>Subtotal</span>
                <span>₹{((order.total_amount || 0) - (order.shipping_cost || 0)).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.875rem' }}>
                <span>Shipping</span>
                <span>{order.shipping_cost === 0 ? 'FREE' : `₹${order.shipping_cost}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#1f2937', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e5e7eb' }}>
                <span>Total</span>
                <span>₹{(order.total_amount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expected Delivery */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>📦</div>
        <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>Expected Delivery</h3>
        <p style={{ color: '#3b82f6', margin: 0, fontSize: '1.125rem' }}>
          {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
        <p style={{ color: '#6b7280', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
          You'll receive tracking updates via email
        </p>
      </div>

      {/* What's Next */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { icon: '📧', title: 'Email Sent', desc: 'Order confirmation in your inbox' },
          { icon: '🔔', title: 'Track Order', desc: 'Get updates on your delivery' },
          { icon: '💬', title: 'Need Help?', desc: 'Contact artisan directly' }
        ].map((item, index) => (
          <div key={index} style={{
            padding: '1.25rem',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
            <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>{item.title}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link
          to="/orders"
          style={{
            padding: '0.875rem 2rem',
            background: '#2563eb',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          📋 View My Orders
        </Link>
        <Link
          to="/explore"
          style={{
            padding: '0.875rem 2rem',
            background: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🛍️ Continue Shopping
        </Link>
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;
