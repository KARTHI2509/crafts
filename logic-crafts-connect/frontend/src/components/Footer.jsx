import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { ShieldCheck, Truck, RotateCcw, Headset } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const { language } = useContext(LanguageContext);
  const isLoggedIn = localStorage.getItem("token");

  const t = {
    en: {
      tagline: "Empowering local artisans, connecting global buyers with authentic handcrafted masterpieces.",
      quickLinks: "Quick Links",
      support: "Support",
      followUs: "Follow Us",
      newsletterTitle: "Join the Artisan Journey",
      newsletterDesc: "Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.",
      subscribe: "Subscribe",
      secure: "100% Secure Payment",
      shipping: "Worldwide Shipping",
      returns: "Easy Returns",
      help: "24/7 Support",
      copyright: "All rights reserved. Designed with passion."
    },
    te: {
      tagline: "స్థానిక కళాకారులకు శక్తినిచ్చి, ప్రపంచ కొనుగోలుదారులను కనెక్ట్ చేస్తున్నాము.",
      quickLinks: "క్విక్ లింక్‌లు",
      support: "మద్దతు",
      followUs: "మమ్మల్ని అనుసరించండి",
      newsletterTitle: "మా వార్తాలేఖకు సభ్యత్వాన్ని పొందండి",
      newsletterDesc: "ప్రత్యేక ఆఫర్‌లు మరియు డిస్కౌంట్‌లను పొందడానికి సభ్యత్వాన్ని పొందండి.",
      subscribe: "సభ్యత్వం పొందండి",
      secure: "సురక్షిత చెల్లింపు",
      shipping: "ప్రపంచవ్యాప్త షిప్పింగ్",
      returns: "సులభమైన రిటర్న్స్",
      help: "24/7 మద్దతు",
      copyright: "అన్ని హక్కులు రక్షితం."
    }
  }[language] || {
      tagline: "Empowering local artisans, connecting global buyers with authentic handcrafted masterpieces.",
      quickLinks: "Quick Links",
      support: "Support",
      followUs: "Follow Us",
      newsletterTitle: "Join the Artisan Journey",
      newsletterDesc: "Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.",
      subscribe: "Subscribe",
      secure: "100% Secure Payment",
      shipping: "Worldwide Shipping",
      returns: "Easy Returns",
      help: "24/7 Support",
      copyright: "All rights reserved. Designed with passion."
  };

  return (
    <footer className="footer">
      
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>{t.newsletterTitle}</h2>
            <p>{t.newsletterDesc}</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" />
              <button className="btn">{t.subscribe}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="footer-content">
          <div className="footer-grid">

            {/* Brand Section */}
            <div className="footer-section">
              <div className="footer-brand">
                <span className="footer-brand-title">Logic Crafts Connect</span>
              </div>
              <p className="footer-tagline">{t.tagline}</p>
              
              <div className="social-icons">
                <a href="#" className="social-circle">Fb</a>
                <a href="#" className="social-circle">Ig</a>
                <a href="#" className="social-circle">Tw</a>
                <a href="#" className="social-circle">Yt</a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="footer-title">{t.quickLinks}</h4>
              <div className="footer-links">
                <Link to="/">Home</Link>
                <Link to="/explore">Explore Collections</Link>
                <Link to="/upload">Artisan Application</Link>
                {isLoggedIn && <Link to="/dashboard">My Dashboard</Link>}
              </div>
            </div>

            {/* Support */}
            <div className="footer-section">
              <h4 className="footer-title">{t.support}</h4>
              <div className="footer-links">
                <Link to="/about">Our Story</Link>
                <Link to="/contact">Contact Us</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
              </div>
            </div>

            {/* Empty space for grid alignment or extra links if needed */}
            <div className="footer-section">
              <h4 className="footer-title">Contact</h4>
              <div className="footer-links">
                <span style={{color: '#a1a1aa'}}>support@logiccrafts.com</span>
                <span style={{color: '#a1a1aa'}}>+91 98765 43210</span>
                <span style={{color: '#a1a1aa', marginTop: '10px', lineHeight: 1.6}}>123 Heritage Street<br/>Jaipur, Rajasthan, India</span>
              </div>
            </div>

          </div>
        </div>

        {/* Trust Badges */}
        <div className="footer-trust">
          <div className="trust-grid">
            <div className="trust-item"><ShieldCheck size={24} /> <strong>{t.secure}</strong></div>
            <div className="trust-item"><Truck size={24} /> <strong>{t.shipping}</strong></div>
            <div className="trust-item"><RotateCcw size={24} /> <strong>{t.returns}</strong></div>
            <div className="trust-item"><Headset size={24} /> <strong>{t.help}</strong></div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Logic Crafts Connect. {t.copyright}</p>
        </div>
      </div>

    </footer>
  );
}