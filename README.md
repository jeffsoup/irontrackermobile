# 💪 IronTracker Mobile

A React Native mobile application for tracking workouts, exercises, and fitness progress. Built with Expo, TypeScript, and Supabase.

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)
![Expo](https://img.shields.io/badge/Expo-54.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.90.1-green)

## ✨ Features

### Implemented ✅
- **Authentication** - Email/password sign in and sign up with Supabase Auth
- **Bottom Tab Navigation** - 6 main screens (Home, Add Set, Workouts, History, Progression, Profile)
- **Dark Theme** - Fitness-themed dark UI with orange accents (#f58025)
- **Service Layer** - Complete migration of all services:
  - Exercise Service (CRUD operations, recommendations, progression data)
  - Workout Service (create, finish, reactivate workouts)
  - Image Service (upload/download with Expo Image Picker)
  - Vertex AI Service (AI-powered fitness recommendations)
- **Type Safety** - Full TypeScript implementation
- **Supabase Integration** - Database, authentication, and storage

### To Be Implemented 🚧
- **Home Screen** - Dashboard with last workout and recommendations
- **Exercise Form** - Add/log exercises with image/video upload
- **Exercise List** - History with filtering and grouping
- **Workout Management** - Create, view, and manage workouts
- **Progression Charts** - Weight/rep progression with react-native-chart-kit
- **Profile Management** - User settings and account management

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account and project
- iOS Simulator (macOS) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   cd /Users/jeffreycampbell/Documents/IronTrackerMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GOOGLE_CLOUD_API=your_google_cloud_api_key
   ```

4. **Run the app**

   Start the Expo development server:
   ```bash
   npm start
   ```

   Then choose your platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## 📁 Project Structure

```
IronTrackerMobile/
├── App.tsx                      # Main application entry point
├── app.config.ts                # Expo configuration with env variables
├── src/
│   ├── components/              # Reusable React components (to be created)
│   ├── lib/
│   │   └── supabase.ts          # Supabase client configuration
│   ├── navigation/
│   │   ├── MainTabNavigator.tsx # Bottom tab navigation
│   │   └── types.ts             # Navigation type definitions
│   ├── screens/                 # Screen components
│   │   ├── AuthScreen.tsx       # Sign in/up screen ✅
│   │   ├── HomeScreen.tsx       # Dashboard (placeholder)
│   │   ├── AddSetScreen.tsx     # Exercise form (placeholder)
│   │   ├── WorkoutsScreen.tsx   # Workout list (placeholder)
│   │   ├── HistoryScreen.tsx    # Exercise history (placeholder)
│   │   ├── ProgressionScreen.tsx# Charts (placeholder)
│   │   └── ProfileScreen.tsx    # User profile (placeholder)
│   ├── services/                # API and business logic
│   │   ├── exerciseService.ts   # Exercise CRUD operations ✅
│   │   ├── workoutService.ts    # Workout management ✅
│   │   ├── imageService.ts      # Media upload/download ✅
│   │   └── vertexAIService.ts   # AI fitness assistant ✅
│   └── types/
│       └── Exercise.ts          # TypeScript type definitions ✅
├── assets/                      # Images, fonts, icons
└── package.json                 # Dependencies and scripts
```

## 🛠️ Tech Stack

### Core
- **React Native** - Mobile framework
- **Expo** - Development platform and tooling
- **TypeScript** - Type safety and developer experience

### UI/UX
- **React Native Paper** - Material Design components
- **React Navigation** - Navigation and routing
- **react-native-chart-kit** - Charts and data visualization
- **react-native-toast-message** - Toast notifications

### Backend & Services
- **Supabase** - Database, authentication, and storage
- **@supabase/supabase-js** - Supabase client SDK
- **AsyncStorage** - Local data persistence

### Utilities
- **date-fns** - Date formatting and manipulation
- **uuid** - UUID generation
- **expo-image-picker** - Image/video selection
- **expo-file-system** - File operations

## 🎨 Design System

### Color Palette
- **Primary**: `#f58025` (Orange) - Main brand color
- **Background**: `#0a0a0a` (Dark Black) - Main background
- **Surface**: `#1a1a1a` (Lighter Black) - Cards and surfaces
- **Text**: `#ffffff` (White) - Primary text
- **Secondary Text**: `#ccc` (Light Gray)

### Typography
Using React Native Paper's Material Design typography:
- `headlineLarge` - Main headings
- `headlineMedium` - Section headings
- `bodyLarge` - Large body text
- `bodyMedium` - Standard body text

## 🔐 Authentication

The app uses Supabase Auth with:
- Email/password authentication
- Session persistence via AsyncStorage
- Automatic session refresh
- Auth state listener for real-time updates

Users must sign in to access the main app. The auth flow is handled in `App.tsx` with conditional rendering based on auth state.

## 📊 Database Schema

The app uses the same Supabase database as the web version:

### Tables
- `exercises` - Exercise logs with sets, reps, weight, notes
- `workouts` - Workout sessions with categories
- `categories` - Exercise categories (view)
- `exercises_canonical` - Template exercises for new users
- `progression_max` - Max weight per exercise (view)
- `exercise_usage` - Exercise frequency stats (view)

### Supabase Storage
- Bucket: `workout-images` (PUBLIC)
- Structure: `{userId}/{filename}` for images
- Structure: `{userId}/videos/{filename}` for videos

## 🚧 Migration Status

### Completed ✅
1. ✅ Project setup with Expo TypeScript template
2. ✅ Dependencies installed (navigation, UI, charts, Supabase)
3. ✅ Type definitions migrated
4. ✅ Service layer fully migrated
5. ✅ Environment configuration with app.config.ts
6. ✅ React Navigation setup with bottom tabs
7. ✅ Authentication screen with sign in/up
8. ✅ Main app structure with auth flow
9. ✅ Dark theme configuration

### In Progress 🚧
10. 🚧 Screen implementations (placeholders created)
11. 🚧 Component migrations
12. 🚧 Chart integration
13. 🚧 Testing on iOS/Android

### Key Differences from Web Version

| Feature | Web (Vite) | Mobile (Expo) |
|---------|-----------|---------------|
| Build Tool | Vite | Metro Bundler |
| UI Framework | Material-UI | React Native Paper |
| Navigation | React Router DOM | React Navigation |
| Charts | Chart.js | react-native-chart-kit |
| Storage | Browser localStorage | AsyncStorage |
| Image Upload | File input | expo-image-picker |
| Analytics | Vercel Analytics | (Not migrated) |

## 📱 Running on Devices

### iOS (macOS only)
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web (for testing)
```bash
npm run web
```

## 🧪 Next Steps

To complete the migration:

1. **Implement Home Screen**
   - Fetch last workout from workoutService
   - Display exercise recommendations
   - Show workout stats

2. **Implement Exercise Form**
   - Create form with React Native Paper inputs
   - Integrate expo-image-picker for photos/videos
   - Connect to exerciseService.addExercise()

3. **Implement Exercise History**
   - List exercises grouped by date
   - Add filtering and search
   - Connect to exerciseService.getExercises()

4. **Implement Progression Charts**
   - Use react-native-chart-kit for Line charts
   - Connect to exerciseService.getProgressionData()
   - Add category and exercise filters

5. **Implement Workout Management**
   - Create workout dialog with category selection
   - Display active/completed workouts
   - Connect to workoutService methods

6. **Test on Physical Devices**
   - Build with `expo build`
   - Test on iOS and Android devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo** for the amazing mobile development platform
- **React Native Paper** for Material Design components
- **Supabase** for backend infrastructure
- **Original IronTracker Web App** for the foundation

---

**Built with 💪 for fitness enthusiasts on the go**
