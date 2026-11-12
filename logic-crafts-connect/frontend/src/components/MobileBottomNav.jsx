import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Only show for logged in users on mobile
  if (!user) return null;

  const buyerNav = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/explore', icon: '🔍', label: 'Explore' },
    { path: '/cart', icon: '🛒', label: 'Cart' },
    { path: '/wishlist', icon: '❤️', label: 'Wishlist' },
    { path: '/buyer/dashboard', icon: '👤', label: 'Account' },
  ];

  const artisanNav = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/upload', icon: '➕', label: 'Upload' },
    { path: '/artisan/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/artisan/orders', icon: '📦', label: 'Orders' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  const adminNav = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/admin', icon: '⚙️', label: 'Admin' },
    { path: '/explore', icon: '🔍', label: 'Explore' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  const navItems = user.role === 'artisan' ? artisanNav 
    : user.role === 'admin' ? adminNav 
    : buyerNav;

  return (
    <>
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <style>{`
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 8px 0;
          padding-bottom: max(8px, env(safe-area-inset-bottom));
          z-index: 1000;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex;
            justify-content: space-around;
            align-items: center;
          }

          /* Add padding to main content to prevent overlap */
          body {
            padding-bottom: 70px;
          }
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 12px;
          text-decoration: none;
          color: #6b7280;
          border-radius: 8px;
          transition: all 0.2s ease;
          min-width: 60px;
        }

        .nav-item.active {
          color: #8b5a2b;
        }

        .nav-item.active .nav-icon {
          transform: scale(1.1);
        }

        .nav-icon {
          font-size: 22px;
          line-height: 1;
          transition: transform 0.2s ease;
        }

        .nav-label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .nav-item:active {
          background: rgba(139, 90, 43, 0.1);
        }
      `}</style>
    </>
  );
};

export default MobileBottomNav;
