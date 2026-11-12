import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI, uploadAPI, artisanAPI, craftAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import "./ArtisanProfileEdit.css";

export default function ArtisanProfileEdit() {
  const { user, setUser } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
    profileImage: "",
  });
  const [stats, setStats] = useState(null);
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const content = {
    en: {
      title: "My Profile",
      subtitle: "Manage your artisan profile and settings",
      tabs: {
        profile: "Profile",
        password: "Password",
        stats: "Statistics",
      },
      profileSection: {
        photo: "Profile Photo",
        changePhoto: "Change Photo",
        name: "Full Name",
        email: "Email",
        phone: "Phone Number",
        location: "Location/City",
        bio: "About Me",
        bioPlaceholder: "Tell buyers about yourself, your craft, and your experience...",
        website: "Website/Social Media",
        websitePlaceholder: "https://yourwebsite.com",
        save: "Save Changes",
        saving: "Saving...",
      },
      passwordSection: {
        current: "Current Password",
        new: "New Password",
        confirm: "Confirm New Password",
        change: "Change Password",
        changing: "Changing...",
        minLength: "Password must be at least 8 characters",
        mismatch: "Passwords do not match",
      },
      statsSection: {
        totalCrafts: "Total Crafts",
        totalViews: "Total Views",
        totalSaves: "Total Saves",
        totalOrders: "Total Orders",
        avgRating: "Average Rating",
        memberSince: "Member Since",
      },
      messages: {
        profileUpdated: "Profile updated successfully!",
        passwordChanged: "Password changed successfully!",
        uploadSuccess: "Photo uploaded successfully!",
        error: "Something went wrong. Please try again.",
      },
    },
    te: {
      title: "నా ప్రొఫైల్",
      subtitle: "మీ ఆర్టిసన్ ప్రొఫైల్ మరియు సెట్టింగ్‌లను నిర్వహించండి",
      tabs: {
        profile: "ప్రొఫైల్",
        password: "పాస్‌వర్డ్",
        stats: "గణాంకాలు",
      },
      profileSection: {
        photo: "ప్రొఫైల్ ఫోటో",
        changePhoto: "ఫోటో మార్చు",
        name: "పూర్తి పేరు",
        email: "ఇమెయిల్",
        phone: "ఫోన్ నంబర్",
        location: "ప్రదేశం/నగరం",
        bio: "నా గురించి",
        bioPlaceholder: "మీ గురించి, మీ క్రాఫ్ట్ మరియు మీ అనుభవం గురించి కొనుగోలుదారులకు చెప్పండి...",
        website: "వెబ్‌సైట్/సోషల్ మీడియా",
        websitePlaceholder: "https://yourwebsite.com",
        save: "మార్పులను సేవ్ చేయండి",
        saving: "సేవ్ చేస్తోంది...",
      },
      passwordSection: {
        current: "ప్రస్తుత పాస్‌వర్డ్",
        new: "కొత్త పాస్‌వర్డ్",
        confirm: "కొత్త పాస్‌వర్డ్‌ను నిర్ధారించండి",
        change: "పాస్‌వర్డ్ మార్చండి",
        changing: "మారుస్తోంది...",
      },
      statsSection: {
        totalCrafts: "మొత్తం క్రాఫ్ట్‌లు",
        totalViews: "మొత్తం వీక్షణలు",
        totalSaves: "మొత్తం సేవ్‌లు",
        totalOrders: "మొత్తం ఆర్డర్లు",
        avgRating: "సగటు రేటింగ్",
        memberSince: "సభ్యుడు అయిన తేదీ",
      },
      messages: {
        profileUpdated: "ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది!",
        passwordChanged: "పాస్‌వర్డ్ విజయవంతంగా మార్చబడింది!",
        uploadSuccess: "ఫోటో విజయవంతంగా అప్‌లోడ్ చేయబడింది!",
        error: "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
      },
    },
  };

  const t = content[language] || content.en;

  useEffect(() => {
    if (!user || user.role !== "artisan") {
      navigate("/login");
      return;
    }
    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Fetch profile, stats and crafts in parallel
      const [profileRes, statsRes, craftsRes] = await Promise.all([
        userAPI.getProfile(),
        artisanAPI.getStats().catch(() => ({ data: { stats: null } })),
        artisanAPI.getMyCrafts().catch(() => ({ data: { crafts: [] } })),
      ]);

      if (profileRes?.data?.data?.user) {
        const userData = profileRes.data.data.user;
        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          location: userData.location || "",
          bio: userData.bio || "",
          website: userData.website || "",
          profileImage: userData.profile_image || userData.profileImage || "",
        });
      }

      if (statsRes?.data?.stats) {
        setStats(statsRes.data.stats);
      }

      if (craftsRes?.data?.crafts) {
        setCrafts(craftsRes.data.crafts);
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      setMessage({ type: "error", text: t.messages.error });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be less than 5MB" });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await uploadAPI.profileImage(formData);

      if (response?.data?.url) {
        setProfile((prev) => ({ ...prev, profileImage: response.data.url }));
        setMessage({ type: "success", text: t.messages.uploadSuccess });

        // Update profile with new image
        await userAPI.updateProfile({ profileImage: response.data.url });

        // Update context
        if (setUser) {
          setUser((prev) => ({ ...prev, profile_image: response.data.url }));
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ type: "error", text: t.messages.error });
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const updateData = {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        website: profile.website,
      };

      const response = await userAPI.updateProfile(updateData);

      if (response?.data?.success) {
        setMessage({ type: "success", text: t.messages.profileUpdated });

        // Update context
        if (setUser && response.data?.data?.user) {
          setUser((prev) => ({ ...prev, ...response.data.data.user }));
        }
      }
    } catch (error) {
      console.error("Save profile error:", error);
      setMessage({ type: "error", text: error.message || t.messages.error });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: "error", text: t.passwordSection.minLength });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: t.passwordSection.mismatch });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage({ type: "success", text: t.messages.passwordChanged });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Change password error:", error);
      setMessage({ type: "error", text: error.message || t.messages.error });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(language === "te" ? "te-IN" : "en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="artisan-profile-edit loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="artisan-profile-edit">
      <div className="profile-header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          👤 {t.tabs.profile}
        </button>
        <button
          className={`tab ${activeTab === "password" ? "active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          🔒 {t.tabs.password}
        </button>
        <button
          className={`tab ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          📊 {t.tabs.stats}
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === "success" ? "✓" : "⚠"} {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSave} className="profile-form">
          {/* Profile Photo */}
          <div className="photo-section">
            <label>{t.profileSection.photo}</label>
            <div className="photo-container">
              <div className="photo-preview" onClick={handlePhotoClick}>
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" />
                ) : (
                  <div className="photo-placeholder">
                    {profile.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                )}
                {uploading && <div className="upload-overlay">Uploading...</div>}
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePhotoClick}
                disabled={uploading}
              >
                📷 {t.profileSection.changePhoto}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">{t.profileSection.name}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t.profileSection.email}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                disabled
                className="disabled"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t.profileSection.phone}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">{t.profileSection.location}</label>
              <input
                type="text"
                id="location"
                name="location"
                value={profile.location}
                onChange={handleInputChange}
                placeholder="City, State"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="bio">{t.profileSection.bio}</label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder={t.profileSection.bioPlaceholder}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="website">{t.profileSection.website}</label>
              <input
                type="url"
                id="website"
                name="website"
                value={profile.website}
                onChange={handleInputChange}
                placeholder={t.profileSection.websitePlaceholder}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? t.profileSection.saving : t.profileSection.save}
          </button>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">{t.passwordSection.current}</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">{t.passwordSection.new}</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t.passwordSection.confirm}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? t.passwordSection.changing : t.passwordSection.change}
          </button>
        </form>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎨</div>
              <div className="stat-value">{stats?.total_crafts || crafts.length || 0}</div>
              <div className="stat-label">{t.statsSection.totalCrafts}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👁️</div>
              <div className="stat-value">{stats?.total_views || 0}</div>
              <div className="stat-label">{t.statsSection.totalViews}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💾</div>
              <div className="stat-value">{stats?.total_saves || 0}</div>
              <div className="stat-label">{t.statsSection.totalSaves}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-value">{stats?.total_orders || 0}</div>
              <div className="stat-label">{t.statsSection.totalOrders}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{stats?.avg_rating?.toFixed(1) || "N/A"}</div>
              <div className="stat-label">{t.statsSection.avgRating}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">
                {user?.created_at ? formatDate(user.created_at) : "N/A"}
              </div>
              <div className="stat-label">{t.statsSection.memberSince}</div>
            </div>
          </div>

          {/* Recent Crafts Preview */}
          {crafts.length > 0 && (
            <div className="recent-crafts">
              <h3>Your Recent Crafts</h3>
              <div className="crafts-preview">
                {crafts.slice(0, 4).map((craft) => (
                  <div key={craft.id} className="craft-preview-card">
                    <img
                      src={craft.images?.[0] || craft.image_url || "/placeholder.jpg"}
                      alt={craft.name}
                    />
                    <div className="craft-info">
                      <h4>{craft.name}</h4>
                      <p>₹{craft.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="btn-secondary"
                onClick={() => navigate("/artisan/crafts")}
              >
                View All Crafts →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
