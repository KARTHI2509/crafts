import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import useForm from "../hooks/useForm";
import { validationRules } from "../utils/validation";
import FormInput from "../components/FormInput";
import { FormButton } from "../components/FormInput";
import toast from "react-hot-toast";

export default function Register() {
  const { language } = useContext(LanguageContext);
  const { register: authRegister } = useAuth();

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
      phone: "Phone Number",
      registerBtn: "Register",
      alreadyHaveAccount: "Already have an account?",
      registerSuccess: "Registration successful! Please log in.",
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
      phone: "ఫోన్ నంబర్",
      registerBtn: "నమోదు చేయండి",
      alreadyHaveAccount: "ఇది గతంలో ఖాతా ఉందా?",
      registerSuccess: "నమోదు విజయవంతమైంది! దయచేసి లాగిన్ అవండి.",
    },
  };

  const t = content[language] || content.en;

  // State for password to use in confirm password validation
  const [passwordValue, setPasswordValue] = React.useState("");

  // Dynamic validation schema that updates with password changes
  const form = useForm({
    initialValues: { 
      name: "", 
      email: "", 
      password: "", 
      confirmPassword: "",
      role: "artisan",
      location: "",
      phone: "",
    },
    validationSchema: {
      name: {
        label: 'Name',
        rules: [
          validationRules.required,
          validationRules.minLength(2),
          validationRules.maxLength(50),
        ],
      },
      email: {
        label: 'Email',
        rules: [validationRules.required, validationRules.email],
      },
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
      location: {
        label: 'Location',
        rules: [validationRules.required],
      },
      phone: {
        label: 'Phone',
        rules: [validationRules.phone],
      },
    },
    onSubmit: async (values) => {
      // Final password match check before submit
      if (values.password !== values.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      const registrationData = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        location: values.location,
        phone: values.phone || '',
      };
      
      const result = await authRegister(registrationData);
      
      if (!result.success) {
        throw new Error(result.message || 'Registration failed. Please try again.');
      }
      toast.success(t.registerSuccess);
      // AuthContext will handle redirect
    },
  });

  // Sync password value for confirm validation
  React.useEffect(() => {
    setPasswordValue(form.values.password);
  }, [form.values.password]);

  // Handle role change separately (radio buttons)
  const handleRoleChange = (e) => {
    form.setFieldValue('role', e.target.value);
  };

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
        {/* Name */}
        <div className="field">
          <FormInput
            label={t.name}
            type="text"
            placeholder={t.name}
            disabled={form.isSubmitting}
            autoComplete="name"
            required
            {...form.getFieldProps("name")}
          />
        </div>

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

        {/* Role Selection */}
        <div className="field">
          <label className="form-label">{t.role}</label>
          <div style={{display: 'flex', gap: '16px', marginTop: '8px'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'}}>
              <input
                type="radio"
                name="role"
                value="artisan"
                checked={form.values.role === "artisan"}
                onChange={handleRoleChange}
                disabled={form.isSubmitting}
              />
              {t.artisan}
            </label>
            <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'}}>
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={form.values.role === "buyer"}
                onChange={handleRoleChange}
                disabled={form.isSubmitting}
              />
              {t.buyer}
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="field">
          <FormInput
            label={t.location}
            type="text"
            placeholder="Jaipur, Rajasthan"
            disabled={form.isSubmitting}
            required
            {...form.getFieldProps("location")}
          />
        </div>

        {/* Phone Number */}
        <div className="field">
          <FormInput
            label={t.phone}
            type="tel"
            placeholder="9876543210"
            disabled={form.isSubmitting}
            autoComplete="tel"
            {...form.getFieldProps("phone")}
          />
        </div>

        {/* Password */}
        <div className="field">
          <FormInput
            label={t.password}
            type="password"
            placeholder={t.password}
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

        {/* Confirm Password */}
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

        {/* Actions */}
        <div className="actions">
          <FormButton 
            type="submit" 
            loading={form.isSubmitting}
          >
            {t.registerBtn}
          </FormButton>
          <Link to="/login">
            <button type="button" className="btn secondary" disabled={form.isSubmitting}>
              {t.alreadyHaveAccount}
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
