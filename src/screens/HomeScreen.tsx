import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { workoutService } from '../services/workoutService';
import { exerciseService } from '../services/exerciseService';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../navigation/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

interface LastWorkoutExercise {
  name: string;
  category: string;
  reps: number;
  weight: number;
  notes: string | null;
  categories: string[];
  is_active: boolean;
}

interface RecommendedExercise {
  name: string;
  lastUsed: Date;
}

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastWorkout, setLastWorkout] = useState<LastWorkoutExercise[]>([]);
  const [recommendations, setRecommendations] = useState<Map<string, RecommendedExercise[]>>(new Map());
  const [workoutCount, setWorkoutCount] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);

  const loadData = async () => {
    try {
      // Load last completed workout
      const lastWorkoutData = await workoutService.getLastCompletedWorkout();
      setLastWorkout(lastWorkoutData);

      // Load active workout
      const active = await workoutService.getActiveWorkout();
      setActiveWorkout(active);

      // Load workout count
      const allWorkouts = await workoutService.getAllWorkouts();
      setWorkoutCount(allWorkouts.length);

      // Load exercise count
      const allExercises = await exerciseService.getExercises();
      setExerciseCount(allExercises.length);

      // Load recommendations by category
      const categories = await exerciseService.getUniqueCategories();
      const recommendationsMap = new Map<string, RecommendedExercise[]>();

      for (const category of categories.slice(0, 3)) {
        // Get top 3 categories
        const categoryRecommendations = await exerciseService.getRecommendedExercises(category);
        if (categoryRecommendations.length > 0) {
          recommendationsMap.set(category, categoryRecommendations);
        }
      }

      setRecommendations(recommendationsMap);
    } catch (error) {
      console.error('Error loading home data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load dashboard data',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f58025" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  const lastWorkoutDate = lastWorkout.length > 0 && lastWorkout[0].categories
    ? 'Recent'
    : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f58025" />
      }
    >
      <View style={styles.content}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.welcomeText}>
            Welcome Back! 💪
          </Text>
          {activeWorkout && (
            <Card style={styles.activeWorkoutCard}>
              <Card.Content>
                <View style={styles.activeWorkoutHeader}>
                  <MaterialCommunityIcons name="dumbbell" size={24} color="#f58025" />
                  <Text variant="titleMedium" style={styles.activeWorkoutText}>
                    Active Workout
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.activeWorkoutCategories}>
                  {activeWorkout.categories?.join(', ') || 'No categories'}
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="dumbbell" size={32} color="#f58025" />
              <Text variant="headlineMedium" style={styles.statNumber}>
                {workoutCount}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Workouts
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="weight-lifter" size={32} color="#f58025" />
              <Text variant="headlineMedium" style={styles.statNumber}>
                {exerciseCount}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Exercises
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Last Workout Section */}
        {lastWorkout.length > 0 ? (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="history" size={24} color="#f58025" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Last Workout
                </Text>
              </View>
              {lastWorkout[0].categories && lastWorkout[0].categories.length > 0 && (
                <Text variant="bodySmall" style={styles.workoutDate}>
                  Categories: {lastWorkout[0].categories.join(', ')}
                </Text>
              )}
              <Divider style={styles.divider} />
              {lastWorkout.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <View style={styles.exerciseHeader}>
                    <Text variant="titleMedium" style={styles.exerciseName}>
                      {exercise.name}
                    </Text>
                    <Text variant="bodySmall" style={styles.exerciseCategory}>
                      {exercise.category}
                    </Text>
                  </View>
                  <View style={styles.exerciseDetails}>
                    <View style={styles.exerciseStat}>
                      <MaterialCommunityIcons name="weight-kilogram" size={16} color="#ccc" />
                      <Text variant="bodyMedium" style={styles.exerciseStatText}>
                        {exercise.weight} kg
                      </Text>
                    </View>
                    <View style={styles.exerciseStat}>
                      <MaterialCommunityIcons name="repeat" size={16} color="#ccc" />
                      <Text variant="bodyMedium" style={styles.exerciseStatText}>
                        {exercise.reps} reps
                      </Text>
                    </View>
                  </View>
                  {exercise.notes && (
                    <Text variant="bodySmall" style={styles.exerciseNotes}>
                      {exercise.notes}
                    </Text>
                  )}
                  {index < lastWorkout.length - 1 && <Divider style={styles.exerciseDivider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="history" size={24} color="#f58025" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Last Workout
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.emptyText}>
                No workouts yet. Start your first workout!
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Exercise Recommendations */}
        {recommendations.size > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="lightbulb-on" size={24} color="#f58025" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Recommended Exercises
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.recommendationsSubtitle}>
                Exercises you haven't done in a while
              </Text>
              <Divider style={styles.divider} />
              {Array.from(recommendations.entries()).map(([category, exercises]) => (
                <View key={category} style={styles.recommendationCategory}>
                  <Text variant="titleMedium" style={styles.recommendationCategoryTitle}>
                    {category}
                  </Text>
                  {exercises.map((exercise, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color="#f58025"
                        style={styles.recommendationIcon}
                      />
                      <View style={styles.recommendationContent}>
                        <Text variant="bodyLarge" style={styles.recommendationName}>
                          {exercise.name}
                        </Text>
                        <Text variant="bodySmall" style={styles.recommendationDate}>
                          Last done:{' '}
                          {formatDistanceToNow(exercise.lastUsed, { addSuffix: true })}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            icon="plus-circle"
            style={styles.quickActionButton}
            contentStyle={styles.quickActionContent}
            labelStyle={styles.quickActionLabel}
            onPress={() => navigation.navigate('AddSet')}
          >
            Add Exercise
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
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
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activeWorkoutCard: {
    backgroundColor: '#1a1a1a',
    borderLeftWidth: 4,
    borderLeftColor: '#f58025',
  },
  activeWorkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeWorkoutText: {
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  activeWorkoutCategories: {
    color: '#ccc',
    marginLeft: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#ccc',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  workoutDate: {
    color: '#ccc',
    marginTop: 4,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#333',
  },
  exerciseItem: {
    marginVertical: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    color: '#ffffff',
    flex: 1,
  },
  exerciseCategory: {
    color: '#f58025',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  exerciseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseStatText: {
    color: '#ccc',
  },
  exerciseNotes: {
    color: '#ccc',
    marginTop: 8,
    fontStyle: 'italic',
  },
  exerciseDivider: {
    marginTop: 12,
    backgroundColor: '#333',
  },
  emptyText: {
    color: '#ccc',
    textAlign: 'center',
    marginVertical: 16,
  },
  recommendationsSubtitle: {
    color: '#ccc',
    marginTop: 4,
    marginBottom: 8,
  },
  recommendationCategory: {
    marginTop: 16,
  },
  recommendationCategoryTitle: {
    color: '#f58025',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingLeft: 8,
  },
  recommendationIcon: {
    marginRight: 8,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationName: {
    color: '#ffffff',
  },
  recommendationDate: {
    color: '#ccc',
    marginTop: 2,
  },
  quickActions: {
    marginTop: 8,
    marginBottom: 24,
  },
  quickActionButton: {
    backgroundColor: '#f58025',
  },
  quickActionContent: {
    paddingVertical: 8,
  },
  quickActionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
