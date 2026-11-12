import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import useForm from "../hooks/useForm";
import { formSchemas } from "../utils/validation";
import FormInput from "../components/FormInput";
import { FormButton } from "../components/FormInput";
import toast from "react-hot-toast";

export default function Login() {
  const { language } = useContext(LanguageContext);
  const { login: authLogin } = useAuth();

  const content = {
    en: {
      title: "Login",
      email: "Email",
      password: "Password",
      loginBtn: "Login",
      createAccount: "Create Account",
      forgotPassword: "Forgot password?",
      clickHere: "Click here",
      loggingIn: "Logging in...",
      invalidCredentials: "Invalid email or password",
      loginSuccess: "Login successful!",
    },
    te: {
      title: "లాగిన్",
      email: "ఇమేల్",
      password: "పాస్‌వర్డ్",
      loginBtn: "లాగిన్",
      createAccount: "కొత్త ఖాతాను సృష్టించండి",
      forgotPassword: "పాస్‌వర్డ్ మరచిపోయారా?",
      clickHere: "ఇక్కడ క్లిక్ చేయండి",
      loggingIn: "లాగిన్ అవుతోంది...",
      invalidCredentials: "చెల్లని ఇమేల్ లేదా పాస్‌వర్డ్",
      loginSuccess: "లాగిన్ విజయవంతం!",
    },
  };

  const t = content[language] || content.en;

  const form = useForm({
    initialValues: { email: "", password: "" },
    validationSchema: formSchemas.login,
    onSubmit: async (values) => {
      const result = await authLogin(values.email, values.password);
      
      if (!result.success) {
        throw new Error(result.message || t.invalidCredentials);
      }
      toast.success(t.loginSuccess);
      // Success redirect is handled by AuthContext
    },
  });

  // Show submit error as toast
  React.useEffect(() => {
    if (form.submitError) {
      toast.error(form.submitError);
    }
  }, [form.submitError]);

  return (
    <div className="form">
      <h3>{t.title}</h3>
      
      <form {...form.getFormProps()}>
        {/* Email */}
        <div className="field">
          <FormInput
            label={t.email}
            type="email"
            placeholder={t.email}
            disabled={form.isSubmitting}
            autoComplete="email"
            required
            {...form.getFieldProps("email")}
          />
        </div>

        {/* Password */}
        <div className="field">
          <FormInput
            label={t.password}
            type="password"
            placeholder={t.password}
            disabled={form.isSubmitting}
            autoComplete="current-password"
            showPasswordToggle
            required
            {...form.getFieldProps("password")}
          />
        </div>

        {/* Actions */}
        <div className="actions">
          <FormButton 
            type="submit" 
            loading={form.isSubmitting}
            disabled={!form.isValid && Object.keys(form.touched).length > 0}
          >
            {t.loginBtn}
          </FormButton>
          <Link to="/register">
            <button type="button" className="btn secondary" disabled={form.isSubmitting}>
              {t.createAccount}
            </button>
          </Link>
        </div>
      </form>

      {/* Helper link */}
      <p style={{ marginTop: "10px", fontSize: "14px", color: "var(--muted)" }}>
        {t.forgotPassword} <Link to="/forgot-password">{t.clickHere}</Link>
      </p>
    </div>
  );
}