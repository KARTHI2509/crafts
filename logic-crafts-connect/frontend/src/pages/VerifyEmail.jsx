import React, { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

export default function VerifyEmail() {
  const { language } = useContext(LanguageContext);
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  
  const token = searchParams.get('token');

  const content = {
    en: {
      verifying: "Verifying your email...",
      successTitle: "Email Verified!",
      successMessage: "Your email has been successfully verified. You can now log in to your account.",
      errorTitle: "Verification Failed",
      errorMessage: "This verification link is invalid or has expired.",
      loginBtn: "Go to Login",
      resendLink: "Resend verification email",
      noToken: "No verification token provided.",
    },
    te: {
      verifying: "మీ ఇమేల్‌ను ధృవీకరిస్తోంది...",
      successTitle: "ఇమేల్ ధృవీకరించబడింది!",
      successMessage: "మీ ఇమేల్ విజయవంతంగా ధృవీకరించబడింది. మీరు ఇప్పుడు మీ ఖాతాలోకి లాగిన్ అవచ్చు.",
      errorTitle: "ధృవీకరణ విఫలమైంది",
      errorMessage: "ఈ ధృవీకరణ లింక్ చెల్లదు లేదా గడువు ముగిసింది.",
      loginBtn: "లాగిన్‌కు వెళ్ళు",
      resendLink: "ధృవీకరణ ఇమేల్‌ను మళ్ళీ పంపండి",
      noToken: "ధృవీకరణ టోకెన్ అందించలేదు.",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        toast.success(t.successTitle);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        toast.error(t.errorTitle);
      }
    };

    verifyEmailToken();
  }, [token]);

  // No token provided
  if (!token) {
    return (
      <div className="form">
        <div style={{
          padding: '20px',
          background: '#fee',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <svg 
            style={{ width: '48px', height: '48px', color: '#c33', margin: '0 auto 12px' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p style={{ color: '#c33', fontWeight: '500', marginBottom: '16px' }}>
            {t.noToken}
          </p>
          <Link to="/login" className="btn" style={{ display: 'inline-block' }}>
            {t.loginBtn}
          </Link>
        </div>
      </div>
    );
  }

  // Verifying state
  if (status === 'verifying') {
    return (
      <div className="form">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #f97316',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
            {t.verifying}
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="form">
        <div style={{
          padding: '20px',
          background: '#d4edda',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <svg 
            style={{ width: '64px', height: '64px', color: '#28a745', margin: '0 auto 16px' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 style={{ color: '#155724', marginBottom: '8px' }}>{t.successTitle}</h3>
          <p style={{ color: '#155724', marginBottom: '20px' }}>
            {t.successMessage}
          </p>
          <Link to="/login" className="btn" style={{ display: 'inline-block' }}>
            {t.loginBtn}
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="form">
      <div style={{
        padding: '20px',
        background: '#fee',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <svg 
          style={{ width: '64px', height: '64px', color: '#c33', margin: '0 auto 16px' }}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 style={{ color: '#c33', marginBottom: '8px' }}>{t.errorTitle}</h3>
        <p style={{ color: '#c33', marginBottom: '20px' }}>
          {t.errorMessage}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" className="btn" style={{ display: 'inline-block' }}>
            {t.loginBtn}
          </Link>
        </div>
      </div>
    </div>
  );
}
