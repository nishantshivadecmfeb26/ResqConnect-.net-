/**
 * Frontend regex validation patterns matching backend DTOs
 * These patterns are used for real-time validation feedback before API submission
 */

export const ValidationPatterns = {
  // Phone number: Indian format (10 digits, optional +91 prefix or 0)
  PHONE: /^(?:\+91|0)?[6-9]\d{9}$/,
  
  // Name: Letters, spaces, hyphens, apostrophes only
  NAME: /^[a-zA-Z\s'-]{2,100}$/,
  
  // Email: Standard email format
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Latitude: -90 to 90
  LATITUDE: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/,
  
  // Longitude: -180 to 180
  LONGITUDE: /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
  
  // Address: Letters, numbers, spaces, and basic punctuation
  ADDRESS: /^[a-zA-Z0-9\s\-',./()&]{3,255}$/,
  
  // Alphanumeric with spaces
  ALPHANUMERIC_SPACE: /^[a-zA-Z0-9\s\-',./()&]{1,255}$/,
  
  // Description: Prevents common injection patterns
  DESCRIPTION: /^[a-zA-Z0-9\s\-',./()&!?\n]{5,1000}$/,
  
  // Password: Min 8 chars with uppercase, lowercase, and number
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

/**
 * Validation messages matching backend error messages
 */
export const ValidationMessages = {
  PHONE: "Enter 10-digit Indian number or +91xxxxxxxxxx",
  NAME: "Name can only contain letters, spaces, hyphens, and apostrophes",
  EMAIL: "Invalid email format",
  LATITUDE: "Latitude must be between -90 and 90",
  LONGITUDE: "Longitude must be between -180 and 180",
  ADDRESS: "Address must be 3-255 characters with letters, numbers, and basic punctuation",
  DESCRIPTION: "Description must be 5-500 characters with valid characters only",
  PASSWORD: "Password must be at least 8 characters with uppercase, lowercase, and number",
  REQUIRED: "This field is required",
  MIN_LENGTH: (length) => `Minimum ${length} characters required`,
  MAX_LENGTH: (length) => `Maximum ${length} characters allowed`,
};

/**
 * Comprehensive validation function for form fields
 * Returns validation object with isValid flag and error message
 */
export const validateField = (fieldName, value, rules = {}) => {
  // Check required
  if (rules.required && (!value || value.toString().trim() === "")) {
    return {
      isValid: false,
      error: ValidationMessages.REQUIRED,
    };
  }

  if (!value) {
    return { isValid: true, error: null };
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value.toString())) {
    return {
      isValid: false,
      error: rules.message || `Invalid ${fieldName} format`,
    };
  }

  // Length validation
  if (rules.minLength && value.toString().length < rules.minLength) {
    return {
      isValid: false,
      error: ValidationMessages.MIN_LENGTH(rules.minLength),
    };
  }

  if (rules.maxLength && value.toString().length > rules.maxLength) {
    return {
      isValid: false,
      error: ValidationMessages.MAX_LENGTH(rules.maxLength),
    };
  }

  // Custom validation function
  if (rules.custom) {
    const customResult = rules.custom(value);
    if (!customResult.isValid) {
      return customResult;
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validation rules for common form fields
 */
export const FormFieldRules = {
  // Authentication
  name: {
    required: true,
    pattern: ValidationPatterns.NAME,
    message: ValidationMessages.NAME,
    minLength: 2,
    maxLength: 100,
  },
  
  email: {
    required: true,
    pattern: ValidationPatterns.EMAIL,
    message: ValidationMessages.EMAIL,
    maxLength: 100,
  },
  
  phone: {
    required: false,
    pattern: ValidationPatterns.PHONE,
    message: ValidationMessages.PHONE,
    maxLength: 20,
  },
  
  password: {
    required: true,
    pattern: ValidationPatterns.PASSWORD,
    message: ValidationMessages.PASSWORD,
    minLength: 6,
    maxLength: 50,
  },

  // Location
  latitude: {
    required: true,
    pattern: ValidationPatterns.LATITUDE,
    message: ValidationMessages.LATITUDE,
    custom: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < -90 || num > 90) {
        return { isValid: false, error: ValidationMessages.LATITUDE };
      }
      return { isValid: true };
    },
  },
  
  longitude: {
    required: true,
    pattern: ValidationPatterns.LONGITUDE,
    message: ValidationMessages.LONGITUDE,
    custom: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < -180 || num > 180) {
        return { isValid: false, error: ValidationMessages.LONGITUDE };
      }
      return { isValid: true };
    },
  },

  // Address and locations
  address: {
    required: true,
    pattern: ValidationPatterns.ADDRESS,
    message: ValidationMessages.ADDRESS,
    minLength: 3,
    maxLength: 255,
  },

  // Descriptions
  description: {
    required: true,
    pattern: ValidationPatterns.DESCRIPTION,
    message: ValidationMessages.DESCRIPTION,
    minLength: 5,
    maxLength: 500,
  },

  // Disaster and SOS fields
  victimsCount: {
    required: true,
    custom: (value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 10000) {
        return { isValid: false, error: "Count must be between 1 and 10000" };
      }
      return { isValid: true };
    },
  },

  capacity: {
    required: true,
    custom: (value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 100000) {
        return { isValid: false, error: "Capacity must be between 1 and 100000" };
      }
      return { isValid: true };
    },
  },
};

/**
 * Check for SQL injection patterns
 */
export const checkSQLInjection = (text) => {
  const sqlPatterns = [
    "DROP TABLE",
    "DELETE FROM",
    "INSERT INTO",
    "UPDATE ",
    "SELECT * FROM",
    "UNION SELECT",
    "--",
    "/*",
    "*/",
    "xp_",
    "sp_",
  ];

  const upperText = text.toUpperCase();
  return sqlPatterns.some((pattern) => upperText.includes(pattern));
};

/**
 * Check for script injection patterns
 */
export const checkScriptInjection = (text) => {
  const scriptPatterns = [
    "<script",
    "javascript:",
    "onerror=",
    "onclick=",
    "onload=",
    "eval(",
    "alert(",
    "document.cookie",
  ];

  const lowerText = text.toLowerCase();
  return scriptPatterns.some((pattern) => lowerText.includes(pattern));
};

/**
 * Sanitize input by removing dangerous characters
 */
export const sanitizeInput = (input) => {
  if (!input) return "";

  return input
    .replace(/</g, "")
    .replace(/>/g, "")
    .replace(/"/g, "")
    .replace(/'/g, "")
    .replace(/;/g, "")
    .replace(/&/g, "&amp;")
    .trim();
};

/**
 * Validate entire form object
 * Returns object with isValid flag and errors object
 */
export const validateForm = (formData, fieldsRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(fieldsRules).forEach((fieldName) => {
    const result = validateField(fieldName, formData[fieldName], fieldsRules[fieldName]);
    if (!result.isValid) {
      errors[fieldName] = result.error;
      isValid = false;
    }
  });

  return { isValid, errors };
};
