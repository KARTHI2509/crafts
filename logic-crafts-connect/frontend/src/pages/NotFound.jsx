import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" 
            />
          </svg>
        </div>
        
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-message">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="not-found-actions">
          <Link to="/" className="btn primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <Link to="/explore" className="btn secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explore Crafts
          </Link>
        </div>
        
        <div className="not-found-decoration">
          <div className="craft-icons">
            <span>🏺</span>
            <span>🎨</span>
            <span>🧵</span>
            <span>🪡</span>
            <span>🎭</span>
          </div>
        </div>
      </div>
      
      <style>{`
        .not-found-page {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }
        
        .not-found-content {
          max-width: 500px;
        }
        
        .not-found-icon {
          width: 120px;
          height: 120px;
          margin: 0 auto 24px;
          color: var(--accent, #f97316);
          animation: bounce 2s infinite;
        }
        
        .not-found-icon svg {
          width: 100%;
          height: 100%;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .not-found-title {
          font-size: 96px;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, var(--accent, #f97316), #ea580c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        
        .not-found-subtitle {
          font-size: 28px;
          font-weight: 600;
          margin: 8px 0 16px;
          color: var(--text, #1f2937);
        }
        
        .not-found-message {
          color: var(--muted, #6b7280);
          font-size: 16px;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        
        .not-found-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .not-found-actions .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .not-found-actions .btn.primary {
          background: linear-gradient(135deg, var(--accent, #f97316), #ea580c);
          color: white;
        }
        
        .not-found-actions .btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
        }
        
        .not-found-actions .btn.secondary {
          background: var(--surface, #f9fafb);
          color: var(--text, #1f2937);
          border: 1px solid var(--border, #e5e7eb);
        }
        
        .not-found-actions .btn.secondary:hover {
          background: var(--border, #e5e7eb);
        }
        
        .not-found-decoration {
          margin-top: 48px;
        }
        
        .craft-icons {
          display: flex;
          justify-content: center;
          gap: 16px;
          font-size: 32px;
          opacity: 0.6;
        }
        
        .craft-icons span {
          animation: float 3s ease-in-out infinite;
        }
        
        .craft-icons span:nth-child(2) { animation-delay: 0.5s; }
        .craft-icons span:nth-child(3) { animation-delay: 1s; }
        .craft-icons span:nth-child(4) { animation-delay: 1.5s; }
        .craft-icons span:nth-child(5) { animation-delay: 2s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @media (max-width: 480px) {
          .not-found-title {
            font-size: 64px;
          }
          
          .not-found-subtitle {
            font-size: 22px;
          }
          
          .not-found-icon {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>
    </div>
  );
}
