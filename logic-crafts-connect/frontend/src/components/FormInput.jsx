import React from 'react';

/**
 * Reusable Form Input Component with Validation
 */
const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  icon,
  rightIcon,
  onRightIconClick,
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = showPasswordToggle && type === 'password'
    ? (showPassword ? 'text' : 'password')
    : type;

  const hasError = touched && error;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className={`form-label ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        
        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            form-input w-full px-4 py-2.5 rounded-lg border transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${rightIcon || showPasswordToggle ? 'pr-10' : ''}
            ${hasError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50' 
              : 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-2
            ${inputClassName}
          `}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...props}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        
        {rightIcon && !showPasswordToggle && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {rightIcon}
          </button>
        )}
      </div>
      
      {hasError && (
        <p 
          id={`${name}-error`} 
          className={`mt-1 text-sm text-red-600 flex items-center gap-1 ${errorClassName}`}
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Reusable TextArea Component with Validation
 */
export const FormTextArea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  showCount = false,
  className = '',
  textareaClassName = '',
  labelClassName = '',
  errorClassName = '',
  ...props
}) => {
  const hasError = touched && error;
  const currentLength = value?.length || 0;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className={`form-label ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`
            form-textarea w-full px-4 py-2.5 rounded-lg border transition-all duration-200 resize-y
            ${hasError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50' 
              : 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-2
            ${textareaClassName}
          `}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...props}
        />
        
        {showCount && maxLength && (
          <span className={`absolute bottom-2 right-2 text-xs ${
            currentLength > maxLength * 0.9 ? 'text-red-500' : 'text-gray-400'
          }`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      
      {hasError && (
        <p 
          id={`${name}-error`} 
          className={`mt-1 text-sm text-red-600 flex items-center gap-1 ${errorClassName}`}
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Reusable Select Component with Validation
 */
export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
  selectClassName = '',
  labelClassName = '',
  errorClassName = '',
  ...props
}) => {
  const hasError = touched && error;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className={`form-label ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            form-select w-full px-4 py-2.5 rounded-lg border transition-all duration-200 appearance-none
            ${hasError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50' 
              : 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-2 pr-10
            ${selectClassName}
          `}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option 
              key={option.value || option} 
              value={option.value || option}
            >
              {option.label || option}
            </option>
          ))}
        </select>
        
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
      
      {hasError && (
        <p 
          id={`${name}-error`} 
          className={`mt-1 text-sm text-red-600 flex items-center gap-1 ${errorClassName}`}
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Form Submit Button with Loading State
 */
export const FormButton = ({
  children,
  type = 'submit',
  loading = false,
  disabled = false,
  variant = 'primary',
  className = '',
  onClick,
  ...props
}) => {
  const variants = {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'border-2 border-amber-600 text-amber-600 hover:bg-amber-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        px-6 py-2.5 rounded-lg font-medium transition-all duration-200
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${(disabled || loading) ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
            fill="none"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {loading ? 'Please wait...' : children}
    </button>
  );
};

export default FormInput;
