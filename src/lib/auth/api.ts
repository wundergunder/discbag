import { AuthResponse } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { SignUpData } from './types';
import { AUTH_ERRORS } from './errors';
import { validateSignUpData } from './validation';
import { AUTH_ROUTES } from './constants';

export async function signUp({ email, password }: SignUpData): Promise<AuthResponse> {
  const validationError = validateSignUpData({ email, password });
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    // First check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim())
      .maybeSingle();

    if (existingUser) {
      throw new Error(AUTH_ERRORS.EMAIL_IN_USE);
    }

    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${AUTH_ROUTES.CALLBACK}`,
        data: { email: email.trim() }
      }
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error(AUTH_ERRORS.NO_USER_DATA);
    }

    // Create profile
    const { error: profileError } = await createProfile(data.user.id, email);
    if (profileError) {
      // Cleanup: Delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(data.user.id);
      throw new Error(AUTH_ERRORS.PROFILE_CREATE_ERROR);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Signup process error:', error);
    throw error;
  }
}

export async function createProfile(userId: string, email: string) {
  if (!userId || !email?.trim()) {
    throw new Error(AUTH_ERRORS.INVALID_PROFILE_DATA);
  }

  // Retry profile creation up to 3 times
  let attempts = 0;
  const maxAttempts = 3;
  let lastError = null;

  while (attempts < maxAttempts) {
    try {
      const { error } = await supabase.rpc('ensure_profile_exists', {
        user_id: userId,
        user_email: email.trim()
      });

      if (!error) {
        return { error: null };
      }

      lastError = error;
    } catch (error) {
      lastError = error;
    }

    attempts++;
    if (attempts < maxAttempts) {
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
    }
  }

  console.error('Profile creation failed after retries:', lastError);
  return { error: lastError };
}