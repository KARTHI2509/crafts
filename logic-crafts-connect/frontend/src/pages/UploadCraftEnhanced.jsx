import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";

export default function UploadCraftEnhanced() {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    craft_type: "",
    category: "",
    price: "",
    location: "",
    contact: "",
    stock: "",
    delivery_days: "7",
    is_featured: false,
    is_new_arrival: true,
    made_to_order: false,
    limited_edition: false,
  });
  
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const content = {
    en: {
      title: "Upload Your Craft",
      subtitle: "Share your handmade creation with buyers around the world",
      basicInfo: "Basic Information",
      craftName: "Craft Name",
      description: "Description",
      category: "Category",
      craftType: "Craft Type",
      pricing: "Pricing & Inventory",
      price: "Price (₹)",
      stock: "Available Stock",
      stockHint: "Enter 0 if made to order",
      deliveryDays: "Estimated Delivery Days",
      location: "Location",
      contact: "Contact Number",
      productDetails: "Product Details",
      madeToOrder: "Made to Order",
      limitedEdition: "Limited Edition",
      featured: "Mark as Featured",
      newArrival: "Mark as New Arrival",
      images: "Product Images",
      imagesHint: "Upload up to 5 images (first image will be the main display)",
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
      errorMsg: "Failed to upload craft. Please try again.",
      validationError: "Please fill all required fields",
    },
    te: {
      title: "మీ హస్తకళను అప్‌లోడ్ చేయండి",
      subtitle: "ప్రపంచవ్యాప్తంగా ఉన్న కొనుగోలుదారులతో మీ చేతితో తయారు చేసిన సృష్టిని పంచుకోండి",
      basicInfo: "ప్రాథమిక సమాచారం",
      craftName: "హస్తకళ పేరు",
      description: "వివరణ",
      category: "వర్గం",
      craftType: "హస్తకళ రకం",
      pricing: "ధర & జాబితా",
      price: "ధర (₹)",
      stock: "అందుబాటులో ఉన్న స్టాక్",
      stockHint: "ఆర్డర్‌పై తయారీ అయితే 0 నమోదు చేయండి",
      deliveryDays: "అంచనా డెలివరీ రోజులు",
      location: "స్థానం",
      contact: "సంప్రదింపు నంబర్",
      productDetails: "ఉత్పత్తి వివరాలు",
      madeToOrder: "ఆర్డర్‌పై తయారు చేయబడింది",
      limitedEdition: "పరిమిత సంచిక",
      featured: "ఫీచర్డ్‌గా గుర్తించండి",
      newArrival: "కొత్త రాకగా గుర్తించండి",
      images: "ఉత్పత్తి చిత్రాలు",
      imagesHint: "5 చిత్రాల వరకు అప్‌లోడ్ చేయండి (మొదటి చిత్రం ప్రధాన ప్రదర్శన అవుతుంది)",
      uploadBtn: "హస్తకళను అప్‌లోడ్ చేయండి",
      cancel: "రద్దు చేయి",
      uploading: "అప్‌లోడ్ చేస్తోంది...",
      successMsg: "హస్తకళ విజయవంతంగా అప్‌లోడ్ చేయబడింది!",
      errorMsg: "హస్తకళ అప్‌లోడ్ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
      validationError: "దయచేసి అన్ని అవసరమైన ఫీల్డ్‌లను పూరించండి",
    },
  };

  const t = content[language] || content.en;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      alert("You can upload maximum 5 images");
      return;
    }

    setImages([...images, ...files]);

    // Create previews
    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.description || !form.price || images.length === 0) {
      alert(t.validationError);
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      
      // For now, we'll use base64 images in the array
      // In production, you would upload to cloud storage and get URLs
      const imageUrls = imagePreviews;

      const craftData = {
        name: form.name,
        description: form.description,
        craft_type: form.craft_type || form.category,
        category: form.category,
        price: parseFloat(form.price),
        location: form.location || user?.location,
        contact: form.contact || user?.phone,
        image_url: imageUrls[0], // Main image
        images: imageUrls, // All images
        stock: parseInt(form.stock) || 0,
        delivery_days: parseInt(form.delivery_days) || 7,
        is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival,
        made_to_order: form.made_to_order,
        limited_edition: form.limited_edition,
      };

      const response = await axios.post(
        "http://localhost:5000/api/crafts",
        craftData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        alert(t.successMsg);
        navigate("/artisan/crafts");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(t.errorMsg);
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
          {/* Basic Information */}
          <div className="form-section">
            <h3>{t.basicInfo}</h3>
            
            <div className="field">
              <label>{t.craftName} *</label>
              <input
                type="text"
                className="input"
                name="name"
                value={form.name}
                placeholder="Handmade Terracotta Pot"
                onChange={handleChange}
                required
              />
            </div>

            <div className="row" style={{ gap: "12px" }}>
              <div className="field" style={{ flex: 1 }}>
                <label>{t.category} *</label>
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

              <div className="field" style={{ flex: 1 }}>
                <label>{t.craftType}</label>
                <input
                  type="text"
                  className="input"
                  name="craft_type"
                  value={form.craft_type}
                  placeholder="Decorative Pottery"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label>{t.description} *</label>
              <textarea
                className="input"
                name="description"
                value={form.description}
                placeholder="Tell buyers about your craft..."
                onChange={handleChange}
                required
                style={{ minHeight: "100px" }}
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="form-section">
            <h3>{t.pricing}</h3>
            
            <div className="row" style={{ gap: "12px" }}>
              <div className="field" style={{ flex: 1 }}>
                <label>{t.price} *</label>
                <input
                  type="number"
                  className="input"
                  name="price"
                  value={form.price}
                  placeholder="500"
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="field" style={{ flex: 1 }}>
                <label>{t.stock}</label>
                <input
                  type="number"
                  className="input"
                  name="stock"
                  value={form.stock}
                  placeholder="10"
                  onChange={handleChange}
                  min="0"
                />
                <small style={{ color: "#666", fontSize: "12px" }}>
                  {t.stockHint}
                </small>
              </div>

              <div className="field" style={{ flex: 1 }}>
                <label>{t.deliveryDays}</label>
                <input
                  type="number"
                  className="input"
                  name="delivery_days"
                  value={form.delivery_days}
                  placeholder="7"
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </div>

            <div className="row" style={{ gap: "12px" }}>
              <div className="field" style={{ flex: 1 }}>
                <label>{t.location}</label>
                <input
                  type="text"
                  className="input"
                  name="location"
                  value={form.location}
                  placeholder={user?.location || "Jaipur, Rajasthan"}
                  onChange={handleChange}
                />
              </div>

              <div className="field" style={{ flex: 1 }}>
                <label>{t.contact}</label>
                <input
                  type="text"
                  className="input"
                  name="contact"
                  value={form.contact}
                  placeholder={user?.phone || "9876543210"}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="form-section">
            <h3>{t.productDetails}</h3>
            
            <div className="checkbox-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="made_to_order"
                  checked={form.made_to_order}
                  onChange={handleChange}
                />
                <span>{t.madeToOrder}</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="limited_edition"
                  checked={form.limited_edition}
                  onChange={handleChange}
                />
                <span>{t.limitedEdition}</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={form.is_featured}
                  onChange={handleChange}
                />
                <span>{t.featured}</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_new_arrival"
                  checked={form.is_new_arrival}
                  onChange={handleChange}
                />
                <span>{t.newArrival}</span>
              </label>
            </div>
          </div>

          {/* Product Images */}
          <div className="form-section">
            <h3>{t.images} *</h3>
            <small style={{ color: "#666", display: "block", marginBottom: "12px" }}>
              {t.imagesHint}
            </small>
            
            <input
              type="file"
              className="input"
              name="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={images.length >= 5}
            />

            {imagePreviews.length > 0 && (
              <div className="image-preview-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "12px",
                marginTop: "16px",
              }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        boxShadow: "var(--shadow)",
                      }}
                    />
                    {index === 0 && (
                      <span style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        background: "#8b5a2b",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}>
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(255, 0, 0, 0.8)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        cursor: "pointer",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="actions" style={{ marginTop: "24px" }}>
            <button type="submit" className="btn" disabled={uploading}>
              {uploading ? t.uploading : t.uploadBtn}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate("/dashboard")}
              disabled={uploading}
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .form-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: var(--shadow);
          margin-bottom: 20px;
        }

        .form-section h3 {
          color: var(--primary);
          margin-bottom: 16px;
          font-size: 18px;
          border-bottom: 2px solid var(--secondary);
          padding-bottom: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .checkbox-label:hover {
          background: #f5f5f5;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .checkbox-label span {
          font-size: 14px;
          color: #333;
        }
      `}</style>
    </div>
  );
}
