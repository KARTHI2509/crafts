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

  // -----------------------------
  // States
  // -----------------------------
  const [crafts, setCrafts] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // -----------------------------
  // Language Content
  // -----------------------------
  const content = {
    en: {
      title: "My Crafts",
      subtitle: "Manage your products and track performance",
      addNew: "+ Add New Craft",
      overview: "Overview",
      noCrafts: "No crafts available. Upload your first craft!",
      confirmDelete: "Are you sure you want to delete this craft?",
      deleteSuccess: "Craft deleted successfully",
      deleteError: "Failed to delete craft",
    },
  };

  const t = content[language] || content.en;

  // -----------------------------
  // Initial Load
  // -----------------------------
  useEffect(() => {
    if (authLoading) return;

    if (user?.role === "artisan") {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCrafts(), fetchStats()]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Fetch Crafts
  // -----------------------------
  const fetchCrafts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/crafts/my-crafts`,
        { headers }
      );

      if (response.data.success) {
        setCrafts(response.data.data.crafts);
        setError("");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch crafts"
      );
    }
  };

  // -----------------------------
  // Fetch Stats
  // -----------------------------
  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/crafts/artisan/stats`,
        { headers }
      );

      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch stats"
      );
    }
  };

  // -----------------------------
  // Delete Craft
  // -----------------------------
  const handleDelete = async (craftId) => {
    if (!window.confirm(t.confirmDelete)) return;

    try {
      const response = await axios.delete(
        `${API_URL}/crafts/${craftId}`,
        { headers }
      );

      if (response.data.success) {
        alert(t.deleteSuccess);
        loadData();
      }
    } catch {
      alert(t.deleteError);
    }
  };

  // -----------------------------
  // Toggle Visibility
  // -----------------------------
  const toggleVisibility = async (
    craftId,
    currentVisibility
  ) => {
    try {
      const newVisibility =
        currentVisibility === "public"
          ? "hidden"
          : "public";

      await axios.patch(
        `${API_URL}/crafts/${craftId}/visibility`,
        { visibility: newVisibility },
        { headers }
      );

      loadData();
    } catch {
      alert("Failed to update visibility");
    }
  };

  // -----------------------------
  // Filter Crafts
  // -----------------------------
  const filteredCrafts = crafts.filter((craft) => {
    const filters = {
      approved: craft.status === "approved",
      pending: craft.status === "pending",
      featured: craft.is_featured,
      newArrival: craft.is_new_arrival,
    };

    return filter === "all" ? true : filters[filter];
  });

  // -----------------------------
  // Status Badge
  // -----------------------------
  const getStatusBadge = (status) => {
    const colors = {
      approved: "#22c55e",
      pending: "#f59e0b",
      rejected: "#ef4444",
    };

    return (
      <span
        className="status-badge"
        style={{
          background: colors[status] || colors.pending,
        }}
      >
        {status}
      </span>
    );
  };

  // -----------------------------
  // Loading UI
  // -----------------------------
  if (authLoading || loading) {
    return (
      <div className="container">
        <div className="loading">Loading your crafts...</div>
      </div>
    );
  }

  // -----------------------------
  // Error UI
  // -----------------------------
  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="btn" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="artisan-crafts-page">
      <div className="container">

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>

          <button
            className="btn"
            onClick={() =>
              navigate("/upload-craft-enhanced")
            }
          >
            {t.addNew}
          </button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="stats-overview">
            <h3>{t.overview}</h3>
            <div className="stats-grid">
              {[
                ["📦", stats.total_crafts],
                ["👁️", stats.total_views],
                ["❤️", stats.total_saves],
                ["🛒", stats.total_orders],
                ["⭐", stats.featured_count],
                ["✅", stats.approved_count],
              ].map(([icon, value], index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{icon}</div>
                  <div className="stat-value">{value || 0}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {[
            "all",
            "approved",
            "pending",
            "featured",
            "newArrival",
          ].map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
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

                {/* Craft Image */}
                <div className="craft-image">
                  <img
                    src={
                      craft.image_url ||
                      craft.images?.[0] ||
                      "/placeholder.jpg"
                    }
                    alt={craft.name}
                  />
                </div>

                {/* Craft Details */}
                <div className="craft-details">
                  <div className="craft-header">
                    <h4>{craft.name}</h4>
                    {getStatusBadge(craft.status)}
                  </div>

                  <p className="craft-description">
                    {craft.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="craft-actions">
                  <button
                    className="btn-icon visibility"
                    onClick={() =>
                      toggleVisibility(
                        craft.id,
                        craft.visibility
                      )
                    }
                  >
                    {craft.visibility === "public"
                      ? "👁️"
                      : "🙈"}
                  </button>

                  <button
                    className="btn-icon edit"
                    onClick={() =>
                      navigate(`/crafts/edit/${craft.id}`)
                    }
                  >
                    ✏️
                  </button>

                  <button
                    className="btn-icon delete"
                    onClick={() =>
                      handleDelete(craft.id)
                    }
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