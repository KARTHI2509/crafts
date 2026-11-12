import React from 'react';

/**
 * Confirmation Dialog Component
 * Used for delete confirmations, logout, etc.
 */

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'warning', 'info'
  loading = false
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          buttonBg: '#ef4444',
          buttonHover: '#dc2626'
        };
      case 'warning':
        return {
          icon: '⚡',
          buttonBg: '#f59e0b',
          buttonHover: '#d97706'
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          buttonBg: '#3b82f6',
          buttonHover: '#2563eb'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <>
      <div className="dialog-overlay" onClick={onClose}></div>
      <div className="dialog-container">
        <div className="dialog-icon">{styles.icon}</div>
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button 
            className="dialog-cancel" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            className="dialog-confirm"
            onClick={onConfirm}
            disabled={loading}
            style={{ 
              background: styles.buttonBg,
              '--hover-bg': styles.buttonHover
            }}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
      <style>{`
        .dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        
        .dialog-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          z-index: 1001;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideIn 0.3s ease;
        }
        
        .dialog-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .dialog-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .dialog-message {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        
        .dialog-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        
        .dialog-cancel {
          padding: 12px 24px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .dialog-cancel:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
        }
        
        .dialog-confirm {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 100px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .dialog-confirm:hover:not(:disabled) {
          filter: brightness(0.9);
        }
        
        .dialog-cancel:disabled,
        .dialog-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

// Delete confirmation preset
export const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, itemName = 'item', loading }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete Item"
    message={`Are you sure you want to delete this ${itemName}? This action cannot be undone.`}
    confirmText="Delete"
    cancelText="Cancel"
    variant="danger"
    loading={loading}
  />
);

// Logout confirmation preset
export const LogoutConfirmDialog = ({ isOpen, onClose, onConfirm, loading }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Log Out"
    message="Are you sure you want to log out of your account?"
    confirmText="Log Out"
    cancelText="Stay"
    variant="warning"
    loading={loading}
  />
);

// Remove from cart confirmation
export const RemoveFromCartDialog = ({ isOpen, onClose, onConfirm, loading }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Remove Item"
    message="Remove this item from your cart?"
    confirmText="Remove"
    cancelText="Keep"
    variant="warning"
    loading={loading}
  />
);

// Cancel order confirmation
export const CancelOrderDialog = ({ isOpen, onClose, onConfirm, loading }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Cancel Order"
    message="Are you sure you want to cancel this order? You may be charged a cancellation fee."
    confirmText="Cancel Order"
    cancelText="Keep Order"
    variant="danger"
    loading={loading}
  />
);

export default ConfirmDialog;
