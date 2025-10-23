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

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const content = {
    en: {
      title: "Order Details",
      backToOrders: "← Back to Orders",
      orderNumber: "Order Number",
      orderDate: "Order Date",
      status: "Status",
      buyerInfo: "Buyer Information",
      name: "Name",
      email: "Email",
      phone: "Phone",
      address: "Shipping Address",
      orderItems: "Order Items",
      item: "Item",
      quantity: "Quantity",
      price: "Price",
      subtotal: "Subtotal",
      orderSummary: "Order Summary",
      itemsTotal: "Items Total",
      shipping: "Shipping",
      total: "Total",
      paymentMethod: "Payment Method",
      notes: "Notes",
      updateStatus: "Update Order Status",
      selectStatus: "Select new status",
      confirmStatus: "Confirm",
      updateSuccess: "Order status updated successfully",
      updateError: "Failed to update order status",
      trackingInfo: "Tracking Information",
      trackingNumber: "Tracking Number",
      updateTracking: "Update Tracking",
      estimatedDelivery: "Estimated Delivery",
      trackingSuccess: "Tracking information updated",
      trackingError: "Failed to update tracking",
    },
    te: {
      title: "ఆర్డర్ వివరాలు",
      backToOrders: "← ఆర్డర్లకు తిరిగి వెళ్ళు",
      orderNumber: "ఆర్డర్ నంబర్",
      orderDate: "ఆర్డర్ తేదీ",
      status: "స్థితి",
      buyerInfo: "కొనుగోలుదారు సమాచారం",
      name: "పేరు",
      email: "ఇమెయిల్",
      phone: "ఫోన్",
      address: "షిప్పింగ్ చిరునామా",
      orderItems: "ఆర్డర్ వస్తువులు",
      updateStatus: "ఆర్డర్ స్థితిని నవీకరించండి",
      updateSuccess: "ఆర్డర్ స్థితి విజయవంతంగా నవీకరించబడింది",
      updateError: "ఆర్డర్ స్థితి నవీకరించడం విఫలమైంది",
    },
  };

  const t = content[language] || content.en;

  const statusOptions = [
    { value: "confirmed", label: "Confirmed", color: "#9c27b0" },
    { value: "processing", label: "Processing", color: "#ff9800" },
    { value: "shipped", label: "Shipped", color: "#00bcd4" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "#03a9f4" },
    { value: "delivered", label: "Delivered", color: "#4caf50" },
  ];

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Update order status to ${newStatus}?`)) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert(t.updateSuccess);
        fetchOrder();
      }
    } catch (error) {
      console.error("Update status error:", error);
      alert(t.updateError);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTracking = async () => {
    const trackingNumber = window.prompt(t.trackingNumber + ":");
    if (!trackingNumber) return;

    const estimatedDelivery = window.prompt(t.estimatedDelivery + " (YYYY-MM-DD):");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/tracking`,
        {
          tracking_number: trackingNumber,
          estimated_delivery: estimatedDelivery || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert(t.trackingSuccess);
        fetchOrder();
      }
    } catch (error) {
      console.error("Update tracking error:", error);
      alert(t.trackingError);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      placed: { text: "Placed", color: "#2196f3" },
      confirmed: { text: "Confirmed", color: "#9c27b0" },
      processing: { text: "Processing", color: "#ff9800" },
      shipped: { text: "Shipped", color: "#00bcd4" },
      out_for_delivery: { text: "Out for Delivery", color: "#03a9f4" },
      delivered: { text: "Delivered", color: "#4caf50" },
      cancelled: { text: "Cancelled", color: "#f44336" },
    };

    const badge = badges[status] || badges.placed;
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

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
        <button className="back-btn" onClick={() => navigate("/artisan/orders")}>
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

        <div className="details-grid">
          {/* Buyer Information */}
          <div className="info-section">
            <h3>👤 {t.buyerInfo}</h3>
            <div className="info-content">
              <div className="info-row">
                <span className="label">{t.name}:</span>
                <span className="value">{order.buyer_name}</span>
              </div>
              <div className="info-row">
                <span className="label">{t.email}:</span>
                <span className="value">{order.buyer_email}</span>
              </div>
              <div className="info-row">
                <span className="label">{t.phone}:</span>
                <span className="value">{order.buyer_phone}</span>
              </div>
              <div className="info-row">
                <span className="label">{t.address}:</span>
                <span className="value">{order.shipping_address}</span>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="info-section">
            <h3>📦 {t.trackingInfo}</h3>
            <div className="info-content">
              <div className="info-row">
                <span className="label">{t.trackingNumber}:</span>
                <span className="value">{order.tracking_number || "Not set"}</span>
              </div>
              <div className="info-row">
                <span className="label">{t.estimatedDelivery}:</span>
                <span className="value">
                  {order.estimated_delivery
                    ? formatDate(order.estimated_delivery)
                    : "Not set"}
                </span>
              </div>
              <button className="btn btn-secondary" onClick={handleUpdateTracking}>
                {t.updateTracking}
              </button>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="items-section">
          <h3>📋 {t.orderItems}</h3>
          <div className="items-table">
            <div className="table-header">
              <div>{t.item}</div>
              <div>{t.quantity}</div>
              <div>{t.price}</div>
              <div>{t.subtotal}</div>
            </div>
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
                <div className="subtotal">{formatCurrency(item.subtotal)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="summary-section">
          <h3>💰 {t.orderSummary}</h3>
          <div className="summary-content">
            <div className="summary-row">
              <span>{t.paymentMethod}:</span>
              <span>{order.payment_method || "COD"}</span>
            </div>
            <div className="summary-row total">
              <span>{t.total}:</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
            {order.notes && (
              <div className="notes">
                <strong>{t.notes}:</strong>
                <p>{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Update Status */}
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <div className="status-update-section">
            <h3>{t.updateStatus}</h3>
            <div className="status-buttons">
              {statusOptions.map((option) => {
                const isCurrentOrPast =
                  statusOptions.findIndex((s) => s.value === order.status) >=
                  statusOptions.findIndex((s) => s.value === option.value);

                return (
                  <button
                    key={option.value}
                    className={`status-btn ${
                      order.status === option.value ? "current" : ""
                    } ${isCurrentOrPast ? "past" : ""}`}
                    style={{ borderColor: option.color }}
                    onClick={() => handleUpdateStatus(option.value)}
                    disabled={updating || isCurrentOrPast}
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
