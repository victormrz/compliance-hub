import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

// ── Input validation constants ──
const MAX_TEXT_LENGTH = 500;
const MAX_TEXTAREA_LENGTH = 2000;
const MAX_NUMBER_VALUE = 99999;
const MIN_NUMBER_VALUE = 0;

/**
 * Sanitize text input — strip potential script content
 */
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Validate a single field value
 */
function validateField(field, value) {
  // Required check
  if (field.required) {
    if (value === '' || value === null || value === undefined) {
      return `${field.label} is required`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `${field.label} is required`;
    }
  }

  // Skip further validation if empty and not required
  if (!value && value !== 0) return null;

  // Length checks
  if (field.type === 'text' || field.type === 'tags') {
    const str = Array.isArray(value) ? value.join(', ') : String(value);
    const max = field.maxLength || MAX_TEXT_LENGTH;
    if (str.length > max) {
      return `${field.label} must be ${max} characters or less (currently ${str.length})`;
    }
  }
  if (field.type === 'textarea') {
    const max = field.maxLength || MAX_TEXTAREA_LENGTH;
    if (String(value).length > max) {
      return `${field.label} must be ${max} characters or less`;
    }
  }

  // Number bounds
  if (field.type === 'number') {
    const num = Number(value);
    const min = field.min ?? MIN_NUMBER_VALUE;
    const max = field.max ?? MAX_NUMBER_VALUE;
    if (isNaN(num)) return `${field.label} must be a valid number`;
    if (num < min) return `${field.label} must be at least ${min}`;
    if (num > max) return `${field.label} must be ${max} or less`;
  }

  // Date validation
  if (field.type === 'date' && value) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return `${field.label} must be a valid date`;
  }

  return null;
}

/**
 * Reusable form modal for create/edit operations.
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onSubmit: (formData) => void
 *   title: string (e.g., "Add Standard", "Edit Policy")
 *   fields: Array of { key, label, type, options?, required?, placeholder?, maxLength?, min?, max? }
 *   initialData: object (for edit mode, pre-fill the form)
 *   loading: boolean
 */
export default function FormModal({ open, onClose, onSubmit, title, fields, initialData = {}, loading = false }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      const defaults = {};
      fields.forEach(f => {
        defaults[f.key] = initialData[f.key] ?? f.defaultValue ?? '';
      });
      setFormData(defaults);
      setErrors({});
    }
  }, [open, initialData, fields]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    let hasErrors = false;

    fields.forEach(field => {
      const error = validateField(field, formData[field.key]);
      if (error) {
        newErrors[field.key] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Sanitize text fields before submission
    const sanitized = {};
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitize(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(v => typeof v === 'string' ? sanitize(v) : v);
      } else {
        sanitized[key] = value;
      }
    }

    onSubmit(sanitized);
  };

  const inputClasses = (key) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      errors[key] ? 'border-red-300 bg-red-50/50' : 'border-slate-300'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4">
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>

                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    className={inputClasses(field.key)}
                  >
                    <option value="">Select...</option>
                    {field.options?.map(opt => (
                      <option key={opt.value ?? opt} value={opt.value ?? opt}>
                        {opt.label ?? opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength || MAX_TEXTAREA_LENGTH}
                    rows={3}
                    className={`${inputClasses(field.key)} resize-none`}
                  />
                ) : field.type === 'date' ? (
                  <input
                    type="date"
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    className={inputClasses(field.key)}
                  />
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    min={field.min ?? MIN_NUMBER_VALUE}
                    max={field.max ?? MAX_NUMBER_VALUE}
                    className={inputClasses(field.key)}
                  />
                ) : field.type === 'tags' ? (
                  <input
                    type="text"
                    value={Array.isArray(formData[field.key]) ? formData[field.key].join(', ') : formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder={field.placeholder || 'Comma-separated values'}
                    maxLength={field.maxLength || MAX_TEXT_LENGTH}
                    className={inputClasses(field.key)}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength || MAX_TEXT_LENGTH}
                    className={inputClasses(field.key)}
                  />
                )}

                {/* Validation error */}
                {errors[field.key] && (
                  <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                    <AlertCircle size={12} /> {errors[field.key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {initialData?.id ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
