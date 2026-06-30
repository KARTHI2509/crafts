import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import axios from "axios";
import SEO from "../components/SEO";
import "./Auth.css";

export default function Reset() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const content = {
    en: {
      title: "Reset Password",
      email: "Email Address",
      password: "New Password",
      confirmPassword: "Confirm New Password",
      resetBtn: "Reset Password",
      successMsg: "Password updated successfully! Redirecting to login...",
      backToLogin: "Back to Login",
      matchError: "Passwords do not match",
      invalidEmail: "Please provide a valid email",
      genericError: "Failed to reset password. Please check your credentials."
    },
    te: {
      title: "పాస్‌వర్డ్ రీసెట్",
      email: "ఇమెయిల్ చిరునామా",
      password: "కొత్త పాస్‌వర్డ్",
      confirmPassword: "కొత్త పాస్‌వర్డ్ నిర్ధారించండి",
      resetBtn: "పాస్‌వర్డ్ రీసెట్ చేయండి",
      successMsg: "పాస్‌వర్డ్ విజయవంతంగా రీసెట్ చేయబడింది! లాగిన్‌కు మళ్లుతోంది...",
      backToLogin: "లాగిన్‌కు తిరిగి వెళ్లండి",
      matchError: "పాస్‌వర్డ్‌లు సరిపోలడం లేదు",
      invalidEmail: "దయచేసి సరైన ఇమెయిల్ ఇవ్వండి",
      genericError: "పాస్‌వర్డ్ రీసెట్ చేయడం విఫలమైంది."
    }
  };

  const t = content[language] || content.en;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value.trimStart()
    }));
    if (error) setError("");
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t.matchError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.post(`${apiUrl}/auth/reset-password`, {
        email: form.email,
        password: form.password
      });

      if (response.data.success) {
        setSuccess(t.successMsg);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.data.message || t.genericError);
      }
    } catch (err) {
      console.error("Reset Error:", err);
      setError(err.response?.data?.message || t.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <SEO title={t.title} />
      <div className="form">
        <h3>{t.title}</h3>
        <p className="text-small" style={{ marginBottom: "1.5rem", color: "var(--color-text-muted)" }}>
          Direct password reset for demo users. Type any seeded or registered email.
        </p>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--color-success)", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>{success}</div>}

        <form onSubmit={handleReset}>
          {/* Email */}
          <div className="field">
            <label>{t.email}</label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="e.g. buyer@crafthub.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading || !!success}
            />
          </div>

          {/* New Password */}
          <div className="field">
            <label>{t.password}</label>
            <input
              type="password"
              name="password"
              className="input"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading || !!success}
            />
          </div>

          {/* Confirm Password */}
          <div className="field">
            <label>{t.confirmPassword}</label>
            <input
              type="password"
              name="confirmPassword"
              className="input"
              placeholder={t.confirmPassword}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading || !!success}
            />
          </div>

          {/* Buttons */}
          <div className="actions" style={{ marginTop: "2rem" }}>
            <button type="submit" className="btn" disabled={loading || !!success}>
              {loading ? "Resetting..." : t.resetBtn}
            </button>

            <Link to="/login" style={{ width: "100%" }}>
              <button
                type="button"
                className="btn secondary"
                style={{ width: "100%" }}
                disabled={loading}
              >
                {t.backToLogin}
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
