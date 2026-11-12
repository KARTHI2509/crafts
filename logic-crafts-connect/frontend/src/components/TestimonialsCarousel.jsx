import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    avatar: 'P',
    rating: 5,
    text: 'Absolutely stunning Madhubani painting! The colors are vibrant and the craftsmanship is exceptional. It now hangs proudly in my living room.',
    product: 'Madhubani Painting'
  },
  {
    id: 2,
    name: 'Rahul Verma',
    location: 'Delhi',
    avatar: 'R',
    rating: 5,
    text: 'The brass lamp I ordered exceeded my expectations. You can feel the tradition and love poured into every detail. Highly recommended!',
    product: 'Brass Diya Lamp'
  },
  {
    id: 3,
    name: 'Anita Reddy',
    location: 'Hyderabad',
    avatar: 'A',
    rating: 5,
    text: 'Found the perfect handwoven Pochampally saree here. The artisan was so helpful in guiding me through the selection. True heritage!',
    product: 'Pochampally Silk Saree'
  },
  {
    id: 4,
    name: 'Vikram Singh',
    location: 'Jaipur',
    avatar: 'V',
    rating: 4,
    text: 'Beautiful blue pottery set for my home. Each piece is unique and tells a story. Supporting local artisans feels wonderful.',
    product: 'Blue Pottery Set'
  },
  {
    id: 5,
    name: 'Meera Nair',
    location: 'Kerala',
    avatar: 'M',
    rating: 5,
    text: 'The wooden Kathakali mask is a masterpiece! Such intricate details and authentic craftsmanship. It\'s become a conversation starter.',
    product: 'Kathakali Wooden Mask'
  },
  {
    id: 6,
    name: 'Suresh Kumar',
    location: 'Chennai',
    avatar: 'S',
    rating: 5,
    text: 'Ordered handmade Tanjore paintings for my pooja room. The gold foil work is breathtaking. Delivery was prompt and secure.',
    product: 'Tanjore Painting'
  }
];

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Get visible testimonials (3 at a time on desktop)
  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      result.push(testimonials[index]);
    }
    return result;
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <span className="section-badge">💬 Customer Stories</span>
          <h2>What Our Customers Say</h2>
          <p>Real experiences from people who love handmade crafts</p>
        </div>

        <div 
          className="testimonials-carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrows */}
          <button className="carousel-arrow prev" onClick={goToPrev} aria-label="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="testimonials-track">
            {getVisibleTestimonials().map((testimonial, idx) => (
              <div 
                key={`${testimonial.id}-${idx}`}
                className={`testimonial-card ${idx === 1 ? 'center' : ''}`}
                style={{ 
                  animationDelay: `${idx * 0.1}s`,
                  opacity: idx === 1 ? 1 : 0.7,
                  transform: idx === 1 ? 'scale(1)' : 'scale(0.95)'
                }}
              >
                <div className="quote-icon">"</div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-product">🎨 {testimonial.product}</div>
                <div className="testimonial-rating">
                  {'⭐'.repeat(testimonial.rating)}
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <span className="author-name">{testimonial.name}</span>
                    <span className="author-location">📍 {testimonial.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="carousel-arrow next" onClick={goToNext} aria-label="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="carousel-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="testimonials-stats">
          <div className="stat">
            <span className="stat-number">10,000+</span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="stat">
            <span className="stat-number">4.8</span>
            <span className="stat-label">Average Rating</span>
          </div>
          <div className="stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Verified Artisans</span>
          </div>
        </div>
      </div>

      <style>{`
        .testimonials-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #fef7ed 0%, #fdf2e6 100%);
          overflow: hidden;
        }

        .testimonials-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .testimonials-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .section-badge {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(139, 90, 43, 0.1);
          color: #8b5a2b;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .testimonials-header h2 {
          font-size: 36px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 12px;
        }

        .testimonials-header p {
          font-size: 18px;
          color: #6b7280;
          margin: 0;
        }

        .testimonials-carousel {
          position: relative;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .carousel-arrow {
          position: absolute;
          z-index: 10;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: white;
          color: #8b5a2b;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .carousel-arrow:hover {
          background: #8b5a2b;
          color: white;
          transform: scale(1.1);
        }

        .carousel-arrow.prev {
          left: -24px;
        }

        .carousel-arrow.next {
          right: -24px;
        }

        .testimonials-track {
          display: flex;
          gap: 24px;
          justify-content: center;
          width: 100%;
          padding: 20px 0;
        }

        .testimonial-card {
          flex: 0 0 calc(33.333% - 16px);
          max-width: 380px;
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.4s ease;
          animation: fadeIn 0.5s ease-out;
        }

        .testimonial-card.center {
          box-shadow: 0 8px 30px rgba(139, 90, 43, 0.15);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .quote-icon {
          font-size: 48px;
          color: #d4a574;
          font-family: Georgia, serif;
          line-height: 1;
          margin-bottom: 8px;
        }

        .testimonial-text {
          font-size: 15px;
          line-height: 1.7;
          color: #374151;
          margin: 0 0 16px;
          min-height: 80px;
        }

        .testimonial-product {
          font-size: 13px;
          color: #8b5a2b;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .testimonial-rating {
          font-size: 14px;
          margin-bottom: 20px;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5a2b, #d4a574);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
        }

        .author-info {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          font-weight: 600;
          color: #1f2937;
        }

        .author-location {
          font-size: 13px;
          color: #6b7280;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 32px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: none;
          background: #d1d5db;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot.active {
          background: #8b5a2b;
          transform: scale(1.2);
        }

        .dot:hover {
          background: #d4a574;
        }

        .testimonials-stats {
          display: flex;
          justify-content: center;
          gap: 64px;
          margin-top: 48px;
          padding-top: 48px;
          border-top: 1px solid rgba(139, 90, 43, 0.2);
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 36px;
          font-weight: 700;
          color: #8b5a2b;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
        }

        @media (max-width: 1024px) {
          .testimonial-card {
            flex: 0 0 calc(50% - 12px);
          }

          .testimonial-card:nth-child(3) {
            display: none;
          }

          .carousel-arrow.prev {
            left: 0;
          }

          .carousel-arrow.next {
            right: 0;
          }
        }

        @media (max-width: 768px) {
          .testimonials-section {
            padding: 48px 0;
          }

          .testimonials-header h2 {
            font-size: 28px;
          }

          .testimonial-card {
            flex: 0 0 100%;
          }

          .testimonial-card:nth-child(2),
          .testimonial-card:nth-child(3) {
            display: none;
          }

          .carousel-arrow {
            width: 40px;
            height: 40px;
          }

          .testimonials-stats {
            flex-direction: column;
            gap: 24px;
          }

          .stat-number {
            font-size: 28px;
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsCarousel;
