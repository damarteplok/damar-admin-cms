/**
 * Application Constants
 */

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/query';
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Damar Admin CMS',
  APP_DESCRIPTION: 'Modern Admin CMS Platform',
  APP_VERSION: '1.0.0',
  DEFAULT_LOCALE: 'id',
  SUPPORTED_LOCALES: ['id', 'en'],
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
} as const;

// UI Constants
export const UI = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_BLOG: '/admin/blog',
  ADMIN_USERS: '/admin/users',
  BLOG: '/blog',
  PRICING: '/pricing',
  CONTACT: '/contact',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;
