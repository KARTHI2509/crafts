const OrderTimeline = ({ status, createdAt, updatedAt }) => {
  const statuses = [
    { key: 'pending', label: 'Order Placed', icon: '📝', description: 'Your order has been received' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅', description: 'Order confirmed by artisan' },
    { key: 'processing', label: 'Processing', icon: '🔨', description: 'Being crafted with care' },
    { key: 'shipped', label: 'Shipped', icon: '🚚', description: 'On the way to you' },
    { key: 'delivered', label: 'Delivered', icon: '📦', description: 'Enjoy your craft!' },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.key === status) || 0;
  const isCancelled = status === 'cancelled';

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isCancelled) {
    return (
      <div className="order-timeline cancelled">
        <div className="cancelled-status">
          <span className="cancelled-icon">❌</span>
          <div className="cancelled-info">
            <span className="cancelled-label">Order Cancelled</span>
            <span className="cancelled-date">{formatDate(updatedAt)}</span>
          </div>
        </div>
        <style>{getStyles()}</style>
      </div>
    );
  }

  return (
    <div className="order-timeline">
      <div className="timeline-track">
        {statuses.map((step, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          
          return (
            <div 
              key={step.key} 
              className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="step-connector">
                {index > 0 && <div className={`connector-line ${isCompleted ? 'filled' : ''}`} />}
              </div>
              
              <div className={`step-icon ${isCompleted ? 'completed' : ''} ${isCurrent ? 'pulse' : ''}`}>
                {isCompleted ? step.icon : <span className="step-number">{index + 1}</span>}
              </div>
              
              <div className="step-content">
                <span className="step-label">{step.label}</span>
                <span className="step-description">{step.description}</span>
                {isCurrent && createdAt && (
                  <span className="step-date">{formatDate(isCurrent ? updatedAt || createdAt : '')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{getStyles()}</style>
    </div>
  );
};

const getStyles = () => `
  .order-timeline {
    padding: 24px;
    background: linear-gradient(135deg, #fefbf6 0%, #fef7ed 100%);
    border-radius: 16px;
    border: 1px solid rgba(139, 90, 43, 0.1);
  }

  .timeline-track {
    display: flex;
    justify-content: space-between;
    position: relative;
  }

  .timeline-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
  }

  .step-connector {
    position: absolute;
    top: 20px;
    left: -50%;
    width: 100%;
    height: 4px;
    z-index: 0;
  }

  .timeline-step:first-child .step-connector {
    display: none;
  }

  .connector-line {
    width: 100%;
    height: 100%;
    background: #e5e7eb;
    border-radius: 2px;
    transition: background 0.3s ease;
  }

  .connector-line.filled {
    background: linear-gradient(90deg, #8b5a2b, #d4a574);
  }

  .step-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: white;
    border: 3px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    z-index: 1;
    transition: all 0.3s ease;
  }

  .step-icon.completed {
    background: linear-gradient(135deg, #8b5a2b, #a0522d);
    border-color: #8b5a2b;
    color: white;
  }

  .step-icon.pulse {
    animation: pulse 2s infinite;
    box-shadow: 0 0 0 0 rgba(139, 90, 43, 0.4);
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(139, 90, 43, 0.4);
    }
    70% {
      box-shadow: 0 0 0 12px rgba(139, 90, 43, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(139, 90, 43, 0);
    }
  }

  .step-number {
    font-weight: 600;
    color: #9ca3af;
    font-size: 14px;
  }

  .step-content {
    margin-top: 12px;
    text-align: center;
    max-width: 120px;
  }

  .step-label {
    display: block;
    font-weight: 600;
    color: #374151;
    font-size: 13px;
    margin-bottom: 4px;
  }

  .timeline-step.completed .step-label {
    color: #8b5a2b;
  }

  .step-description {
    display: block;
    font-size: 11px;
    color: #9ca3af;
    line-height: 1.3;
  }

  .timeline-step.current .step-description {
    color: #6b7280;
  }

  .step-date {
    display: block;
    font-size: 10px;
    color: #8b5a2b;
    margin-top: 6px;
    font-weight: 500;
  }

  /* Cancelled State */
  .order-timeline.cancelled {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border-color: rgba(239, 68, 68, 0.2);
  }

  .cancelled-status {
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: center;
    padding: 16px;
  }

  .cancelled-icon {
    font-size: 32px;
  }

  .cancelled-info {
    display: flex;
    flex-direction: column;
  }

  .cancelled-label {
    font-size: 18px;
    font-weight: 600;
    color: #dc2626;
  }

  .cancelled-date {
    font-size: 13px;
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    .order-timeline {
      padding: 16px;
    }

    .timeline-track {
      flex-direction: column;
      gap: 0;
    }

    .timeline-step {
      flex-direction: row;
      align-items: flex-start;
      padding: 16px 0;
    }

    .step-connector {
      position: absolute;
      top: 0;
      left: 20px;
      width: 4px;
      height: 100%;
    }

    .timeline-step:first-child .step-connector {
      display: block;
      top: 50%;
      height: 50%;
    }

    .timeline-step:last-child .step-connector {
      height: 50%;
    }

    .connector-line {
      width: 100%;
      height: 100%;
    }

    .step-icon {
      flex-shrink: 0;
    }

    .step-content {
      margin-top: 0;
      margin-left: 16px;
      text-align: left;
      max-width: none;
    }
  }
`;

export default OrderTimeline;
