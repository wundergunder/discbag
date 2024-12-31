import { AuthError } from '@supabase/supabase-js';

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_IN_USE: 'This email is already registered',
  WEAK_PASSWORD: 'Password must be at least 6 characters long',
  SERVER_ERROR: 'Unable to create account. Please try again later',
  PROFILE_CREATE_ERROR: 'Unable to complete signup. Please try again',
  NO_USER_DATA: 'Unable to create account',
  INVALID_PROFILE_DATA: 'Invalid profile data',
  UNKNOWN: 'An unexpected error occurred. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
  PERMISSION_DENIED: 'Database permission error. Contact support.',
} as const;

export function getAuthErrorMessage(error: unknown): string {
  if (!error) return AUTH_ERRORS.UNKNOWN;

  if (error instanceof AuthError) {
    switch (error.status) {
      case 400:
        return AUTH_ERRORS.INVALID_CREDENTIALS;
      case 422:
        return AUTH_ERRORS.EMAIL_IN_USE;
      case 500:
        return AUTH_ERRORS.SERVER_ERROR;
      default:
        return error.message || AUTH_ERRORS.UNKNOWN;
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('permission denied')) {
      return AUTH_ERRORS.PERMISSION_DENIED;
    }
    if (error.message.includes('duplicate key')) {
      return AUTH_ERRORS.EMAIL_IN_USE;
    }
    if (error.message.includes('profile')) {
      return AUTH_ERRORS.PROFILE_CREATE_ERROR;
    }
    return error.message;
  }

  return AUTH_ERRORS.UNKNOWN;
}
