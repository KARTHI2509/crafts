import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { useSocket } from "../context/SocketContext";
import { orderAPI } from "../services/api";
import "./BuyerOrders.css";

const BuyerOrders = () => {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const socket = useSocket();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const text = {
    en: {
      myOrders: "My Orders",
      all: "All",
      placed: "Placed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      orderNumber: "Order #",
      total: "Total",
      items: "Items",
      viewDetails: "View Details",
      noOrders: "No orders found",
      startShopping: "Start Shopping",
      loading: "Loading orders...",
      orderedOn: "Ordered on",
    },
    te: {
      myOrders: "నా ఆర్డర్లు",
      all: "అన్నీ",
      placed: "ప్లేస్ చేయబడింది",
      processing: "ప్రాసెస్ అవుతోంది",
      shipped: "షిప్ చేయబడింది",
      delivered: "డెలివరీ అయింది",
      cancelled: "రద్దు చేయబడింది",
      orderNumber: "ఆర్డర్ #",
      total: "మొత్తం",
      items: "వస్తువులు",
      viewDetails: "వివరాలు చూడండి",
      noOrders: "ఆర్డర్లు కనిపించలేదు",
      startShopping: "షాపింగ్ ప్రారంభించండి",
      loading: "ఆర్డర్లు లోడ్ అవుతున్నాయి...",
      orderedOn: "ఆర్డర్ చేసిన తేదీ",
    },
  };

  const t = text[language] || text.en;

  const filterTabs = [
    "all",
    "placed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  useEffect(() => {
    if (user?.role === "buyer") {
      fetchOrders();
    }
  }, [user, filter]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderStatusUpdated = (order) => {
      fetchOrders();
    };

    socket.on('orderStatusUpdated', handleOrderStatusUpdated);

    return () => {
      socket.off('orderStatusUpdated', handleOrderStatusUpdated);
    };
  }, [socket, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response =
        filter === "all"
          ? await orderAPI.getAll()
          : await orderAPI.getAll({ status: filter });

      setOrders(response.data?.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = {
    placed: { background: "#fff3cd", color: "#856404" },
    confirmed: { background: "#cce5ff", color: "#004085" },
    processing: { background: "#cce5ff", color: "#004085" },
    shipped: { background: "#d1ecf1", color: "#0c5460" },
    out_for_delivery: { background: "#d1ecf1", color: "#0c5460" },
    delivered: { background: "#d4edda", color: "#155724" },
    cancelled: { background: "#f8d7da", color: "#721c24" },
    returned: { background: "#f8d7da", color: "#721c24" },
  };

  const getStatusStyle = (status) =>
    statusStyles[status] || {
      background: "#f0f0f0",
      color: "#666",
    };

  if (!user || user.role !== "buyer") {
    return (
      <div className="buyer-orders-page">
        <div className="message">
          Please login as a buyer to view orders
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="buyer-orders-page">
        <div className="loading">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="buyer-orders-page">
      <div className="orders-container">

        <div className="orders-header">
          <h1>📦 {t.myOrders}</h1>
        </div>

        <div className="filter-tabs">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              className={filter === tab ? "active" : ""}
              onClick={() => setFilter(tab)}
            >
              {t[tab]}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>

            <h2>{t.noOrders}</h2>

            <button
              onClick={() => navigate("/explore")}
              className="start-shopping-btn"
            >
              {t.startShopping} →
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">

                <div className="order-card-header">
                  <div className="order-info">
                    <span className="order-number">
                      {t.orderNumber} {order.order_number}
                    </span>

                    <span className="order-date">
                      {t.orderedOn}{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className="order-status"
                    style={getStatusStyle(order.status)}
                  >
                    {order.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-details">

                    <div className="detail-item">
                      <span className="label">{t.items}</span>
                      <span className="value">
                        {order.total_items || "N/A"}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="label">{t.total}</span>
                      <span className="value total-amount">
                        ₹{order.total_amount}
                      </span>
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      navigate(`/buyer/orders/${order.id}`)
                    }
                    className="view-details-btn"
                  >
                    {t.viewDetails} →
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default BuyerOrders;