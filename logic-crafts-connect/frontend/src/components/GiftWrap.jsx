import React, { useState, createContext, useContext } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './GiftWrap.css';

// ============================================
// GIFT WRAP CONTEXT
// ============================================
const GiftWrapContext = createContext(null);

const GIFT_WRAP_PRICE = 49;

export function GiftWrapProvider({ children }) {
  const [giftWrap, setGiftWrap] = useState({
    enabled: false,
    message: '',
    recipientName: '',
    senderName: '',
    wrapStyle: 'classic'
  });

  const enableGiftWrap = () => {
    setGiftWrap(prev => ({ ...prev, enabled: true }));
  };

  const disableGiftWrap = () => {
    setGiftWrap({
      enabled: false,
      message: '',
      recipientName: '',
      senderName: '',
      wrapStyle: 'classic'
    });
  };

  const updateGiftDetails = (details) => {
    setGiftWrap(prev => ({ ...prev, ...details }));
  };

  const getGiftWrapCost = () => {
    return giftWrap.enabled ? GIFT_WRAP_PRICE : 0;
  };

  return (
    <GiftWrapContext.Provider value={{
      giftWrap,
      enableGiftWrap,
      disableGiftWrap,
      updateGiftDetails,
      getGiftWrapCost,
      GIFT_WRAP_PRICE
    }}>
      {children}
    </GiftWrapContext.Provider>
  );
}

export function useGiftWrap() {
  const context = useContext(GiftWrapContext);
  if (!context) {
    return {
      giftWrap: { enabled: false, message: '', recipientName: '', senderName: '', wrapStyle: 'classic' },
      enableGiftWrap: () => {},
      disableGiftWrap: () => {},
      updateGiftDetails: () => {},
      getGiftWrapCost: () => 0,
      GIFT_WRAP_PRICE: 49
    };
  }
  return context;
}

// ============================================
// GIFT WRAP OPTION COMPONENT
// ============================================
export function GiftWrapOption() {
  const { giftWrap, enableGiftWrap, disableGiftWrap, updateGiftDetails, GIFT_WRAP_PRICE } = useGiftWrap();
  const langContext = useLanguage();
  const language = langContext?.language || 'en';

  const texts = {
    en: {
      giftWrap: 'Gift Wrap',
      giftWrapDesc: 'Add premium gift wrapping and a personalized message',
      addGiftWrap: 'Add Gift Wrapping',
      giftWrapPrice: `+₹${GIFT_WRAP_PRICE}`,
      wrapStyle: 'Wrapping Style',
      classic: 'Classic',
      festive: 'Festive',
      elegant: 'Elegant',
      eco: 'Eco-Friendly',
      recipientName: 'Recipient Name',
      senderName: 'From (Your Name)',
      message: 'Gift Message',
      messagePlaceholder: 'Write a heartfelt message...',
      charLimit: 'characters remaining',
      removeGiftWrap: 'Remove Gift Wrap'
    },
    ta: {
      giftWrap: 'பரிசு மடிப்பு',
      giftWrapDesc: 'பிரீமியம் பரிசு மடிப்பு மற்றும் தனிப்பயனாக்கப்பட்ட செய்தியை சேர்க்கவும்',
      addGiftWrap: 'பரிசு மடிப்பு சேர்',
      giftWrapPrice: `+₹${GIFT_WRAP_PRICE}`,
      wrapStyle: 'மடிப்பு பாணி',
      classic: 'கிளாசிக்',
      festive: 'விழா',
      elegant: 'நேர்த்தியான',
      eco: 'சுற்றுச்சூழல்',
      recipientName: 'பெறுநர் பெயர்',
      senderName: 'அனுப்புநர் (உங்கள் பெயர்)',
      message: 'பரிசு செய்தி',
      messagePlaceholder: 'ஒரு இதயப்பூர்வமான செய்தி எழுதுங்கள்...',
      charLimit: 'எழுத்துக்கள் மீதமுள்ளன',
      removeGiftWrap: 'பரிசு மடிப்பை அகற்று'
    }
  };

  const t = texts[language] || texts.en;
  const MAX_MESSAGE_LENGTH = 150;
  const remainingChars = MAX_MESSAGE_LENGTH - (giftWrap.message?.length || 0);

  const wrapStyles = [
    { id: 'classic', emoji: '🎁', label: t.classic },
    { id: 'festive', emoji: '🎄', label: t.festive },
    { id: 'elegant', emoji: '✨', label: t.elegant },
    { id: 'eco', emoji: '🌿', label: t.eco }
  ];

  return (
    <div className="gift-wrap-section">
      <div className="gift-wrap-header">
        <div className="gift-wrap-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="8" width="18" height="13" rx="2" />
            <path d="M12 8v13" />
            <path d="M3 13h18" />
            <path d="M8 3c0 2.5 2 5 4 5s4-2.5 4-5" />
          </svg>
        </div>
        <div className="gift-wrap-info">
          <h4>{t.giftWrap}</h4>
          <p>{t.giftWrapDesc}</p>
        </div>
        <label className="gift-wrap-toggle">
          <input
            type="checkbox"
            checked={giftWrap.enabled}
            onChange={(e) => e.target.checked ? enableGiftWrap() : disableGiftWrap()}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-price">{t.giftWrapPrice}</span>
        </label>
      </div>

      {giftWrap.enabled && (
        <div className="gift-wrap-details">
          {/* Wrap Style Selection */}
          <div className="wrap-style-section">
            <label>{t.wrapStyle}</label>
            <div className="wrap-styles">
              {wrapStyles.map((style) => (
                <button
                  key={style.id}
                  className={`wrap-style-btn ${giftWrap.wrapStyle === style.id ? 'active' : ''}`}
                  onClick={() => updateGiftDetails({ wrapStyle: style.id })}
                >
                  <span className="style-emoji">{style.emoji}</span>
                  <span className="style-label">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient & Sender Names */}
          <div className="gift-names-row">
            <div className="gift-input-group">
              <label>{t.recipientName}</label>
              <input
                type="text"
                value={giftWrap.recipientName}
                onChange={(e) => updateGiftDetails({ recipientName: e.target.value })}
                placeholder="To..."
              />
            </div>
            <div className="gift-input-group">
              <label>{t.senderName}</label>
              <input
                type="text"
                value={giftWrap.senderName}
                onChange={(e) => updateGiftDetails({ senderName: e.target.value })}
                placeholder="From..."
              />
            </div>
          </div>

          {/* Gift Message */}
          <div className="gift-message-group">
            <label>{t.message}</label>
            <textarea
              value={giftWrap.message}
              onChange={(e) => {
                if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                  updateGiftDetails({ message: e.target.value });
                }
              }}
              placeholder={t.messagePlaceholder}
              rows={3}
            />
            <span className={`char-count ${remainingChars < 20 ? 'low' : ''}`}>
              {remainingChars} {t.charLimit}
            </span>
          </div>

          {/* Preview */}
          <div className="gift-preview">
            <div className={`preview-card style-${giftWrap.wrapStyle}`}>
              <div className="preview-ribbon"></div>
              <div className="preview-content">
                {giftWrap.recipientName && (
                  <p className="preview-to">To: {giftWrap.recipientName}</p>
                )}
                {giftWrap.message && (
                  <p className="preview-message">"{giftWrap.message}"</p>
                )}
                {giftWrap.senderName && (
                  <p className="preview-from">With love, {giftWrap.senderName}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// GIFT WRAP SUMMARY (for order review)
// ============================================
export function GiftWrapSummary() {
  const { giftWrap, getGiftWrapCost } = useGiftWrap();
  const langContext = useLanguage();
  const language = langContext?.language || 'en';

  if (!giftWrap.enabled) return null;

  const cost = getGiftWrapCost();

  const texts = {
    en: { giftWrap: 'Gift Wrapping', style: 'Style' },
    ta: { giftWrap: 'பரிசு மடிப்பு', style: 'பாணி' }
  };

  const t = texts[language] || texts.en;

  const styleEmojis = {
    classic: '🎁',
    festive: '🎄',
    elegant: '✨',
    eco: '🌿'
  };

  return (
    <div className="gift-wrap-summary">
      <div className="gift-wrap-summary-line">
        <span>
          {t.giftWrap} {styleEmojis[giftWrap.wrapStyle]}
        </span>
        <span>₹{cost}</span>
      </div>
      {giftWrap.recipientName && (
        <div className="gift-wrap-recipient">
          To: {giftWrap.recipientName}
        </div>
      )}
    </div>
  );
}

export default GiftWrapOption;
