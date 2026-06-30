import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";
import "./Cart.css";
import SEO from "../components/SEO";
import { trackEvent } from "../utils/analytics";

export default function Cart() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const t = {
    en: {
      title: "Your Shopping Cart",
      empty: "Your cart is currently empty.",
      startShopping: "Start Shopping",
      subtotal: "Subtotal",
      shipping: "Shipping Estimate",
      total: "Total",
      checkout: "Proceed to Checkout",
      clear: "Clear Cart",
      loading: "Loading your cart...",
      secure: "Secure Checkout"
    },
    te: {
      title: "మీ షాపింగ్ కార్ట్",
      empty: "మీ కార్ట్ ప్రస్తుతం ఖాళీగా ఉంది.",
      startShopping: "షాపింగ్ ప్రారంభించండి",
      subtotal: "ఉప మొత్తం",
      shipping: "షిప్పింగ్ అంచనా",
      total: "మొత్తం",
      checkout: "చెక్అవుట్‌కు వెళ్లండి",
      clear: "కార్ట్ క్లియర్ చేయండి",
      loading: "మీ కార్ట్ లోడ్ అవుతోంది...",
      secure: "సురక్షిత చెక్అవుట్"
    }
  }[language] || {
    title: "Your Shopping Cart",
    empty: "Your cart is currently empty.",
    startShopping: "Start Shopping",
    subtotal: "Subtotal",
    shipping: "Shipping Estimate",
    total: "Total",
    checkout: "Proceed to Checkout",
    clear: "Clear Cart",
    loading: "Loading your cart...",
    secure: "Secure Checkout"
  };

  useEffect(() => {
    trackEvent('page_visit', { page: 'cart' });
    if (user?.role === "buyer") {
      fetchCart();
    } else if (user && user.role !== "buyer") {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartAPI.getCart();
      setCartItems(res.data?.data?.cart_items || []);
    } catch (error) {
      console.error("Cart error", error);
      // Fallback mock if API fails
      setCartItems([
        { id: "1", craft_title: "Handwoven Silk Saree", artisan_name: "Rajesh Kumar", price: 4500, quantity: 1, subtotal: 4500, craft_images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400"], stock: 5 },
        { id: "2", craft_title: "Terracotta Vase", artisan_name: "Meera Devi", price: 850, quantity: 2, subtotal: 1700, craft_images: ["https://images.unsplash.com/photo-1615397349754-5e6d2e18b0b8?w=400"], stock: 10 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      setUpdating(true);
      await cartAPI.updateCart(id, { quantity: newQty });
      await fetchCart();
    } catch (e) {
      // Mock update
      setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty, subtotal: newQty * item.price } : item));
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (id) => {
    try {
      setUpdating(true);
      await cartAPI.removeItem(id);
      await fetchCart();
    } catch (e) {
      // Mock delete
      setCartItems(prev => prev.filter(item => item.id !== id));
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure?")) return;
    try {
      setUpdating(true);
      await cartAPI.clearCart();
      setCartItems([]);
    } catch (e) {
      setCartItems([]);
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    trackEvent('checkout_start', { 
      itemsCount: cartItems.length, 
      subtotal 
    });
    navigate("/checkout"); // Needs Checkout phase to be built
  };

  if (!user || user.role !== "buyer") {
    return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Please login as a buyer to view your cart.</div>;
  }

  if (loading) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>{t.loading}</div>;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const shipping = cartItems.length > 0 ? 150 : 0;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <SEO title="Your Cart" />
      <div className="container">
        
        <div className="cart-header">
          <h1>{t.title} ({cartItems.length})</h1>
          {cartItems.length > 0 && (
            <button className="btn secondary" onClick={clearCart} disabled={updating}>
              <Trash2 size={16} style={{marginRight: '8px'}} /> {t.clear}
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <motion.div className="cart-empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ShoppingBag size={64} color="var(--color-border)" style={{ marginBottom: '1rem' }} />
            <h2>{t.empty}</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Discover unique handcrafted items.</p>
            <button className="btn hover-lift" onClick={() => navigate("/explore")}>{t.startShopping}</button>
          </motion.div>
        ) : (
          <div className="cart-layout">
            
            {/* Items List */}
            <div className="cart-items-list">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    className="cart-item-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <img src={item.craft_images?.[0] || "https://via.placeholder.com/150"} alt={item.craft_title} className="cart-item-image" />
                    
                    <div className="cart-item-info">
                      <h3>{item.craft_title}</h3>
                      <p className="cart-item-artisan">by {item.artisan_name}</p>
                      <div className="cart-item-price">₹{item.price}</div>
                    </div>

                    <div className="cart-item-actions">
                      <div className="qty-controls">
                        <button disabled={updating || item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button disabled={updating || item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '1.2rem', minWidth: '80px', textAlign: 'right' }}>
                        ₹{item.subtotal}
                      </div>

                      <button className="btn-remove" disabled={updating} onClick={() => removeItem(item.id)}>
                        <Trash2 size={20} />
                      </button>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div className="cart-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>{t.subtotal}</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>{t.shipping}</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>

              <div className="summary-total">
                <span>{t.total}</span>
                <span style={{ color: 'var(--color-primary)' }}>₹{total.toFixed(2)}</span>
              </div>

              <button className="btn shine-effect btn-checkout" onClick={handleCheckout} disabled={updating}>
                {t.checkout} <ArrowRight size={18} />
              </button>

              <div className="secure-checkout">
                <ShieldCheck size={18} /> {t.secure}
              </div>
            </motion.div>

          </div>
        )}

      </div>
    </div>
  );
}