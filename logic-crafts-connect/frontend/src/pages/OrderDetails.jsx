import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { orderAPI } from "../services/api";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { orderId } = useParams();
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const text = {
    en: {
      orderDetails: "Order Details",
      orderNumber: "Order Number",
      orderDate: "Order Date",
      status: "Status",
      items: "Items",
      shippingAddress: "Shipping Address",
      paymentMethod: "Payment Method",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      total: "Total",
      cancelOrder: "Cancel Order",
      returnOrder: "Return Order",
      confirmCancel: "Are you sure you want to cancel this order?",
      confirmReturn: "Are you sure you want to return this order?",
      cancelReason: "Please provide a reason for cancellation:",
      returnReason: "Please provide a reason for return:",
      orderTimeline: "Order Timeline",
      placed: "Order Placed",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      outForDelivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
      by: "by",
      quantity: "Qty",
      loading: "Loading order details...",
      backToOrders: "← Back to Orders",
      orderCancelled: "Order cancelled successfully",
      returnRequested: "Return requested successfully",
    },
    te: {
      orderDetails: "ఆర్డర్ వివరాలు",
      orderNumber: "ఆర్డర్ నంబర్",
      orderDate: "ఆర్డర్ తేదీ",
      status: "స్థితి",
      items: "వస్తువులు",
      shippingAddress: "షిప్పింగ్ చిరునామా",
      paymentMethod: "చెల్లింపు పద్ధతి",
      orderSummary: "ఆర్డర్ సారాంశం",
      subtotal: "ఉప మొత్తం",
      shipping: "షిప్పింగ్",
      total: "మొత్తం",
      cancelOrder: "ఆర్డర్ రద్దు చేయండి",
      returnOrder: "ఆర్డర్ తిరిగి ఇవ్వండి",
      confirmCancel: "మీరు ఈ ఆర్డర్‌ను రద్దు చేయాలనుకుంటున్నారా?",
      confirmReturn: "మీరు ఈ ఆర్డర్‌ను తిరిగి ఇవ్వాలనుకుంటున్నారా?",
      cancelReason: "రద్దు కారణం ఇవ్వండి:",
      returnReason: "రిటర్న్ కారణం ఇవ్వండి:",
      orderTimeline: "ఆర్డర్ టైమ్‌లైన్",
      placed: "ఆర్డర్ చేయబడింది",
      confirmed: "నిర్ధారించబడింది",
      processing: "ప్రాసెస్ అవుతోంది",
      shipped: "షిప్ చేయబడింది",
      outForDelivery: "డెలివరీకి బయలుదేరింది",
      delivered: "డెలివరీ అయింది",
      cancelled: "రద్దు చేయబడింది",
      returned: "తిరిగి ఇవ్వబడింది",
      by: "ద్వారా",
      quantity: "పరిమాణం",
      loading: "ఆర్డర్ వివరాలు లోడ్ అవుతున్నాయి...",
      backToOrders: "← ఆర్డర్లకు తిరిగి వెళ్లండి",
      orderCancelled: "ఆర్డర్ విజయవంతంగా రద్దు చేయబడింది",
      returnRequested: "రిటర్న్ విజయవంతంగా అభ్యర్థించబడింది",
    },
  };

  const t = text[language] || text.en;

  useEffect(() => {
    if (user?.role === "buyer" && orderId) {
      fetchOrderDetails();
    }
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getById(orderId);
      setOrder(response.data?.order || null);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm(t.confirmCancel)) return;

    const reason = prompt(t.cancelReason);
    if (!reason) return;

    try {
      setActionLoading(true);
      await orderAPI.cancel(orderId, { cancel_reason: reason });

      alert(t.orderCancelled);
      fetchOrderDetails();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to cancel order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnOrder = async () => {
    if (!window.confirm(t.confirmReturn)) return;

    const reason = prompt(t.returnReason);
    if (!reason) return;

    try {
      setActionLoading(true);
      await orderAPI.return(orderId, { return_reason: reason });

      alert(t.returnRequested);
      fetchOrderDetails();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to request return");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || user.role !== "buyer") {
    return (
      <div className="order-details-page">
        <div className="message">Please login as buyer</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="loading">{t.loading}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="message">Order not found</div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        <div className="details-header">
          <button onClick={() => navigate("/buyer/orders")} className="back-btn">
            {t.backToOrders}
          </button>
          <h1>{t.orderDetails}</h1>
        </div>

        <div className="order-info-bar">
          <div className="info-item">
            <span>{t.orderNumber}</span>
            <strong>{order.order_number}</strong>
          </div>

          <div className="info-item">
            <span>{t.orderDate}</span>
            <strong>{new Date(order.created_at).toLocaleDateString()}</strong>
          </div>

          <div className="info-item">
            <span>{t.status}</span>
            <strong>{order.status}</strong>
          </div>
        </div>

        <div className="order-section">
          <h2>{t.items}</h2>

          {order.items?.map((item, index) => (
            <div key={index} className="order-item">
              <img
                src={item.craft_images?.[0] || "/placeholder.jpg"}
                alt={item.craft_title}
              />

              <div>
                <h3>{item.craft_title}</h3>
                <p>{t.by} {item.artisan_name}</p>
                <p>{t.quantity}: {item.quantity}</p>
              </div>

              <div>
                ₹{item.subtotal}
              </div>
            </div>
          ))}
        </div>

        <div className="order-actions">
          {["placed", "confirmed"].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              className="cancel-btn"
              disabled={actionLoading}
            >
              {t.cancelOrder}
            </button>
          )}

          {order.status === "delivered" && (
            <button
              onClick={handleReturnOrder}
              className="return-btn"
              disabled={actionLoading}
            >
              {t.returnOrder}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;