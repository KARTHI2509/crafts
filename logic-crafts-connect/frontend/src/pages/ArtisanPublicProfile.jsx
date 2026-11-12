import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { userAPI, craftAPI, reviewAPI, messageAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import "./ArtisanPublicProfile.css";

export default function ArtisanPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);

  const [artisan, setArtisan] = useState(null);
  const [crafts, setCrafts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalCrafts: 0, avgRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("crafts");
  const [showContactModal, setShowContactModal] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const content = {
    en: {
      loading: "Loading artisan profile...",
      notFound: "Artisan not found",
      backToExplore: "Back to Explore",
      tabs: { crafts: "Products", about: "About", reviews: "Reviews" },
      memberSince: "Member since",
      location: "Location",
      contact: "Contact Artisan",
      viewProduct: "View Details",
      noCrafts: "No products listed yet",
      noReviews: "No reviews yet",
      aboutArtisan: "About the Artisan",
      sendMessage: "Send Message",
      messagePlaceholder: "Write your message to the artisan...",
      send: "Send",
      cancel: "Cancel",
      loginToContact: "Login to contact this artisan",
      messageSent: "Message sent successfully!",
      craftCount: "Products",
      rating: "Rating",
      reviewCount: "Reviews",
    },
    te: {
      loading: "ఆర్టిసన్ ప్రొఫైల్ లోడ్ అవుతోంది...",
      notFound: "ఆర్టిసన్ కనుగొనబడలేదు",
      backToExplore: "ఎక్స్‌ప్లోర్‌కు తిరిగి వెళ్ళు",
      tabs: { crafts: "ఉత్పత్తులు", about: "గురించి", reviews: "రివ్యూలు" },
      memberSince: "సభ్యుడు అయిన తేదీ",
      location: "ప్రదేశం",
      contact: "ఆర్టిసన్‌ను సంప్రదించండి",
      viewProduct: "వివరాలు చూడండి",
      noCrafts: "ఇంకా ఉత్పత్తులు జాబితా చేయబడలేదు",
      noReviews: "ఇంకా రివ్యూలు లేవు",
      aboutArtisan: "ఆర్టిసన్ గురించి",
      sendMessage: "సందేశం పంపండి",
      messagePlaceholder: "ఆర్టిసన్‌కు మీ సందేశాన్ని రాయండి...",
      send: "పంపు",
      cancel: "రద్దు చేయండి",
      loginToContact: "ఈ ఆర్టిసన్‌ను సంప్రదించడానికి లాగిన్ అవ్వండి",
      messageSent: "సందేశం విజయవంతంగా పంపబడింది!",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    fetchArtisanData();
  }, [id]);

  const fetchArtisanData = async () => {
    try {
      setLoading(true);

      // Fetch artisan profile
      const userRes = await userAPI.getById(id);
      if (userRes?.data?.user) {
        setArtisan(userRes.data.user);
      }

      // Fetch artisan's crafts
      const craftsRes = await craftAPI.getAll({ artisan_id: id });
      const artisanCrafts = craftsRes?.data?.crafts || [];
      setCrafts(artisanCrafts);

      // Calculate stats and fetch reviews
      let allReviews = [];
      let totalRating = 0;

      for (const craft of artisanCrafts.slice(0, 10)) {
        try {
          const reviewRes = await reviewAPI.getForCraft(craft.id);
          if (reviewRes?.data?.reviews) {
            const craftReviews = reviewRes.data.reviews.map((r) => ({
              ...r,
              craft_name: craft.name,
              craft_image: craft.images?.[0] || craft.image_url,
            }));
            allReviews.push(...craftReviews);
          }
        } catch (err) {
          // Ignore review fetch errors
        }
      }

      allReviews.forEach((r) => (totalRating += r.rating));
      setReviews(allReviews.slice(0, 20));

      setStats({
        totalCrafts: artisanCrafts.length,
        avgRating: allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0,
        totalReviews: allReviews.length,
      });
    } catch (error) {
      console.error("Fetch artisan data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      await messageAPI.send({
        receiver_id: id,
        content: message,
      });
      alert(t.messageSent);
      setShowContactModal(false);
      setMessage("");
    } catch (error) {
      console.error("Send message error:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(language === "te" ? "te-IN" : "en-IN", {
      year: "numeric",
      month: "long",
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.round(rating) ? "filled" : ""}`}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="artisan-public-profile loading">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="artisan-public-profile not-found">
        <h2>😕 {t.notFound}</h2>
        <Link to="/explore" className="btn-primary">
          {t.backToExplore}
        </Link>
      </div>
    );
  }

  return (
    <div className="artisan-public-profile">
      {/* Hero Section */}
      <div className="profile-hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="artisan-avatar">
            {artisan.profile_image ? (
              <img src={artisan.profile_image} alt={artisan.name} />
            ) : (
              <span>{artisan.name?.charAt(0)?.toUpperCase() || "A"}</span>
            )}
          </div>
          <div className="artisan-info">
            <h1>{artisan.name}</h1>
            {artisan.location && (
              <p className="location">
                📍 {artisan.location}
              </p>
            )}
            <p className="member-since">
              {t.memberSince} {formatDate(artisan.created_at || new Date())}
            </p>
          </div>
          <button className="btn-contact" onClick={handleContact}>
            💬 {t.contact}
          </button>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">{stats.totalCrafts}</span>
            <span className="stat-label">{t.craftCount}</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {stats.avgRating > 0 ? (
                <>
                  {stats.avgRating} <span className="star-small">★</span>
                </>
              ) : (
                "—"
              )}
            </span>
            <span className="stat-label">{t.rating}</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.totalReviews}</span>
            <span className="stat-label">{t.reviewCount}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === "crafts" ? "active" : ""}`}
          onClick={() => setActiveTab("crafts")}
        >
          🎨 {t.tabs.crafts}
        </button>
        <button
          className={`tab ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          👤 {t.tabs.about}
        </button>
        <button
          className={`tab ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          ⭐ {t.tabs.reviews} ({stats.totalReviews})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Crafts Tab */}
        {activeTab === "crafts" && (
          <div className="crafts-grid">
            {crafts.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📦</span>
                <p>{t.noCrafts}</p>
              </div>
            ) : (
              crafts.map((craft) => (
                <div key={craft.id} className="craft-card" onClick={() => navigate(`/craft/${craft.id}`)}>
                  <div className="craft-image">
                    <img
                      src={craft.images?.[0] || craft.image_url || "/placeholder.jpg"}
                      alt={craft.name}
                    />
                    {craft.is_featured && <span className="badge featured">Featured</span>}
                    {craft.is_new && <span className="badge new">New</span>}
                  </div>
                  <div className="craft-info">
                    <h3>{craft.name}</h3>
                    <p className="category">{craft.category}</p>
                    <div className="craft-footer">
                      <span className="price">₹{craft.price}</span>
                      {craft.rating > 0 && (
                        <span className="rating">
                          ⭐ {craft.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="about-section">
            <h2>{t.aboutArtisan}</h2>
            {artisan.bio ? (
              <p className="bio">{artisan.bio}</p>
            ) : (
              <p className="no-bio">This artisan hasn't added a bio yet.</p>
            )}

            <div className="info-cards">
              {artisan.location && (
                <div className="info-card">
                  <span className="icon">📍</span>
                  <div>
                    <label>{t.location}</label>
                    <span>{artisan.location}</span>
                  </div>
                </div>
              )}
              {artisan.website && (
                <div className="info-card">
                  <span className="icon">🌐</span>
                  <div>
                    <label>Website</label>
                    <a href={artisan.website} target="_blank" rel="noopener noreferrer">
                      {artisan.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="reviews-section">
            {reviews.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">⭐</span>
                <p>{t.noReviews}</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer">
                        <div className="reviewer-avatar">
                          {review.buyer_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <h4>{review.buyer_name || "Anonymous"}</h4>
                          <p className="review-date">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="review-rating">{renderStars(review.rating)}</div>
                    </div>
                    <p className="review-text">{review.review_text}</p>
                    {review.craft_name && (
                      <div className="reviewed-product">
                        {review.craft_image && (
                          <img src={review.craft_image} alt={review.craft_name} />
                        )}
                        <span>{review.craft_name}</span>
                      </div>
                    )}
                    {review.artisan_reply && (
                      <div className="artisan-reply">
                        <strong>Artisan's Reply:</strong>
                        <p>{review.artisan_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.sendMessage}</h3>
              <button className="close-btn" onClick={() => setShowContactModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                To: <strong>{artisan.name}</strong>
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.messagePlaceholder}
                rows={5}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowContactModal(false)}>
                {t.cancel}
              </button>
              <button
                className="btn-primary"
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
              >
                {sending ? "Sending..." : t.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
