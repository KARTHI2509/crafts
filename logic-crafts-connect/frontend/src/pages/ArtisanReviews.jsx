import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { reviewAPI, artisanAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import "./ArtisanReviews.css";

export default function ArtisanReviews() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCraft, setSelectedCraft] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const content = {
    en: {
      title: "Reviews Dashboard",
      subtitle: "View and respond to customer feedback",
      overview: "Overview",
      avgRating: "Average Rating",
      totalReviews: "Total Reviews",
      responseRate: "Response Rate",
      filters: {
        allProducts: "All Products",
        allRatings: "All Ratings",
        stars: "stars",
      },
      noReviews: "No reviews yet",
      noReviewsDesc: "Reviews from your customers will appear here",
      reply: "Reply",
      yourReply: "Your Reply",
      replyPlaceholder: "Write your response to this review...",
      sendReply: "Send Reply",
      sending: "Sending...",
      cancel: "Cancel",
      replySuccess: "Reply posted successfully!",
      replyError: "Failed to post reply",
      helpful: "helpful",
      verified: "Verified Purchase",
    },
    te: {
      title: "రివ్యూల డాష్‌బోర్డ్",
      subtitle: "కస్టమర్ ఫీడ్‌బ్యాక్‌ను చూడండి మరియు స్పందించండి",
      overview: "సమీక్ష",
      avgRating: "సగటు రేటింగ్",
      totalReviews: "మొత్తం రివ్యూలు",
      responseRate: "స్పందన రేటు",
      filters: {
        allProducts: "అన్ని ఉత్పత్తులు",
        allRatings: "అన్ని రేటింగ్‌లు",
        stars: "స్టార్లు",
      },
      noReviews: "ఇంకా రివ్యూలు లేవు",
      noReviewsDesc: "మీ కస్టమర్ల నుండి రివ్యూలు ఇక్కడ కనిపిస్తాయి",
      reply: "స్పందించు",
      yourReply: "మీ స్పందన",
      replyPlaceholder: "ఈ రివ్యూకు మీ స్పందనను రాయండి...",
      sendReply: "స్పందన పంపు",
      sending: "పంపుతోంది...",
      cancel: "రద్దు చేయి",
      replySuccess: "స్పందన విజయవంతంగా పోస్ట్ చేయబడింది!",
      replyError: "స్పందన పోస్ట్ చేయడం విఫలమైంది",
      helpful: "సహాయకరం",
      verified: "ధృవీకరించిన కొనుగోలు",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    if (!user || user.role !== "artisan") {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch artisan's crafts first
      const craftsRes = await artisanAPI.getMyCrafts();
      const artisanCrafts = craftsRes?.data?.crafts || [];
      setCrafts(artisanCrafts);

      // Fetch reviews for all crafts
      const allReviews = [];
      let totalRating = 0;
      let reviewCount = 0;
      let repliedCount = 0;

      for (const craft of artisanCrafts) {
        try {
          const reviewsRes = await reviewAPI.getForCraft(craft.id);
          if (reviewsRes?.data?.reviews) {
            const craftReviews = reviewsRes.data.reviews.map((r) => ({
              ...r,
              craft_name: craft.name,
              craft_image: craft.images?.[0] || craft.image_url,
              craft_id: craft.id,
            }));
            allReviews.push(...craftReviews);
            
            craftReviews.forEach((r) => {
              totalRating += r.rating;
              reviewCount++;
              if (r.artisan_reply) repliedCount++;
            });
          }
        } catch (err) {
          console.error(`Error fetching reviews for craft ${craft.id}:`, err);
        }
      }

      // Sort by date (newest first)
      allReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(allReviews);

      // Calculate stats
      setStats({
        totalReviews: reviewCount,
        avgRating: reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : "0.0",
        responseRate: reviewCount > 0 ? Math.round((repliedCount / reviewCount) * 100) : 0,
        ratingDistribution: calculateRatingDistribution(allReviews),
      });
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRatingDistribution = (reviews) => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (dist[r.rating] !== undefined) {
        dist[r.rating]++;
      }
    });
    return dist;
  };

  const filteredReviews = reviews.filter((review) => {
    const craftMatch = selectedCraft === "all" || review.craft_id === selectedCraft;
    const ratingMatch = ratingFilter === "all" || review.rating === parseInt(ratingFilter);
    return craftMatch && ratingMatch;
  });

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;

    try {
      setSending(true);
      
      // Call API to post reply
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reply_text: replyText })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, artisan_reply: replyText, artisan_reply_at: new Date() }
              : r
          )
        );
        setReplyingTo(null);
        setReplyText("");
        alert(t.replySuccess);
      } else {
        alert(t.replyError);
      }
    } catch (error) {
      console.error("Reply error:", error);
      alert(t.replyError);
    } finally {
      setSending(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? "filled" : ""}`}>
        ★
      </span>
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(language === "te" ? "te-IN" : "en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="artisan-reviews loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="artisan-reviews">
      {/* Header */}
      <div className="reviews-header">
        <div className="header-text">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card main-rating">
          <div className="big-rating">
            <span className="rating-value">{stats?.avgRating || "0.0"}</span>
            <span className="rating-stars">{renderStars(Math.round(stats?.avgRating || 0))}</span>
          </div>
          <div className="stat-label">{t.avgRating}</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats?.totalReviews || 0}</div>
          <div className="stat-label">{t.totalReviews}</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats?.responseRate || 0}%</div>
          <div className="stat-label">{t.responseRate}</div>
        </div>

        {/* Rating Distribution */}
        <div className="stat-card rating-bars">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="rating-bar">
              <span className="bar-label">{star}★</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: stats?.totalReviews
                      ? `${(stats.ratingDistribution[star] / stats.totalReviews) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="bar-count">{stats?.ratingDistribution[star] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="reviews-filters">
        <select
          value={selectedCraft}
          onChange={(e) => setSelectedCraft(e.target.value)}
          className="filter-select"
        >
          <option value="all">{t.filters.allProducts}</option>
          {crafts.map((craft) => (
            <option key={craft.id} value={craft.id}>
              {craft.name}
            </option>
          ))}
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">{t.filters.allRatings}</option>
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>
              {star} {t.filters.stars}
            </option>
          ))}
        </select>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.length === 0 ? (
          <div className="no-reviews">
            <div className="no-reviews-icon">📝</div>
            <h3>{t.noReviews}</h3>
            <p>{t.noReviewsDesc}</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="review-card">
              {/* Review Header */}
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.buyer_image ? (
                      <img src={review.buyer_image} alt={review.buyer_name} />
                    ) : (
                      <span>{review.buyer_name?.charAt(0)?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <div className="reviewer-details">
                    <h4>{review.buyer_name || "Anonymous"}</h4>
                    <div className="review-meta">
                      <span className="review-rating">{renderStars(review.rating)}</span>
                      <span className="review-date">{formatDate(review.created_at)}</span>
                      {review.order_id && (
                        <span className="verified-badge">✓ {t.verified}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Craft Info */}
                <div className="craft-info">
                  {review.craft_image && (
                    <img src={review.craft_image} alt={review.craft_name} />
                  )}
                  <span>{review.craft_name}</span>
                </div>
              </div>

              {/* Review Content */}
              <div className="review-content">
                <p>{review.review_text || "No comment"}</p>
                
                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Review ${idx + 1}`} />
                    ))}
                  </div>
                )}

                {review.helpful_count > 0 && (
                  <div className="helpful-count">
                    👍 {review.helpful_count} {t.helpful}
                  </div>
                )}
              </div>

              {/* Artisan Reply Section */}
              {review.artisan_reply ? (
                <div className="artisan-reply">
                  <div className="reply-header">
                    <span className="reply-badge">🏪 {t.yourReply}</span>
                    <span className="reply-date">{formatDate(review.artisan_reply_at)}</span>
                  </div>
                  <p>{review.artisan_reply}</p>
                </div>
              ) : replyingTo === review.id ? (
                <div className="reply-form">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t.replyPlaceholder}
                    rows={3}
                  />
                  <div className="reply-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      disabled={sending}
                    >
                      {t.cancel}
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleReply(review.id)}
                      disabled={sending || !replyText.trim()}
                    >
                      {sending ? t.sending : t.sendReply}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="reply-button"
                  onClick={() => setReplyingTo(review.id)}
                >
                  💬 {t.reply}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
