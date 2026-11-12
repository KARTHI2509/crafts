import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';
import './QuickReorder.css';

const QuickReorder = ({ order, onReordered }) => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const text = {
    en: {
      reorder: 'Reorder',
      reorderAll: 'Reorder All Items',
      addingToCart: 'Adding to cart...',
      addedToCart: 'Items added to cart!',
      someFailed: 'Some items could not be added',
      goToCart: 'Go to Cart',
      cancel: 'Cancel',
      confirm: 'Confirm',
      confirmTitle: 'Reorder Confirmation',
      confirmMessage: 'Add all items from this order to your cart?',
      items: 'items',
      total: 'Total'
    },
    te: {
      reorder: 'మళ్ళీ ఆర్డర్ చేయండి',
      reorderAll: 'అన్ని వస్తువులను రీఆర్డర్ చేయండి',
      addingToCart: 'కార్ట్‌కు జోడిస్తోంది...',
      addedToCart: 'వస్తువులు కార్ట్‌కు జోడించబడ్డాయి!',
      someFailed: 'కొన్ని వస్తువులు జోడించబడలేదు',
      goToCart: 'కార్ట్‌కు వెళ్ళండి',
      cancel: 'రద్దు',
      confirm: 'నిర్ధారించు',
      confirmTitle: 'రీఆర్డర్ నిర్ధారణ',
      confirmMessage: 'ఈ ఆర్డర్ నుండి అన్ని వస్తువులను మీ కార్ట్‌కు జోడించాలా?',
      items: 'వస్తువులు',
      total: 'మొత్తం'
    }
  };

  const t = text[language] || text.en;

  const handleReorder = async () => {
    if (!order?.items || order.items.length === 0) {
      toast.error('No items to reorder');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Add each item to cart
      for (const item of order.items) {
        try {
          await cartAPI.add(item.craft_id || item.id, item.quantity || 1);
          successCount++;
        } catch (err) {
          failCount++;
          console.error('Failed to add item:', item.name, err);
        }
      }

      if (successCount > 0) {
        toast.success(`${t.addedToCart} (${successCount} ${t.items})`);
        if (onReordered) onReordered();
      }
      
      if (failCount > 0) {
        toast.error(`${t.someFailed} (${failCount})`);
      }

      setShowConfirm(false);
    } catch (error) {
      console.error('Reorder error:', error);
      toast.error('Failed to reorder');
    } finally {
      setLoading(false);
    }
  };

  const itemCount = order?.items?.length || 0;
  const orderTotal = order?.total_amount || order?.total || 0;

  return (
    <div className="quick-reorder">
      <button 
        className="reorder-btn"
        onClick={() => setShowConfirm(true)}
        disabled={loading || itemCount === 0}
      >
        <span className="reorder-icon">🔄</span>
        <span>{t.reorder}</span>
      </button>

      {showConfirm && (
        <div className="reorder-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="reorder-modal" onClick={e => e.stopPropagation()}>
            <h3>{t.confirmTitle}</h3>
            <p>{t.confirmMessage}</p>
            
            <div className="reorder-summary">
              <div className="summary-row">
                <span>{t.items}</span>
                <span>{itemCount}</span>
              </div>
              <div className="summary-row total">
                <span>{t.total}</span>
                <span>₹{orderTotal}</span>
              </div>
            </div>

            <div className="reorder-items-preview">
              {order?.items?.slice(0, 3).map((item, idx) => (
                <div key={idx} className="preview-item">
                  <img 
                    src={item.image_url || item.craft_image || 'https://via.placeholder.com/40'} 
                    alt={item.name || item.craft_name} 
                  />
                  <span>{item.name || item.craft_name}</span>
                </div>
              ))}
              {itemCount > 3 && (
                <div className="preview-more">+{itemCount - 3} more</div>
              )}
            </div>

            <div className="reorder-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                {t.cancel}
              </button>
              <button 
                className="btn-confirm"
                onClick={handleReorder}
                disabled={loading}
              >
                {loading ? t.addingToCart : t.confirm}
              </button>
            </div>

            {successCount > 0 && (
              <button 
                className="btn-go-cart"
                onClick={() => navigate('/cart')}
              >
                {t.goToCart} →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickReorder;
