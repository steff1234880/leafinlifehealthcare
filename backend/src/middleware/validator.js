import validator from 'validator';

/**
 * Validation middleware factory that validates request body against schema rules
 * @param {object} rules - Field validation functions
 */
export function validateRequestBody(rules = {}) {
  return (req, res, next) => {
    const errors = {};
    const body = req.body || {};

    for (const [field, validateFn] of Object.entries(rules)) {
      const errorMsg = validateFn(body[field], body);
      if (errorMsg) {
        errors[field] = errorMsg;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed for one or more fields',
        errors,
      });
    }

    next();
  };
}

/**
 * Common reusable validation helper functions
 */
export const validationRules = {
  required: (fieldName = 'Field') => (val) => {
    if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
      return `${fieldName} is required.`;
    }
    return null;
  },

  email: () => (val) => {
    if (!val || typeof val !== 'string' || !validator.isEmail(val.trim())) {
      return 'Please provide a valid email address.';
    }
    return null;
  },

  phone: () => (val) => {
    if (!val || typeof val !== 'string') {
      return 'Please provide a valid phone number.';
    }
    const clean = val.replace(/\s+/g, '');
    if (!/^[6-9]\d{9}$/.test(clean)) {
      return 'Please enter a valid 10-digit Indian mobile number.';
    }
    return null;
  },

  passwordMinLength: (min = 6) => (val) => {
    if (!val || typeof val !== 'string' || val.length < min) {
      return `Password must be at least ${min} characters long.`;
    }
    return null;
  },

  positiveNumber: (fieldName = 'Amount') => (val) => {
    const num = Number(val);
    if (Number.isNaN(num) || num <= 0) {
      return `${fieldName} must be a positive number greater than 0.`;
    }
    return null;
  },
};

