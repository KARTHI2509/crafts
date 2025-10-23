import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";

export default function Home() {
  const { language } = useContext(LanguageContext);
  
  const content = {
    en: {
      heroTitle: "Connect Local Artisans with the World",
      heroSub: "A platform where local craftsmen can showcase their handmade products and reach real buyers without middlemen. Support tradition. Support local talent.",
      exploreCrafts: "Explore Crafts",
      uploadCraft: "Upload Craft",
      whyChooseUs: "Why Choose Logic Crafts Connect?",
      empowerTitle: "Empower Local Artisans",
      empowerDesc: "Direct connection between artisans and buyers, eliminating middlemen and ensuring fair prices.",
      storytellingTitle: "Share Your Story",
      storytellingDesc: "Every craft has a story. Share your heritage, passion, and journey with the world.",
      verifiedTitle: "Verified Quality",
      verifiedDesc: "Admin-verified crafts ensure authenticity and quality for buyers worldwide.",
      communityTitle: "Community Support",
      communityDesc: "Reviews, ratings, and appreciation messages build trust and community.",
      testimonialsTitle: "What Our Artisans Say",
      testimonial1: "This platform changed my life! I can now reach customers globally without any middleman.",
      testimonial1Author: "Priya Sharma, Textile Artist",
      testimonial2: "Easy to use and great support. My pottery is now appreciated by people worldwide.",
      testimonial2Author: "Rajesh Kumar, Potter",
      testimonial3: "The storytelling feature helps me connect emotionally with my buyers. Highly recommended!",
      testimonial3Author: "Lakshmi Devi, Handicraft Artist",
      eventsTitle: "Upcoming Events & Exhibitions",
      eventsDesc: "Join us at craft fairs and exhibitions to showcase your work.",
      viewEvents: "View All Events",
      joinTitle: "Join Our Community Today",
      joinDesc: "Whether you're an artisan or a buyer, become part of our growing community.",
      getStarted: "Get Started",
    },
    te: {
      heroTitle: "స్థానిక కళాకారులను ప్రపంచంతో కనెక్ట్ చేయండి",
      heroSub: "స్థానిక హస్తకళాకారులు తమ చేతితో తయారు చేసిన ఉత్పత్తులను ప్రదర్శించి, మధ్యవర్తులు లేకుండా నిజమైన కొనుగోలుదారులను చేరుకోగల వేదిక. సంప్రదాయానికి మద్దతు ఇవ్వండి. స్థానిక ప్రతిభకు మద్దతు ఇవ్వండి.",
      exploreCrafts: "హస్తకళలను అన్వేషించండి",
      uploadCraft: "హస్తకళను అప్‌లోడ్ చేయండి",
      whyChooseUs: "లాజిక్ క్రాఫ్ట్స్ కనెక్ట్‌ను ఎందుకు ఎంచుకోవాలి?",
      empowerTitle: "స్థానిక కళాకారులకు శక్తినివ్వండి",
      empowerDesc: "కళాకారులు మరియు కొనుగోలుదారుల మధ్య ప్రత్యక్ష సంబంధం, మధ్యవర్తులను తొలగించి న్యాయమైన ధరలను నిర్ధారిస్తుంది.",
      storytellingTitle: "మీ కథను పంచుకోండి",
      storytellingDesc: "ప్రతి హస్తకళకు ఒక కథ ఉంటుంది. మీ వారసత్వం, అభిరుచి మరియు ప్రయాణాన్ని ప్రపంచంతో పంచుకోండి.",
      verifiedTitle: "ధృవీకరించబడిన నాణ్యత",
      verifiedDesc: "అడ్మిన్ ధృవీకరించిన హస్తకళలు ప్రపంచవ్యాప్తంగా కొనుగోలుదారులకు ప్రామాణికత మరియు నాణ్యతను నిర్ధారిస్తాయి.",
      communityTitle: "సమాజ మద్దతు",
      communityDesc: "సమీక్షలు, రేటింగ్‌లు మరియు ప్రశంస సందేశాలు విశ్వాసం మరియు సమాజాన్ని నిర్మిస్తాయి.",
      testimonialsTitle: "మా కళాకారులు చెప్పేది",
      testimonial1: "ఈ వేదిక నా జీవితాన్ని మార్చింది! నేను ఇప్పుడు మధ్యవర్తి లేకుండా ప్రపంచవ్యాప్తంగా కస్టమర్‌లను చేరుకోగలను.",
      testimonial1Author: "ప్రియ శర్మ, వస్త్ర కళాకారిణి",
      testimonial2: "ఉపయోగించడానికి సులభం మరియు గొప్ప మద్దతు. నా కుండలు ఇప్పుడు ప్రపంచవ్యాప్తంగా ప్రజలచే ప్రశంసించబడుతున్నాయి.",
      testimonial2Author: "రాజేష్ కుమార్, కుమ్మరి",
      testimonial3: "కథ చెప్పే ఫీచర్ నా కొనుగోలుదారులతో భావోద్వేగంగా కనెక్ట్ అవ్వడానికి సహాయపడుతుంది. బాగా సిఫార్సు చేస్తున్నాను!",
      testimonial3Author: "లక్ష్మీ దేవి, హస్తకళా కళాకారిణి",
      eventsTitle: "రాబోయే ఈవెంట్‌లు & ప్రదర్శనలు",
      eventsDesc: "మీ పనిని ప్రదర్శించడానికి క్రాఫ్ట్ ఫెయిర్‌లు మరియు ప్రదర్శనలలో మాతో చేరండి.",
      viewEvents: "అన్ని ఈవెంట్‌లను చూడండి",
      joinTitle: "ఈరోజే మా కమ్యూనిటీలో చేరండి",
      joinDesc: "మీరు కళాకారుడైనా లేదా కొనుగోలుదారుడైనా, మా పెరుగుతున్న కమ్యూనిటీలో భాగం అవ్వండి.",
      getStarted: "ప్రారంభించండి",
    },
  };
  
  const t = content[language] || content.en;
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="container hero-inner">
          <div className="hero-left">
            <h1 className="hero-title">{t.heroTitle}</h1>
            <p className="hero-sub">{t.heroSub}</p>
            <div className="hero-cta">
              <Link to="/explore">
                <button className="btn">{t.exploreCrafts}</button>
              </Link>
              <Link to="/register">
                <button className="btn secondary">{t.uploadCraft}</button>
              </Link>
            </div>
          </div>
          <div className="hero-right">
            <img
              src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=350&fit=crop"
              alt="Handmade Crafts"
              style={{ borderRadius: "12px", boxShadow: "var(--shadow)" }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/500x350?text=Handmade+Crafts'; }}
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">{t.whyChooseUs}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>{t.empowerTitle}</h3>
              <p>{t.empowerDesc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📖</div>
              <h3>{t.storytellingTitle}</h3>
              <p>{t.storytellingDesc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>{t.verifiedTitle}</h3>
              <p>{t.verifiedDesc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>{t.communityTitle}</h3>
              <p>{t.communityDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">{t.testimonialsTitle}</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">"{t.testimonial1}"</p>
              <p className="testimonial-author">— {t.testimonial1Author}</p>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"{t.testimonial2}"</p>
              <p className="testimonial-author">— {t.testimonial2Author}</p>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"{t.testimonial3}"</p>
              <p className="testimonial-author">— {t.testimonial3Author}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Teaser */}
      <section className="events-teaser">
        <div className="container">
          <div className="events-content">
            <h2>{t.eventsTitle}</h2>
            <p>{t.eventsDesc}</p>
            <Link to="/events">
              <button className="btn">{t.viewEvents}</button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>{t.joinTitle}</h2>
          <p>{t.joinDesc}</p>
          <Link to="/register">
            <button className="btn">{t.getStarted}</button>
          </Link>
        </div>
      </section>

      {/* Future-ready placeholders (commented) */}
      {/* 
      <section className="ai-recommendations">
        <div className="container">
          <h2>AI-Powered Recommendations</h2>
          <p>Personalized craft suggestions based on your preferences (Coming Soon)</p>
        </div>
      </section>
      
      <section className="voice-search">
        <div className="container">
          <h2>Voice Search in Local Languages</h2>
          <p>Search for crafts using voice commands in Telugu, Hindi, and more (Coming Soon)</p>
        </div>
      </section>
      */}
    </div>
  );
}
