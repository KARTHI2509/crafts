/**
 * Form Validation Utilities
 * Comprehensive client-side validation with error messages
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (Indian format)
const PHONE_REGEX = /^[6-9]\d{9}$/;

// Password requirements
const PASSWORD_MIN_LENGTH = 8;

/**
 * Validation rules object
 */
export const validationRules = {
  required: (value, fieldName = 'This field') => {
    if (value === undefined || value === null || value === '') {
      return `${fieldName} is required`;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    if (!EMAIL_REGEX.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const cleanPhone = value.replace(/\D/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      return 'Please enter a valid 10-digit phone number';
    }
    return null;
  },

  minLength: (min) => (value, fieldName = 'This field') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max) => (value, fieldName = 'This field') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} must be less than ${max} characters`;
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    
    const errors = [];
    
    if (value.length < PASSWORD_MIN_LENGTH) {
      errors.push(`at least ${PASSWORD_MIN_LENGTH} characters`);
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(value)) {
      errors.push('one lowercase letter');
    }
    if (!/[0-9]/.test(value)) {
      errors.push('one number');
    }
    
    if (errors.length > 0) {
      return `Password must contain ${errors.join(', ')}`;
    }
    return null;
  },

  confirmPassword: (password) => (value) => {
    if (!value) return null;
    if (value !== password) {
      return 'Passwords do not match';
    }
    return null;
  },

  number: (value, fieldName = 'This field') => {
    if (!value && value !== 0) return null;
    if (isNaN(Number(value))) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  },

  positiveNumber: (value, fieldName = 'This field') => {
    if (!value && value !== 0) return null;
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return `${fieldName} must be a positive number`;
    }
    return null;
  },

  min: (minValue) => (value, fieldName = 'This field') => {
    if (!value && value !== 0) return null;
    if (Number(value) < minValue) {
      return `${fieldName} must be at least ${minValue}`;
    }
    return null;
  },

  max: (maxValue) => (value, fieldName = 'This field') => {
    if (!value && value !== 0) return null;
    if (Number(value) > maxValue) {
      return `${fieldName} must be at most ${maxValue}`;
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  pattern: (regex, message) => (value) => {
    if (!value) return null;
    if (!regex.test(value)) {
      return message || 'Invalid format';
    }
    return null;
  },
};

/**
 * Validate a single field against multiple rules
 * @param {any} value - Field value
 * @param {Array} rules - Array of validation functions
 * @param {string} fieldName - Field name for error messages
 * @returns {string|null} - Error message or null
 */
export const validateField = (value, rules, fieldName = 'This field') => {
  for (const rule of rules) {
    const error = typeof rule === 'function' 
      ? rule(value, fieldName) 
      : rule;
    if (error) return error;
  }
  return null;
};

/**
 * Validate entire form
 * @param {Object} values - Form values object
 * @param {Object} validationSchema - Schema defining rules for each field
 * @returns {Object} - { isValid: boolean, errors: { fieldName: errorMessage } }
 */
export const validateForm = (values, validationSchema) => {
  const errors = {};
  let isValid = true;

  for (const [fieldName, config] of Object.entries(validationSchema)) {
    const value = values[fieldName];
    const rules = config.rules || [];
    const label = config.label || fieldName;
    
    const error = validateField(value, rules, label);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Common form schemas
 */
export const formSchemas = {
  login: {
    email: {
      label: 'Email',
      rules: [validationRules.required, validationRules.email],
    },
    password: {
      label: 'Password',
      rules: [validationRules.required],
    },
  },

  register: {
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
    phone: {
      label: 'Phone',
      rules: [validationRules.phone],
    },
    location: {
      label: 'Location',
      rules: [validationRules.maxLength(100)],
    },
  },

  craftUpload: {
    name: {
      label: 'Craft Name',
      rules: [
        validationRules.required,
        validationRules.minLength(3),
        validationRules.maxLength(100),
      ],
    },
    description: {
      label: 'Description',
      rules: [
        validationRules.required,
        validationRules.minLength(20),
        validationRules.maxLength(2000),
      ],
    },
    price: {
      label: 'Price',
      rules: [
        validationRules.required,
        validationRules.positiveNumber,
        validationRules.min(1),
      ],
    },
    category: {
      label: 'Category',
      rules: [validationRules.required],
    },
    location: {
      label: 'Location',
      rules: [validationRules.required],
    },
  },

  checkout: {
    fullName: {
      label: 'Full Name',
      rules: [validationRules.required, validationRules.minLength(2)],
    },
    email: {
      label: 'Email',
      rules: [validationRules.required, validationRules.email],
    },
    phone: {
      label: 'Phone',
      rules: [validationRules.required, validationRules.phone],
    },
    address: {
      label: 'Address',
      rules: [validationRules.required, validationRules.minLength(10)],
    },
    city: {
      label: 'City',
      rules: [validationRules.required],
    },
    state: {
      label: 'State',
      rules: [validationRules.required],
    },
    pincode: {
      label: 'Pincode',
      rules: [
        validationRules.required,
        validationRules.pattern(/^\d{6}$/, 'Pincode must be 6 digits'),
      ],
    },
  },
};

/**
 * Custom hook for form validation (use with React)
 */
export const useFormValidation = (initialValues, schema) => {
  return {
    validate: (values) => validateForm(values, schema),
    validateField: (fieldName, value) => {
      const config = schema[fieldName];
      if (!config) return null;
      return validateField(value, config.rules || [], config.label || fieldName);
    },
  };
};

export default {
  validationRules,
  validateField,
  validateForm,
  formSchemas,
  useFormValidation,
};
