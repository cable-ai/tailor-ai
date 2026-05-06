import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface PhotoUploadScreenProps {
  onNext: () => void;
}

export const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({ onNext }) => {
  const [photos, setPhotos] = useState<string[]>([]);

  const photoTypes = [
    { index: 1, name: 'Front Flat Lay', description: 'Full front view of the item' },
    { index: 2, name: 'Back Flat Lay', description: 'Back view and details' },
    { index: 3, name: 'Brand/Label Tag', description: 'Clear photo of the brand label' },
    { index: 4, name: 'Size Tag', description: 'Size information' },
    { index: 5, name: 'Care/Fabric Label', description: 'Material and care instructions' },
    { index: 6, name: 'Flaws (Optional)', description: 'Any damage or stains' },
  ];

  const pickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...photos];
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  const canProceed = photos.filter((p) => p).length >= 5; // At least 5 photos (optional 6th)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Upload Clothing Photos</Text>
        <Text style={styles.sectionDescription}>
          Upload up to 6 photos. The first 5 are required, the 6th (flaws) is optional.
        </Text>

        {photoTypes.map((photoType) => (
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
            {photos.filter((p) => p).length} / 6 photos uploaded
          </Text>
        </View>

        <Button
          title="Continue to AI Analysis"
          onPress={onNext}
          disabled={!canProceed}
          color={canProceed ? '#007AFF' : '#ccc'}
        />
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
});
