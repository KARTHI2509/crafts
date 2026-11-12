import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import "./ArtisanOrders.css";

export default function ArtisanOrders() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      title: "Order Management",
      subtitle: "Manage all incoming orders and track your sales",
      overview: "Sales Overview",
      totalOrders: "Total Orders",
      newOrders: "New Orders",
      pendingOrders: "In Progress",
      shippedOrders: "Shipped",
      completedOrders: "Completed",
      totalRevenue: "Total Revenue",
      avgOrderValue: "Avg Order Value",
      filters: {
        all: "All Orders",
        placed: "New",
        confirmed: "Confirmed",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
      },
      noOrders: "No orders found",
      orderNumber: "Order",
      buyer: "Buyer",
      items: "Items",
      total: "Total",
      status: "Status",
      date: "Date",
      viewDetails: "View Details",
      updateStatus: "Update Status",
      rejectOrder: "Reject",
      confirmReject: "Are you sure you want to reject this order?",
      rejectReason: "Please enter rejection reason:",
      rejectSuccess: "Order rejected successfully",
      rejectError: "Failed to reject order",
    },
    te: {
      title: "ఆర్డర్ నిర్వహణ",
      subtitle: "అన్ని ఇన్కమింగ్ ఆర్డర్లను నిర్వహించండి మరియు మీ అమ్మకాలను ట్రాక్ చేయండి",
      overview: "అమ్మకాల సమీక్ష",
      totalOrders: "మొత్తం ఆర్డర్లు",
      newOrders: "కొత్త ఆర్డర్లు",
      pendingOrders: "ప్రగతిలో",
      shippedOrders: "షిప్ చేయబడింది",
      completedOrders: "పూర్తయింది",
      totalRevenue: "మొత్తం ఆదాయం",
      avgOrderValue: "సగటు ఆర్డర్ విలువ",
      noOrders: "ఆర్డర్లు కనుగొనబడలేదు",
      orderNumber: "ఆర్డర్",
      buyer: "కొనుగోలుదారుడు",
      items: "వస్తువులు",
      total: "మొత్తం",
      status: "స్థితి",
      date: "తేదీ",
      viewDetails: "వివరాలు చూడండి",
      updateStatus: "స్థితిని నవీకరించండి",
      rejectOrder: "తిరస్కరించు",
      confirmReject: "మీరు ఖచ్చితంగా ఈ ఆర్డర్‌ను తిరస్కరించాలనుకుంటున్నారా?",
      rejectReason: "దయచేసి తిరస్కరణ కారణాన్ని నమోదు చేయండి:",
      rejectSuccess: "ఆర్డర్ విజయవంతంగా తిరస్కరించబడింది",
      rejectError: "ఆర్డర్ తిరస్కరించడం విఫలమైంది",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    if (user && user.role === "artisan") {
      fetchOrders();
      fetchStats();
    }
  }, [user, filter]);

  const fetchOrders = async () => {
    try {
      const filters = filter !== "all" ? { status: filter } : {};
      
      const response = await orderAPI.getAll(filters);

      if (response.success) {
        setOrders(response.data?.orders || []);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await orderAPI.getArtisanStats();

      if (response.success) {
        setStats(response.data?.stats);
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm(t.confirmReject)) return;

    const reason = window.prompt(t.rejectReason);
    if (!reason) return;

    try {
      const response = await orderAPI.reject(orderId, reason);

      if (response.success) {
        alert(t.rejectSuccess);
        fetchOrders();
        fetchStats();
      }
    } catch (error) {
      console.error("Reject order error:", error);
      alert(t.rejectError);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      placed: { text: "New", color: "#2196f3" },
      confirmed: { text: "Confirmed", color: "#9c27b0" },
      processing: { text: "Processing", color: "#ff9800" },
      shipped: { text: "Shipped", color: "#00bcd4" },
      out_for_delivery: { text: "Out for Delivery", color: "#03a9f4" },
      delivered: { text: "Delivered", color: "#4caf50" },
      cancelled: { text: "Cancelled", color: "#f44336" },
      returned: { text: "Returned", color: "#9e9e9e" },
    };

    const badge = badges[status] || badges.placed;
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="artisan-orders-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
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
                  <div className="stat-value">{stats.total_orders || 0}</div>
                  <div className="stat-label">{t.totalOrders}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#f3e5f5" }}>
                  🆕
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.new_orders || 0}</div>
                  <div className="stat-label">{t.newOrders}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#fff3e0" }}>
                  ⏳
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.pending_orders || 0}</div>
                  <div className="stat-label">{t.pendingOrders}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#e0f2f1" }}>
                  🚚
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.shipped_orders || 0}</div>
                  <div className="stat-label">{t.shippedOrders}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#e8f5e9" }}>
                  ✅
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.completed_orders || 0}</div>
                  <div className="stat-label">{t.completedOrders}</div>
                </div>
              </div>

              <div className="stat-card highlight">
                <div className="stat-icon" style={{ background: "#fff9c4" }}>
                  💰
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {formatCurrency(stats.total_revenue || 0)}
                  </div>
                  <div className="stat-label">{t.totalRevenue}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#fce4ec" }}>
                  📊
                </div>
                <div className="stat-info">
                  <div className="stat-value">
                    {formatCurrency(stats.average_order_value || 0)}
                  </div>
                  <div className="stat-label">{t.avgOrderValue}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            {t.filters.all}
          </button>
          <button
            className={filter === "placed" ? "active" : ""}
            onClick={() => setFilter("placed")}
          >
            {t.filters.placed}
          </button>
          <button
            className={filter === "confirmed" ? "active" : ""}
            onClick={() => setFilter("confirmed")}
          >
            {t.filters.confirmed}
          </button>
          <button
            className={filter === "processing" ? "active" : ""}
            onClick={() => setFilter("processing")}
          >
            {t.filters.processing}
          </button>
          <button
            className={filter === "shipped" ? "active" : ""}
            onClick={() => setFilter("shipped")}
          >
            {t.filters.shipped}
          </button>
          <button
            className={filter === "delivered" ? "active" : ""}
            onClick={() => setFilter("delivered")}
          >
            {t.filters.delivered}
          </button>
          <button
            className={filter === "cancelled" ? "active" : ""}
            onClick={() => setFilter("cancelled")}
          >
            {t.filters.cancelled}
          </button>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="no-orders">
              <p>{t.noOrders}</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h4>
                      {t.orderNumber} #{order.order_number}
                    </h4>
                    <p className="buyer-name">
                      👤 {t.buyer}: {order.buyer_name}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="order-body">
                  <div className="order-details">
                    <div className="detail-item">
                      <span className="label">📅 {t.date}:</span>
                      <span className="value">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">📦 {t.items}:</span>
                      <span className="value">{order.items?.length || 0} item(s)</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">💰 {t.total}:</span>
                      <span className="value total-amount">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="item-preview">
                        <img
                          src={item.image_url || "/placeholder.jpg"}
                          alt={item.craft_name}
                        />
                        <span>{item.craft_name}</span>
                        <span className="quantity">×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <span className="more-items">+{order.items.length - 2} more</span>
                    )}
                  </div>
                </div>

                <div className="order-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/artisan/orders/${order.id}`)}
                  >
                    {t.viewDetails}
                  </button>
                  {(order.status === "placed" || order.status === "confirmed") && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRejectOrder(order.id)}
                    >
                      {t.rejectOrder}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
