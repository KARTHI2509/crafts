import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";

export default function Footer() {
  const { language } = useContext(LanguageContext);

  const content = {
    en: {
      tagline: "Empowering local artisans, connecting global buyers",
      quickLinks: "Quick Links",
      home: "Home",
      explore: "Explore",
      upload: "Upload",
      events: "Events",
      support: "Support",
      about: "About Us",
      contact: "Contact",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      followUs: "Follow Us",
      copyright: "All rights reserved.",
    },
    te: {
      tagline: "స్థానిక కళాకారులకు శక్తినిచ్చి, ప్రపంచ కొనుగోలుదారులను కనెక్ట్ చేస్తున్నాము",
      quickLinks: "క్విక్ లింక్‌లు",
      home: "హోమ్",
      explore: "అన్వేషించండి",
      upload: "అప్‌లోడ్",
      events: "ఈవెంట్‌లు",
      support: "మద్దతు",
      about: "మా గురించి",
      contact: "సంప్రదించండి",
      privacy: "గోప్యతా విధానం",
      terms: "సేవా నిబంధనలు",
      followUs: "మమ్మల్ని అనుసరించండి",
      copyright: "అన్ని హక్కులు రక్షితం.",
    },
  };

  const t = content[language] || content.en;

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-section">
              <div className="footer-brand">
                <div className="logo">LC</div>
                <span className="brand-name">Logic Crafts Connect</span>
              </div>
              <p className="footer-tagline">{t.tagline}</p>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="footer-title">{t.quickLinks}</h4>
              <div className="footer-links">
                <Link to="/">{t.home}</Link>
                <Link to="/explore">{t.explore}</Link>
                <Link to="/upload">{t.upload}</Link>
                <Link to="/events">{t.events}</Link>
              </div>
            </div>

            {/* Support */}
            <div className="footer-section">
              <h4 className="footer-title">{t.support}</h4>
              <div className="footer-links">
                <Link to="/about">{t.about}</Link>
                <Link to="/contact">{t.contact}</Link>
                <Link to="/privacy">{t.privacy}</Link>
                <Link to="/terms">{t.terms}</Link>
              </div>
            </div>

            {/* Social Links */}
            <div className="footer-section">
              <h4 className="footer-title">{t.followUs}</h4>
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <span>📘</span> Facebook
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <span>📷</span> Instagram
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <span>🐦</span> Twitter
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <span>🎥</span> YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright Bar */}
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Logic Crafts Connect. {t.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
