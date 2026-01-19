// Input validation utilities

export const validators = {
  email: (value) => {
    if (!value || value.trim().length === 0) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  title: (value) => {
    if (!value || value.trim().length === 0) {
      return 'Title is required';
    }
    if (value.length > 100) {
      return 'Title must be less than 100 characters';
    }
    // Check for potentially malicious content
    if (/<script|javascript:/i.test(value)) {
      return 'Invalid characters in title';
    }
    return null;
  },

  description: (value) => {
    if (!value || value.trim().length === 0) {
      return 'Description is required';
    }
    if (value.length > 2000) {
      return 'Description must be less than 2000 characters';
    }
    // Check for potentially malicious content
    if (/<script|javascript:/i.test(value)) {
      return 'Invalid characters in description';
    }
    return null;
  },

  price: (value) => {
    if (value === '' || value === null || value === undefined) {
      return 'Price is required';
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Price must be a number';
    }
    if (num < 0) {
      return 'Price cannot be negative';
    }
    if (num > 100000) {
      return 'Price seems unreasonably high';
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null; // Optional field
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number';
    }
    if (value.replace(/\D/g, '').length < 8) {
      return 'Phone number is too short';
    }
    return null;
  },

  imageUrl: (value) => {
    if (!value) return null; // Optional field
    try {
      const url = new URL(value);
      if (!url.protocol.startsWith('https')) {
        return 'Image URL must use HTTPS';
      }
      // Check for valid image extensions
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasValidExtension = validExtensions.some(ext => 
        url.pathname.toLowerCase().endsWith(ext)
      );
      if (!hasValidExtension) {
        return 'URL must point to a valid image file';
      }
      return null;
    } catch {
      return 'Invalid URL';
    }
  },

  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return `${fieldName} is required`;
    }
    return null;
  },

  minLength: (value, min, fieldName = 'This field') => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value, max, fieldName = 'This field') => {
    if (value && value.length > max) {
      return `${fieldName} must be less than ${max} characters`;
    }
    return null;
  }
};

// Validate entire form
export const validateForm = (formData, fields) => {
  const errors = {};
  
  fields.forEach(field => {
    const validator = validators[field.name] || validators[field.type];
    if (validator) {
      const error = validator(formData[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    }
    
    // Apply custom validators if provided
    if (field.customValidator) {
      const error = field.customValidator(formData[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitize input - removes potentially dangerous characters
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

// Validate file upload
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size must be less than ${maxSize / 1024 / 1024}MB` 
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only images are allowed.' 
    };
  }

  return { valid: true, error: null };
};