import { AlertCircle, Check } from 'lucide-react';

/**
 * Form Input Component with Validation
 * 
 * @param {string} label - Input label
 * @param {string} error - Error message to display
 * @param {string} helper - Helper text (shown when no error)
 * @param {boolean} success - Show success state
 * @param {string} type - Input type (text, email, number, etc.)
 * @param {boolean} required - Is field required
 * @param {object} ...props - Other input props
 */
const FormInput = ({ 
  label, 
  error, 
  helper, 
  success, 
  className = '', 
  required = false,
  ...props 
}) => {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          className={`
            w-full px-3 py-2 border rounded-md transition-colors
            focus:outline-none focus:ring-2
            ${hasError 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : hasSuccess
              ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            }
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${props.id}-error` : helper ? `${props.id}-helper` : undefined}
          {...props}
        />
        
        {/* Success Icon */}
        {hasSuccess && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Check className="h-5 w-5 text-green-500" />
          </div>
        )}
        
        {/* Error Icon */}
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600 flex items-start gap-1">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!hasError && helper && (
        <p id={`${props.id}-helper`} className="mt-1 text-sm text-gray-500">
          {helper}
        </p>
      )}
    </div>
  );
};

export default FormInput;

