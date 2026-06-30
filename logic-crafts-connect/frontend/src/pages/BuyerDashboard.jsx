import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import ProductCard from "../components/ProductCard";
import "./BuyerDashboard.css";

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 1.2;
    const incrementTime = 25;
    const totalSteps = (duration * 1000) / incrementTime;
    const step = end / totalSteps;

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
}

const BuyerDashboard = () => {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  // --------------------------------
  // State Management
  // --------------------------------
  const [stats, setStats] = useState({
    orders: { total: 0, pending: 0, completed: 0 },
    wishlist: 0,
    cart: 0,
    unreadMessages: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [availableCrafts, setAvailableCrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: "",
    artisan: "",
    sortBy: "newest",
  });

  // Auth Config
  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // --------------------------------
  // Language Content
  // --------------------------------
  const text = {
    en: {
      welcome: "Welcome back",
      myOrders: "My Orders",
      wishlist: "Wishlist",
      cart: "Shopping Cart",
      messages: "Messages",
      pendingOrders: "Pending",
      completedOrders: "Completed",
      items: "items",
      unread: "unread",
      recentOrders: "Recent Orders",
      recommendedForYou: "Recommended For You",
      browseCrafts: "Browse Available Crafts",
      viewAll: "View All",
      viewOrder: "View",
      addToCart: "Add to Cart",
      noOrders: "No orders yet",
      startShopping: "Start Shopping",
      orderNumber: "Order #",
      total: "Total",
      loading: "Loading your dashboard...",
    },
  };

  const t = text[language] || text.en;

  // --------------------------------
  // Initial Load
  // --------------------------------
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --------------------------------
  // Fetch Dashboard Data
  // --------------------------------
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        ordersRes,
        wishlistRes,
        cartRes,
        messagesRes,
        craftsRes,
      ] = await Promise.all([
        axios
          .get("http://localhost:5000/api/orders/stats", config)
          .catch(() => ({
            data: {
              data: {
                stats: {
                  total: 0,
                  pending: 0,
                  completed: 0,
                },
              },
            },
          })),

        axios
          .get("http://localhost:5000/api/wishlist/count", config)
          .catch(() => ({
            data: { data: { count: 0 } },
          })),

        axios
          .get("http://localhost:5000/api/cart", config)
          .catch(() => ({
            data: { data: { total_items: 0 } },
          })),

        axios
          .get(
            "http://localhost:5000/api/messages/unread-count",
            config
          )
          .catch(() => ({
            data: { data: { unread_count: 0 } },
          })),

        axios.get(
          "http://localhost:5000/api/crafts?page=1&limit=8"
        ),
      ]);

      // Update Stats
      setStats({
        orders: ordersRes.data.data.stats,
        wishlist: wishlistRes.data.data.count,
        cart: cartRes.data.data.total_items || 0,
        unreadMessages:
          messagesRes.data.data.unread_count,
      });

      // Fetch Recommendations
      await fetchRecommendations();

      // Transform Crafts
      const crafts =
        craftsRes.data.data.crafts?.map((craft) => ({
          id: craft.id,
          name: craft.name,
          craftType:
            craft.craft_type ||
            craft.category ||
            "Handmade",
          price: `₹${craft.price || 0}`,
          location:
            craft.location ||
            craft.artisan_location ||
            "India",
          imageUrl:
            craft.image_url ||
            craft.images?.[0] ||
            "https://via.placeholder.com/400x300?text=No+Image",
          contact:
            craft.contact ||
            craft.artisan_phone ||
            "919876543210",
          artisan:
            craft.artisan_name ||
            "Unknown Artisan",
          verified: craft.status === "approved",
        })) || [];

      setAvailableCrafts(crafts);

      // Fetch Recent Orders
      await fetchRecentOrders();

    } catch (error) {
      console.error(
        "Error fetching dashboard data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Fetch Recommendations
  // --------------------------------
  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/recommendations/personalized?limit=4",
        config
      );

      setRecommendations(
        response.data.data.recommendations || []
      );
    } catch {
      console.log(
        "Recommendations unavailable"
      );
      setRecommendations([]);
    }
  };

  // --------------------------------
  // Fetch Recent Orders
  // --------------------------------
  const fetchRecentOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/orders?limit=5",
        config
      );

      setRecentOrders(
        response.data.data.orders || []
      );
    } catch {
      setRecentOrders([]);
    }
  };

  // --------------------------------
  // Add To Cart
  // --------------------------------
  const handleAddToCart = async (craftId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/cart",
        {
          craft_id: craftId,
          quantity: 1,
        },
        config
      );

      fetchDashboardData();
      alert("Added to cart!");
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );
      alert("Failed to add to cart");
    }
  };

  // --------------------------------
  // Loading State
  // --------------------------------
  if (loading) {
    return (
      <div className="buyer-dashboard">
        <div className="loading">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="buyer-dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <h1>
          {t.welcome}, {user?.name}!
        </h1>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        {[
          ["📦", t.myOrders, stats.orders.total],
          ["❤️", t.wishlist, stats.wishlist],
          ["🛒", t.cart, stats.cart],
          ["💬", t.messages, stats.unreadMessages],
        ].map(([icon, label, value], index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{icon}</div>

            <div className="stat-content">
              <h3>{label}</h3>
              <div className="stat-number">
                <AnimatedNumber value={value} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>{t.recentOrders}</h2>

          <button
            onClick={() =>
              navigate("/buyer/orders")
            }
            className="view-all-btn"
          >
            {t.viewAll} →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <p>{t.noOrders}</p>

            <button
              onClick={() =>
                navigate("/explore")
              }
              className="primary-btn"
            >
              {t.startShopping}
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="order-item"
              >
                <div className="order-info">
                  <span className="order-number">
                    {t.orderNumber}
                    {order.order_number}
                  </span>

                  <span
                    className={`order-status status-${order.status}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="order-details">
                  <span>
                    {new Date(
                      order.created_at
                    ).toLocaleDateString()}
                  </span>

                  <span className="order-total">
                    {t.total}: ₹
                    {order.total_amount}
                  </span>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/buyer/orders/${order.id}`
                    )
                  }
                  className="view-order-btn"
                >
                  {t.viewOrder}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>{t.recommendedForYou}</h2>
          </div>

          <div className="recommendations-grid">
            {recommendations.map((item) => (
              <div
                key={item.id}
                className="recommendation-card"
              >
                <div className="recommendation-image">
                  <img
                    src={
                      item.images?.[0] ||
                      "/placeholder.jpg"
                    }
                    alt={item.title}
                  />
                </div>

                <div className="recommendation-content">
                  <h3>{item.title}</h3>

                  <p className="price">
                    ₹{item.price}
                  </p>

                  <button
                    onClick={() =>
                      handleAddToCart(item.id)
                    }
                    className="add-to-cart-btn"
                  >
                    {t.addToCart}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available Crafts */}
      {availableCrafts.length > 0 && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>{t.browseCrafts}</h2>
          </div>

          <div className="grid">
            {availableCrafts.map((craft) => (
              <ProductCard
                key={craft.id}
                craft={craft}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BuyerDashboard;