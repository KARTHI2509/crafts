import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { GiftWrapOption, GiftWrapSummary, useGiftWrap } from '../components/GiftWrap';
import { useCoupon, CouponSummary } from '../components/CouponCode';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getGiftWrapCost, giftWrap } = useGiftWrap();
  const { discountAmount } = useCoupon();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, online

  useEffect(() => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user, navigate]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        setCartItems(res.data.data.items || []);
        if (!res.data.data.items?.length) {
          toast.error('Your cart is empty');
          navigate('/cart');
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 500 ? 0 : 50; // Free shipping over ₹500
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + getGiftWrapCost() - discountAmount;
  };

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;
    
    setProcessing(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          craft_id: item.craft_id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        total_amount: calculateTotal(),
        shipping_cost: calculateShipping()
      };

      const res = await api.post('/orders', orderData);
      
      if (res.data.success) {
        toast.success('Order placed successfully!');
        navigate('/order-confirmation', { 
          state: { order: res.data.data.order }
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>Checkout</h1>
      
      {/* Progress Steps */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        {[
          { num: 1, label: 'Address' },
          { num: 2, label: 'Payment' },
          { num: 3, label: 'Review' }
        ].map((s, index) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              onClick={() => s.num < step && setStep(s.num)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                cursor: s.num < step ? 'pointer' : 'default',
                background: step >= s.num ? '#2563eb' : '#e5e7eb',
                color: step >= s.num ? 'white' : '#6b7280'
              }}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span style={{ marginLeft: '0.5rem', fontWeight: step === s.num ? 'bold' : 'normal', color: step >= s.num ? '#2563eb' : '#6b7280' }}>
              {s.label}
            </span>
            {index < 2 && (
              <div style={{ width: '60px', height: '2px', margin: '0 1rem', background: step > s.num ? '#2563eb' : '#e5e7eb' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Main Content */}
        <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>Shipping Address</h2>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Address *</label>
                  <textarea
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleAddressChange}
                    rows={2}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', resize: 'vertical' }}
                    placeholder="House no., Building, Street"
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                      placeholder="State"
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingAddress.pincode}
                      onChange={handleAddressChange}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                      placeholder="6-digit pincode"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Landmark (Optional)</label>
                    <input
                      type="text"
                      name="landmark"
                      value={shippingAddress.landmark}
                      onChange={handleAddressChange}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                      placeholder="Near..."
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => validateAddress() && setStep(2)}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  padding: '1rem',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>Payment Method</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    border: `2px solid ${paymentMethod === 'cod' ? '#2563eb' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: paymentMethod === 'cod' ? '#eff6ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginRight: '1rem', width: '20px', height: '20px' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>💵 Cash on Delivery</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pay when you receive your order</div>
                  </div>
                </label>
                
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    border: `2px solid ${paymentMethod === 'online' ? '#2563eb' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: paymentMethod === 'online' ? '#eff6ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginRight: '1rem', width: '20px', height: '20px' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>💳 Online Payment</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>UPI, Credit/Debit Card, Net Banking</div>
                  </div>
                </label>
              </div>
              
              {/* Gift Wrap Option */}
              <GiftWrapOption />
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    flex: 2,
                    padding: '1rem',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>Review Your Order</h2>
              
              {/* Shipping Address Summary */}
              <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: '600', color: '#374151' }}>📍 Shipping Address</h3>
                  <button onClick={() => setStep(1)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Edit</button>
                </div>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  {shippingAddress.fullName}<br />
                  {shippingAddress.address}<br />
                  {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}<br />
                  Phone: {shippingAddress.phone}
                </p>
              </div>
              
              {/* Payment Method Summary */}
              <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: '600', color: '#374151' }}>💳 Payment Method</h3>
                  <button onClick={() => setStep(2)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Edit</button>
                </div>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  {paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                </p>
              </div>
              
              {/* Order Items */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>📦 Order Items ({cartItems.length})</h3>
                {cartItems.map(item => (
                  <div key={item.craft_id} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #e5e7eb' }}>
                    <img
                      src={item.image || 'https://placehold.co/80x80?text=Craft'}
                      alt={item.name}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>{item.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  style={{
                    flex: 2,
                    padding: '1rem',
                    background: processing ? '#9ca3af' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: processing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? 'Placing Order...' : `Place Order • ₹${calculateTotal().toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content', position: 'sticky', top: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>Order Summary</h2>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
            {cartItems.map(item => (
              <div key={item.craft_id} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <img
                  src={item.image || 'https://placehold.co/50x50?text=Craft'}
                  alt={item.name}
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
          
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#6b7280' }}>
              <span>Subtotal</span>
              <span>₹{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#6b7280' }}>
              <span>Shipping</span>
              <span style={{ color: calculateShipping() === 0 ? '#16a34a' : 'inherit' }}>
                {calculateShipping() === 0 ? 'FREE' : `₹${calculateShipping()}`}
              </span>
            </div>
            {calculateShipping() > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#16a34a', marginBottom: '0.5rem' }}>
                Add ₹{(500 - calculateSubtotal()).toLocaleString()} more for free shipping
              </div>
            )}
            
            {/* Gift Wrap Summary */}
            <GiftWrapSummary />
            
            {/* Coupon Discount Summary */}
            <CouponSummary />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.125rem', color: '#1f2937', borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span>Total</span>
              <span>₹{calculateTotal().toLocaleString()}</span>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '6px', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span>🔒</span>
            <span style={{ fontSize: '0.75rem', color: '#92400e' }}>Your payment information is secure. We use industry-standard encryption.</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 400px"] {
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

export default Checkout;
