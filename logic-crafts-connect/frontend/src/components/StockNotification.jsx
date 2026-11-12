import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './StockNotification.css';

// ============================================
// STOCK NOTIFICATION SIGNUP
// Used when a product is out of stock
// ============================================
export function StockNotification({ productId, productName, onClose }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notifyBy, setNotifyBy] = useState('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const authContext = useAuth();
  const user = authContext?.user;
  const langContext = useLanguage();
  const language = langContext?.language || 'en';

  const texts = {
    en: {
      outOfStock: 'Out of Stock',
      notifyMe: 'Notify Me When Available',
      description: "We'll send you a notification as soon as this item is back in stock",
      notifyVia: 'Notify me via',
      emailOption: 'Email',
      smsOption: 'SMS',
      enterEmail: 'Enter your email address',
      enterPhone: 'Enter your phone number',
      subscribe: 'Subscribe',
      subscribing: 'Subscribing...',
      successTitle: 'You\'re on the list!',
      successMessage: 'We\'ll notify you when this product is back in stock.',
      close: 'Close',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      alreadySignedUp: 'You are already signed up for notifications',
      productLabel: 'Product'
    },
    ta: {
      outOfStock: 'இருப்பில் இல்லை',
      notifyMe: 'கிடைக்கும்போது தெரிவிக்கவும்',
      description: 'இந்த பொருள் மீண்டும் இருப்பில் வரும்போது உங்களுக்கு அறிவிப்பு அனுப்புவோம்',
      notifyVia: 'வழியாக தெரிவிக்கவும்',
      emailOption: 'மின்னஞ்சல்',
      smsOption: 'எஸ்எம்எஸ்',
      enterEmail: 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்',
      enterPhone: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
      subscribe: 'பதிவு செய்',
      subscribing: 'பதிவு செய்கிறது...',
      successTitle: 'நீங்கள் பட்டியலில் உள்ளீர்கள்!',
      successMessage: 'இந்த தயாரிப்பு மீண்டும் இருப்பில் வரும்போது தெரிவிப்போம்.',
      close: 'மூடு',
      invalidEmail: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்',
      invalidPhone: 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்',
      alreadySignedUp: 'நீங்கள் ஏற்கனவே அறிவிப்புகளுக்கு பதிவு செய்துள்ளீர்கள்',
      productLabel: 'தயாரிப்பு'
    }
  };

  const t = texts[language] || texts.en;

  // Pre-fill email if user is logged in
  React.useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\D/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (notifyBy === 'email' && !validateEmail(email)) {
      setError(t.invalidEmail);
      return;
    }

    if (notifyBy === 'sms' && !validatePhone(phone)) {
      setError(t.invalidPhone);
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to localStorage (in real app, send to backend)
      const notifications = JSON.parse(localStorage.getItem('stock_notifications') || '[]');
      
      const existingIndex = notifications.findIndex(
        n => n.productId === productId && (n.email === email || n.phone === phone)
      );

      if (existingIndex >= 0) {
        setError(t.alreadySignedUp);
        setIsSubmitting(false);
        return;
      }

      notifications.push({
        productId,
        productName,
        email: notifyBy === 'email' ? email : null,
        phone: notifyBy === 'sms' ? phone : null,
        notifyBy,
        createdAt: new Date().toISOString()
      });

      localStorage.setItem('stock_notifications', JSON.stringify(notifications));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="stock-notify-success">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3>{t.successTitle}</h3>
        <p>{t.successMessage}</p>
        <p className="notify-product-name">{productName}</p>
        {onClose && (
          <button className="btn-close-notify" onClick={onClose}>
            {t.close}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="stock-notification">
      <div className="stock-notify-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span>{t.outOfStock}</span>
      </div>

      <h3>{t.notifyMe}</h3>
      <p className="notify-description">{t.description}</p>

      <form onSubmit={handleSubmit} className="notify-form">
        {/* Notify Method Toggle */}
        <div className="notify-method-toggle">
          <span>{t.notifyVia}:</span>
          <div className="method-buttons">
            <button
              type="button"
              className={`method-btn ${notifyBy === 'email' ? 'active' : ''}`}
              onClick={() => setNotifyBy('email')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {t.emailOption}
            </button>
            <button
              type="button"
              className={`method-btn ${notifyBy === 'sms' ? 'active' : ''}`}
              onClick={() => setNotifyBy('sms')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              {t.smsOption}
            </button>
          </div>
        </div>

        {/* Input Field */}
        {notifyBy === 'email' ? (
          <div className="notify-input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.enterEmail}
              required
            />
          </div>
        ) : (
          <div className="notify-input-group">
            <span className="phone-prefix">+91</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder={t.enterPhone}
              required
            />
          </div>
        )}

        {error && <p className="notify-error">{error}</p>}

        <button 
          type="submit" 
          className="btn-notify-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              {t.subscribing}
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {t.subscribe}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ============================================
// COMPACT NOTIFY BUTTON (for product cards)
// ============================================
export function NotifyButton({ productId, productName }) {
  const [showModal, setShowModal] = useState(false);
  const langContext = useLanguage();
  const language = langContext?.language || 'en';

  const texts = {
    en: { notifyMe: 'Notify Me' },
    ta: { notifyMe: 'தெரிவிக்கவும்' }
  };

  const t = texts[language] || texts.en;

  return (
    <>
      <button className="btn-notify-me" onClick={() => setShowModal(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {t.notifyMe}
      </button>

      {showModal && (
        <div className="notify-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="notify-modal" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setShowModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <StockNotification 
              productId={productId}
              productName={productName}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// INLINE NOTIFY (for product detail page)
// ============================================
export function InlineStockNotify({ productId, productName, stock }) {
  if (stock > 0) return null;

  return (
    <div className="inline-stock-notify">
      <StockNotification productId={productId} productName={productName} />
    </div>
  );
}

export default StockNotification;
