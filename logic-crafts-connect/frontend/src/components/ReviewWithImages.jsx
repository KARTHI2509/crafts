import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './ReviewWithImages.css';

const ReviewWithImages = ({ onSubmit, craftId, existingReview = null, loading = false }) => {
  const langContext = useLanguage();
  const language = langContext?.language || 'en';
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState(existingReview?.images || []);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const texts = {
    en: {
      title: existingReview ? 'Edit Your Review' : 'Write a Review',
      ratingLabel: 'Your Rating',
      commentLabel: 'Your Review',
      commentPlaceholder: 'Share your experience with this product...',
      addPhotos: 'Add Photos',
      maxPhotos: 'Max 5 photos (JPG, PNG)',
      removePhoto: 'Remove',
      submit: existingReview ? 'Update Review' : 'Submit Review',
      submitting: 'Submitting...',
      ratingRequired: 'Please select a rating',
      uploadError: 'Error uploading image',
      maxPhotosReached: 'Maximum 5 photos allowed'
    },
    ta: {
      title: existingReview ? 'உங்கள் மதிப்பாய்வை திருத்துங்கள்' : 'மதிப்பாய்வு எழுதுங்கள்',
      ratingLabel: 'உங்கள் மதிப்பீடு',
      commentLabel: 'உங்கள் மதிப்பாய்வு',
      commentPlaceholder: 'இந்த தயாரிப்பு குறித்த உங்கள் அனுபவத்தைப் பகிருங்கள்...',
      addPhotos: 'புகைப்படங்களைச் சேர்',
      maxPhotos: 'அதிகபட்சம் 5 புகைப்படங்கள் (JPG, PNG)',
      removePhoto: 'நீக்கு',
      submit: existingReview ? 'மதிப்பாய்வை புதுப்பி' : 'மதிப்பாய்வை சமர்ப்பி',
      submitting: 'சமர்ப்பிக்கிறது...',
      ratingRequired: 'மதிப்பீடு தேர்ந்தெடுக்கவும்',
      uploadError: 'படத்தை பதிவேற்றுவதில் பிழை',
      maxPhotosReached: 'அதிகபட்சம் 5 புகைப்படங்கள் அனுமதிக்கப்படும்'
    }
  };

  const t = texts[language] || texts.en;

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      alert(t.maxPhotosReached);
      return;
    }

    setUploading(true);

    try {
      const newPreviews = [];
      const newImages = [];

      for (const file of files) {
        // Create preview
        const reader = new FileReader();
        const previewUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        
        newPreviews.push({
          id: Date.now() + Math.random(),
          url: previewUrl,
          file: file
        });

        // For demo, we'll use the preview URL
        // In production, upload to Cloudinary or similar
        newImages.push(previewUrl);
      }

      setPreviewImages(prev => [...prev, ...newPreviews]);
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Error processing images:', error);
      alert(t.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert(t.ratingRequired);
      return;
    }

    onSubmit({
      rating,
      comment,
      images,
      craftId
    });
  };

  return (
    <div className="review-with-images">
      <h3 className="review-form-title">{t.title}</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="review-rating-section">
          <label>{t.ratingLabel}</label>
          <div className="star-rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <svg viewBox="0 0 24 24" fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="review-comment-section">
          <label>{t.commentLabel}</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.commentPlaceholder}
            rows={4}
          />
        </div>

        {/* Image Upload */}
        <div className="review-images-section">
          <div className="images-header">
            <button
              type="button"
              className="add-photos-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 5 || uploading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {t.addPhotos}
            </button>
            <span className="photos-hint">{t.maxPhotos}</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          {/* Image Previews */}
          {(previewImages.length > 0 || images.length > 0) && (
            <div className="image-previews">
              {(previewImages.length > 0 ? previewImages : images.map((url, i) => ({ id: i, url }))).map((img, index) => (
                <div key={img.id} className="image-preview-item">
                  <img src={img.url} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {uploading && (
                <div className="image-preview-item uploading">
                  <div className="upload-spinner"></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-review-btn"
          disabled={loading || uploading}
        >
          {loading ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
};

// Review Display Component with Images
export const ReviewDisplay = ({ review }) => {
  const [lightboxImage, setLightboxImage] = useState(null);

  return (
    <div className="review-display">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.user?.name?.charAt(0) || 'U'}
          </div>
          <div className="reviewer-details">
            <span className="reviewer-name">{review.user?.name || 'Anonymous'}</span>
            <span className="review-date">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="review-rating-display">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              viewBox="0 0 24 24"
              fill={star <= review.rating ? '#f59e0b' : 'none'}
              stroke="#f59e0b"
              strokeWidth="2"
              className="star-icon"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
      </div>

      {review.comment && (
        <p className="review-comment">{review.comment}</p>
      )}

      {review.images && review.images.length > 0 && (
        <div className="review-images-gallery">
          {review.images.map((img, index) => (
            <div
              key={index}
              className="review-image-thumb"
              onClick={() => setLightboxImage(img)}
            >
              <img src={img} alt={`Review image ${index + 1}`} />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div className="review-lightbox" onClick={() => setLightboxImage(null)}>
          <button className="lightbox-close">×</button>
          <img src={lightboxImage} alt="Review" />
        </div>
      )}
    </div>
  );
};

export default ReviewWithImages;
