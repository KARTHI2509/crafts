import React, { useEffect, useState, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
// import { adminAPI } from '../utils/api';

export default function DashboardAdmin() {
  const { language } = useContext(LanguageContext);
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState({ totalCrafts: 0, totalUsers: 0, pendingApprovals: 0, totalEvents: 0 });
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ name: '', description: '', location: '', date: '', time: '' });

  const content = {
    en: {
      title: "Admin Dashboard",
      subtitle: "Manage crafts, users, and platform settings",
      totalCrafts: "Total Crafts",
      totalUsers: "Total Users",
      pendingApprovals: "Pending Approvals",
      totalEvents: "Total Events",
      pendingApprovalsList: "Pending Approvals",
      noPending: "No pending crafts",
      approve: "Approve",
      reject: "Reject",
      eventsManagement: "Events Management",
      createEvent: "Create New Event",
      eventName: "Event Name",
      eventDescription: "Event Description",
      eventLocation: "Location",
      eventDate: "Date",
      eventTime: "Time",
      submit: "Submit Event",
      cancel: "Cancel",
    },
    te: {
      title: "అడ్మిన్ డాష్‌బోర్డ్",
      subtitle: "హస్తకళలు, వినియోగదారులు మరియు ప్లాట్‌ఫారమ్ సెట్టింగ్‌లను నిర్వహించండి",
      totalCrafts: "మొత్తం హస్తకళలు",
      totalUsers: "మొత్తం వినియోగదారులు",
      pendingApprovals: "పెండింగ్ ఆమోదాలు",
      totalEvents: "మొత్తం ఈవెంట్‌లు",
      pendingApprovalsList: "పెండింగ్ ఆమోదాలు",
      noPending: "పెండింగ్ హస్తకళలు లేవు",
      approve: "ఆమోదించు",
      reject: "తిరస్కరించు",
      eventsManagement: "ఈవెంట్‌ల నిర్వహణ",
      createEvent: "కొత్త ఈవెంట్‌ను సృష్టించండి",
      eventName: "ఈవెంట్ పేరు",
      eventDescription: "ఈవెంట్ వివరణ",
      eventLocation: "స్థానం",
      eventDate: "తేదీ",
      eventTime: "సమయం",
      submit: "ఈవెంట్‌ను సమర్పించండి",
      cancel: "రద్దు చేయి",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    // TODO: Replace with actual API calls
    // adminAPI.getPendingCrafts()
    //   .then(data => setPending(data.crafts))
    //   .catch(err => console.error(err));
    
    // adminAPI.getStats()
    //   .then(data => setStats(data))
    //   .catch(err => console.error(err));

    // Mock pending crafts
    const mockPending = [
      { 
        id: 11, 
        name: 'Clay Lamp', 
        craftType: 'Pottery', 
        location: 'Village A',
        artisan: 'Ramesh Kumar',
        imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=150&h=100&fit=crop',
        price: '₹250',
        story: 'Traditional clay lamps made for festivals',
      },
      { 
        id: 12, 
        name: 'Handwoven Mat', 
        craftType: 'Textiles', 
        location: 'Village B',
        artisan: 'Lakshmi Devi',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=100&fit=crop',
        price: '₹600',
        story: 'Eco-friendly mats woven from natural fibers',
      },
      { 
        id: 13, 
        name: 'Bamboo Basket', 
        craftType: 'Basketry', 
        location: 'Assam',
        artisan: 'Priya Sharma',
        imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=150&h=100&fit=crop',
        price: '₹450',
        story: 'Sturdy baskets for daily use',
      },
    ];
    
    setPending(mockPending);
    
    // Mock stats
    setStats({
      totalCrafts: 156,
      totalUsers: 87,
      pendingApprovals: mockPending.length,
      totalEvents: 8,
    });
  }, []);

  const approve = (id) => {
    // TODO: Call backend API
    // adminAPI.approveCraft(id)
    //   .then(() => setPending(prev => prev.filter(p => p.id !== id)))
    //   .catch(err => console.error(err));
    
    setPending(prev => prev.filter(p => p.id !== id));
    setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
  };

  const reject = (id) => {
    // TODO: Call backend API
    // adminAPI.rejectCraft(id)
    //   .then(() => setPending(prev => prev.filter(p => p.id !== id)))
    //   .catch(err => console.error(err));
    
    setPending(prev => prev.filter(p => p.id !== id));
    setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    // TODO: Call backend API
    // adminAPI.createEvent(eventForm)
    //   .then(() => {
    //     setEventForm({ name: '', description: '', location: '', date: '', time: '' });
    //     setShowEventForm(false);
    //   })
    //   .catch(err => console.error(err));
    
    console.log('Event created:', eventForm);
    alert('Event created successfully!');
    setEventForm({ name: '', description: '', location: '', date: '', time: '' });
    setShowEventForm(false);
    setStats(prev => ({ ...prev, totalEvents: prev.totalEvents + 1 }));
  };

  return (
    <div className="container dashboard-admin">
      <h2>{t.title}</h2>
      <p>{t.subtitle}</p>
      
      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>{t.totalCrafts}</h4>
          <div className="stat-number">{stats.totalCrafts}</div>
        </div>
        <div className="stat-card">
          <h4>{t.totalUsers}</h4>
          <div className="stat-number">{stats.totalUsers}</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: 'var(--accent)'}}>
          <h4>{t.pendingApprovals}</h4>
          <div className="stat-number">{stats.pendingApprovals}</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: '#10b981'}}>
          <h4>{t.totalEvents}</h4>
          <div className="stat-number">{stats.totalEvents}</div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <h3 style={{marginBottom: '16px', fontSize: '20px', marginTop: '32px'}}>{t.pendingApprovalsList}</h3>
      <div className="craft-list">
        {pending.length === 0 ? (
          <div className="panel">{t.noPending}</div>
        ) : (
          pending.map(p => (
            <div key={p.id} className="craft-card admin-craft-card">
              <div className="admin-craft-content">
                <img 
                  src={p.imageUrl} 
                  alt={p.name} 
                  className="admin-craft-image"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150x100?text=Craft'; }}
                />
                <div className="admin-craft-info">
                  <h3>{p.name}</h3>
                  <p>{p.craftType} • {p.location}</p>
                  <p style={{fontSize: '14px', color: 'var(--muted)'}}>
                    <strong>Artisan:</strong> {p.artisan}
                  </p>
                  <p style={{fontSize: '14px', color: 'var(--muted)'}}>
                    <strong>Price:</strong> {p.price}
                  </p>
                  <p style={{fontSize: '13px', color: 'var(--muted)', marginTop: '4px', fontStyle: 'italic'}}>
                    "{p.story}"
                  </p>
                </div>
                <div className="admin-craft-actions">
                  <button className="btn" onClick={() => approve(p.id)}>
                    ✓ {t.approve}
                  </button>
                  <button className="btn danger" onClick={() => reject(p.id)}>
                    ✗ {t.reject}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Events Management Section */}
      <h3 style={{marginBottom: '16px', fontSize: '20px', marginTop: '32px'}}>{t.eventsManagement}</h3>
      <div className="panel">
        <button 
          className="btn" 
          onClick={() => setShowEventForm(!showEventForm)}
        >
          {showEventForm ? t.cancel : `+ ${t.createEvent}`}
        </button>

        {showEventForm && (
          <form onSubmit={handleEventSubmit} className="event-form" style={{marginTop: '20px'}}>
            <div className="field">
              <label>{t.eventName}</label>
              <input
                type="text"
                className="input"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                required
              />
            </div>
            
            <div className="field">
              <label>{t.eventDescription}</label>
              <textarea
                className="input"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                required
              />
            </div>
            
            <div className="field">
              <label>{t.eventLocation}</label>
              <input
                type="text"
                className="input"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                required
              />
            </div>
            
            <div className="row" style={{gap: '12px'}}>
              <div className="field" style={{flex: 1}}>
                <label>{t.eventDate}</label>
                <input
                  type="date"
                  className="input"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                />
              </div>
              
              <div className="field" style={{flex: 1}}>
                <label>{t.eventTime}</label>
                <input
                  type="time"
                  className="input"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{marginTop: '16px', display: 'flex', gap: '8px'}}>
              <button type="submit" className="btn">{t.submit}</button>
              <button 
                type="button" 
                className="btn secondary" 
                onClick={() => setShowEventForm(false)}
              >
                {t.cancel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
