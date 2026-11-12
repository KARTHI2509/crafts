import React, { useState, createContext, useContext } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './CouponCode.css';

// ============================================
// COUPON CONTEXT - Manage discount state
// ============================================
const CouponContext = createContext(null);

// Sample coupon codes (in real app, validate against backend)
const VALID_COUPONS = {
  'WELCOME10': { discount: 10, type: 'percent', minOrder: 500, description: '10% off your first order' },
  'SAVE20': { discount: 20, type: 'percent', minOrder: 1000, description: '20% off orders ₹1000+' },
  'FLAT100': { discount: 100, type: 'flat', minOrder: 500, description: '₹100 off orders ₹500+' },
  'CRAFT15': { discount: 15, type: 'percent', minOrder: 0, description: '15% off on all crafts' },
  'FESTIVE25': { discount: 25, type: 'percent', minOrder: 1500, description: '25% off festive orders' },
};

export function CouponProvider({ children }) {
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const applyCoupon = (code, orderTotal) => {
    const coupon = VALID_COUPONS[code.toUpperCase()];
    
    if (!coupon) {
      return { success: false, message: 'Invalid coupon code' };
    }
    
    if (orderTotal < coupon.minOrder) {
      return { 
        success: false, 
        message: `Minimum order of ₹${coupon.minOrder} required for this coupon` 
      };
    }

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = Math.round((orderTotal * coupon.discount) / 100);
    } else {
      discount = coupon.discount;
    }

    setAppliedCoupon({ code: code.toUpperCase(), ...coupon });
    setDiscountAmount(discount);
    
    return { success: true, discount, message: 'Coupon applied successfully!' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const getAvailableCoupons = () => {
    return Object.entries(VALID_COUPONS).map(([code, details]) => ({
      code,
      ...details
    }));
  };

  return (
    <CouponContext.Provider value={{
      appliedCoupon,
      discountAmount,
      applyCoupon,
      removeCoupon,
      getAvailableCoupons
    }}>
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupon() {
  const context = useContext(CouponContext);
  if (!context) {
    return {
      appliedCoupon: null,
      discountAmount: 0,
      applyCoupon: () => ({ success: false, message: 'Coupon system not available' }),
      removeCoupon: () => {},
      getAvailableCoupons: () => []
    };
  }
  return context;
}

// ============================================
// COUPON INPUT COMPONENT
// ============================================
export function CouponInput({ orderTotal }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  
  const { appliedCoupon, discountAmount, applyCoupon, removeCoupon, getAvailableCoupons } = useCoupon();
  const langContext = useLanguage();
  const language = langContext?.language || 'en';

  const texts = {
    en: {
      enterCode: 'Enter coupon code',
      apply: 'Apply',
      remove: 'Remove',
      viewCoupons: 'View Available Coupons',
      hideCoupons: 'Hide Coupons',
      availableCoupons: 'Available Coupons',
      minOrder: 'Min. order',
      noMinimum: 'No minimum',
      applyCoupon: 'Apply',
      couponApplied: 'Coupon applied',
      youSave: 'You save'
    },
    ta: {
      enterCode: 'கூப்பன் குறியீட்டை உள்ளிடவும்',
      apply: 'பயன்படுத்து',
      remove: 'அகற்று',
      viewCoupons: 'கூப்பன்களைக் காண்க',
      hideCoupons: 'கூப்பன்களை மறை',
      availableCoupons: 'கிடைக்கும் கூப்பன்கள்',
      minOrder: 'குறைந்தபட்ச ஆர்டர்',
      noMinimum: 'குறைந்தபட்சம் இல்லை',
      applyCoupon: 'பயன்படுத்து',
      couponApplied: 'கூப்பன் பயன்படுத்தப்பட்டது',
      youSave: 'சேமிப்பு'
    }
  };

  const t = texts[language] || texts.en;

  const handleApply = () => {
    if (!code.trim()) return;
    
    const result = applyCoupon(code, orderTotal);
    setMessage(result.message);
    setIsSuccess(result.success);
    
    if (result.success) {
      setCode('');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setMessage(null);
  };

  const handleQuickApply = (couponCode) => {
    const result = applyCoupon(couponCode, orderTotal);
    setMessage(result.message);
    setIsSuccess(result.success);
    setShowCoupons(false);
    
    if (result.success) {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const availableCoupons = getAvailableCoupons();

  return (
    <div className="coupon-section">
      {appliedCoupon ? (
        <div className="coupon-applied">
          <div className="coupon-applied-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <span className="coupon-code-applied">{appliedCoupon.code}</span>
              <span className="coupon-savings">{t.youSave}: ₹{discountAmount}</span>
            </div>
          </div>
          <button className="btn-remove-coupon" onClick={handleRemove}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          <div className="coupon-input-wrapper">
            <div className="coupon-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
                <path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
                <path d="M12 4v16" />
                <path d="M4 12h16" />
                <circle cx="8" cy="8" r="1" />
                <circle cx="16" cy="16" r="1" />
              </svg>
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t.enterCode}
              className="coupon-input"
              onKeyPress={(e) => e.key === 'Enter' && handleApply()}
            />
            <button 
              className="btn-apply-coupon"
              onClick={handleApply}
              disabled={!code.trim()}
            >
              {t.apply}
            </button>
          </div>

          {message && (
            <div className={`coupon-message ${isSuccess ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button 
            className="btn-view-coupons"
            onClick={() => setShowCoupons(!showCoupons)}
          >
            {showCoupons ? t.hideCoupons : t.viewCoupons}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points={showCoupons ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
            </svg>
          </button>

          {showCoupons && (
            <div className="available-coupons">
              <h4>{t.availableCoupons}</h4>
              {availableCoupons.map((coupon) => (
                <div key={coupon.code} className="coupon-card">
                  <div className="coupon-card-left">
                    <span className="coupon-code">{coupon.code}</span>
                    <span className="coupon-desc">{coupon.description}</span>
                    <span className="coupon-min">
                      {coupon.minOrder > 0 ? `${t.minOrder}: ₹${coupon.minOrder}` : t.noMinimum}
                    </span>
                  </div>
                  <button 
                    className="btn-quick-apply"
                    onClick={() => handleQuickApply(coupon.code)}
                  >
                    {t.applyCoupon}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// COUPON SUMMARY (for cart/checkout)
// ============================================
export function CouponSummary() {
  const { appliedCoupon, discountAmount } = useCoupon();
  const langContext = useLanguage();
  const language = langContext?.language || 'en';

  if (!appliedCoupon) return null;

  const texts = {
    en: { discount: 'Coupon Discount' },
    ta: { discount: 'கூப்பன் தள்ளுபடி' }
  };

  const t = texts[language] || texts.en;

  return (
    <div className="coupon-summary-line">
      <span>{t.discount} ({appliedCoupon.code})</span>
      <span className="discount-amount">-₹{discountAmount}</span>
    </div>
  );
}

export default CouponInput;
