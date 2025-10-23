import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import "./ArtisanAnalytics.css";

export default function ArtisanAnalytics() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [orderStats, setOrderStats] = useState(null);
  const [craftStats, setCraftStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topCrafts, setTopCrafts] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      title: "Analytics & Insights",
      subtitle: "Track your business performance and growth",
      period: {
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly",
        yearly: "Yearly",
      },
      revenue: "Revenue Trends",
      topProducts: "Top Selling Products",
      orderDistribution: "Order Status Distribution",
      performance: "Performance Metrics",
      totalRevenue: "Total Revenue",
      avgOrderValue: "Avg Order Value",
      totalOrders: "Total Orders",
      completionRate: "Completion Rate",
      totalCrafts: "Total Products",
      totalViews: "Total Views",
      conversionRate: "Conversion Rate",
      noData: "No data available yet",
    },
    te: {
      title: "విశ్లేషణ & అంతర్దృష్టులు",
      subtitle: "మీ వ్యాపార పనితీరు మరియు వృద్ధిని ట్రాక్ చేయండి",
      revenue: "ఆదాయ ధోరణులు",
      topProducts: "టాప్ సెల్లింగ్ ఉత్పత్తులు",
      totalRevenue: "మొత్తం ఆదాయం",
      avgOrderValue: "సగటు ఆర్డర్ విలువ",
      totalOrders: "మొత్తం ఆర్డర్లు",
      noData: "ఇంకా డేటా అందుబాటులో లేదు",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    if (user && user.role === "artisan") {
      fetchAllData();
    }
  }, [user, period]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchOrderStats(),
        fetchCraftStats(),
        fetchRevenueData(),
        fetchTopCrafts(),
      ]);
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/orders/artisan/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setOrderStats(response.data.data.stats);
      }
    } catch (error) {
      console.error("Fetch order stats error:", error);
    }
  };

  const fetchCraftStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/crafts/artisan/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCraftStats(response.data.data.stats);
      }
    } catch (error) {
      console.error("Fetch craft stats error:", error);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/orders/artisan/revenue?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const data = response.data.data.revenue.reverse().map((item) => ({
          period: item.period,
          revenue: parseFloat(item.revenue),
          orders: parseInt(item.order_count),
          avgValue: parseFloat(item.avg_order_value),
        }));
        setRevenueData(data);
      }
    } catch (error) {
      console.error("Fetch revenue data error:", error);
    }
  };

  const fetchTopCrafts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/crafts/my-crafts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const crafts = response.data.data.crafts
          .filter((c) => c.order_count > 0)
          .sort((a, b) => b.order_count - a.order_count)
          .slice(0, 5)
          .map((craft) => ({
            name: craft.name.length > 20 ? craft.name.substring(0, 20) + "..." : craft.name,
            orders: craft.order_count,
            revenue: craft.order_count * craft.price,
          }));
        setTopCrafts(crafts);
      }
    } catch (error) {
      console.error("Fetch top crafts error:", error);
    }
  };

  const formatCurrency = (value) => {
    return `₹${parseFloat(value).toLocaleString("en-IN")}`;
  };

  const getOrderDistributionData = () => {
    if (!orderStats) return [];

    return [
      { name: "New", value: parseInt(orderStats.new_orders || 0), color: "#2196f3" },
      {
        name: "In Progress",
        value: parseInt(orderStats.pending_orders || 0),
        color: "#ff9800",
      },
      {
        name: "Shipped",
        value: parseInt(orderStats.shipped_orders || 0),
        color: "#00bcd4",
      },
      {
        name: "Completed",
        value: parseInt(orderStats.completed_orders || 0),
        color: "#4caf50",
      },
      {
        name: "Cancelled",
        value: parseInt(orderStats.cancelled_orders || 0),
        color: "#f44336",
      },
    ].filter((item) => item.value > 0);
  };

  const calculateMetrics = () => {
    const completionRate = orderStats
      ? (
          (parseInt(orderStats.completed_orders) /
            Math.max(parseInt(orderStats.total_orders), 1)) *
          100
        ).toFixed(1)
      : 0;

    const conversionRate = craftStats && orderStats
      ? (
          (parseInt(orderStats.total_orders) /
            Math.max(parseInt(craftStats.total_views), 1)) *
          100
        ).toFixed(2)
      : 0;

    return { completionRate, conversionRate };
  };

  const { completionRate, conversionRate } = calculateMetrics();

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="artisan-analytics-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
          <div className="period-selector">
            {Object.keys(t.period).map((key) => (
              <button
                key={key}
                className={period === key ? "active" : ""}
                onClick={() => setPeriod(key)}
              >
                {t.period[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="metrics-grid">
          <div className="metric-card highlight">
            <div className="metric-icon">💰</div>
            <div className="metric-info">
              <div className="metric-value">
                {formatCurrency(orderStats?.total_revenue || 0)}
              </div>
              <div className="metric-label">{t.totalRevenue}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-info">
              <div className="metric-value">
                {formatCurrency(orderStats?.average_order_value || 0)}
              </div>
              <div className="metric-label">{t.avgOrderValue}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📦</div>
            <div className="metric-info">
              <div className="metric-value">{orderStats?.total_orders || 0}</div>
              <div className="metric-label">{t.totalOrders}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">✅</div>
            <div className="metric-info">
              <div className="metric-value">{completionRate}%</div>
              <div className="metric-label">{t.completionRate}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🎨</div>
            <div className="metric-info">
              <div className="metric-value">{craftStats?.total_crafts || 0}</div>
              <div className="metric-label">{t.totalCrafts}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">👁️</div>
            <div className="metric-info">
              <div className="metric-value">{craftStats?.total_views || 0}</div>
              <div className="metric-label">{t.totalViews}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📈</div>
            <div className="metric-info">
              <div className="metric-value">{conversionRate}%</div>
              <div className="metric-label">{t.conversionRate}</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Revenue Trends */}
          <div className="chart-card full-width">
            <h3>{t.revenue}</h3>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="period"
                    stroke="#666"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#666"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => {
                      if (name === "revenue" || name === "avgValue") {
                        return [`₹${value}`, name === "revenue" ? "Revenue" : "Avg Value"];
                      }
                      return [value, "Orders"];
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5a2b"
                    strokeWidth={3}
                    dot={{ fill: "#8b5a2b", r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#4caf50"
                    strokeWidth={2}
                    dot={{ fill: "#4caf50", r: 4 }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">{t.noData}</div>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="chart-card">
            <h3>{t.topProducts}</h3>
            {topCrafts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCrafts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#666"
                    style={{ fontSize: "11px" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => [
                      name === "orders" ? value : formatCurrency(value),
                      name === "orders" ? "Orders" : "Revenue",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="orders" fill="#8b5a2b" name="Orders" />
                  <Bar dataKey="revenue" fill="#d4a574" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">{t.noData}</div>
            )}
          </div>

          {/* Order Distribution */}
          <div className="chart-card">
            <h3>{t.orderDistribution}</h3>
            {getOrderDistributionData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getOrderDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getOrderDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">{t.noData}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
