import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import "./UploadCraftEnhanced.css";

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
  const [error, setError] = useState("");

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
      imagesHint: "Upload up to 5 images",
      selectCategory: "Select category",
      uploadBtn: "Upload Craft",
      cancel: "Cancel",
      uploading: "Uploading...",
      successMsg: "Craft uploaded successfully!",
      errorMsg: "Failed to upload craft",
      validationError: "Please fill all required fields",
    },
  };

  const t = content[language] || content.en;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    const validFiles = [];
    const previews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not a valid image`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB`);
        return;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    });

    setImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (
      !form.name ||
      !form.description ||
      !form.category ||
      !form.price ||
      images.length === 0
    ) {
      return t.validationError;
    }

    if (parseFloat(form.price) <= 0) {
      return "Price must be greater than 0";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm();

    if (validation) {
      setError(validation);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await axios.post(
        "http://localhost:5000/api/crafts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert(t.successMsg);
        navigate("/artisan/crafts");
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || t.errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container upload-craft">
      <h2>{t.title}</h2>
      <p>{t.subtitle}</p>

      {error && <div className="error-box">{error}</div>}

      <div className="form">
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="form-section">
            <h3>{t.basicInfo}</h3>

            <div className="field">
              <label>{t.craftName} *</label>
              <input
                type="text"
                className="input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row">
              <div className="field flex">
                <label>{t.category} *</label>
                <select
                  className="input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t.selectCategory}</option>
                  <option value="Pottery">Pottery</option>
                  <option value="Woodwork">Woodwork</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Metalwork">Metalwork</option>
                  <option value="Basketry">Basketry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field flex">
                <label>{t.craftType}</label>
                <input
                  type="text"
                  className="input"
                  name="craft_type"
                  value={form.craft_type}
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
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="form-section">
            <h3>{t.pricing}</h3>

            <div className="row">
              <div className="field flex">
                <label>{t.price}</label>
                <input
                  type="number"
                  className="input"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div className="field flex">
                <label>{t.stock}</label>
                <input
                  type="number"
                  className="input"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>

              <div className="field flex">
                <label>{t.deliveryDays}</label>
                <input
                  type="number"
                  className="input"
                  name="delivery_days"
                  value={form.delivery_days}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="form-section">
            <h3>{t.productDetails}</h3>

            <div className="checkbox-grid">
              {[
                ["made_to_order", t.madeToOrder],
                ["limited_edition", t.limitedEdition],
                ["is_featured", t.featured],
                ["is_new_arrival", t.newArrival],
              ].map(([name, label]) => (
                <label key={name} className="checkbox-label">
                  <input
                    type="checkbox"
                    name={name}
                    checked={form[name]}
                    onChange={handleChange}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <h3>{t.images}</h3>

            <input
              type="file"
              className="input"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />

            {imagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="preview-card">
                    <img src={preview} alt={`Preview ${index}`} />

                    {index === 0 && <span className="main-badge">Main</span>}

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="actions">
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
    </div>
  );
}