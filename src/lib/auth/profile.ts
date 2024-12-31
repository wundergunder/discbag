import { supabase } from '../supabase';

export async function createProfile(userId: string, email: string) {
  if (!userId || !email?.trim()) {
    return { error: new Error('Invalid profile data') };
  }

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.rpc('ensure_profile_exists', {
        user_id: userId,
        user_email: email.trim().toLowerCase()
      });

      if (!error && data?.success) {
        return { error: null };
      }

      lastError = error || new Error(data?.error || 'Profile creation failed');

      // Don't retry on validation errors
      if (data?.error?.includes('Invalid input parameters')) {
        break;
      }

      // Add exponential backoff delay between retries
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000)));
      }
    } catch (error) {
      lastError = error;
    }
  }

  return { error: lastError };
}