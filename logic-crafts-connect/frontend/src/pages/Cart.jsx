import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const text = {
    en: {
      shoppingCart: 'Shopping Cart',
      empty: 'Your cart is empty',
      startShopping: 'Start Shopping',
      item: 'Item',
      price: 'Price',
      quantity: 'Quantity',
      subtotal: 'Subtotal',
      total: 'Total',
      proceedToCheckout: 'Proceed to Checkout',
      remove: 'Remove',
      clearCart: 'Clear Cart',
      confirmClear: 'Are you sure you want to clear your cart?',
      loading: 'Loading cart...',
      outOfStock: 'Out of Stock'
    },
    te: {
      shoppingCart: 'షాపింగ్ కార్ట్',
      empty: 'మీ కార్ట్ ఖాళీగా ఉంది',
      startShopping: 'షాపింగ్ ప్రారంభించండి',
      item: 'వస్తువు',
      price: 'ధర',
      quantity: 'పరిమాణం',
      subtotal: 'ఉప మొత్తం',
      total: 'మొత్తం',
      proceedToCheckout: 'చెక్అవుట్‌కు వెళ్లండి',
      remove: 'తొలగించు',
      clearCart: 'కార్ట్ క్లియర్ చేయండి',
      confirmClear: 'మీరు మీ కార్ట్‌ను క్లియర్ చేయాలనుకుంటున్నారా?',
      loading: 'కార్ట్ లోడ్ చేస్తోంది...',
      outOfStock: 'స్టాక్ లో లేదు'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data.data.cart_items || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/cart/${itemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
    setUpdating(false);
  };

  const removeItem = async (itemId) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
    setUpdating(false);
  };

  const clearCart = async () => {
    if (!window.confirm(t.confirmClear)) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    }
    setUpdating(false);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.subtotal || 0), 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!user || user.role !== 'buyer') {
    return (
      <div className="cart-page">
        <div className="message">Please login as a buyer to view cart</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>{t.shoppingCart}</h1>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="clear-cart-btn" disabled={updating}>
              🗑️ {t.clearCart}
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <p>{t.empty}</p>
            <button onClick={() => navigate('/explore')} className="start-shopping-btn">
              {t.startShopping}
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img 
                      src={item.craft_images?.[0] || '/placeholder.jpg'} 
                      alt={item.craft_title}
                    />
                    {item.stock === 0 && (
                      <div className="out-of-stock-badge">{t.outOfStock}</div>
                    )}
                  </div>

                  <div className="item-details">
                    <h3>{item.craft_title}</h3>
                    <p className="artisan-name">by {item.artisan_name}</p>
                    <p className="item-price">₹{item.price}</p>
                  </div>

                  <div className="item-quantity">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={updating || item.quantity <= 1}
                      className="qty-btn"
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updating || item.quantity >= item.stock}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-subtotal">
                    <p className="subtotal-label">{t.subtotal}</p>
                    <p className="subtotal-amount">₹{item.subtotal?.toFixed(2)}</p>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    className="remove-btn"
                    disabled={updating}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span className="summary-label">{t.total}</span>
                <span className="summary-value">₹{calculateTotal().toFixed(2)}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="checkout-btn"
                disabled={updating || cartItems.some(item => item.stock === 0)}
              >
                {t.proceedToCheckout} →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
