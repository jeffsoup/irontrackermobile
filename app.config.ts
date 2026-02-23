import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // Read environment variables - Expo automatically loads .env files with EXPO_PUBLIC_ prefix
  // Make sure to restart the dev server after creating/updating .env file
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  const googleCloudApi = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API || '';

  return {
    ...config,
    name: 'IronTracker',
    slug: 'IronTrackerMobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0a0a0a'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.irontracker.mobile'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0a0a0a'
      },
      package: 'com.irontracker.mobile',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      '@react-native-community/datetimepicker',
      [
        'expo-image-picker',
        {
          photosPermission: 'The app needs access to your photos to upload exercise images.',
          cameraPermission: 'The app needs access to your camera to take exercise photos.'
        }
      ]
    ],
    extra: {
      supabaseUrl,
      supabaseAnonKey,
      googleCloudApi,
    }
  };
};
