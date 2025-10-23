import React, { useEffect, useState, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
// import { adminAPI } from '../utils/api';

export default function Events() {
  const { language } = useContext(LanguageContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      title: "Upcoming Events & Exhibitions",
      subtitle: "Join us at craft fairs, exhibitions, and workshops to showcase and learn",
      noEvents: "No upcoming events at the moment. Check back soon!",
      location: "Location",
      date: "Date",
      time: "Time",
      details: "Details",
      registerInterest: "Register Interest",
    },
    te: {
      title: "రాబోయే ఈవెంట్‌లు & ప్రదర్శనలు",
      subtitle: "క్రాఫ్ట్ ఫెయిర్‌లు, ప్రదర్శనలు మరియు వర్క్‌షాప్‌లలో మాతో చేరండి",
      noEvents: "ప్రస్తుతం రాబోయే ఈవెంట్‌లు లేవు. త్వరలో తనిఖీ చేయండి!",
      location: "స్థానం",
      date: "తేదీ",
      time: "సమయం",
      details: "వివరాలు",
      registerInterest: "ఆసక్తిని నమోదు చేయండి",
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    // TODO: Replace with actual API call
    // adminAPI.getEvents()
    //   .then(data => setEvents(data.events))
    //   .catch(err => console.error(err))
    //   .finally(() => setLoading(false));

    // Mock data for now
    const mockEvents = [
      {
        id: 1,
        name: 'National Handicraft Fair 2025',
        description: 'A week-long exhibition showcasing traditional handicrafts from across India. Meet artisans, learn techniques, and buy authentic handmade products.',
        location: 'Pragati Maidan, New Delhi',
        date: '2025-11-15',
        time: '10:00 AM - 8:00 PM',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop',
      },
      {
        id: 2,
        name: 'Pottery & Clay Art Workshop',
        description: 'Hands-on workshop with master potter Rajesh Kumar. Learn traditional pottery techniques and create your own piece.',
        location: 'Jaipur Art Center, Rajasthan',
        date: '2025-11-22',
        time: '2:00 PM - 5:00 PM',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=250&fit=crop',
      },
      {
        id: 3,
        name: 'Textile Artisan Meetup',
        description: 'Connect with fellow textile artists, share experiences, and explore collaboration opportunities.',
        location: 'Bangalore Craft Village',
        date: '2025-12-05',
        time: '11:00 AM - 4:00 PM',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
      },
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">{t.title}</h1>
          <p className="page-subtitle">{t.subtitle}</p>
        </div>

        {events.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ color: 'var(--muted)', fontSize: '18px' }}>{t.noEvents}</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <img 
                  className="event-image" 
                  src={event.image} 
                  alt={event.name}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x250?text=Event'; }}
                />
                <div className="event-content">
                  <h3 className="event-title">{event.name}</h3>
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-meta">
                    <div className="event-meta-item">
                      <span className="meta-icon">📍</span>
                      <div>
                        <strong>{t.location}:</strong> {event.location}
                      </div>
                    </div>
                    <div className="event-meta-item">
                      <span className="meta-icon">📅</span>
                      <div>
                        <strong>{t.date}:</strong> {new Date(event.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="event-meta-item">
                      <span className="meta-icon">🕐</span>
                      <div>
                        <strong>{t.time}:</strong> {event.time}
                      </div>
                    </div>
                  </div>

                  <button className="btn" style={{ marginTop: '16px', width: '100%' }}>
                    {t.registerInterest}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
