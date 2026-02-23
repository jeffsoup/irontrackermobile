import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Menu,
  Portal,
  Dialog,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { exerciseService } from '../services/exerciseService';
import { workoutService } from '../services/workoutService';
import { imageService } from '../services/imageService';
import { ExerciseFormData } from '../types/Exercise';
import Toast from 'react-native-toast-message';
import { getSupabase } from '../lib/supabase';

export default function AddSetScreen() {
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: null,
    category: '',
    reps: 0,
    weight: 0,
    date: new Date().toISOString(),
    rating: null,
    notes: null,
    workout: null,
    image_path: null,
    video_path: null,
    myorep: false,
    dropset: false,
    restpause: false,
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [filteredExerciseNames, setFilteredExerciseNames] = useState<string[]>([]);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [exerciseMenuVisible, setExerciseMenuVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.category) {
      loadExerciseNames(formData.category);
    }
  }, [formData.category]);

  useEffect(() => {
    if (formData.name) {
      const filtered = exerciseNames.filter((name) =>
        name.toLowerCase().includes(formData.name!.toLowerCase())
      );
      setFilteredExerciseNames(filtered);
    } else {
      setFilteredExerciseNames(exerciseNames);
    }
  }, [formData.name, exerciseNames]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesData, activeWorkoutData] = await Promise.all([
        exerciseService.getUniqueCategories(),
        workoutService.getActiveWorkout(),
      ]);

      setCategories(categoriesData);
      setActiveWorkout(activeWorkoutData);

      if (activeWorkoutData) {
        setFormData((prev) => ({ ...prev, workout: activeWorkoutData.id }));
      }

      // Auto-populate from last exercise if available
      if (activeWorkoutData) {
        const lastExercise = await exerciseService.getMostRecentExerciseForWorkout(
          activeWorkoutData.id
        );
        if (lastExercise) {
          setFormData((prev) => ({
            ...prev,
            name: lastExercise.name,
            category: lastExercise.category,
            reps: lastExercise.reps,
            weight: lastExercise.weight,
            rating: lastExercise.rating,
            notes: lastExercise.notes,
            myorep: lastExercise.myorep || false,
            dropset: lastExercise.dropset || false,
            restpause: lastExercise.restpause || false,
          }));
          if (lastExercise.category) {
            loadExerciseNames(lastExercise.category);
          }
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load form data',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExerciseNames = async (category: string) => {
    try {
      const names = await exerciseService.getExerciseNamesByCategory(category);
      setExerciseNames(names);
      setFilteredExerciseNames(names);
    } catch (error) {
      console.error('Error loading exercise names:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image',
      });
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to take photo',
      });
    }
  };

  const handlePickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload videos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedVideo(asset.uri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick video',
      });
    }
  };

  const handleRatingPress = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating: prev.rating === rating ? null : rating,
    }));
  };

  const renderRatingStars = () => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingPress(star)}
            style={styles.starButton}
          >
            <MaterialCommunityIcons
              name={formData.rating && star <= formData.rating ? 'star' : 'star-outline'}
              size={32}
              color={formData.rating && star <= formData.rating ? '#f58025' : '#666'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.category) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a category',
      });
      return;
    }

    if (!formData.name || formData.name.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter an exercise name',
      });
      return;
    }

    if (formData.reps <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid number of reps',
      });
      return;
    }

    try {
      setSubmitting(true);

      // Upload image if selected
      let imagePath = formData.image_path;
      if (selectedImage) {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const asset = {
            uri: selectedImage,
            fileName: `image-${Date.now()}.jpg`,
            mimeType: 'image/jpeg',
          };
          imagePath = await imageService.uploadImage(asset, user.id);
        }
      }

      // Upload video if selected
      let videoPath = formData.video_path;
      if (selectedVideo) {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const asset = {
            uri: selectedVideo,
            fileName: `video-${Date.now()}.mp4`,
            mimeType: 'video/mp4',
          };
          videoPath = await imageService.uploadVideo(asset, user.id);
        }
      }

      // Prepare exercise data
      const exerciseData: ExerciseFormData = {
        ...formData,
        image_path: imagePath,
        video_path: videoPath,
        date: formData.date || new Date().toISOString(),
      };

      await exerciseService.addExercise(exerciseData);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Exercise added successfully!',
      });

      // Reset form
      setFormData({
        name: null,
        category: formData.category, // Keep category
        reps: formData.reps, // Keep reps/weight for quick entry
        weight: formData.weight,
        date: new Date().toISOString(),
        rating: null,
        notes: null,
        workout: activeWorkout?.id || null,
        image_path: null,
        video_path: null,
        myorep: false,
        dropset: false,
        restpause: false,
      });
      setSelectedImage(null);
      setSelectedVideo(null);
    } catch (error) {
      console.error('Error submitting exercise:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add exercise',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f58025" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading form...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Active Workout Banner */}
        {activeWorkout && (
          <Card style={styles.workoutBanner}>
            <Card.Content>
              <View style={styles.workoutBannerContent}>
                <MaterialCommunityIcons name="dumbbell" size={24} color="#f58025" />
                <View style={styles.workoutBannerText}>
                  <Text variant="titleSmall" style={styles.workoutBannerTitle}>
                    Active Workout
                  </Text>
                  <Text variant="bodySmall" style={styles.workoutBannerCategories}>
                    {activeWorkout.categories?.join(', ') || 'No categories'}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Category Selection */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Category *
          </Text>
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <TouchableOpacity
                onPress={() => setCategoryMenuVisible(true)}
                style={styles.pickerButton}
              >
                <Text style={styles.pickerButtonText}>
                  {formData.category || 'Select Category'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#ccc" />
              </TouchableOpacity>
            }
          >
            {categories.map((cat) => (
              <Menu.Item
                key={cat}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, category: cat, name: null }));
                  setCategoryMenuVisible(false);
                }}
                title={cat}
              />
            ))}
          </Menu>
        </View>

        {/* Exercise Name */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Exercise Name *
          </Text>
          <View>
            <TextInput
              label="Enter or select exercise name"
              value={formData.name || ''}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, name: text }));
                if (text && filteredExerciseNames.length > 0) {
                  setExerciseMenuVisible(true);
                } else {
                  setExerciseMenuVisible(false);
                }
              }}
              onFocus={() => {
                if (filteredExerciseNames.length > 0 && formData.name) {
                  setExerciseMenuVisible(true);
                }
              }}
              onBlur={() => {
                // Delay hiding to allow menu item selection
                setTimeout(() => setExerciseMenuVisible(false), 200);
              }}
              style={styles.input}
              mode="outlined"
            />
            {exerciseMenuVisible && filteredExerciseNames.length > 0 && (
              <Card style={styles.suggestionsCard}>
                <Card.Content style={styles.suggestionsContent}>
                  {filteredExerciseNames.slice(0, 8).map((name) => (
                    <TouchableOpacity
                      key={name}
                      onPress={() => {
                        setFormData((prev) => ({ ...prev, name }));
                        setExerciseMenuVisible(false);
                      }}
                      style={styles.suggestionItem}
                    >
                      <Text style={styles.suggestionText}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </Card.Content>
              </Card>
            )}
          </View>
        </View>

        {/* Weight and Reps */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Weight & Reps *
          </Text>
          <View style={styles.row}>
            <TextInput
              label="Weight (kg)"
              value={formData.weight.toString()}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, weight: parseFloat(text) || 0 }))
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              mode="outlined"
            />
            <TextInput
              label="Reps"
              value={formData.reps.toString()}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, reps: parseInt(text) || 0 }))
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              mode="outlined"
            />
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Date
          </Text>
          <TouchableOpacity
            onPress={() => setDatePickerVisible(true)}
            style={styles.pickerButton}
          >
            <Text style={styles.pickerButtonText}>
              {formData.date ? format(new Date(formData.date), 'MMM d, yyyy') : 'Select Date'}
            </Text>
            <MaterialCommunityIcons name="calendar" size={24} color="#ccc" />
          </TouchableOpacity>
          {datePickerVisible && (
            <DateTimePicker
              value={formData.date ? new Date(formData.date) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setDatePickerVisible(false);
                }
                if (selectedDate) {
                  setFormData((prev) => ({ ...prev, date: selectedDate.toISOString() }));
                }
              }}
            />
          )}
          {Platform.OS === 'ios' && datePickerVisible && (
            <View style={styles.datePickerActions}>
              <Button onPress={() => setDatePickerVisible(false)}>Done</Button>
            </View>
          )}
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Rating
          </Text>
          {renderRatingStars()}
        </View>

        {/* Training Techniques */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Training Techniques
          </Text>
          <View style={styles.techniqueContainer}>
            <Chip
              selected={formData.myorep || false}
              onPress={() =>
                setFormData((prev) => ({ ...prev, myorep: !prev.myorep }))
              }
              style={styles.techniqueChip}
              selectedColor="#f58025"
            >
              Myorep
            </Chip>
            <Chip
              selected={formData.dropset || false}
              onPress={() =>
                setFormData((prev) => ({ ...prev, dropset: !prev.dropset }))
              }
              style={styles.techniqueChip}
              selectedColor="#f58025"
            >
              Dropset
            </Chip>
            <Chip
              selected={formData.restpause || false}
              onPress={() =>
                setFormData((prev) => ({ ...prev, restpause: !prev.restpause }))
              }
              style={styles.techniqueChip}
              selectedColor="#f58025"
            >
              Rest-Pause
            </Chip>
          </View>
        </View>

        {/* Media Upload */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Media
          </Text>
          <View style={styles.mediaContainer}>
            <Button
              mode="outlined"
              icon="image"
              onPress={handlePickImage}
              style={styles.mediaButton}
            >
              {selectedImage ? 'Change Image' : 'Add Image'}
            </Button>
            <Button
              mode="outlined"
              icon="camera"
              onPress={handleTakePhoto}
              style={styles.mediaButton}
            >
              Take Photo
            </Button>
            <Button
              mode="outlined"
              icon="video"
              onPress={handlePickVideo}
              style={styles.mediaButton}
            >
              {selectedVideo ? 'Change Video' : 'Add Video'}
            </Button>
          </View>
          {selectedImage && (
            <View style={styles.mediaPreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <Button
                mode="text"
                icon="close"
                onPress={() => setSelectedImage(null)}
                textColor="#ff4444"
              >
                Remove
              </Button>
            </View>
          )}
          {selectedVideo && (
            <View style={styles.mediaPreview}>
              <MaterialCommunityIcons name="video" size={64} color="#f58025" />
              <Text variant="bodySmall" style={styles.videoPreviewText}>
                Video selected
              </Text>
              <Button
                mode="text"
                icon="close"
                onPress={() => setSelectedVideo(null)}
                textColor="#ff4444"
              >
                Remove
              </Button>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Notes
          </Text>
          <TextInput
            label="Add any notes about this exercise"
            value={formData.notes || ''}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
            multiline
            numberOfLines={4}
            style={styles.input}
            mode="outlined"
          />
        </View>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Add Exercise
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    marginTop: 16,
    color: '#ccc',
  },
  workoutBanner: {
    backgroundColor: '#1a1a1a',
    borderLeftWidth: 4,
    borderLeftColor: '#f58025',
    marginBottom: 24,
  },
  workoutBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  workoutBannerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  workoutBannerCategories: {
    color: '#ccc',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 16,
    minHeight: 56,
  },
  pickerButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  techniqueContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techniqueChip: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaButton: {
    flex: 1,
    minWidth: 100,
    borderColor: '#333',
  },
  mediaPreview: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  videoPreviewText: {
    color: '#ccc',
    marginTop: 8,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#f58025',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  suggestionsCard: {
    marginTop: 8,
    backgroundColor: '#1a1a1a',
    maxHeight: 200,
  },
  suggestionsContent: {
    padding: 8,
  },
  suggestionItem: {
    padding: 12,
    borderRadius: 4,
  },
  suggestionText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
