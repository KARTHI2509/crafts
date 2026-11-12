import React from 'react';
import './Skeleton.css';

// Base Skeleton Component
export const Skeleton = ({ width, height, borderRadius = '4px', className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '16px',
        borderRadius,
      }}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => {
  return (
    <div className="product-card-skeleton">
      <Skeleton height="200px" borderRadius="8px" className="image" />
      <div className="content">
        <Skeleton width="60%" height="12px" />
        <Skeleton width="80%" height="18px" />
        <Skeleton width="40%" height="16px" />
        <div className="footer">
          <Skeleton width="30%" height="14px" />
          <Skeleton width="80px" height="32px" borderRadius="16px" />
        </div>
      </div>
    </div>
  );
};

// Grid of Product Card Skeletons
export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="product-grid-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Order Card Skeleton
export const OrderCardSkeleton = () => {
  return (
    <div className="order-card-skeleton">
      <div className="header">
        <Skeleton width="120px" height="16px" />
        <Skeleton width="80px" height="24px" borderRadius="12px" />
      </div>
      <div className="items">
        <div className="item">
          <Skeleton width="60px" height="60px" borderRadius="8px" />
          <div className="details">
            <Skeleton width="70%" height="14px" />
            <Skeleton width="40%" height="12px" />
          </div>
        </div>
      </div>
      <div className="footer">
        <Skeleton width="100px" height="14px" />
        <Skeleton width="80px" height="16px" />
      </div>
    </div>
  );
};

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="table-row-skeleton">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index}>
          <Skeleton height="14px" />
        </td>
      ))}
    </tr>
  );
};

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <table className="table-skeleton">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index}>
              <Skeleton height="16px" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRowSkeleton key={index} columns={columns} />
        ))}
      </tbody>
    </table>
  );
};

// Dashboard Stats Skeleton
export const StatsCardSkeleton = () => {
  return (
    <div className="stats-card-skeleton">
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <div className="content">
        <Skeleton width="60%" height="12px" />
        <Skeleton width="40%" height="24px" />
      </div>
    </div>
  );
};

// Chat/Message Skeleton
export const MessageSkeleton = ({ isOwn = false }) => {
  return (
    <div className={`message-skeleton ${isOwn ? 'own' : ''}`}>
      <Skeleton 
        width={isOwn ? '60%' : '70%'} 
        height="40px" 
        borderRadius="16px" 
      />
      <Skeleton width="60px" height="10px" />
    </div>
  );
};

// Conversation List Skeleton
export const ConversationListSkeleton = ({ count = 5 }) => {
  return (
    <div className="conversation-list-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="conversation-item-skeleton">
          <Skeleton width="48px" height="48px" borderRadius="50%" />
          <div className="content">
            <Skeleton width="60%" height="14px" />
            <Skeleton width="80%" height="12px" />
          </div>
          <Skeleton width="40px" height="10px" />
        </div>
      ))}
    </div>
  );
};

// Profile Skeleton
export const ProfileSkeleton = () => {
  return (
    <div className="profile-skeleton">
      <Skeleton width="100px" height="100px" borderRadius="50%" />
      <Skeleton width="150px" height="24px" />
      <Skeleton width="200px" height="14px" />
      <div className="info-row">
        <Skeleton width="120px" height="14px" />
        <Skeleton width="120px" height="14px" />
      </div>
    </div>
  );
};

// Page Loading Skeleton (Full page loader)
export const PageLoadingSkeleton = () => {
  return (
    <div className="page-loading-skeleton">
      <div className="spinner"></div>
      <Skeleton width="200px" height="16px" />
    </div>
  );
};

export default Skeleton;
