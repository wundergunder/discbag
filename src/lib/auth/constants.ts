export const AUTH_ROUTES = {
  CALLBACK: '/auth/callback',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard'
} as const;

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 6
} as const;

export const PROFILE_DEFAULTS = {
  VISIBILITY: 'private',
  MAX_USERNAME_ATTEMPTS: 100,
  MAX_RETRIES: 3
} as const;