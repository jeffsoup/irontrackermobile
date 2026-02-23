import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  // Try multiple ways to get the config (for compatibility with Expo Go and development builds)
  const supabaseUrl =
    (Constants.expoConfig?.extra?.supabaseUrl as string | undefined) ||
    (Constants.manifest?.extra?.supabaseUrl as string | undefined) ||
    (process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined);

  const supabaseAnonKey =
    (Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined) ||
    (Constants.manifest?.extra?.supabaseAnonKey as string | undefined) ||
    (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration missing:', {
      supabaseUrl: supabaseUrl ? 'present' : 'missing',
      supabaseAnonKey: supabaseAnonKey ? 'present' : 'missing',
      expoConfig: Constants.expoConfig ? 'present' : 'missing',
      manifest: Constants.manifest ? 'present' : 'missing',
      expoConfigExtra: Constants.expoConfig?.extra,
      manifestExtra: Constants.manifest?.extra,
    });
    throw new Error(
      'Missing Supabase environment variables. Please ensure your .env file contains EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, and restart the Expo dev server.'
    );
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

// Backwards-compatible export: a proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    // Delegate all property access to the real client
    return (getSupabase() as any)[prop as keyof SupabaseClient];
  },
}) as SupabaseClient;
