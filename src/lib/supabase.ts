import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string | undefined;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
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
