import { useState } from 'react';
import toast from 'react-hot-toast';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      toast.success('Thanks for subscribing! 🎉');
      setEmail('');
    }, 1000);
  };

  return (
    <div className="newsletter-section">
      <div className="newsletter-content">
        <div className="newsletter-text">
          <span className="newsletter-icon">✉️</span>
          <h3>Stay Updated</h3>
          <p>Get the latest crafts, artisan stories, and exclusive offers in your inbox.</p>
        </div>
        
        {subscribed ? (
          <div className="subscribed-message">
            <span className="check-icon">✅</span>
            <span>You're subscribed! Watch your inbox for updates.</span>
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
            <p className="privacy-note">
              🔒 We respect your privacy. Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>

      <style>{`
        .newsletter-section {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          padding: 48px 24px;
          border-radius: 16px;
          margin: 48px 0;
        }

        .newsletter-content {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .newsletter-text {
          margin-bottom: 24px;
        }

        .newsletter-icon {
          font-size: 36px;
          display: block;
          margin-bottom: 12px;
        }

        .newsletter-text h3 {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px;
        }

        .newsletter-text p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-wrapper {
          display: flex;
          gap: 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .input-wrapper input {
          flex: 1;
          padding: 16px 20px;
          border: none;
          font-size: 15px;
          outline: none;
        }

        .input-wrapper input::placeholder {
          color: #9ca3af;
        }

        .input-wrapper button {
          padding: 16px 28px;
          background: linear-gradient(135deg, #8b5a2b, #a0522d);
          color: white;
          border: none;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 120px;
        }

        .input-wrapper button:hover:not(:disabled) {
          background: linear-gradient(135deg, #a0522d, #8b4513);
        }

        .input-wrapper button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .privacy-note {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .subscribed-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          color: #22c55e;
          font-weight: 500;
        }

        .check-icon {
          font-size: 24px;
        }

        @media (max-width: 640px) {
          .newsletter-section {
            padding: 32px 16px;
            margin: 32px 16px;
            border-radius: 12px;
          }

          .input-wrapper {
            flex-direction: column;
          }

          .input-wrapper input {
            padding: 14px 16px;
          }

          .input-wrapper button {
            padding: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default NewsletterSignup;
