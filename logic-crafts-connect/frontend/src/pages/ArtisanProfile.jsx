import React from 'react';
import { useParams } from 'react-router-dom';

export default function ArtisanProfile(){
  const { id } = useParams();
  
  // Mock artisan data - replace with API call
  const artisan = {
    id: id,
    name: 'Rajesh Kumar',
    location: 'Jaipur, Rajasthan',
    craftType: 'Pottery & Clay Art',
    experience: '15 years',
    bio: 'Master craftsman specializing in traditional pottery and clay sculptures. My family has been practicing this art for three generations.',
    contact: '+91 9876543210',
    email: 'rajesh.pottery@example.com',
    crafts: [
      { id: 1, name: 'Clay Lamp', price: '₹250', image: 'https://via.placeholder.com/300x200?text=Clay+Lamp' },
      { id: 2, name: 'Decorative Pot', price: '₹800', image: 'https://via.placeholder.com/300x200?text=Decorative+Pot' },
      { id: 3, name: 'Terracotta Vase', price: '₹650', image: 'https://via.placeholder.com/300x200?text=Vase' },
    ]
  };
  
  return (
    <div className="container artisan-profile">
      {/* Profile Header */}
      <div className="profile-header">
        <h2>{artisan.name}</h2>
        <p>{artisan.craftType} • {artisan.location}</p>
        <p>{artisan.experience} of experience</p>
      </div>

      {/* About Section */}
      <div className="profile-section">
        <h3>About</h3>
        <p style={{color: 'var(--muted)', lineHeight: '1.6'}}>{artisan.bio}</p>
      </div>

      {/* Contact Section */}
      <div className="profile-section">
        <h3>Contact Information</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <p><strong>Phone:</strong> {artisan.contact}</p>
          <p><strong>Email:</strong> {artisan.email}</p>
          <p><strong>Location:</strong> {artisan.location}</p>
        </div>
      </div>

      {/* Crafts Section */}
      <div className="profile-section">
        <h3>Products</h3>
        <div className="grid">
          {artisan.crafts.map(craft => (
            <div key={craft.id} className="card">
              <img className="card-img" src={craft.image} alt={craft.name} />
              <div className="card-title">{craft.name}</div>
              <div className="card-meta">{craft.price}</div>
              <button className="btn" style={{marginTop: '8px', width: '100%'}}>Contact</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
