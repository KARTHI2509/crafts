import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Empty State Components for various scenarios
 */

// Generic empty state wrapper
const EmptyStateWrapper = ({ children }) => (
  <div className="empty-state">
    {children}
    <style>{`
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        text-align: center;
        min-height: 300px;
      }
      
      .empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
        opacity: 0.8;
      }
      
      .empty-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--text, #1f2937);
        margin-bottom: 8px;
      }
      
      .empty-description {
        font-size: 14px;
        color: var(--muted, #6b7280);
        max-width: 320px;
        margin-bottom: 24px;
        line-height: 1.5;
      }
      
      .empty-action {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        background: var(--accent, #f97316);
        color: white;
        border-radius: 8px;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s;
      }
      
      .empty-action:hover {
        background: #ea580c;
        transform: translateY(-2px);
      }
      
      .empty-secondary {
        margin-top: 12px;
        color: var(--muted, #6b7280);
        font-size: 14px;
      }
      
      .empty-secondary a {
        color: var(--accent, #f97316);
        text-decoration: none;
      }
      
      .empty-secondary a:hover {
        text-decoration: underline;
      }
    `}</style>
  </div>
);

// Empty Cart
export const EmptyCart = () => (
  <EmptyStateWrapper>
    <div className="empty-icon">🛒</div>
    <h3 className="empty-title">Your cart is empty</h3>
    <p className="empty-description">
      Looks like you haven't added any handcrafted items to your cart yet. 
      Start exploring our unique collection!
    </p>
    <Link to="/crafts" className="empty-action">
      <span>🎨</span>
      <span>Browse Crafts</span>
    </Link>
  </EmptyStateWrapper>
);

// Empty Wishlist
export const EmptyWishlist = () => (
  <EmptyStateWrapper>
    <div className="empty-icon">💝</div>
    <h3 className="empty-title">Your wishlist is empty</h3>
    <p className="empty-description">
      Save your favorite crafts here to find them easily later. 
      Click the heart icon on any item to add it!
    </p>
    <Link to="/crafts" className="empty-action">
      <span>✨</span>
      <span>Discover Crafts</span>
    </Link>
  </EmptyStateWrapper>
);

// Empty Orders
export const EmptyOrders = () => (
  <EmptyStateWrapper>
    <div className="empty-icon">📦</div>
    <h3 className="empty-title">No orders yet</h3>
    <p className="empty-description">
      You haven't placed any orders yet. 
      Start shopping to see your orders here!
    </p>
    <Link to="/crafts" className="empty-action">
      <span>🛍️</span>
      <span>Start Shopping</span>
    </Link>
  </EmptyStateWrapper>
);

// Empty Search Results
export const EmptySearch = ({ query }) => (
  <EmptyStateWrapper>
    <div className="empty-icon">🔍</div>
    <h3 className="empty-title">No results found</h3>
    <p className="empty-description">
      We couldn't find any crafts matching "{query}". 
      Try different keywords or browse all crafts.
    </p>
    <Link to="/crafts" className="empty-action">
      <span>🎯</span>
      <span>View All Crafts</span>
    </Link>
    <p className="empty-secondary">
      or <Link to="/">go back home</Link>
    </p>
  </EmptyStateWrapper>
);

// Empty Messages
export const EmptyMessages = () => (
  <EmptyStateWrapper>
    <div className="empty-icon">💬</div>
    <h3 className="empty-title">No messages yet</h3>
    <p className="empty-description">
      You don't have any messages yet. Start a conversation 
      with an artisan about their crafts!
    </p>
    <Link to="/crafts" className="empty-action">
      <span>🤝</span>
      <span>Find Artisans</span>
    </Link>
  </EmptyStateWrapper>
);

// Empty Reviews
export const EmptyReviews = () => (
  <EmptyStateWrapper>
    <div className="empty-icon">⭐</div>
    <h3 className="empty-title">No reviews yet</h3>
    <p className="empty-description">
      Be the first to share your experience! 
      Your feedback helps other buyers and supports artisans.
    </p>
  </EmptyStateWrapper>
);

// Empty Artisan Crafts (for artisan dashboard)
export const EmptyArtisanCrafts = () => (
  <EmptyStateWrapper>
    <div className="empty-icon">🎨</div>
    <h3 className="empty-title">No crafts listed yet</h3>
    <p className="empty-description">
      Start showcasing your handcrafted creations! 
      Add your first craft to reach buyers around the world.
    </p>
    <Link to="/crafts/create" className="empty-action">
      <span>➕</span>
      <span>Add Your First Craft</span>
    </Link>
  </EmptyStateWrapper>
);

// Empty Notifications
export const EmptyNotifications = () => (
  <EmptyStateWrapper>
    <div className="empty-icon">🔔</div>
    <h3 className="empty-title">All caught up!</h3>
    <p className="empty-description">
      You don't have any notifications right now. 
      We'll let you know when something happens!
    </p>
  </EmptyStateWrapper>
);

// Empty Recently Viewed
export const EmptyRecentlyViewed = () => (
  <EmptyStateWrapper>
    <div className="empty-icon">👀</div>
    <h3 className="empty-title">Nothing viewed yet</h3>
    <p className="empty-description">
      Items you view will appear here so you can easily find them again.
    </p>
    <Link to="/crafts" className="empty-action">
      <span>🔎</span>
      <span>Explore Crafts</span>
    </Link>
  </EmptyStateWrapper>
);

// Connection Error
export const ConnectionError = ({ onRetry }) => (
  <EmptyStateWrapper>
    <div className="empty-icon">📡</div>
    <h3 className="empty-title">Connection error</h3>
    <p className="empty-description">
      Unable to connect to the server. Please check your 
      internet connection and try again.
    </p>
    {onRetry && (
      <button onClick={onRetry} className="empty-action">
        <span>🔄</span>
        <span>Try Again</span>
      </button>
    )}
  </EmptyStateWrapper>
);

// Generic Error
export const GenericError = ({ message, onRetry }) => (
  <EmptyStateWrapper>
    <div className="empty-icon">😕</div>
    <h3 className="empty-title">Something went wrong</h3>
    <p className="empty-description">
      {message || "We encountered an unexpected error. Please try again later."}
    </p>
    {onRetry && (
      <button onClick={onRetry} className="empty-action">
        <span>🔄</span>
        <span>Retry</span>
      </button>
    )}
  </EmptyStateWrapper>
);

export default {
  EmptyCart,
  EmptyWishlist,
  EmptyOrders,
  EmptySearch,
  EmptyMessages,
  EmptyReviews,
  EmptyArtisanCrafts,
  EmptyNotifications,
  EmptyRecentlyViewed,
  ConnectionError,
  GenericError
};
