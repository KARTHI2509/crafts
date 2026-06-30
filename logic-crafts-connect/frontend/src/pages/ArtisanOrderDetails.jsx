import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import "./ArtisanOrderDetails.css";

export default function ArtisanOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);

  // ---------------------------------
  // State Management
  // ---------------------------------
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ---------------------------------
  // Multi-language content
  // ---------------------------------
  const content = {
    en: {
      title: "Order Details",
      backToOrders: "← Back to Orders",
      orderNumber: "Order Number",
      orderDate: "Order Date",
      buyerInfo: "Buyer Information",
      trackingInfo: "Tracking Information",
      orderItems: "Order Items",
      orderSummary: "Order Summary",
      name: "Name",
      email: "Email",
      phone: "Phone",
      address: "Shipping Address",
      quantity: "Quantity",
      price: "Price",
      subtotal: "Subtotal",
      total: "Total",
      paymentMethod: "Payment Method",
      notes: "Notes",
      updateStatus: "Update Order Status",
      trackingNumber: "Tracking Number",
      updateTracking: "Update Tracking",
      estimatedDelivery: "Estimated Delivery",
      updateSuccess: "Order status updated successfully",
      updateError: "Failed to update order status",
      trackingSuccess: "Tracking information updated",
      trackingError: "Failed to update tracking",
    },
  };

  const t = content[language] || content.en;

  // ---------------------------------
  // Status Options
  // ---------------------------------
  const statusOptions = [
    { value: "confirmed", label: "Confirmed", color: "#9c27b0" },
    { value: "processing", label: "Processing", color: "#ff9800" },
    { value: "shipped", label: "Shipped", color: "#00bcd4" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "#03a9f4" },
    { value: "delivered", label: "Delivered", color: "#4caf50" },
  ];

  // ---------------------------------
  // Initial Load
  // ---------------------------------
  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // ---------------------------------
  // Fetch Order Details
  // ---------------------------------
  const fetchOrder = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/api/orders/${orderId}`,
        { headers }
      );

      if (response.data.success) {
        setOrder(response.data.data.order);
      }
    } catch (error) {
      console.error("Fetch order error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------
  // Update Order Status
  // ---------------------------------
  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Update status to ${newStatus}?`)) return;

    try {
      setUpdating(true);

      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers }
      );

      if (response.data.success) {
        alert(t.updateSuccess);
        fetchOrder();
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert(t.updateError);
    } finally {
      setUpdating(false);
    }
  };

  // ---------------------------------
  // Update Tracking
  // ---------------------------------
  const handleUpdateTracking = async () => {
    const trackingNumber = window.prompt(`${t.trackingNumber}:`);
    if (!trackingNumber) return;

    const estimatedDelivery = window.prompt(
      `${t.estimatedDelivery} (YYYY-MM-DD):`
    );

    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/tracking`,
        {
          tracking_number: trackingNumber,
          estimated_delivery: estimatedDelivery || null,
        },
        { headers }
      );

      if (response.data.success) {
        alert(t.trackingSuccess);
        fetchOrder();
      }
    } catch (error) {
      console.error("Tracking update error:", error);
      alert(t.trackingError);
    }
  };

  // ---------------------------------
  // Helpers
  // ---------------------------------
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (amount) =>
    `₹${parseFloat(amount).toLocaleString("en-IN")}`;

  const getStatusBadge = (status) => {
    const colors = {
      placed: "#2196f3",
      confirmed: "#9c27b0",
      processing: "#ff9800",
      shipped: "#00bcd4",
      out_for_delivery: "#03a9f4",
      delivered: "#4caf50",
      cancelled: "#f44336",
    };

    return (
      <span
        className="status-badge"
        style={{ background: colors[status] || colors.placed }}
      >
        {status.replaceAll("_", " ")}
      </span>
    );
  };

  // ---------------------------------
  // Loading State
  // ---------------------------------
  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  // ---------------------------------
  // Error State
  // ---------------------------------
  if (!order) {
    return (
      <div className="container">
        <div className="error">Order not found</div>
      </div>
    );
  }

  return (
    <div className="artisan-order-details-page">
      <div className="container">

        {/* Back Button */}
        <button
          className="back-btn"
          onClick={() => navigate("/artisan/orders")}
        >
          {t.backToOrders}
        </button>

        {/* Header */}
        <div className="order-header">
          <div>
            <h2>{t.title}</h2>
            <p>
              {t.orderNumber}: <strong>#{order.order_number}</strong>
            </p>
            <p className="order-date">{formatDate(order.created_at)}</p>
          </div>

          {getStatusBadge(order.status)}
        </div>

        {/* Buyer + Tracking */}
        <div className="details-grid">

          {/* Buyer Info */}
          <div className="info-section">
            <h3>👤 {t.buyerInfo}</h3>

            <div className="info-content">
              {[
                [t.name, order.buyer_name],
                [t.email, order.buyer_email],
                [t.phone, order.buyer_phone],
                [t.address, order.shipping_address],
              ].map(([label, value], index) => (
                <div key={index} className="info-row">
                  <span className="label">{label}</span>
                  <span className="value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Info */}
          <div className="info-section">
            <h3>📦 {t.trackingInfo}</h3>

            <div className="info-content">
              <div className="info-row">
                <span className="label">{t.trackingNumber}</span>
                <span className="value">
                  {order.tracking_number || "Not set"}
                </span>
              </div>

              <div className="info-row">
                <span className="label">{t.estimatedDelivery}</span>
                <span className="value">
                  {order.estimated_delivery
                    ? formatDate(order.estimated_delivery)
                    : "Not set"}
                </span>
              </div>

              <button
                className="btn btn-secondary"
                onClick={handleUpdateTracking}
              >
                {t.updateTracking}
              </button>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="items-section">
          <h3>📋 {t.orderItems}</h3>

          <div className="items-table">
            {order.items.map((item) => (
              <div key={item.id} className="table-row">
                <div className="item-info">
                  <img
                    src={item.image_url || "/placeholder.jpg"}
                    alt={item.craft_name}
                  />

                  <div>
                    <strong>{item.craft_name}</strong>
                    <p>{item.description}</p>
                  </div>
                </div>

                <div>{item.quantity}</div>
                <div>{formatCurrency(item.price_at_purchase)}</div>
                <div className="subtotal">
                  {formatCurrency(item.subtotal)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="summary-section">
          <h3>💰 {t.orderSummary}</h3>

          <div className="summary-content">
            <div className="summary-row">
              <span>{t.paymentMethod}</span>
              <span>{order.payment_method || "COD"}</span>
            </div>

            <div className="summary-row total">
              <span>{t.total}</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>

            {order.notes && (
              <div className="notes">
                <strong>{t.notes}</strong>
                <p>{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Update */}
        {order.status !== "delivered" &&
          order.status !== "cancelled" && (
            <div className="status-update-section">
              <h3>{t.updateStatus}</h3>

              <div className="status-buttons">
                {statusOptions.map((option) => {
                  const currentIndex = statusOptions.findIndex(
                    (s) => s.value === order.status
                  );

                  const optionIndex = statusOptions.findIndex(
                    (s) => s.value === option.value
                  );

                  const disabled = currentIndex >= optionIndex;

                  return (
                    <button
                      key={option.value}
                      className={`status-btn ${
                        order.status === option.value
                          ? "current"
                          : ""
                      } ${disabled ? "past" : ""}`}
                      style={{
                        borderColor: option.color,
                      }}
                      onClick={() =>
                        handleUpdateStatus(option.value)
                      }
                      disabled={updating || disabled}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

      </div>
    </div>
  );
}