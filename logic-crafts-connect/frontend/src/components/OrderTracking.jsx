import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import './OrderTracking.css';

const OrderTracking = ({ order }) => {
  const { language } = useContext(LanguageContext);

  const text = {
    en: {
      orderPlaced: 'Order Placed',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      outForDelivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      estimatedDelivery: 'Estimated Delivery',
      trackingNumber: 'Tracking Number',
      carrier: 'Carrier',
      lastUpdate: 'Last Updated'
    },
    te: {
      orderPlaced: 'ఆర్డర్ చేయబడింది',
      confirmed: 'ధృవీకరించబడింది',
      processing: 'ప్రాసెస్ అవుతోంది',
      shipped: 'షిప్ చేయబడింది',
      outForDelivery: 'డెలివరీకి బయలుదేరింది',
      delivered: 'డెలివరీ అయింది',
      cancelled: 'రద్దు చేయబడింది',
      estimatedDelivery: 'అంచనా డెలివరీ',
      trackingNumber: 'ట్రాకింగ్ నంబర్',
      carrier: 'కారియర్',
      lastUpdate: 'చివరి అప్‌డేట్'
    }
  };

  const t = text[language] || text.en;

  const statusSteps = [
    { key: 'pending', label: t.orderPlaced, icon: '📝' },
    { key: 'confirmed', label: t.confirmed, icon: '✓' },
    { key: 'processing', label: t.processing, icon: '⚙️' },
    { key: 'shipped', label: t.shipped, icon: '📦' },
    { key: 'out_for_delivery', label: t.outForDelivery, icon: '🚚' },
    { key: 'delivered', label: t.delivered, icon: '✅' }
  ];

  const getStatusIndex = (status) => {
    if (status === 'cancelled') return -1;
    const index = statusSteps.findIndex(step => step.key === status);
    return index >= 0 ? index : 0;
  };

  const currentStatusIndex = getStatusIndex(order?.status);
  const isCancelled = order?.status === 'cancelled';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(language === 'te' ? 'te-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-tracking">
      {isCancelled ? (
        <div className="cancelled-status">
          <span className="cancelled-icon">❌</span>
          <span className="cancelled-text">{t.cancelled}</span>
        </div>
      ) : (
        <>
          <div className="tracking-timeline">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div 
                  key={step.key} 
                  className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="step-indicator">
                    <span className="step-icon">{step.icon}</span>
                    {index < statusSteps.length - 1 && (
                      <div className={`step-line ${index < currentStatusIndex ? 'completed' : ''}`}></div>
                    )}
                  </div>
                  <div className="step-label">{step.label}</div>
                </div>
              );
            })}
          </div>

          {/* Tracking Info */}
          <div className="tracking-info">
            {order?.estimated_delivery && (
              <div className="info-item">
                <span className="info-label">📅 {t.estimatedDelivery}</span>
                <span className="info-value">{formatDate(order.estimated_delivery)}</span>
              </div>
            )}
            
            {order?.tracking_number && (
              <div className="info-item">
                <span className="info-label">🔢 {t.trackingNumber}</span>
                <span className="info-value tracking-number">{order.tracking_number}</span>
              </div>
            )}
            
            {order?.carrier && (
              <div className="info-item">
                <span className="info-label">🚛 {t.carrier}</span>
                <span className="info-value">{order.carrier}</span>
              </div>
            )}
            
            {order?.updated_at && (
              <div className="info-item">
                <span className="info-label">🕐 {t.lastUpdate}</span>
                <span className="info-value">{formatDate(order.updated_at)}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderTracking;
