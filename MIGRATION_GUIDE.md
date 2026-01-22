# 🚀 IronTracker Web → Mobile Migration Guide

This document outlines the migration from the React web app to React Native mobile app.

## ✅ Completed Migration

### 1. Project Foundation
- ✅ Expo TypeScript project created
- ✅ Dependencies installed and configured
- ✅ Project structure established
- ✅ Environment variables configured

### 2. Type Definitions
Migrated from `src/types/Exercise.ts`:
- ✅ `Exercise` interface
- ✅ `ExerciseFormData` interface
- ✅ `Workout` interface

### 3. Service Layer (100% Complete)

#### Supabase Client (`src/lib/supabase.ts`)
- ✅ Adapted for React Native using AsyncStorage
- ✅ Uses Expo Constants for environment variables
- ✅ Session persistence configured

#### Exercise Service (`src/services/exerciseService.ts`)
- ✅ `getExercises()` - Fetch user exercises
- ✅ `getUniqueCategories()` - Get exercise categories
- ✅ `getExerciseNamesByCategory()` - Get names by category
- ✅ `getRecommendedExercises()` - Get 3 least recently used
- ✅ `getProgressionData()` - Get max weight/reps over time
- ✅ `getExerciseUsageData()` - Get usage statistics
- ✅ `hasUserExercises()` - Check if user has data
- ✅ `populateStarterExercisesFromCanonical()` - Seed data
- ✅ `addExercise()` - Create exercise
- ✅ `deleteExercise()` - Remove exercise
- ✅ `updateExercise()` - Modify exercise
- ✅ `getExerciseHistoryByName()` - Get history for exercise
- ✅ `getExerciseHistoryAggregatedByName()` - Get aggregated history
- ✅ `getMostRecentExerciseForWorkout()` - Get latest exercise

#### Workout Service (`src/services/workoutService.ts`)
- ✅ `getActiveWorkout()` - Get current active session
- ✅ `createWorkout()` - Start new workout
- ✅ `finishWorkout()` - End workout
- ✅ `reactivateWorkout()` - Resume workout
- ✅ `getAllWorkouts()` - Fetch all workouts
- ✅ `deleteWorkout()` - Remove workout
- ✅ `getLastCompletedWorkout()` - Get most recent workout

#### Image Service (`src/services/imageService.ts`)
- ✅ `uploadImage()` - Upload with expo-image-picker
- ✅ `getImageUrl()` - Get public URL
- ✅ `deleteImage()` - Remove image
- ✅ `validateImageFile()` - Validate file
- ✅ `uploadVideo()` - Upload video
- ✅ `getVideoUrl()` - Get video URL
- ✅ `deleteVideo()` - Remove video
- ✅ `validateVideoFile()` - Validate video
- ✅ `base64ToBlob()` - Helper for file conversion

#### Vertex AI Service (`src/services/vertexAIService.ts`)
- ✅ `sendMessage()` - Chat with AI
- ✅ `getExerciseRecommendation()` - AI exercise suggestions
- ✅ `getWorkoutPlan()` - AI workout planning
- ✅ `getNutritionAdvice()` - AI nutrition guidance

### 4. Navigation & Routing
- ✅ React Navigation setup
- ✅ Bottom Tab Navigator with 6 tabs
- ✅ Type-safe navigation params
- ✅ Auth flow (Auth screen ↔ Main tabs)

### 5. Authentication
- ✅ AuthScreen with sign in/up
- ✅ Email/password authentication
- ✅ Session management
- ✅ Auth state listener
- ✅ Sign out functionality

### 6. Screens (Basic Structure)
- ✅ AuthScreen - Full implementation
- ✅ HomeScreen - Placeholder
- ✅ AddSetScreen - Placeholder
- ✅ WorkoutsScreen - Placeholder
- ✅ HistoryScreen - Placeholder
- ✅ ProgressionScreen - Placeholder
- ✅ ProfileScreen - Basic implementation

### 7. Theme & Styling
- ✅ Dark theme configured
- ✅ IronTracker color scheme (#f58025 orange)
- ✅ React Native Paper theme customization

---

## 🚧 Remaining Work

### Priority 1: Core Screens

#### Home Screen
**Original:** `src/components/Home.tsx` (257 lines)

**To Implement:**
- [ ] Fetch last completed workout
- [ ] Display workout summary (sets, muscle groups)
- [ ] Show recommended exercises
- [ ] Display "workout active" indicator
- [ ] Add quick stats cards

**API Calls:**
- `workoutService.getLastCompletedWorkout()`
- `exerciseService.getRecommendedExercises()`
- `exerciseService.hasUserExercises()`

#### Exercise Form (Add Set Screen)
**Original:** `src/components/ExerciseForm.tsx` (638 lines)

**To Implement:**
- [ ] Category dropdown/picker
- [ ] Exercise name autocomplete
- [ ] Reps/weight number inputs
- [ ] Rating selector (0-5 stars)
- [ ] Notes text area
- [ ] Image/video upload buttons
- [ ] Training technique toggles (Myorep, Dropset, Restpause)
- [ ] Auto-populate from last exercise
- [ ] Form validation
- [ ] Submit handler

**Components Needed:**
- React Native Paper TextInput
- Picker/Select component
- Star rating component
- Image picker modal
- Toggle buttons

**API Calls:**
- `exerciseService.getUniqueCategories()`
- `exerciseService.getExerciseNamesByCategory()`
- `exerciseService.getMostRecentExerciseForWorkout()`
- `exerciseService.addExercise()`
- `imageService.uploadImage()`
- `imageService.uploadVideo()`

#### Exercise History Screen
**Original:** `src/components/ExerciseList.tsx` (1438 lines - **LARGEST COMPONENT**)

**To Implement:**
- [ ] Grouped list by date
- [ ] Expandable date groups
- [ ] Exercise cards with details
- [ ] Edit inline functionality
- [ ] Delete confirmation
- [ ] Image/video viewer modal
- [ ] Filters (date range, category, name, rating)
- [ ] Search functionality
- [ ] Pull-to-refresh
- [ ] Infinite scroll / pagination

**Components Needed:**
- SectionList or FlatList with grouping
- Filter modal/bottom sheet
- Date range picker
- Image viewer modal
- Video player
- Confirmation dialog

**API Calls:**
- `exerciseService.getExercises()`
- `exerciseService.updateExercise()`
- `exerciseService.deleteExercise()`
- `imageService.getImageUrl()`
- `imageService.getVideoUrl()`
- `imageService.deleteImage()`

### Priority 2: Workout Management

#### Workouts Screen
**Original:** `src/components/WorkoutsList.tsx` (286 lines)

**To Implement:**
- [ ] Active workout card
- [ ] Completed workouts list
- [ ] Resume workout button
- [ ] Delete workout button
- [ ] Workout details (categories, date)
- [ ] Exercise count per workout

**API Calls:**
- `workoutService.getAllWorkouts()`
- `workoutService.reactivateWorkout()`
- `workoutService.deleteWorkout()`

#### Workout Dialog
**Original:** `src/components/WorkoutDialog.tsx` (155 lines)

**To Implement:**
- [ ] Modal/bottom sheet
- [ ] Multi-select category checkboxes
- [ ] Start workout button
- [ ] Cancel button

**Component:**
- Create `src/components/WorkoutDialog.tsx`
- Use React Native Paper Dialog or Modal

**API Calls:**
- `exerciseService.getUniqueCategories()`
- `workoutService.createWorkout()`

### Priority 3: Analytics & Charts

#### Progression Screen
**Original:** `src/components/Progression.tsx` (553 lines)

**To Implement:**
- [ ] Category filter dropdown
- [ ] Exercise filter dropdown
- [ ] Sort options (date, weight, reps, usage)
- [ ] Line chart for weight progression
- [ ] Line chart for reps progression
- [ ] Bar chart for exercise usage
- [ ] Chart data transformation
- [ ] Legend and tooltips

**Libraries:**
- `react-native-chart-kit` - Line and bar charts
- `react-native-svg` - SVG rendering for charts

**API Calls:**
- `exerciseService.getProgressionData()`
- `exerciseService.getExerciseUsageData()`

### Priority 4: Profile & Settings

#### Profile Screen
**Original:** `src/components/Profile.tsx` (242 lines)

**To Implement:**
- [ ] Display user email
- [ ] Edit display name
- [ ] Update email form
- [ ] Change password form
- [ ] Sign out button (already implemented)
- [ ] Delete account option

**API Calls:**
- `supabase.auth.getUser()`
- `supabase.auth.updateUser()`
- Potentially user profile table queries

---

## 🔄 Component Comparison

### Web vs Mobile Component Count

| Screen | Web Component | Lines | Mobile Status |
|--------|---------------|-------|---------------|
| Home | Home.tsx | 257 | Placeholder |
| Add Set | ExerciseForm.tsx | 638 | Placeholder |
| Workouts | WorkoutsList.tsx | 286 | Placeholder |
| History | ExerciseList.tsx | **1438** | Placeholder |
| Progression | Progression.tsx | 553 | Placeholder |
| Profile | Profile.tsx | 242 | Basic |
| Auth | AuthForm.tsx | 399 | ✅ Complete |
| Workout Dialog | WorkoutDialog.tsx | 155 | Not started |

**Total Web Code:** ~3,968 lines
**Total Mobile Code:** ~50 lines (placeholders)
**Completion:** ~1.3%

---

## 📦 Library Replacements Reference

| Web | Mobile | Usage |
|-----|--------|-------|
| Material-UI `TextField` | React Native Paper `TextInput` | Text inputs |
| Material-UI `Select` | `Picker` or custom dropdown | Dropdowns |
| Material-UI `Button` | React Native Paper `Button` | Buttons |
| Material-UI `Rating` | Custom star rating | Ratings |
| Material-UI `Dialog` | React Native Paper `Dialog` or `Modal` | Modals |
| Material-UI `Snackbar` | `react-native-toast-message` | Notifications |
| Material-UI `Tabs` | React Navigation Bottom Tabs | Tab navigation |
| Chart.js `Line` | react-native-chart-kit `LineChart` | Line charts |
| Chart.js `Bar` | react-native-chart-kit `BarChart` | Bar charts |
| Browser File Input | expo-image-picker | Image/video selection |
| `<img>` tag | `<Image>` component | Image display |
| `<video>` tag | expo-av `<Video>` | Video playback |
| MUI DatePicker | @react-native-community/datetimepicker | Date selection |

---

## 🎯 Recommended Implementation Order

1. **Week 1: Core Functionality**
   - [ ] Exercise Form (Add Set screen)
   - [ ] Home screen with workout summary
   - [ ] Basic Workout Dialog

2. **Week 2: Data Display**
   - [ ] Exercise History (simplified version)
   - [ ] Workouts List
   - [ ] Basic filtering

3. **Week 3: Advanced Features**
   - [ ] Image/video upload and viewing
   - [ ] Advanced filtering and search
   - [ ] Exercise History inline editing

4. **Week 4: Analytics & Polish**
   - [ ] Progression charts
   - [ ] Profile management
   - [ ] Performance optimization
   - [ ] Bug fixes and testing

---

## 💡 Tips for Migration

### General Approach
1. Start with one screen at a time
2. Copy the logic from web component
3. Replace Material-UI components with React Native Paper equivalents
4. Test each screen thoroughly before moving on
5. Use the existing services - they're already adapted!

### Common Patterns

#### Forms
**Web:**
```tsx
<TextField
  label="Reps"
  type="number"
  value={reps}
  onChange={(e) => setReps(e.target.value)}
/>
```

**Mobile:**
```tsx
<TextInput
  label="Reps"
  keyboardType="numeric"
  value={reps}
  onChangeText={setReps}
/>
```

#### Dropdowns
**Web:**
```tsx
<Select value={category} onChange={handleChange}>
  {categories.map(cat => <MenuItem value={cat}>{cat}</MenuItem>)}
</Select>
```

**Mobile:**
```tsx
<Picker
  selectedValue={category}
  onValueChange={setCategory}
>
  {categories.map(cat => <Picker.Item key={cat} label={cat} value={cat} />)}
</Picker>
```

#### Lists
**Web:**
```tsx
{exercises.map(exercise => (
  <div key={exercise.id}>{exercise.name}</div>
))}
```

**Mobile:**
```tsx
<FlatList
  data={exercises}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <Text>{item.name}</Text>}
/>
```

---

## 🧪 Testing Checklist

Before considering migration complete:

### Functionality
- [ ] Sign in/sign up works
- [ ] Create workout works
- [ ] Add exercise works
- [ ] View exercise history works
- [ ] Charts display correctly
- [ ] Image upload works
- [ ] Video upload works
- [ ] Edit exercise works
- [ ] Delete exercise works
- [ ] Sign out works

### Performance
- [ ] App loads quickly
- [ ] Lists scroll smoothly
- [ ] Images load efficiently
- [ ] No memory leaks
- [ ] Offline handling (if applicable)

### Cross-Platform
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] UI looks good on different screen sizes
- [ ] Navigation works on both platforms

---

## 📞 Need Help?

Reference these files:
- Original web app: `/Users/jeffreycampbell/Documents/IronTracker`
- Services documentation in each service file
- React Native Paper docs: https://reactnativepaper.com/
- Expo docs: https://docs.expo.dev/

Good luck with the migration! 💪
