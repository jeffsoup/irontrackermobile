import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  Chip,
  IconButton,
  Dialog,
  Portal,
  Button,
  TextInput,
  Menu,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { exerciseService } from '../services/exerciseService';
import { imageService } from '../services/imageService';
import { Exercise } from '../types/Exercise';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

interface GroupedExercise {
  title: string;
  data: Exercise[];
}

export default function HistoryScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [ratingMenuVisible, setRatingMenuVisible] = useState(false);
  const initializedRef = useRef(false);

  const loadData = async () => {
    try {
      const [exercisesData, categoriesData] = await Promise.all([
        exerciseService.getExercises(),
        exerciseService.getUniqueCategories(),
      ]);
      setExercises(exercisesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load exercise history',
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

  // Filter and group exercises
  const groupedExercises = useMemo(() => {
    let filtered = exercises;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name?.toLowerCase().includes(query) ||
          ex.category.toLowerCase().includes(query) ||
          ex.notes?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((ex) => ex.category === selectedCategory);
    }

    // Apply rating filter
    if (selectedRating !== null) {
      filtered = filtered.filter((ex) => ex.rating === selectedRating);
    }

    // Group by date
    const grouped = new Map<string, Exercise[]>();
    filtered.forEach((exercise) => {
      if (!exercise.date) return;
      const dateKey = format(exercise.date, 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(exercise);
    });

    // Convert to array format for SectionList
    const sections: GroupedExercise[] = Array.from(grouped.entries())
      .sort((a, b) => b[0].localeCompare(a[0])) // Sort dates descending
      .map(([dateKey, exercises]) => {
        const date = parseISO(dateKey);
        let title: string;
        if (isToday(date)) {
          title = 'Today';
        } else if (isYesterday(date)) {
          title = 'Yesterday';
        } else {
          title = format(date, 'EEEE, MMMM d, yyyy');
        }
        return {
          title,
          data: exercises.sort((a, b) => {
            // Sort by category, then name
            if (a.category !== b.category) {
              return a.category.localeCompare(b.category);
            }
            return (a.name || '').localeCompare(b.name || '');
          }),
        };
      });

    return sections;
  }, [exercises, searchQuery, selectedCategory, selectedRating]);

  // Expand all sections by default when they first load
  useEffect(() => {
    if (groupedExercises.length > 0 && !initializedRef.current) {
      const allTitles = new Set(groupedExercises.map((s) => s.title));
      setExpandedSections(allTitles);
      initializedRef.current = true;
    } else if (groupedExercises.length === 0) {
      initializedRef.current = false;
    }
  }, [groupedExercises.length]);

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setEditDialogVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingExercise) return;

    try {
      await exerciseService.updateExercise(editingExercise.id, {
        name: editingExercise.name,
        category: editingExercise.category,
        reps: editingExercise.reps,
        weight: editingExercise.weight,
        rating: editingExercise.rating,
        notes: editingExercise.notes,
        date: editingExercise.date,
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Exercise updated successfully',
      });
      setEditDialogVisible(false);
      setEditingExercise(null);
      loadData();
    } catch (error) {
      console.error('Error updating exercise:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update exercise',
      });
    }
  };

  const handleDelete = (exercise: Exercise) => {
    setExerciseToDelete(exercise);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!exerciseToDelete) return;

    try {
      // Delete image/video if exists
      if (exerciseToDelete.image_path) {
        try {
          await imageService.deleteImage(exerciseToDelete.image_path);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
      if (exerciseToDelete.video_path) {
        try {
          await imageService.deleteVideo(exerciseToDelete.video_path);
        } catch (error) {
          console.error('Error deleting video:', error);
        }
      }

      await exerciseService.deleteExercise(exerciseToDelete.id);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Exercise deleted successfully',
      });
      setDeleteDialogVisible(false);
      setExerciseToDelete(null);
      loadData();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete exercise',
      });
    }
  };

  const renderRatingStars = (rating: number | null) => {
    if (rating === null) return null;
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialCommunityIcons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#f58025' : '#666'}
          />
        ))}
      </View>
    );
  };

  const renderExercise = ({ item }: { item: Exercise }) => {
    const isExpanded = expandedSections.has(
      item.date ? format(item.date, 'EEEE, MMMM d, yyyy') : ''
    );

    return (
      <Card style={styles.exerciseCard}>
        <Card.Content>
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseInfo}>
              <Text variant="titleMedium" style={styles.exerciseName}>
                {item.name || 'Unnamed Exercise'}
              </Text>
              <Chip
                mode="outlined"
                compact
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {item.category}
              </Chip>
            </View>
            <View style={styles.exerciseActions}>
              {item.image_path && (
                <IconButton
                  icon="image"
                  size={20}
                  iconColor="#f58025"
                  onPress={() => {
                    const url = imageService.getImageUrl(item.image_path!);
                    setSelectedImage(url);
                  }}
                />
              )}
              {item.video_path && (
                <IconButton
                  icon="video"
                  size={20}
                  iconColor="#f58025"
                  onPress={() => {
                    const url = imageService.getVideoUrl(item.video_path!);
                    setSelectedImage(url);
                  }}
                />
              )}
              <IconButton
                icon="pencil"
                size={20}
                iconColor="#ccc"
                onPress={() => handleEdit(item)}
              />
              <IconButton
                icon="delete"
                size={20}
                iconColor="#ff4444"
                onPress={() => handleDelete(item)}
              />
            </View>
          </View>

          <View style={styles.exerciseDetails}>
            <View style={styles.exerciseStat}>
              <MaterialCommunityIcons name="weight-kilogram" size={18} color="#ccc" />
              <Text variant="bodyMedium" style={styles.exerciseStatText}>
                {item.weight} kg
              </Text>
            </View>
            <View style={styles.exerciseStat}>
              <MaterialCommunityIcons name="repeat" size={18} color="#ccc" />
              <Text variant="bodyMedium" style={styles.exerciseStatText}>
                {item.reps} reps
              </Text>
            </View>
            {item.rating !== null && (
              <View style={styles.exerciseStat}>
                {renderRatingStars(item.rating)}
              </View>
            )}
          </View>

          {(item.myorep || item.dropset || item.restpause) && (
            <View style={styles.techniqueTags}>
              {item.myorep && (
                <Chip compact style={styles.techniqueChip} textStyle={styles.techniqueChipText}>
                  Myorep
                </Chip>
              )}
              {item.dropset && (
                <Chip compact style={styles.techniqueChip} textStyle={styles.techniqueChipText}>
                  Dropset
                </Chip>
              )}
              {item.restpause && (
                <Chip compact style={styles.techniqueChip} textStyle={styles.techniqueChipText}>
                  Rest-Pause
                </Chip>
              )}
            </View>
          )}

          {item.notes && (
            <Text variant="bodySmall" style={styles.exerciseNotes}>
              {item.notes}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderSectionHeader = ({ section }: { section: GroupedExercise }) => {
    const isExpanded = expandedSections.has(section.title);
    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(section.title)}
      >
        <View style={styles.sectionHeaderContent}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {section.title}
          </Text>
          <Text variant="bodySmall" style={styles.sectionCount}>
            {section.data.length} {section.data.length === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#f58025"
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f58025" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading exercise history...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Search exercises..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
          iconColor="#f58025"
        />
        <View style={styles.filterChips}>
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Chip
                icon="filter"
                onPress={() => setCategoryMenuVisible(true)}
                style={styles.filterChip}
                textStyle={styles.filterChipText}
              >
                {selectedCategory || 'Category'}
              </Chip>
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedCategory(null);
                setCategoryMenuVisible(false);
              }}
              title="All Categories"
            />
            {categories.map((cat) => (
              <Menu.Item
                key={cat}
                onPress={() => {
                  setSelectedCategory(cat);
                  setCategoryMenuVisible(false);
                }}
                title={cat}
              />
            ))}
          </Menu>

          <Menu
            visible={ratingMenuVisible}
            onDismiss={() => setRatingMenuVisible(false)}
            anchor={
              <Chip
                icon="star"
                onPress={() => setRatingMenuVisible(true)}
                style={styles.filterChip}
                textStyle={styles.filterChipText}
              >
                {selectedRating !== null ? `${selectedRating} stars` : 'Rating'}
              </Chip>
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedRating(null);
                setRatingMenuVisible(false);
              }}
              title="All Ratings"
            />
            {[5, 4, 3, 2, 1].map((rating) => (
              <Menu.Item
                key={rating}
                onPress={() => {
                  setSelectedRating(rating);
                  setRatingMenuVisible(false);
                }}
                title={`${rating} ${rating === 1 ? 'star' : 'stars'}`}
              />
            ))}
          </Menu>

          {(selectedCategory || selectedRating !== null) && (
            <Chip
              icon="close"
              onPress={() => {
                setSelectedCategory(null);
                setSelectedRating(null);
              }}
              style={styles.clearFilterChip}
              textStyle={styles.clearFilterChipText}
            >
              Clear
            </Chip>
          )}
        </View>
      </View>

      {/* Exercise List */}
      {groupedExercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="dumbbell" size={64} color="#666" />
          <Text variant="titleLarge" style={styles.emptyText}>
            No exercises found
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            {searchQuery || selectedCategory || selectedRating !== null
              ? 'Try adjusting your filters'
              : 'Start tracking your workouts!'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groupedExercises.filter((section) =>
            expandedSections.has(section.title)
          )}
          keyExtractor={(item) => item.id}
          renderItem={renderExercise}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f58025" />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Image/Video Viewer Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setSelectedImage(null)}
          >
            <MaterialCommunityIcons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* Edit Dialog */}
      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Edit Exercise</Dialog.Title>
          <Dialog.Content>
            {editingExercise && (
              <>
                <TextInput
                  label="Exercise Name"
                  value={editingExercise.name || ''}
                  onChangeText={(text) =>
                    setEditingExercise({ ...editingExercise, name: text })
                  }
                  style={styles.dialogInput}
                />
                <TextInput
                  label="Category"
                  value={editingExercise.category}
                  onChangeText={(text) =>
                    setEditingExercise({ ...editingExercise, category: text })
                  }
                  style={styles.dialogInput}
                />
                <View style={styles.dialogRow}>
                  <TextInput
                    label="Weight (kg)"
                    value={editingExercise.weight.toString()}
                    onChangeText={(text) =>
                      setEditingExercise({
                        ...editingExercise,
                        weight: parseFloat(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                    style={[styles.dialogInput, styles.dialogInputHalf]}
                  />
                  <TextInput
                    label="Reps"
                    value={editingExercise.reps.toString()}
                    onChangeText={(text) =>
                      setEditingExercise({
                        ...editingExercise,
                        reps: parseInt(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                    style={[styles.dialogInput, styles.dialogInputHalf]}
                  />
                </View>
                <TextInput
                  label="Notes"
                  value={editingExercise.notes || ''}
                  onChangeText={(text) =>
                    setEditingExercise({ ...editingExercise, notes: text })
                  }
                  multiline
                  numberOfLines={3}
                  style={styles.dialogInput}
                />
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveEdit}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Exercise</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this exercise? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete} textColor="#ff4444">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
  filtersContainer: {
    padding: 16,
    backgroundColor: '#0a0a0a',
  },
  searchbar: {
    backgroundColor: '#1a1a1a',
    marginBottom: 12,
  },
  searchbarInput: {
    color: '#fff',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#1a1a1a',
  },
  filterChipText: {
    color: '#fff',
  },
  clearFilterChip: {
    backgroundColor: '#2a2a2a',
  },
  clearFilterChipText: {
    color: '#f58025',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  sectionHeaderContent: {
    flex: 1,
  },
  sectionTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  sectionCount: {
    color: '#ccc',
    marginTop: 4,
  },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    marginBottom: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseName: {
    color: '#ffffff',
    flex: 1,
  },
  categoryChip: {
    backgroundColor: '#2a2a2a',
    borderColor: '#f58025',
  },
  categoryChipText: {
    color: '#f58025',
    fontSize: 12,
  },
  exerciseActions: {
    flexDirection: 'row',
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  exerciseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseStatText: {
    color: '#ccc',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  techniqueTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  techniqueChip: {
    backgroundColor: '#2a2a2a',
  },
  techniqueChipText: {
    color: '#f58025',
    fontSize: 11,
  },
  exerciseNotes: {
    color: '#ccc',
    marginTop: 8,
    fontStyle: 'italic',
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#ccc',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: '#1a1a1a',
  },
  dialogRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogInputHalf: {
    flex: 1,
  },
});
