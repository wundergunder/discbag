import { AuthResponse } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { SignUpData } from './types';
import { validateSignUpData } from './validation';
import { AUTH_ROUTES } from './constants';
import { AUTH_ERRORS } from './errors';

export async function signUp({ email, password }: SignUpData): Promise<AuthResponse> {
  const validationError = validateSignUpData({ email, password });
  if (validationError) {
    throw new Error(validationError);
  }

  const trimmedEmail = email.trim().toLowerCase();

  try {
    console.log('Attempting to sign up user in Supabase Auth...');
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${AUTH_ROUTES.CALLBACK}`,
        data: { email: trimmedEmail },
      },
    });

    if (signUpError) {
      console.error('Auth sign-up error:', signUpError);
      throw signUpError;
    }

    if (!data.user) {
      throw new Error(AUTH_ERRORS.NO_USER_DATA);
    }

    console.log('User created in Supabase Auth. Ensuring profile exists...');
    const { error: profileError } = await supabase.rpc('ensure_profile_exists', {
      user_id: data.user.id,
      user_email: trimmedEmail,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error(AUTH_ERRORS.PROFILE_CREATE_ERROR);
    }

    console.log('User sign-up and profile creation successful.');
    return { data, error: null };
  } catch (error) {
    console.error('Signup process error:', error);

    // Clean up auth user if signup fails
    if (error instanceof Error && error.message.includes(AUTH_ERRORS.PROFILE_CREATE_ERROR)) {
      console.log('Cleaning up incomplete user...');
      await supabase.auth.signOut();
    }

    throw error;
  }
}
