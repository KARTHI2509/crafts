import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { language } = useContext(LanguageContext);
  const { login: authLogin } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const content = {
    en: {
      title: "Login",
      email: "Email",
      password: "Password",
      loginBtn: "Login",
      createAccount: "Create Account",
      forgotPassword: "Forgot password?",
      clickHere: "Click here",
      show: "Show",
      hide: "Hide",
      loggingIn: "Logging in...",
      invalidCredentials: "Invalid email or password",
    },
    te: {
      title: "లాగిన్",
      email: "ఇమేల్",
      password: "పాస్‌వర్డ్",
      loginBtn: "లాగిన్",
      createAccount: "కొత్త ఖాతాను సృష్టించండి",
      forgotPassword: "పాస్‌వర్డ్ మరచిపోయారా?",
      clickHere: "ఇక్కడ క్లిక్ చేయండి",
      show: "చూపు",
      hide: "దాచు",
      loggingIn: "లాగిన్ అవుతోంది...",
      invalidCredentials: "చెల్లని ఇమేల్ లేదా పాస్‌వర్డ్",
    },
  };

  const t = content[language] || content.en;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await authLogin(form.email, form.password);
      
      if (!result.success) {
        setError(result.message || t.invalidCredentials);
      }
      // Success redirect is handled by AuthContext
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || t.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form">
      <h3>{t.title}</h3>
      
      {error && (
        <div style={{
          padding: '10px', 
          marginBottom: '16px', 
          background: '#fee', 
          color: '#c33',
          borderRadius: '6px',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin}>
        {/* Email */}
        <div className="field">
          <label>{t.email}</label>
          <input
            type="email"
            className="input"
            name="email"
            value={form.email}
            placeholder={t.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="field">
          <label>{t.password}</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              name="password"
              value={form.password}
              placeholder={t.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "12px",
                color: "var(--muted)",
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? t.hide : t.show}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="actions">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? t.loggingIn : t.loginBtn}
          </button>
          <Link to="/register">
            <button type="button" className="btn secondary" disabled={loading}>
              {t.createAccount}
            </button>
          </Link>
        </div>
      </form>

      {/* Helper link */}
      <p style={{ marginTop: "10px", fontSize: "14px", color: "var(--muted)" }}>
        {t.forgotPassword} <Link to="/reset">{t.clickHere}</Link>
      </p>
    </div>
  );
}
  