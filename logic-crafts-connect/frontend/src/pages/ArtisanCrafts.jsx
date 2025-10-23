import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import "./ArtisanCrafts.css";

export default function ArtisanCrafts() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [crafts, setCrafts] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const content = {
    en: {
      title: "My Crafts",
      subtitle: "Manage your product listings and track performance",
      addNew: "+ Add New Craft",
      overview: "Overview",
      totalCrafts: "Total Crafts",
      totalViews: "Total Views",
      totalSaves: "Total Saves",
      totalOrders: "Total Orders",
      featured: "Featured",
      approved: "Approved",
      pending: "Pending Review",
      filters: {
        all: "All Crafts",
        approved: "Approved",
        pending: "Pending",
        featured: "Featured",
        newArrival: "New Arrivals",
      },
      noCrafts: "No crafts found. Start by uploading your first craft!",
      price: "Price",
      stock: "Stock",
      views: "Views",
      saves: "Saves",
      orders: "Orders",
      edit: "Edit",
      delete: "Delete",
      status: "Status",
      deliveryDays: "days delivery",
      confirmDelete: "Are you sure you want to delete this craft?",
      deleteSuccess: "Craft deleted successfully",
      deleteError: "Failed to delete craft",
    },
    te: {
      title: "నా హస్తకళలు",
      subtitle: "మీ ఉత్పత్తి జాబితాలను నిర్వహించండి మరియు పనితీరును ట్రాక్ చేయండి",
      addNew: "+ కొత్త హస్తకళను జోడించండి",
      overview: "సమీక్ష",
      totalCrafts: "మొత్తం హస్తకళలు",
      totalViews: "మొత్తం వీక్షణలు",
      totalSaves: "మొత్తం సేవ్‌లు",
      totalOrders: "మొత్తం ఆర్డర్లు",
      featured: "ఫీచర్డ్",
      approved: "ఆమోదించబడింది",
      pending: "సమీక్ష పెండింగ్‌లో",
      noCrafts: "హస్తకళలు కనుగొనబడలేదు. మీ మొదటి హస్తకళను అప్‌లోడ్ చేయడం ద్వారా ప్రారంభించండి!",
      price: "ధర",
      stock: "స్టాక్",
      views: "వీక్షణలు",
      saves: "సేవ్‌లు",
      orders: "ఆర్డర్లు",
      edit: "సవరించు",
      delete: "తొలగించు",
      status: "స్థితి",
      deliveryDays: "రోజుల డెలివరీ",
      confirmDelete: "మీరు ఖచ్చితంగా ఈ హస్తకళను తొలగించాలనుకుంటున్నారా?",
      deleteSuccess: "హస్తకళ విజయవంతంగా తొలగించబడింది",
      deleteError: "హస్తకళ తొలగించడం విఫలమైంది",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    console.log('Auth loading:', authLoading);
    console.log('User object:', user);
    
    // Wait for auth context to finish loading
    if (authLoading) {
      console.log('Still loading auth context');
      return;
    }
    
    if (user && user.role === "artisan") {
      console.log('Fetching crafts for artisan');
      fetchCrafts();
      fetchStats();
    } else if (user === null) {
      // Not authenticated
      console.log('User not authenticated');
      setLoading(false);
    } else {
      console.log('User not qualified to fetch crafts:', user);
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchCrafts = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log('Token:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get("http://localhost:5000/api/crafts/my-crafts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Crafts response:', response.data);
      if (response.data.success) {
        setCrafts(response.data.data.crafts);
        setError(null);
      }
    } catch (error) {
      console.error("Fetch crafts error:", error);
      console.error("Error response:", error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to fetch crafts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log('Fetching stats with token:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get("http://localhost:5000/api/crafts/artisan/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Stats response:', response.data);
      if (response.data.success) {
        setStats(response.data.data.stats);
        setError(null);
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
      console.error("Stats error response:", error.response?.data);
      setError(prev => prev || (error.response?.data?.message || error.message || 'Failed to fetch stats'));
    }
  };

  const handleDelete = async (craftId) => {
    if (!window.confirm(t.confirmDelete)) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`http://localhost:5000/api/crafts/${craftId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        alert(t.deleteSuccess);
        fetchCrafts();
        fetchStats();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(t.deleteError);
    }
  };

  const toggleVisibility = async (craftId, currentVisibility) => {
    try {
      const token = localStorage.getItem("token");
      const newVisibility = currentVisibility === 'public' ? 'hidden' : 'public';
      
      const response = await axios.patch(
        `http://localhost:5000/api/crafts/${craftId}/visibility`,
        { visibility: newVisibility },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchCrafts(); // Refresh the list
        fetchStats();  // Refresh stats
      }
    } catch (error) {
      console.error("Visibility toggle error:", error);
      alert("Failed to toggle visibility");
    }
  };

  const filteredCrafts = crafts.filter((craft) => {
    if (filter === "all") return true;
    if (filter === "approved") return craft.status === "approved";
    if (filter === "pending") return craft.status === "pending";
    if (filter === "featured") return craft.is_featured === true;
    if (filter === "newArrival") return craft.is_new_arrival === true;
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      approved: { text: t.approved, color: "#22c55e" },
      pending: { text: t.pending, color: "#f59e0b" },
      rejected: { text: "Rejected", color: "#ef4444" },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        {badge.text}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="container">
        <div className="loading">Authenticating...</div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading your crafts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Error: {error}</div>
        <button onClick={() => { fetchCrafts(); fetchStats(); }} className="btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="artisan-crafts-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
          <button className="btn" onClick={() => navigate("/upload-craft-enhanced")}>
            {t.addNew}
          </button>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="stats-overview">
            <h3>{t.overview}</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#e3f2fd" }}>
                  📦
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.total_crafts || 0}</div>
                  <div className="stat-label">{t.totalCrafts}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#f3e5f5" }}>
                  👁️
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.total_views || 0}</div>
                  <div className="stat-label">{t.totalViews}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#fff3e0" }}>
                  ❤️
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.total_saves || 0}</div>
                  <div className="stat-label">{t.totalSaves}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#e8f5e9" }}>
                  🛒
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.total_orders || 0}</div>
                  <div className="stat-label">{t.totalOrders}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#fce4ec" }}>
                  ⭐
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.featured_count || 0}</div>
                  <div className="stat-label">{t.featured}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#e0f2f1" }}>
                  ✅
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.approved_count || 0}</div>
                  <div className="stat-label">{t.approved}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filter-tabs">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            {t.filters.all}
          </button>
          <button
            className={filter === "approved" ? "active" : ""}
            onClick={() => setFilter("approved")}
          >
            {t.filters.approved}
          </button>
          <button
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            {t.filters.pending}
          </button>
          <button
            className={filter === "featured" ? "active" : ""}
            onClick={() => setFilter("featured")}
          >
            {t.filters.featured}
          </button>
          <button
            className={filter === "newArrival" ? "active" : ""}
            onClick={() => setFilter("newArrival")}
          >
            {t.filters.newArrival}
          </button>
        </div>

        {/* Crafts List */}
        <div className="crafts-list">
          {filteredCrafts.length === 0 ? (
            <div className="no-crafts">
              <p>{t.noCrafts}</p>
            </div>
          ) : (
            filteredCrafts.map((craft) => (
              <div key={craft.id} className="craft-item">
                <div className="craft-image">
                  <img
                    src={craft.image_url || craft.images?.[0] || "/placeholder.jpg"}
                    alt={craft.name}
                  />
                  {craft.is_featured && <span className="badge featured">⭐ {t.featured}</span>}
                  {craft.is_new_arrival && <span className="badge new">🆕 New</span>}
                </div>

                <div className="craft-details">
                  <div className="craft-header">
                    <h4>{craft.name}</h4>
                    {getStatusBadge(craft.status)}
                  </div>

                  <p className="craft-description">{craft.description}</p>

                  <div className="craft-meta">
                    <span className="meta-item">
                      💰 {t.price}: ₹{craft.price}
                    </span>
                    <span className="meta-item">
                      📦 {t.stock}: {craft.stock || 0}
                    </span>
                    <span className="meta-item">
                      🚚 {craft.delivery_days || 7} {t.deliveryDays}
                    </span>
                  </div>

                  <div className="craft-stats">
                    <span className="stat-item">
                      👁️ {craft.view_count || 0} {t.views}
                    </span>
                    <span className="stat-item">
                      ❤️ {craft.save_count || 0} {t.saves}
                    </span>
                    <span className="stat-item">
                      🛒 {craft.order_count || 0} {t.orders}
                    </span>
                  </div>

                  <div className="craft-tags">
                    {craft.made_to_order && <span className="tag">Made to Order</span>}
                    {craft.limited_edition && <span className="tag">Limited Edition</span>}
                  </div>
                </div>

                <div className="craft-actions">
                  <button
                    className="btn-icon visibility"
                    onClick={() => toggleVisibility(craft.id, craft.visibility)}
                    title={craft.visibility === 'public' ? 'Hide from public' : 'Make public'}
                  >
                    {craft.visibility === 'public' ? '👁️' : '🙈'}
                  </button>
                  <button
                    className="btn-icon edit"
                    onClick={() => navigate(`/crafts/edit/${craft.id}`)}
                    title={t.edit}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDelete(craft.id)}
                    title={t.delete}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
