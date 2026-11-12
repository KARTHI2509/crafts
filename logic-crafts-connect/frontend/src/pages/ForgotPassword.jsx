import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import useForm from "../hooks/useForm";
import { formSchemas } from "../utils/validation";
import FormInput from "../components/FormInput";
import { FormButton } from "../components/FormInput";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const { language } = useContext(LanguageContext);

  const content = {
    en: {
      title: "Forgot Password",
      subtitle: "Enter your email address and we'll send you a link to reset your password.",
      email: "Email Address",
      sendLink: "Send Reset Link",
      backToLogin: "Back to Login",
      emailSent: "Password reset link sent! Check your email.",
      emailNotFound: "No account found with this email address.",
    },
    te: {
      title: "పాస్‌వర్డ్ మరచిపోయారా",
      subtitle: "మీ ఇమేల్ చిరునామాను నమోదు చేయండి, మీ పాస్‌వర్డ్‌ను రీసెట్ చేయడానికి మేము మీకు లింక్ పంపుతాము.",
      email: "ఇమేల్ చిరునామా",
      sendLink: "రీసెట్ లింక్ పంపండి",
      backToLogin: "లాగిన్‌కు తిరిగి వెళ్ళు",
      emailSent: "పాస్‌వర్డ్ రీసెట్ లింక్ పంపబడింది! మీ ఇమేల్‌ను తనిఖీ చేయండి.",
      emailNotFound: "ఈ ఇమేల్ చిరునామాతో ఖాతా కనుగొనబడలేదు.",
    },
  };

  const t = content[language] || content.en;

  const form = useForm({
    initialValues: { email: "" },
    validationSchema: {
      email: formSchemas.login.email,
    },
    onSubmit: async (values) => {
      try {
        await authAPI.forgotPassword(values.email);
        toast.success(t.emailSent);
      } catch (error) {
        if (error.response?.status === 404) {
          throw new Error(t.emailNotFound);
        }
        throw new Error(error.response?.data?.message || 'Failed to send reset link');
      }
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
      <p style={{ 
        color: 'var(--muted)', 
        fontSize: '14px', 
        marginBottom: '24px',
        lineHeight: '1.5'
      }}>
        {t.subtitle}
      </p>

      {form.submitSuccess ? (
        <div style={{
          padding: '20px',
          background: '#d4edda',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <svg 
            style={{ width: '48px', height: '48px', color: '#28a745', margin: '0 auto 12px' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p style={{ color: '#155724', fontWeight: '500', marginBottom: '16px' }}>
            {t.emailSent}
          </p>
          <Link to="/login" className="btn" style={{ display: 'inline-block' }}>
            {t.backToLogin}
          </Link>
        </div>
      ) : (
        <form {...form.getFormProps()}>
          <div className="field">
            <FormInput
              label={t.email}
              type="email"
              placeholder="your@email.com"
              disabled={form.isSubmitting}
              autoComplete="email"
              autoFocus
              required
              {...form.getFieldProps("email")}
            />
          </div>

          <div className="actions" style={{ marginTop: '24px' }}>
            <FormButton
              type="submit"
              loading={form.isSubmitting}
              disabled={!form.isValid && form.touched.email}
            >
              {t.sendLink}
            </FormButton>
          </div>

          <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--muted)', textAlign: 'center' }}>
            <Link to="/login" style={{ color: 'var(--accent)' }}>
              ← {t.backToLogin}
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
