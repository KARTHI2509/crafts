import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { AuthContext } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, LineChart, PlusCircle, LogOut, CheckCircle, Clock, XCircle, Eye, Heart } from "lucide-react";
import { craftAPI } from "../services/api";
import "./ArtisanDashboard.css";

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

export default function ArtisanDashboard() {
  const { language } = useContext(LanguageContext);
  const { user, logout } = useContext(AuthContext);

  const [myCrafts, setMyCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalCrafts: 0,
    totalViews: 0,
    totalLikes: 0,
    pending: 0,
    approved: 0,
  });

  const content = {
    en: { welcome: "Welcome back", subtitle: "Here is what's happening with your artisan shop today." },
    te: { welcome: "స్వాగతం", subtitle: "ఈరోజు మీ హస్తకళల షాపులో జరుగుతున్నది." }
  };
  const t = content[language] || content.en;

  useEffect(() => {
    if (user?.role === "artisan") {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token found");

      const [craftsRes, statsRes] = await Promise.all([
        craftAPI.getMyCrafts(),
        craftAPI.getArtisanStats()
      ]);

      if (craftsRes.data.success) {
        const formattedCrafts = craftsRes.data.data.crafts.map(c => ({
          id: c._id || c.id,
          name: c.name,
          craftType: c.craft_type || c.category || "Handmade",
          price: c.price,
          location: c.location || user.location || "India",
          imageUrl: c.image_url || c.images?.[0] || "https://via.placeholder.com/400x300",
          status: c.status || "approved",
          views: c.view_count || 0,
          likes: c.save_count || 0
        }));
        setMyCrafts(formattedCrafts);
      }

      if (statsRes.data.success) {
        const backendStats = statsRes.data.data;
        setStats({
          totalCrafts: backendStats.totalCrafts || 0,
          totalViews: backendStats.totalViews || 0,
          totalLikes: 0,
          pending: backendStats.pendingCrafts || 0,
          approved: backendStats.approvedCrafts || 0,
        });
      }
      setError("");
    } catch (err) {
      console.warn("Dashboard sync failed, using offline fallback:", err);
      setError("Viewing in Offline Mode. Live stats synchronisation failed.");

      const mockCrafts = [
        { id: 1, name: "Traditional Clay Pot", craftType: "Pottery", price: "500", location: "Jaipur", imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400", status: "approved", views: 145, likes: 23 },
        { id: 2, name: "Wooden Jewelry Box", craftType: "Woodwork", price: "800", location: "Kerala", imageUrl: "https://images.unsplash.com/photo-1615397349754-5e6d2e18b0b8?w=400", status: "pending", views: 12, likes: 2 },
        { id: 3, name: "Silk Embroidered Scarf", craftType: "Textiles", price: "1200", location: "Bangalore", imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400", status: "approved", views: 289, likes: 45 },
      ];
      setMyCrafts(mockCrafts);
      setStats({
        totalCrafts: mockCrafts.length,
        totalViews: mockCrafts.reduce((sum, item) => sum + item.views, 0),
        totalLikes: mockCrafts.reduce((sum, item) => sum + item.likes, 0),
        pending: mockCrafts.filter((item) => item.status === "pending").length,
        approved: mockCrafts.filter((item) => item.status === "approved").length,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this craft?")) return;
    setMyCrafts((prev) => prev.filter((craft) => craft.id !== id));
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: "status-approved",
      pending: "status-pending",
      rejected: "status-rejected",
    };
    const icons = {
      approved: <CheckCircle size={12} />,
      pending: <Clock size={12} />,
      rejected: <XCircle size={12} />,
    };
    return (
      <div className={`craft-status-badge ${styles[status]}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Loading Dashboard...</div>;

  return (
    <div className="dashboard-layout">
      
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div>
            <strong>{user?.name || "Artisan Name"}</strong>
            <span>Master Craftsman</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/artisan-dashboard" className="sidebar-link active"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/upload-craft-enhanced" className="sidebar-link"><PlusCircle size={20} /> Upload Craft</Link>
          <Link to="/artisan/crafts" className="sidebar-link"><Package size={20} /> My Crafts</Link>
          <Link to="/artisan/orders" className="sidebar-link"><ShoppingCart size={20} /> Orders</Link>
          <Link to="/artisan/messages" className="sidebar-link"><MessageSquare size={20} /> Messages</Link>
          <Link to="/artisan/analytics" className="sidebar-link"><LineChart size={20} /> Analytics</Link>
          
          <div className="sidebar-link logout" onClick={logout} style={{ marginTop: 'auto' }}>
            <LogOut size={20} /> Logout
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        {error && (
          <div className="offline-warning-banner">
            <span className="warning-icon">⚠️</span> {error}
          </div>
        )}
        
        <div className="dashboard-header">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>{t.welcome}, {user?.name || "Artisan"}!</motion.h1>
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>{t.subtitle}</motion.p>
          </div>
          <Link to="/upload-craft-enhanced">
            <button className="btn hover-lift"><PlusCircle size={18} /> Upload New Craft</button>
          </Link>
        </div>

        {/* STATS GRID */}
        <div className="dashboard-stats">
          <motion.div className="stat-card-premium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="stat-icon"><Package size={28} /></div>
            <div className="stat-info">
              <h4>Total Crafts</h4>
              <div className="stat-val"><AnimatedNumber value={stats.totalCrafts} /></div>
            </div>
          </motion.div>

          <motion.div className="stat-card-premium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}><CheckCircle size={28} /></div>
            <div className="stat-info">
              <h4>Approved</h4>
              <div className="stat-val"><AnimatedNumber value={stats.approved} /></div>
            </div>
          </motion.div>

          <motion.div className="stat-card-premium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><Eye size={28} /></div>
            <div className="stat-info">
              <h4>Total Views</h4>
              <div className="stat-val"><AnimatedNumber value={stats.totalViews} /></div>
            </div>
          </motion.div>

          <motion.div className="stat-card-premium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><Heart size={28} /></div>
            <div className="stat-info">
              <h4>Total Favorites</h4>
              <div className="stat-val"><AnimatedNumber value={stats.totalLikes} /></div>
            </div>
          </motion.div>
        </div>

        {/* CRAFTS GALLERY */}
        <motion.div className="dashboard-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="section-title">
            <h3>Recent Uploads</h3>
            <Link to="/artisan/crafts" style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>View All</Link>
          </div>

          {myCrafts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <p>You haven't uploaded any crafts yet.</p>
            </div>
          ) : (
            <div className="dashboard-crafts-grid">
              {myCrafts.map((craft, i) => (
                <motion.div key={craft.id} className="craft-manage-card" whileHover={{ y: -5 }}>
                  {getStatusBadge(craft.status)}
                  <ProductCard craft={craft} />
                  <div className="craft-overlay-actions">
                    <button className="btn secondary">Edit</button>
                    <button className="btn" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fef2f2' }} onClick={() => handleDelete(craft.id)}>Delete</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </main>
    </div>
  );
}