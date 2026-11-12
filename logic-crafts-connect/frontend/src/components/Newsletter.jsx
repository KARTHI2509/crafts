import React, { useState, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import './Newsletter.css';

const Newsletter = () => {
  const { language } = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const text = {
    en: {
      title: 'Stay Updated',
      subtitle: 'Subscribe to our newsletter for new crafts, artisan stories, and exclusive offers.',
      placeholder: 'Enter your email',
      subscribe: 'Subscribe',
      subscribing: 'Subscribing...',
      success: 'Welcome! You\'re now subscribed.',
      error: 'Please enter a valid email',
      thankYou: 'Thank you for subscribing!',
      getUpdates: 'You\'ll receive updates on new crafts and artisans.',
      privacy: 'We respect your privacy. Unsubscribe anytime.'
    },
    te: {
      title: 'అప్‌డేట్‌గా ఉండండి',
      subtitle: 'కొత్త హస్తకళలు, కళాకారుల కథలు మరియు ప్రత్యేక ఆఫర్‌ల కోసం మా న్యూస్‌లెటర్‌కు సబ్‌స్క్రైబ్ చేయండి.',
      placeholder: 'మీ ఇమెయిల్ నమోదు చేయండి',
      subscribe: 'సబ్‌స్క్రైబ్',
      subscribing: 'సబ్‌స్క్రైబ్ చేస్తోంది...',
      success: 'స్వాగతం! మీరు ఇప్పుడు సబ్‌స్క్రైబ్ అయ్యారు.',
      error: 'దయచేసి చెల్లుబాటు అయ్యే ఇమెయిల్ నమోదు చేయండి',
      thankYou: 'సబ్‌స్క్రైబ్ చేసినందుకు ధన్యవాదాలు!',
      getUpdates: 'మీరు కొత్త హస్తకళలు మరియు కళాకారులపై అప్‌డేట్‌లు అందుకుంటారు.',
      privacy: 'మేము మీ గోప్యతను గౌరవిస్తాము. ఎప్పుడైనా అన్‌సబ్‌స్క్రైబ్ చేయండి.'
    }
  };

  const t = text[language] || text.en;

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error(t.error);
      return;
    }

    setLoading(true);
    
    // Simulate API call (replace with real API when available)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for demo
      const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
      }
      
      toast.success(t.success);
      setSubscribed(true);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="newsletter-section subscribed">
        <div className="newsletter-content">
          <div className="success-icon">✉️</div>
          <h3>{t.thankYou}</h3>
          <p>{t.getUpdates}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="newsletter-section">
      <div className="newsletter-content">
        <div className="newsletter-text">
          <h3>{t.title}</h3>
          <p>{t.subtitle}</p>
        </div>
        
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <div className="newsletter-input-group">
            <input
              type="email"
              placeholder={t.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? t.subscribing : t.subscribe}
            </button>
          </div>
          <p className="privacy-note">{t.privacy}</p>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;
