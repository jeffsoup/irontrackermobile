import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';

/**
 * Image Service for Supabase Storage - React Native Version
 *
 * SECURITY NOTE: The bucket is PUBLIC for reading (to enable public URLs),
 * but all WRITE operations (INSERT/DELETE) are protected by RLS policies:
 * - Users can ONLY upload to folders matching their userId
 * - Users can ONLY delete images from their own folder
 * - All operations require authentication
 */

interface ImageAsset {
  uri: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}

export const imageService = {
  /**
   * Upload an image to Supabase Storage from React Native
   * @param imageAsset - The image asset from expo-image-picker
   * @param userId - The ID of the user uploading the file
   * @returns The path to the uploaded file
   */
  async uploadImage(imageAsset: ImageAsset, userId: string): Promise<string> {
    // Generate a unique filename to avoid collisions
    const fileExt = imageAsset.fileName?.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(imageAsset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to blob
    const blob = this.base64ToBlob(base64, imageAsset.mimeType || 'image/jpeg');

    const { error } = await supabase.storage
      .from('workout-images')
      .upload(filePath, blob, {
        contentType: imageAsset.mimeType || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    return filePath;
  },

  /**
   * Get the public URL for an image
   * @param path - The path to the image in storage
   * @returns The public URL of the image
   */
  getImageUrl(path: string): string {
    const { data } = supabase.storage
      .from('workout-images')
      .getPublicUrl(path);

    return data.publicUrl;
  },

  /**
   * Delete an image from Supabase Storage
   * @param path - The path to the image to delete
   */
  async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('workout-images')
      .remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  /**
   * Validate that a file is an image and meets size requirements
   * @param imageAsset - The image asset to validate
   * @returns True if valid, throws error if not
   */
  validateImageFile(imageAsset: ImageAsset): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (imageAsset.mimeType && !allowedTypes.includes(imageAsset.mimeType)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
    }

    if (imageAsset.fileSize && imageAsset.fileSize > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    return true;
  },

  /**
   * Upload a video to Supabase Storage
   */
  async uploadVideo(videoAsset: ImageAsset, userId: string): Promise<string> {
    const fileExt = videoAsset.fileName?.split('.').pop() || 'mp4';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/videos/${fileName}`;

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(videoAsset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to blob
    const blob = this.base64ToBlob(base64, videoAsset.mimeType || 'video/mp4');

    const { error } = await supabase.storage
      .from('workout-images')
      .upload(filePath, blob, {
        contentType: videoAsset.mimeType || 'video/mp4',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading video:', error);
      throw error;
    }

    return filePath;
  },

  /**
   * Get video public URL
   */
  getVideoUrl(path: string): string {
    const { data } = supabase.storage
      .from('workout-images')
      .getPublicUrl(path);

    return data.publicUrl;
  },

  /**
   * Delete video
   */
  async deleteVideo(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('workout-images')
      .remove([path]);

    if (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },

  validateVideoFile(videoAsset: ImageAsset): boolean {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-matroska'];

    if (videoAsset.mimeType && !allowedTypes.includes(videoAsset.mimeType)) {
      throw new Error('Invalid file type. Please upload an MP4, WebM, MOV, OGG, or MKV video.');
    }

    if (videoAsset.fileSize && videoAsset.fileSize > maxSize) {
      throw new Error('Video size too large. Maximum size is 50MB.');
    }

    return true;
  },

  /**
   * Helper function to convert base64 to Blob
   */
  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  }
};
