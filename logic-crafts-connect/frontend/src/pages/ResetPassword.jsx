import React, { useContext, useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import useForm from "../hooks/useForm";
import { validationRules } from "../utils/validation";
import FormInput from "../components/FormInput";
import { FormButton } from "../components/FormInput";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { language } = useContext(LanguageContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tokenValid, setTokenValid] = useState(true);
  
  const token = searchParams.get('token');

  const content = {
    en: {
      title: "Reset Password",
      subtitle: "Enter your new password below.",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      resetBtn: "Reset Password",
      backToLogin: "Back to Login",
      resetSuccess: "Password reset successful! You can now login with your new password.",
      invalidToken: "This reset link is invalid or has expired.",
      requestNew: "Request a new reset link",
    },
    te: {
      title: "పాస్‌వర్డ్ రీసెట్ చేయండి",
      subtitle: "మీ కొత్త పాస్‌వర్డ్‌ను క్రింద నమోదు చేయండి.",
      newPassword: "కొత్త పాస్‌వర్డ్",
      confirmPassword: "కొత్త పాస్‌వర్డ్‌ను నిర్ధారించండి",
      resetBtn: "పాస్‌వర్డ్ రీసెట్ చేయండి",
      backToLogin: "లాగిన్‌కు తిరిగి వెళ్ళు",
      resetSuccess: "పాస్‌వర్డ్ రీసెట్ విజయవంతం! మీరు ఇప్పుడు మీ కొత్త పాస్‌వర్డ్‌తో లాగిన్ అవచ్చు.",
      invalidToken: "ఈ రీసెట్ లింక్ చెల్లదు లేదా గడువు ముగిసింది.",
      requestNew: "కొత్త రీసెట్ లింక్ కోసం అభ్యర్థించండి",
    },
  };

  const t = content[language] || content.en;

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  // State for password to use in confirm password validation
  const [passwordValue, setPasswordValue] = useState("");

  const form = useForm({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: {
      password: {
        label: 'Password',
        rules: [validationRules.required, validationRules.password],
      },
      confirmPassword: {
        label: 'Confirm Password',
        rules: [
          validationRules.required,
          validationRules.confirmPassword(passwordValue),
        ],
      },
    },
    onSubmit: async (values) => {
      // Final password match check before submit
      if (values.password !== values.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      try {
        await authAPI.resetPassword(token, values.password);
        toast.success(t.resetSuccess);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        if (error.response?.status === 400) {
          setTokenValid(false);
          throw new Error(t.invalidToken);
        }
        throw new Error(error.response?.data?.message || 'Failed to reset password');
      }
    },
  });

  // Sync password value for confirm validation
  useEffect(() => {
    setPasswordValue(form.values.password);
  }, [form.values.password]);

  // Show submit error as toast
  React.useEffect(() => {
    if (form.submitError) {
      toast.error(form.submitError);
    }
  }, [form.submitError]);

  // Invalid or missing token
  if (!tokenValid) {
    return (
      <div className="form">
        <h3>{t.title}</h3>
        <div style={{
          padding: '20px',
          background: '#fee',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <svg 
            style={{ width: '48px', height: '48px', color: '#c33', margin: '0 auto 12px' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p style={{ color: '#c33', fontWeight: '500', marginBottom: '16px' }}>
            {t.invalidToken}
          </p>
          <Link to="/forgot-password" className="btn" style={{ display: 'inline-block' }}>
            {t.requestNew}
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (form.submitSuccess) {
    return (
      <div className="form">
        <h3>{t.title}</h3>
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
            {t.resetSuccess}
          </p>
          <Link to="/login" className="btn" style={{ display: 'inline-block' }}>
            {t.backToLogin}
          </Link>
        </div>
      </div>
    );
  }

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

      <form {...form.getFormProps()}>
        <div className="field">
          <FormInput
            label={t.newPassword}
            type="password"
            placeholder={t.newPassword}
            disabled={form.isSubmitting}
            autoComplete="new-password"
            showPasswordToggle
            required
            {...form.getFieldProps("password")}
          />
          {!form.errors.password && form.values.password && (
            <p className="mt-1 text-xs text-gray-500">
              Must contain: 8+ chars, uppercase, lowercase, and number
            </p>
          )}
        </div>

        <div className="field">
          <FormInput
            label={t.confirmPassword}
            type="password"
            placeholder={t.confirmPassword}
            disabled={form.isSubmitting}
            autoComplete="new-password"
            required
            {...form.getFieldProps("confirmPassword")}
          />
        </div>

        <div className="actions" style={{ marginTop: '24px' }}>
          <FormButton
            type="submit"
            loading={form.isSubmitting}
          >
            {t.resetBtn}
          </FormButton>
        </div>

        <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--muted)', textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--accent)' }}>
            ← {t.backToLogin}
          </Link>
        </p>
      </form>
    </div>
  );
}
