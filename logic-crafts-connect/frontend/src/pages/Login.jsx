import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";
export default function Login() {
  const { language } = useContext(LanguageContext);
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

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
      email: "ఇమెయిల్",
      password: "పాస్‌వర్డ్",
      loginBtn: "లాగిన్",
      createAccount: "కొత్త ఖాతా సృష్టించండి",
      forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
      clickHere: "ఇక్కడ క్లిక్ చేయండి",
      show: "చూపు",
      hide: "దాచు",
      loggingIn: "లాగిన్ అవుతోంది...",
      invalidCredentials: "తప్పు ఇమెయిల్ లేదా పాస్‌వర్డ్",
    },
  };

  const t = content[language] || content.en;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value.trimStart(),
    }));

    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError(t.invalidCredentials);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(form.email, form.password);

      if (!result.success) {
        setError(result.message || t.invalidCredentials);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || t.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form">
        <h3>{t.title}</h3>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="field">
            <label>{t.email}</label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder={t.email}
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="field">
            <label>{t.password}</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="input"
                placeholder={t.password}
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? t.hide : t.show}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? t.loggingIn : t.loginBtn}
            </button>

            <Link to="/register">
              <button
                type="button"
                className="btn secondary"
                disabled={loading}
              >
                {t.createAccount}
              </button>
            </Link>
          </div>
        </form>

        {/* Forgot Password */}
        <p className="helper-text">
          {t.forgotPassword} <Link to="/reset">{t.clickHere}</Link>
        </p>
      </div>
    </div>
  );
}