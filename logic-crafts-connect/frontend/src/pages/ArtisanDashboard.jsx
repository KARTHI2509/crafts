import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from '../components/ProductCard';
// import { craftAPI } from '../services/api';

export default function ArtisanDashboard() {
  const { language } = useContext(LanguageContext);
  const { user } = useAuth();
  const [myCrafts, setMyCrafts] = useState([]);
  const [stats, setStats] = useState({ totalViews: 0, totalLikes: 0, totalCrafts: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      welcome: "Welcome, Artisan",
      subtitle: "Manage your crafts and view your profile insights",
      uploadNew: "Upload New Craft",
      browseCrafts: "Browse Crafts",
      insights: "Dashboard Insights",
      totalCrafts: "Total Crafts",
      totalViews: "Total Views",
      totalLikes: "Total Likes",
      pendingApproval: "Pending Approval",
      approvedCrafts: "Approved Crafts",
      myCrafts: "My Crafts",
      noCrafts: "You haven't uploaded any crafts yet.",
      uploadFirst: "Upload Your First Craft",
      edit: "Edit",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this craft?",
      status: "Status",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    },
    te: {
      welcome: "స్వాగతం, కళాకారుడు",
      subtitle: "మీ హస్తకళలను నిర్వహించండి మరియు మీ ప్రొఫైల్ అంతర్దృష్టులను చూడండి",
      uploadNew: "కొత్త హస్తకళను అప్‌లోడ్ చేయండి",
      browseCrafts: "హస్తకళలను బ్రౌజ్ చేయండి",
      insights: "డాష్‌బోర్డ్ అంతర్దృష్టులు",
      totalCrafts: "మొత్తం హస్తకళలు",
      totalViews: "మొత్తం వీక్షణలు",
      totalLikes: "మొత్తం లైక్‌లు",
      pendingApproval: "ఆమోదం కోసం వేచి ఉంది",
      approvedCrafts: "ఆమోదించబడిన హస్తకళలు",
      myCrafts: "నా హస్తకళలు",
      noCrafts: "మీరు ఇంకా ఏ హస్తకళలను అప్‌లోడ్ చేయలేదు.",
      uploadFirst: "మీ మొదటి హస్తకళను అప్‌లోడ్ చేయండి",
      edit: "సవరించు",
      delete: "తొలగించు",
      deleteConfirm: "మీరు ఖచ్చితంగా ఈ హస్తకళను తొలగించాలనుకుంటున్నారా?",
      status: "స్థితి",
      pending: "పెండింగ్",
      approved: "ఆమోదించబడింది",
      rejected: "తిరస్కరించబడింది",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    // TODO: Replace with actual API call
    // craftAPI.getMyCrafts()
    //   .then(data => {
    //     setMyCrafts(data.crafts);
    //     calculateStats(data.crafts);
    //   })
    //   .catch(err => console.error(err))
    //   .finally(() => setLoading(false));

    // Mock data for now
    const mockCrafts = [
      { 
        id: 1, 
        name: 'Traditional Clay Pot', 
        craftType: 'Pottery', 
        price: '₹500', 
        location: 'Jaipur', 
        imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop',
        contact: '919876543210',
        status: 'approved',
        views: 145,
        likes: 23,
        story: 'Made using traditional techniques passed down three generations',
      },
      { 
        id: 2, 
        name: 'Wooden Jewelry Box', 
        craftType: 'Woodwork', 
        price: '₹800', 
        location: 'Kerala', 
        imageUrl: 'https://images.unsplash.com/photo-1615397349754-5e6d2e18b0b8?w=400&h=300&fit=crop',
        contact: '919876543210',
        status: 'pending',
        views: 12,
        likes: 2,
        story: 'Handcrafted from sustainable rosewood',
      },
      { 
        id: 3, 
        name: 'Silk Embroidered Scarf', 
        craftType: 'Textiles', 
        price: '₹1200', 
        location: 'Bangalore', 
        imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=300&fit=crop',
        contact: '919876543210',
        status: 'approved',
        views: 289,
        likes: 45,
        story: 'Hand-embroidered with traditional motifs',
      },
    ];

    setTimeout(() => {
      setMyCrafts(mockCrafts);
      
      // Calculate stats
      const totalViews = mockCrafts.reduce((sum, craft) => sum + (craft.views || 0), 0);
      const totalLikes = mockCrafts.reduce((sum, craft) => sum + (craft.likes || 0), 0);
      const pending = mockCrafts.filter(c => c.status === 'pending').length;
      const approved = mockCrafts.filter(c => c.status === 'approved').length;
      
      setStats({
        totalCrafts: mockCrafts.length,
        totalViews,
        totalLikes,
        pending,
        approved,
      });
      
      setLoading(false);
    }, 500);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm(t.deleteConfirm)) {
      // TODO: Call backend API to delete craft
      // craftAPI.delete(id)
      //   .then(() => {
      //     setMyCrafts(myCrafts.filter((craft) => craft.id !== id));
      //   })
      //   .catch(err => console.error(err));
      
      setMyCrafts(myCrafts.filter((craft) => craft.id !== id));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: <span className="badge badge-success">✓ {t.approved}</span>,
      pending: <span className="badge badge-warning">⏳ {t.pending}</span>,
      rejected: <span className="badge badge-danger">✗ {t.rejected}</span>,
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container dashboard">
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
        color: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        marginBottom: '24px' 
      }}>
        <h2>{t.welcome}, {user?.name || 'User'}!</h2>
        <p style={{ opacity: 0.9 }}>{t.subtitle}</p>
        <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>
          Role: <strong>Artisan</strong>
        </p>
      </div>

      {/* Quick Actions */}
      <div className="panel" style={{marginTop: '20px', marginBottom: '24px'}}>
        <div className="row" style={{gap: '12px', flexWrap: 'wrap'}}>
          <Link to="/upload-craft-enhanced">
            <button className="btn">{t.uploadNew}</button>
          </Link>
          <Link to="/artisan/crafts">
            <button className="btn secondary">📦 Manage My Crafts</button>
          </Link>
          <Link to="/artisan/orders">
            <button className="btn secondary">🛒 Manage Orders</button>
          </Link>
          <Link to="/artisan/messages">
            <button className="btn secondary">💬 Messages</button>
          </Link>
          <Link to="/artisan/analytics">
            <button className="btn secondary">📈 Analytics</button>
          </Link>
          <Link to="/explore">
            <button className="btn secondary">{t.browseCrafts}</button>
          </Link>
        </div>
      </div>

      {/* Dashboard Insights */}
      <h3 style={{marginBottom: '16px', fontSize: '20px'}}>{t.insights}</h3>
      <div className="stats-grid" style={{marginBottom: '32px'}}>
        <div className="stat-card">
          <h4>{t.totalCrafts}</h4>
          <div className="stat-number">{stats.totalCrafts}</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: 'var(--accent)'}}>
          <h4>{t.totalViews}</h4>
          <div className="stat-number">{stats.totalViews}</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: '#10b981'}}>
          <h4>{t.totalLikes}</h4>
          <div className="stat-number">{stats.totalLikes}</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: '#f59e0b'}}>
          <h4>{t.pendingApproval}</h4>
          <div className="stat-number">{stats.pending}</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: '#10b981'}}>
          <h4>{t.approvedCrafts}</h4>
          <div className="stat-number">{stats.approved}</div>
        </div>
      </div>

      <h3 style={{marginBottom: '16px', fontSize: '20px'}}>{t.myCrafts}</h3>
      
      {myCrafts.length === 0 ? (
        <div className="panel">
          <p style={{color: 'var(--muted)'}}>{t.noCrafts}</p>
          <Link to="/upload">
            <button className="btn" style={{marginTop: '12px'}}>{t.uploadFirst}</button>
          </Link>
        </div>
      ) : (
        <div className="grid">
          {myCrafts.map((craft) => (
            <div key={craft.id} className="craft-item-wrapper">
              <ProductCard craft={craft} />
              <div className="craft-actions">
                <div style={{marginTop: '8px', marginBottom: '4px'}}>
                  {getStatusBadge(craft.status)}
                </div>
                <div className="craft-stats">
                  <span>👁 {craft.views || 0} views</span>
                  <span>❤ {craft.likes || 0} likes</span>
                </div>
                <div style={{marginTop: '8px', display: 'flex', gap: '8px'}}>
                  <button className="btn secondary" style={{flex: 1, fontSize: '13px', padding: '6px'}}>
                    {t.edit}
                  </button>
                  <button 
                    className="btn danger" 
                    style={{flex: 1, fontSize: '13px', padding: '6px'}} 
                    onClick={() => handleDelete(craft.id)}
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
