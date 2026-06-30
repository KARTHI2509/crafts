/**
 * ============================================
 * SECURITY MIDDLEWARE - HARDENING PORT
 * ============================================
 */

import { check } from 'express-validator';

// Cookie parser utility
const parseCookies = (cookieHeader) => {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts.shift().trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
};

/**
 * Validate Environment Variables
 */
export const validateEnv = () => {
  const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
  const missing = requiredEnv.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.error('✗ CRITICAL CONFIGURATION ERROR: Missing environment variables:');
    missing.forEach(env => console.error(`  - ${env}`));
    console.error('Exiting process...');
    process.exit(1);
  }
  console.log('✓ Environment configuration is valid');
};

/**
 * Anti NoSQL Injection Sanitizer
 * Strips keys containing Mongo operator tokens (starting with $)
 */
export const preventNoSQLInjection = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj instanceof Object) {
      for (const k in obj) {
        if (k.startsWith('$')) {
          console.warn(`[Security Alert] Stripped NoSQL operator key: ${k}`);
          delete obj[k];
        } else {
          sanitize(obj[k]);
        }
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

/**
 * XSS Clean Sanitizer
 * Recursively cleans script and HTML events tags from inputs
 */
export const preventXSS = (req, res, next) => {
  const cleanString = (val) => {
    if (typeof val !== 'string') return val;
    // Strip <script>, <iframe>, javascript: and onload/onerror attributes
    return val
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, '')
      .replace(/href=["']\s*javascript:[^"']*["']/gi, '')
      .replace(/\bon[a-z]+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/<\/?[^>]+(>|$)/g, ''); // strip all html tags
  };

  const sanitize = (obj) => {
    if (obj instanceof Object) {
      for (const k in obj) {
        if (typeof obj[k] === 'string') {
          obj[k] = cleanString(obj[k]);
        } else {
          sanitize(obj[k]);
        }
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

/**
 * CSRF Double Submit Cookie Protection
 */
export const csrfProtect = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  
  // Safe requests: Generate token cookie if not present
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!cookies['XSRF-TOKEN']) {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      // SameSite Strict, Secure cookie (if production)
      res.cookie('XSRF-TOKEN', token, {
        httpOnly: false, // Read on frontend to append header
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/'
      });
    }
    return next();
  }

  // Mutating requests: Check token match
  const csrfCookie = cookies['XSRF-TOKEN'];
  const csrfHeader = req.headers['x-xsrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    console.warn(`[Security Alert] CSRF token mismatch or missing. Cookie: ${!!csrfCookie}, Header: ${!!csrfHeader}`);
    return res.status(403).json({
      success: false,
      message: 'Security check failed: CSRF Token missing or mismatch.'
    });
  }
  
  next();
};
