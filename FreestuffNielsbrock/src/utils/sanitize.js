// XSS Protection - Sanitization utilities
// Install: npm install dompurify

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content for safe display
 * Use this when you need to display user-generated HTML
 */
export const sanitizeHTML = (dirty, options = {}) => {
  const config = {
    ALLOWED_TAGS: options.allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br', 'span'],
    ALLOWED_ATTR: options.allowedAttr || [],
    ALLOW_DATA_ATTR: false,
    ...options
  };

  return DOMPurify.sanitize(dirty, config);
};

/**
 * Sanitize text input - removes HTML and dangerous characters
 * Use this for text inputs like titles, names, etc.
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/data:/gi, ''); // Remove data: protocol
};

/**
 * Sanitize for display in React
 * React automatically escapes text, so only use this if you MUST render HTML
 */
export const sanitizeForReact = (content) => {
  return {
    __html: DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    })
  };
};

/**
 * Sanitize URL to prevent XSS attacks
 */
export const sanitizeURL = (url) => {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }

    return parsed.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitize object - recursively sanitize all string values
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Escape HTML entities
 */
export const escapeHTML = (text) => {
  if (!text) return '';

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Validate and sanitize file name
 */
export const sanitizeFileName = (fileName) => {
  if (!fileName) return '';

  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .substring(0, 255); // Limit length
};
