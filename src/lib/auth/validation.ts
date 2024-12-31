import { PASSWORD_REQUIREMENTS } from './constants';
import { SignUpData } from './types';

export function validateSignUpData({ email, password }: SignUpData): string | null {
  if (!email?.trim()) {
    return 'Email is required';
  }

  if (!password) {
    return 'Password is required';
  }

  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`;
  }

  return null;
}