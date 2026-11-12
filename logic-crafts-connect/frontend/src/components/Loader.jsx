import React from 'react';

/**
 * Loading Spinner Component
 * Multiple variants for different use cases
 */

// Full page loading spinner
export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="page-loader">
    <div className="loader-spinner"></div>
    <p className="loader-message">{message}</p>
    <style>{`
      .page-loader {
        min-height: 60vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
      }
      
      .loader-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--accent, #f97316);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .loader-message {
        color: var(--muted, #6b7280);
        font-size: 14px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Inline spinner (for buttons, etc.)
export const Spinner = ({ size = 20, color = 'currentColor' }) => (
  <svg 
    className="spinner-inline" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    style={{ animation: 'spin 1s linear infinite' }}
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeDasharray="32"
      strokeLinecap="round"
      style={{ opacity: 0.25 }}
    />
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeDasharray="32"
      strokeDashoffset="32"
      strokeLinecap="round"
      style={{ 
        opacity: 1,
        animation: 'dash 1.5s ease-in-out infinite'
      }}
    />
    <style>{`
      @keyframes dash {
        0% { stroke-dashoffset: 32; }
        50% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -32; }
      }
    `}</style>
  </svg>
);

// Overlay loader (covers a container)
export const OverlayLoader = ({ message = 'Loading...' }) => (
  <div className="overlay-loader">
    <div className="overlay-content">
      <div className="loader-spinner"></div>
      <p>{message}</p>
    </div>
    <style>{`
      .overlay-loader {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        backdrop-filter: blur(2px);
      }
      
      .overlay-content {
        text-align: center;
      }
      
      .overlay-content .loader-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid var(--accent, #f97316);
        border-radius: 50%;
        margin: 0 auto 12px;
        animation: spin 1s linear infinite;
      }
      
      .overlay-content p {
        color: var(--muted, #6b7280);
        font-size: 14px;
        margin: 0;
      }
    `}</style>
  </div>
);

// Dots loader (typing indicator style)
export const DotsLoader = ({ size = 8, color = 'var(--accent, #f97316)' }) => (
  <div className="dots-loader">
    <span style={{ background: color }}></span>
    <span style={{ background: color }}></span>
    <span style={{ background: color }}></span>
    <style>{`
      .dots-loader {
        display: inline-flex;
        gap: 4px;
        align-items: center;
      }
      
      .dots-loader span {
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        animation: dots-bounce 1.4s ease-in-out infinite both;
      }
      
      .dots-loader span:nth-child(1) { animation-delay: -0.32s; }
      .dots-loader span:nth-child(2) { animation-delay: -0.16s; }
      .dots-loader span:nth-child(3) { animation-delay: 0s; }
      
      @keyframes dots-bounce {
        0%, 80%, 100% {
          transform: scale(0);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

// Button loader (for loading state in buttons)
export const ButtonLoader = ({ loading, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
    {loading && <Spinner size={16} />}
    {children}
  </span>
);

// Progress bar loader
export const ProgressLoader = ({ progress = 0, showPercent = true }) => (
  <div className="progress-loader">
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
    {showPercent && (
      <span className="progress-text">{Math.round(progress)}%</span>
    )}
    <style>{`
      .progress-loader {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }
      
      .progress-bar {
        flex: 1;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent, #f97316), #ea580c);
        border-radius: 4px;
        transition: width 0.3s ease;
      }
      
      .progress-text {
        font-size: 14px;
        font-weight: 500;
        color: var(--text, #1f2937);
        min-width: 40px;
        text-align: right;
      }
    `}</style>
  </div>
);

export default PageLoader;
