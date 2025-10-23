import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { language } = useContext(LanguageContext);
  const { register: authRegister } = useAuth();
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    role: "artisan",
    location: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const content = {
    en: {
      title: "Create Account",
      name: "Full Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      role: "I am a",
      artisan: "Artisan (Seller)",
      buyer: "Buyer",
      location: "Location (City, State)",
      myStory: "My Story (For Artisans)",
      storyPlaceholder: "Tell us about yourself - your craft journey, heritage, experience, or passion...",
      registerBtn: "Register",
      alreadyHaveAccount: "Already have an account?",
      passwordMismatch: "Passwords do not match!",
      show: "Show",
      hide: "Hide",
    },
    te: {
      title: "కొత్త ఖాతాను సృష్టించండి",
      name: "పూర్తి పేరు",
      email: "ఇమేల్",
      password: "పాస్‌వర్డ్",
      confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
      role: "నేను",
      artisan: "కళాకారుడు (విక్రేత)",
      buyer: "కొనుగోలుదారు",
      location: "స్థానం (నగరం, రాష్ట్రం)",
      myStory: "నా కథ (కళాకారుల కోసం)",
      storyPlaceholder: "మీ గురించి మాకు చెప్పండి - మీ హస్తకళా ప్రయాణం, వారసత్వం, అనుభవం లేదా అభిరుచి...",
      registerBtn: "నమోదు చేయండి",
      alreadyHaveAccount: "ఇది గతంలో ఖాతా ఉందా?",
      passwordMismatch: "పాస్‌వర్డ్‌లు సరిపోలేదు!",
      show: "చూపు",
      hide: "దాచు",
    },
  };

  const t = content[language] || content.en;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    
    // Validate password length
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setError("");
      setSuccess("");
      
      // Prepare registration data
      const registrationData = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,  // Send 'artisan' or 'buyer' directly
        location: form.location,
        phone: form.phone || '',
      };
      
      // Debug log
      console.log('Registering with role:', registrationData.role);
      console.log('Full registration data:', registrationData);
      
      const result = await authRegister(registrationData);
      
      if (result.success) {
        setSuccess(result.message || 'Registration successful! Redirecting to login...');
        // AuthContext will handle redirect to login page
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
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
      
      {success && (
        <div style={{
          padding: '10px', 
          marginBottom: '16px', 
          background: '#d4edda', 
          color: '#155724',
          borderRadius: '6px',
          fontSize: '14px',
        }}>
          {success}
        </div>
      )}
      
      <form onSubmit={handleRegister}>
        {/* Name */}
        <div className="field">
          <label>{t.name}</label>
          <input
            type="text"
            className="input"
            name="name"
            value={form.name}
            placeholder={t.name}
            onChange={handleChange}
            required
          />
        </div>

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
          />
        </div>

        {/* Role Selection */}
        <div className="field">
          <label>{t.role}</label>
          <div style={{display: 'flex', gap: '16px', marginTop: '8px'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'}}>
              <input
                type="radio"
                name="role"
                value="artisan"
                checked={form.role === "artisan"}
                onChange={handleChange}
              />
              {t.artisan}
            </label>
            <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'}}>
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={form.role === "buyer"}
                onChange={handleChange}
              />
              {t.buyer}
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="field">
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

        {/* Phone Number */}
        <div className="field">
          <label>Phone Number</label>
          <input
            type="tel"
            className="input"
            name="phone"
            value={form.phone}
            placeholder="+91 1234567890"
            onChange={handleChange}
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
              minLength="6"
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

        {/* Confirm Password */}
        <div className="field">
          <label>{t.confirmPassword}</label>
          <input
            type="password"
            className="input"
            name="confirmPassword"
            value={form.confirmPassword}
            placeholder={t.confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>

        {/* Actions */}
        <div className="actions">
          <button type="submit" className="btn">
            {t.registerBtn}
          </button>
          <Link to="/login">
            <button type="button" className="btn secondary">
              {t.alreadyHaveAccount}
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
