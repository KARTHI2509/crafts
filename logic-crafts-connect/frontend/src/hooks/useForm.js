import { useState, useCallback, useMemo } from 'react';
import { validateField, validateForm } from '../utils/validation';

/**
 * Custom hook for form state management with validation
 * 
 * @param {Object} config - Configuration object
 * @param {Object} config.initialValues - Initial form values
 * @param {Object} config.validationSchema - Validation schema for each field
 * @param {Function} config.onSubmit - Submit handler function
 * @returns {Object} Form state and handlers
 * 
 * @example
 * const form = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationSchema: formSchemas.login,
 *   onSubmit: async (values) => {
 *     await loginUser(values);
 *   }
 * });
 */
const useForm = ({ initialValues = {}, validationSchema = {}, onSubmit }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /**
   * Check if form is valid
   */
  const isValid = useMemo(() => {
    const { isValid: valid } = validateForm(values, validationSchema);
    return valid;
  }, [values, validationSchema]);

  /**
   * Check if form has been modified from initial values
   */
  const isDirty = useMemo(() => {
    return Object.keys(initialValues).some(
      key => values[key] !== initialValues[key]
    );
  }, [values, initialValues]);

  /**
   * Validate a single field
   */
  const validateSingleField = useCallback((name, value) => {
    const config = validationSchema[name];
    if (!config) return null;
    
    return validateField(value, config.rules || [], config.label || name);
  }, [validationSchema]);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    
    let fieldValue;
    if (type === 'checkbox') {
      fieldValue = checked;
    } else if (type === 'file') {
      fieldValue = files;
    } else {
      fieldValue = value;
    }

    setValues(prev => ({ ...prev, [name]: fieldValue }));
    
    // Clear submit error when user makes changes
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateSingleField(name, fieldValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateSingleField]);

  /**
   * Handle input blur
   */
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const error = validateSingleField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateSingleField]);

  /**
   * Set a specific field value programmatically
   */
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateSingleField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateSingleField]);

  /**
   * Set a specific field error programmatically
   */
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  /**
   * Set a specific field as touched
   */
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  /**
   * Validate all fields
   */
  const validateAllFields = useCallback(() => {
    const result = validateForm(values, validationSchema);
    setErrors(result.errors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationSchema).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
    
    return result.isValid;
  }, [values, validationSchema]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Validate all fields
    const isFormValid = validateAllFields();
    
    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await onSubmit(values);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAllFields, onSubmit]);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback((newInitialValues) => {
    setValues(newInitialValues || initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [initialValues]);

  /**
   * Get field props for easy binding
   */
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
    touched: touched[name],
  }), [values, errors, touched, handleChange, handleBlur]);

  /**
   * Get form props for easy binding
   */
  const getFormProps = useCallback(() => ({
    onSubmit: handleSubmit,
    noValidate: true, // Disable browser validation
  }), [handleSubmit]);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    submitSuccess,
    isValid,
    isDirty,
    
    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Field manipulation
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues,
    setErrors,
    
    // Form manipulation
    resetForm,
    validateAllFields,
    
    // Helper getters
    getFieldProps,
    getFormProps,
  };
};

export default useForm;
