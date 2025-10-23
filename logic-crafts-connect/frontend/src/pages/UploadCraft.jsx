import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import axios from 'axios';

export default function UploadCraft() {
  const { language } = useContext(LanguageContext);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    location: "",
    story: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const content = {
    en: {
      title: "Upload Your Craft",
      subtitle: "Share your handmade creation with buyers around the world",
      craftTitle: "Craft Title",
      description: "Description",
      category: "Category",
      price: "Price (₹)",
      location: "Location",
      yourStory: "Your Story",
      storyPlaceholder: "Tell us about this craft - your inspiration, techniques, heritage, or any special meaning behind it...",
      image: "Upload Image",
      selectCategory: "Select category",
      pottery: "Pottery",
      woodwork: "Woodwork",
      textiles: "Textiles",
      jewelry: "Jewelry",
      metalwork: "Metalwork",
      basketry: "Basketry",
      other: "Other",
      uploadBtn: "Upload Craft",
      cancel: "Cancel",
      uploading: "Uploading...",
      successMsg: "Craft uploaded successfully! It will be visible after admin approval.",
    },
    te: {
      title: "మీ హస్తకళను అప్‌లోడ్ చేయండి",
      subtitle: "ప్రపంచవ్యాప్తంగా ఉన్న కొనుగోలుదారులతో మీ చేతితో తయారు చేసిన సృష్టిని పంచుకోండి",
      craftTitle: "హస్తకళ శీర్షిక",
      description: "వివరణ",
      category: "వర్గం",
      price: "ధర (₹)",
      location: "స్థానం",
      yourStory: "మీ కథ",
      storyPlaceholder: "ఈ హస్తకళ గురించి మాకు చెప్పండి - మీ ప్రేరణ, సాంకేతికతలు, వారసత్వం లేదా దాని వెనుక ఏదైనా ప్రత్యేక అర్థం...",
      image: "చిత్రాన్ని అప్‌లోడ్ చేయండి",
      selectCategory: "వర్గాన్ని ఎంచుకోండి",
      pottery: "కుండల పని",
      woodwork: "కలప పని",
      textiles: "వస్త్రాలు",
      jewelry: "ఆభరణాలు",
      metalwork: "లోహ పని",
      basketry: "బుట్టల పని",
      other: "ఇతరం",
      uploadBtn: "హస్తకళను అప్‌లోడ్ చేయండి",
      cancel: "రద్దు చేయి",
      uploading: "అప్‌లోడ్ చేస్తోంది...",
      successMsg: "హస్తకళ విజయవంతంగా అప్‌లోడ్ చేయబడింది! అడ్మిన్ ఆమోదం తర్వాత ఇది కనిపిస్తుంది.",
    },
  };

  const t = content[language] || content.en;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setForm({ ...form, image: file });
      
      // Create image preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to upload crafts');
        navigate('/login');
        return;
      }

      // Prepare craft data
      const craftData = {
        name: form.title,
        description: form.description,
        category: form.category,
        craft_type: form.category,
        price: parseFloat(form.price),
        location: form.location,
        image_url: imagePreview || 'https://via.placeholder.com/400x300?text=Craft+Image',
        images: imagePreview ? [imagePreview] : [],
        story: form.story,
        stock: 1,
        delivery_days: 7,
        is_new_arrival: true,
        visibility: 'public', // Default visibility
        status: 'approved' // Default status for immediate visibility
      };

      // Make API call to create craft
      const response = await axios.post(
        'http://localhost:5000/api/crafts',
        craftData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Craft Submitted", response.data);
      alert('Craft uploaded successfully! It is now visible to all buyers.');
      navigate("/dashboard");
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Failed to upload craft. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container upload-craft">
      <h2>{t.title}</h2>
      <p>{t.subtitle}</p>
      <div className="form">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="field">
            <label>{t.craftTitle}</label>
            <input
              type="text"
              className="input"
              name="title"
              value={form.title}
              placeholder={t.craftTitle}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category */}
          <div className="field">
            <label>{t.category}</label>
            <select
              className="input"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">{t.selectCategory}</option>
              <option value="Pottery">{t.pottery}</option>
              <option value="Woodwork">{t.woodwork}</option>
              <option value="Textiles">{t.textiles}</option>
              <option value="Jewelry">{t.jewelry}</option>
              <option value="Metalwork">{t.metalwork}</option>
              <option value="Basketry">{t.basketry}</option>
              <option value="Other">{t.other}</option>
            </select>
          </div>

          {/* Price and Location */}
          <div className="row" style={{gap: '12px', alignItems: 'flex-start'}}>
            <div className="field" style={{flex: 1}}>
              <label>{t.price}</label>
              <input
                type="number"
                className="input"
                name="price"
                value={form.price}
                placeholder="500"
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="field" style={{flex: 1}}>
              <label>{t.location}</label>
              <input
                type="text"
                className="input"
                name="location"
                value={form.location}
                placeholder="Jaipur, Rajasthan"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="field">
            <label>{t.description}</label>
            <textarea
              className="input"
              name="description"
              value={form.description}
              placeholder={t.description}
              onChange={handleChange}
              required
              style={{minHeight: '80px'}}
            />
          </div>

          {/* Your Story */}
          <div className="field">
            <label>{t.yourStory}</label>
            <textarea
              className="input"
              name="story"
              value={form.story}
              placeholder={t.storyPlaceholder}
              onChange={handleChange}
              style={{minHeight: '100px'}}
            />
          </div>

          {/* Image Upload */}
          <div className="field">
            <label>{t.image}</label>
            <input
              type="file"
              className="input"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
            />
            {imagePreview && (
              <div style={{marginTop: '12px'}}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{
                    maxWidth: '300px', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow)',
                  }} 
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="actions">
            <button type="submit" className="btn" disabled={uploading}>
              {uploading ? t.uploading : t.uploadBtn}
            </button>
            <button 
              type="button" 
              className="btn secondary" 
              onClick={() => navigate('/dashboard')}
              disabled={uploading}
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
