import React, { useState, useEffect, useContext } from "react";
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
import { motion } from "framer-motion";

import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import "./ArtisanAnalytics.css";

function AnimatedMetric({ value }) {
  const [displayValue, setDisplayValue] = useState("");
  useEffect(() => {
    const str = String(value);
    const hasRupee = str.startsWith("₹");
    const hasPercent = str.endsWith("%");
    const numericStr = str.replace(/[^\d.]/g, "");
    const end = parseFloat(numericStr) || 0;
    
    if (end === 0) {
      setDisplayValue(str);
      return;
    }
    
    let start = 0;
    const duration = 1.0;
    const incrementTime = 25;
    const totalSteps = (duration * 1000) / incrementTime;
    const step = end / totalSteps;

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue((hasRupee ? "₹" : "") + end.toLocaleString() + (hasPercent ? "%" : ""));
      } else {
        const formatted = start.toFixed(str.includes(".") ? 1 : 0);
        setDisplayValue((hasRupee ? "₹" : "") + parseFloat(formatted).toLocaleString() + (hasPercent ? "%" : ""));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue || value}</span>;
}

export default function ArtisanAnalytics() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);

  // ---------------------------
  // State Management
  // ---------------------------
  const [orderStats, setOrderStats] = useState(null);
  const [craftStats, setCraftStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topCrafts, setTopCrafts] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  // ---------------------------
  // Multi-language Content
  // ---------------------------
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
      totalRevenue: "Total Revenue",
      avgOrderValue: "Avg Order Value",
      totalOrders: "Total Orders",
      completionRate: "Completion Rate",
      totalCrafts: "Total Products",
      totalViews: "Total Views",
      conversionRate: "Conversion Rate",
      noData: "No data available yet",
    },
  };

  const t = content[language] || content.en;

  // ---------------------------
  // Fetch Data on Load
  // ---------------------------
  useEffect(() => {
    if (user?.role === "artisan") {
      fetchAnalytics();
    }
  }, [period, user]);

  // ---------------------------
  // Fetch All Analytics
  // ---------------------------
  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchOrderStats(),
        fetchCraftStats(),
        fetchRevenueData(),
        fetchTopCrafts(),
      ]);
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Order Stats
  // ---------------------------
  const fetchOrderStats = async () => {
    const response = await axios.get(
      `${API_URL}/orders/artisan/stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      setOrderStats(response.data.data.stats);
    }
  };

  // ---------------------------
  // Craft Stats
  // ---------------------------
  const fetchCraftStats = async () => {
    const response = await axios.get(
      `${API_URL}/crafts/artisan/stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      setCraftStats(response.data.data.stats);
    }
  };

  // ---------------------------
  // Revenue Trends
  // ---------------------------
  const fetchRevenueData = async () => {
    const response = await axios.get(
      `${API_URL}/orders/artisan/revenue?period=${period}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      const formattedData = response.data.data.revenue
        .reverse()
        .map((item) => ({
          period: item.period,
          revenue: Number(item.revenue),
          orders: Number(item.order_count),
          avgValue: Number(item.avg_order_value),
        }));

      setRevenueData(formattedData);
    }
  };

  // ---------------------------
  // Top Crafts
  // ---------------------------
  const fetchTopCrafts = async () => {
    const response = await axios.get(
      `${API_URL}/crafts/my-crafts`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      const formattedCrafts = response.data.data.crafts
        .filter((craft) => craft.order_count > 0)
        .sort((a, b) => b.order_count - a.order_count)
        .slice(0, 5)
        .map((craft) => ({
          name:
            craft.name.length > 20
              ? craft.name.slice(0, 20) + "..."
              : craft.name,
          orders: craft.order_count,
          revenue: craft.order_count * craft.price,
        }));

      setTopCrafts(formattedCrafts);
    }
  };

  // Currency Formatter
  const formatCurrency = (value) =>
    `₹${Number(value).toLocaleString("en-IN")}`;

  // Order Distribution Chart Data
  const orderDistribution = orderStats
    ? [
        { name: "New", value: +orderStats.new_orders, color: "#2196f3" },
        { name: "Pending", value: +orderStats.pending_orders, color: "#ff9800" },
        { name: "Shipped", value: +orderStats.shipped_orders, color: "#00bcd4" },
        { name: "Completed", value: +orderStats.completed_orders, color: "#4caf50" },
        { name: "Cancelled", value: +orderStats.cancelled_orders, color: "#f44336" },
      ].filter((item) => item.value > 0)
    : [];

  // Calculated Metrics
  const completionRate = orderStats
    ? (
        (+orderStats.completed_orders /
          Math.max(+orderStats.total_orders, 1)) *
        100
      ).toFixed(1)
    : 0;

  const conversionRate =
    craftStats && orderStats
      ? (
          (+orderStats.total_orders /
            Math.max(+craftStats.total_views, 1)) *
          100
        ).toFixed(2)
      : 0;

  // Loading UI
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

          {/* Period Selector */}
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

        {/* Metrics Section */}
        <div className="metrics-grid">
          {[
            ["💰", formatCurrency(orderStats?.total_revenue || 0), t.totalRevenue],
            ["📊", formatCurrency(orderStats?.average_order_value || 0), t.avgOrderValue],
            ["📦", orderStats?.total_orders || 0, t.totalOrders],
            ["✅", `${completionRate}%`, t.completionRate],
            ["🎨", craftStats?.total_crafts || 0, t.totalCrafts],
            ["👁️", craftStats?.total_views || 0, t.totalViews],
            ["📈", `${conversionRate}%`, t.conversionRate],
          ].map(([icon, value, label], index) => (
            <motion.div
              key={index}
              className={`metric-card ${index === 0 ? "highlight" : ""}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="metric-icon">{icon}</div>
              <div className="metric-info">
                <div className="metric-value">
                  <AnimatedMetric value={value} />
                </div>
                <div className="metric-label">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="charts-grid">

          {/* Revenue Chart */}
          <motion.div 
            className="chart-card full-width"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3>{t.revenue}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="revenue" stroke="#8b5a2b" strokeWidth={3} isAnimationActive={true} animationDuration={1200} />
                <Line dataKey="orders" stroke="#4caf50" strokeWidth={2} isAnimationActive={true} animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Products */}
          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h3>{t.topProducts}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCrafts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#8b5a2b" isAnimationActive={true} animationDuration={1200} />
                <Bar dataKey="revenue" fill="#d4a574" isAnimationActive={true} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Order Distribution */}
          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3>{t.orderDistribution}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderDistribution}
                  dataKey="value"
                  outerRadius={90}
                  label
                  isAnimationActive={true}
                  animationDuration={1200}
                >
                  {orderDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

        </div>
      </div>
    </div>
  );
}