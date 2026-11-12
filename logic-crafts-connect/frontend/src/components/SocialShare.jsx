import React, { useState, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import './SocialShare.css';

const SocialShare = ({ product, url }) => {
  const { language } = useContext(LanguageContext);
  const [showDropdown, setShowDropdown] = useState(false);

  const text = {
    en: {
      share: 'Share',
      copyLink: 'Copy Link',
      copied: 'Link copied!',
      shareOn: 'Share on',
    },
    te: {
      share: 'షేర్ చేయండి',
      copyLink: 'లింక్ కాపీ చేయండి',
      copied: 'లింక్ కాపీ అయింది!',
      shareOn: 'షేర్ చేయండి',
    }
  };

  const t = text[language] || text.en;

  const shareUrl = url || window.location.href;
  const shareTitle = product?.name || 'Check out this craft!';
  const shareText = `${shareTitle} - ${product?.price || ''} | Logic Crafts Connect`;

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: '📱',
      color: '#25D366',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: '#1DA1F2',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: '#0A66C2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Pinterest',
      icon: '📌',
      color: '#E60023',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}&media=${encodeURIComponent(product?.imageUrl || '')}`
    },
    {
      name: 'Email',
      icon: '✉️',
      color: '#EA4335',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t.copied);
      setShowDropdown(false);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(t.copied);
      setShowDropdown(false);
    }
  };

  const handleShare = (link) => {
    window.open(link.url, '_blank', 'width=600,height=400');
    setShowDropdown(false);
  };

  // Use native share if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or error
        if (err.name !== 'AbortError') {
          setShowDropdown(true);
        }
      }
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <div className="social-share">
      <button 
        className="share-trigger"
        onClick={handleNativeShare}
        aria-label={t.share}
      >
        <span className="share-icon">↗️</span>
        <span className="share-text">{t.share}</span>
      </button>

      {showDropdown && (
        <>
          <div className="share-overlay" onClick={() => setShowDropdown(false)}></div>
          <div className="share-dropdown">
            <div className="share-header">{t.shareOn}</div>
            <div className="share-options">
              {shareLinks.map((link) => (
                <button
                  key={link.name}
                  className="share-option"
                  onClick={() => handleShare(link)}
                  style={{ '--share-color': link.color }}
                >
                  <span className="option-icon">{link.icon}</span>
                  <span className="option-name">{link.name}</span>
                </button>
              ))}
            </div>
            <button className="copy-link-btn" onClick={handleCopyLink}>
              <span>🔗</span> {t.copyLink}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SocialShare;
