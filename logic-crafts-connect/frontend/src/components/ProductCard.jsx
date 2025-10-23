import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ craft }){
  // craft fields: id, name, craftType, price, location, imageUrl, contact
  return (
    <article className="card">
      <img className="card-img" src={craft.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'} alt={craft.name} />
      <div>
        <div className="card-title">{craft.name}</div>
        <div className="card-meta">{craft.craftType} • {craft.location}</div>
        <div style={{marginTop:8, display:'flex', gap:8}}>
          <a className="btn" href={`https://wa.me/${craft.contact}`} target="_blank" rel="noreferrer">Contact</a>
          <Link to={`/artisan/${craft.id}`} className="btn secondary">Details</Link>
        </div>
      </div>
    </article>
  );
}
