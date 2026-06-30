import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { craftAPI } from "../services/api";
import "./UploadCraft.css";

export default function UploadCraft() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    location: "",
    story: "",
    image: null,
    stock: 1,
    delivery_days: 7,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const content = {
    en: {
      title: "Upload Your Craft",
      uploadBtn: "Upload Craft",
      uploading: "Uploading...",
      cancel: "Cancel",
      invalidImage: "Only JPG, PNG, WEBP allowed",
      fileLarge: "Image size must be less than 5MB",
    },
    te: {
      title: "మీ హస్తకళను అప్‌లోడ్ చేయండి",
      uploadBtn: "అప్‌లోడ్ చేయండి",
      uploading: "అప్‌లోడ్ చేస్తోంది...",
      cancel: "రద్దు చేయి",
      invalidImage: "JPG, PNG, WEBP మాత్రమే అనుమతించబడతాయి",
      fileLarge: "చిత్ర పరిమాణం 5MB కంటే తక్కువ ఉండాలి",
    },
  };

  const t = content[language] || content.en;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        setError(t.invalidImage);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(t.fileLarge);
        return;
      }

      setError("");
      setForm((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!form.title.trim()) return "Title required";
    if (!form.description.trim()) return "Description required";
    if (!form.category) return "Category required";
    if (!form.price || Number(form.price) <= 0) return "Valid price required";
    if (!form.location.trim()) return "Location required";
    if (!form.image) return "Image required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("name", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("craft_type", form.category);
      formData.append("price", form.price);
      formData.append("location", form.location);
      formData.append("story", form.story);
      formData.append("stock", form.stock);
      formData.append("delivery_days", form.delivery_days);
      formData.append("image", form.image);

      await craftAPI.create(formData);

      alert("Craft uploaded successfully!");

      setForm({
        title: "",
        description: "",
        category: "",
        price: "",
        location: "",
        story: "",
        image: null,
        stock: 1,
        delivery_days: 7,
      });

      setImagePreview(null);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to upload craft");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container upload-craft">
      <h2>{t.title}</h2>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="title"
          placeholder="Craft Title"
          value={form.title}
          onChange={handleChange}
          className="input"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="input"
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="input"
        >
          <option value="">Select Category</option>
          <option value="Pottery">Pottery</option>
          <option value="Woodwork">Woodwork</option>
          <option value="Textiles">Textiles</option>
          <option value="Jewelry">Jewelry</option>
        </select>

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="input"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="input"
        />

        <textarea
          name="story"
          placeholder="Story"
          value={form.story}
          onChange={handleChange}
          className="input"
        />

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="input"
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="craft-preview"
          />
        )}

        <div className="actions">
          <button type="submit" className="btn" disabled={uploading}>
            {uploading ? t.uploading : t.uploadBtn}
          </button>

          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate("/dashboard")}
          >
            {t.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}