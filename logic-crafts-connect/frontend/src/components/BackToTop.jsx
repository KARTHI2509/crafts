import { useState, useEffect } from 'react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <button
        className={`back-to-top ${isVisible ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>

      <style>{`
        .back-to-top {
          position: fixed;
          bottom: 80px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5a2b 0%, #a0522d 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(139, 90, 43, 0.4);
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s ease;
          z-index: 999;
        }

        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .back-to-top:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(139, 90, 43, 0.5);
        }

        .back-to-top:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .back-to-top {
            bottom: 100px;
            right: 16px;
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </>
  );
};

export default BackToTop;
