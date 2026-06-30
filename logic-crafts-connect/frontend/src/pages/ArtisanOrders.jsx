import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { useSocket } from "../context/SocketContext";
import "./ArtisanOrders.css";

export default function ArtisanOrders() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const socket = useSocket();

  // ----------------------------
  // State Management
  // ----------------------------
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ----------------------------
  // Language Content
  // ----------------------------
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
      noOrders: "No orders found",
      orderNumber: "Order",
      buyer: "Buyer",
      items: "Items",
      total: "Total",
      date: "Date",
      viewDetails: "View Details",
      rejectOrder: "Reject",
      confirmReject: "Are you sure you want to reject this order?",
      rejectReason: "Enter rejection reason:",
      rejectSuccess: "Order rejected successfully",
      rejectError: "Failed to reject order",

      filters: {
        all: "All Orders",
        placed: "New",
        confirmed: "Confirmed",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
      },
    },
  };

  const t = content[language] || content.en;

  // ----------------------------
  // Initial Load
  // ----------------------------
  useEffect(() => {
    if (user?.role === "artisan") {
      loadData();
    }
  }, [user, filter]);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order) => {
      loadData();
    };

    socket.on('newOrder', handleNewOrder);

    return () => {
      socket.off('newOrder', handleNewOrder);
    };
  }, [socket, filter]);

  const loadData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchOrders(),
        fetchStats(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Fetch Orders
  // ----------------------------
  const fetchOrders = async () => {
    try {
      const query =
        filter !== "all" ? `?status=${filter}` : "";

      const response = await axios.get(
        `http://localhost:5000/api/orders${query}`,
        { headers }
      );

      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  // ----------------------------
  // Fetch Statistics
  // ----------------------------
  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/orders/artisan/stats",
        { headers }
      );

      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  // ----------------------------
  // Reject Order
  // ----------------------------
  const handleRejectOrder = async (orderId) => {
    if (!window.confirm(t.confirmReject)) return;

    const reason = window.prompt(t.rejectReason);
    if (!reason) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/reject`,
        { reason },
        { headers }
      );

      if (response.data.success) {
        alert(t.rejectSuccess);
        loadData();
      }
    } catch (error) {
      console.error("Reject order error:", error);
      alert(t.rejectError);
    }
  };

  // ----------------------------
  // Helper Functions
  // ----------------------------
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount) =>
    `₹${parseFloat(amount).toLocaleString("en-IN")}`;

  // Status Badge
  const getStatusBadge = (status) => {
    const badgeStyles = {
      placed: ["New", "#2196f3"],
      confirmed: ["Confirmed", "#9c27b0"],
      processing: ["Processing", "#ff9800"],
      shipped: ["Shipped", "#00bcd4"],
      out_for_delivery: ["Out for Delivery", "#03a9f4"],
      delivered: ["Delivered", "#4caf50"],
      cancelled: ["Cancelled", "#f44336"],
      returned: ["Returned", "#9e9e9e"],
    };

    const [text, color] =
      badgeStyles[status] || badgeStyles.placed;

    return (
      <span
        className="status-badge"
        style={{ background: color }}
      >
        {text}
      </span>
    );
  };

  // Stats Card Config
  const statsCards = stats
    ? [
        ["📦", stats.total_orders, t.totalOrders],
        ["🆕", stats.new_orders, t.newOrders],
        ["⏳", stats.pending_orders, t.pendingOrders],
        ["🚚", stats.shipped_orders, t.shippedOrders],
        ["✅", stats.completed_orders, t.completedOrders],
        ["💰", formatCurrency(stats.total_revenue), t.totalRevenue, true],
        ["📊", formatCurrency(stats.average_order_value), t.avgOrderValue],
      ]
    : [];

  // ----------------------------
  // Loading UI
  // ----------------------------
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
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="stats-overview">
            <h3>{t.overview}</h3>

            <div className="stats-grid">
              {statsCards.map(
                ([icon, value, label, highlight], index) => (
                  <div
                    key={index}
                    className={`stat-card ${
                      highlight ? "highlight" : ""
                    }`}
                  >
                    <div className="stat-icon">{icon}</div>

                    <div className="stat-info">
                      <div className="stat-value">
                        {value || 0}
                      </div>

                      <div className="stat-label">
                        {label}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {Object.entries(t.filters).map(
            ([key, value]) => (
              <button
                key={key}
                className={
                  filter === key ? "active" : ""
                }
                onClick={() => setFilter(key)}
              >
                {value}
              </button>
            )
          )}
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

                {/* Order Header */}
                <div className="order-header">
                  <div className="order-info">
                    <h4>
                      {t.orderNumber} #
                      {order.order_number}
                    </h4>

                    <p className="buyer-name">
                      👤 {t.buyer}: {order.buyer_name}
                    </p>
                  </div>

                  {getStatusBadge(order.status)}
                </div>

                {/* Order Body */}
                <div className="order-body">

                  {/* Details */}
                  <div className="order-details">
                    <div className="detail-item">
                      <span className="label">
                        📅 {t.date}
                      </span>

                      <span className="value">
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="label">
                        📦 {t.items}
                      </span>

                      <span className="value">
                        {order.items?.length || 0} item(s)
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="label">
                        💰 {t.total}
                      </span>

                      <span className="value total-amount">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="order-items-preview">
                    {order.items
                      ?.slice(0, 2)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="item-preview"
                        >
                          <img
                            src={
                              item.image_url ||
                              "/placeholder.jpg"
                            }
                            alt={item.craft_name}
                          />

                          <span>{item.craft_name}</span>

                          <span className="quantity">
                            ×{item.quantity}
                          </span>
                        </div>
                      ))}

                    {order.items?.length > 2 && (
                      <span className="more-items">
                        +{order.items.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="order-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate(
                        `/artisan/orders/${order.id}`
                      )
                    }
                  >
                    {t.viewDetails}
                  </button>

                  {(order.status === "placed" ||
                    order.status === "confirmed") && (
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        handleRejectOrder(order.id)
                      }
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