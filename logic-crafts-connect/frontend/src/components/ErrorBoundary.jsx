import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            
            <h1>Something went wrong</h1>
            <p>We're sorry, but something unexpected happened. Please try again.</p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
            
            <div className="error-actions">
              <button onClick={this.handleReset} className="btn primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </button>
              <button onClick={() => window.location.reload()} className="btn secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reload Page
              </button>
            </div>
          </div>
          
          <style>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 40px 20px;
              background: linear-gradient(135deg, #fef3c7 0%, #fecaca 100%);
            }
            
            .error-content {
              max-width: 500px;
              text-align: center;
              background: white;
              padding: 48px;
              border-radius: 16px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
            }
            
            .error-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 24px;
              color: #dc2626;
            }
            
            .error-icon svg {
              width: 100%;
              height: 100%;
            }
            
            .error-content h1 {
              font-size: 28px;
              font-weight: 700;
              color: #1f2937;
              margin: 0 0 12px;
            }
            
            .error-content p {
              color: #6b7280;
              font-size: 16px;
              margin-bottom: 24px;
              line-height: 1.6;
            }
            
            .error-details {
              text-align: left;
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 24px;
            }
            
            .error-details summary {
              cursor: pointer;
              font-weight: 500;
              color: #dc2626;
              margin-bottom: 12px;
            }
            
            .error-details pre {
              font-size: 12px;
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-word;
              color: #7f1d1d;
              margin: 8px 0;
            }
            
            .error-actions {
              display: flex;
              gap: 12px;
              justify-content: center;
              flex-wrap: wrap;
            }
            
            .error-actions .btn {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 500;
              border: none;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.2s;
            }
            
            .error-actions .btn.primary {
              background: linear-gradient(135deg, #f97316, #ea580c);
              color: white;
            }
            
            .error-actions .btn.primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
            }
            
            .error-actions .btn.secondary {
              background: #f3f4f6;
              color: #1f2937;
            }
            
            .error-actions .btn.secondary:hover {
              background: #e5e7eb;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
