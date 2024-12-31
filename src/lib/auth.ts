import { AuthError, AuthResponse } from '@supabase/supabase-js';
import { supabase } from './supabase';

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });
}

export async function createProfile(userId: string, email: string) {
  return supabase.rpc('ensure_profile_exists', {
    user_id: userId,
    user_email: email
  });
}

export function formatAuthError(error: AuthError | Error | unknown): string {
  if (!error) return 'An unknown error occurred';
  
  if (error instanceof AuthError) {
    switch (error.status) {
      case 400:
        return 'Invalid email or password';
      case 422:
        return 'Email already registered';
      case 500:
        return 'Unable to create account. Please try again later.';
      default:
        return error.message;
    }
  }
  
  return error instanceof Error ? error.message : 'An unexpected error occurred';
}