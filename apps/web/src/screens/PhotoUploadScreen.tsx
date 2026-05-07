import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { ClothingAnalysisResult } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

interface PhotoUploadScreenProps {
  onNext: (result: ClothingAnalysisResult) => void;
}

const PHOTO_TYPES = [
  { index: 1, name: 'Front Flat Lay', description: 'Full front view of the item' },
  { index: 2, name: 'Back Flat Lay', description: 'Back view and details' },
  { index: 3, name: 'Brand/Label Tag', description: 'Clear photo of the brand label' },
  { index: 4, name: 'Size Tag', description: 'Size information' },
  { index: 5, name: 'Care/Fabric Label', description: 'Material and care instructions' },
  { index: 6, name: 'Flaws (Optional)', description: 'Any damage or stains' },
];

export const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({ onNext }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? 'image/jpeg';
      const dataUri = `data:${mimeType};base64,${asset.base64}`;
      const newPhotos = [...photos];
      newPhotos[index] = dataUri;
      setPhotos(newPhotos);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const validPhotos = photos.filter(Boolean);
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: validPhotos }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error((data as { error?: string }).error ?? 'Analysis failed');
      }
      onNext(data as ClothingAnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canProceed = photos.filter(Boolean).length >= 5;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Upload Clothing Photos</Text>
        <Text style={styles.sectionDescription}>
          Upload up to 6 photos. The first 5 are required, the 6th (flaws) is optional.
        </Text>

        {PHOTO_TYPES.map((photoType) => (
          <View key={photoType.index} style={styles.photoCard}>
            <View style={styles.photoInfo}>
              <Text style={styles.photoName}>
                {photoType.index}. {photoType.name}
              </Text>
              <Text style={styles.photoDescription}>{photoType.description}</Text>
            </View>

            {photos[photoType.index - 1] ? (
              <View style={styles.photoPreviewContainer}>
                <Image
                  source={{ uri: photos[photoType.index - 1] }}
                  style={styles.photoPreview}
                />
                <Button
                  title="Change"
                  onPress={() => pickImage(photoType.index - 1)}
                  color="#007AFF"
                />
              </View>
            ) : (
              <Button
                title={photoType.index === 6 ? 'Add (Optional)' : 'Upload'}
                onPress={() => pickImage(photoType.index - 1)}
                color={photoType.index === 6 ? '#999' : '#007AFF'}
              />
            )}
          </View>
        ))}

        <View style={styles.progress}>
          <Text style={styles.progressText}>
            {photos.filter(Boolean).length} / 6 photos uploaded
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isAnalyzing ? (
          <View style={styles.analyzingBox}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.analyzingText}>Analyzing with Claude AI…</Text>
          </View>
        ) : (
          <Button
            title="Continue to AI Analysis"
            onPress={handleAnalyze}
            disabled={!canProceed}
            color={canProceed ? '#007AFF' : '#ccc'}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  photoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  photoInfo: {
    marginBottom: 12,
  },
  photoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  photoDescription: {
    fontSize: 13,
    color: '#999',
  },
  photoPreviewContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 8,
  },
  progress: {
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
    padding: 12,
    marginVertical: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
  },
  analyzingBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  analyzingText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
});
