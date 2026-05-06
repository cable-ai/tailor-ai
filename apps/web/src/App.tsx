import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import { PhotoUploadScreen } from './screens/PhotoUploadScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'upload' | 'review' | 'publish'>('upload');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tailor AI</Text>
        <Text style={styles.subtitle}>AI-Powered Clothing Resale Listings</Text>
      </View>

      {currentScreen === 'upload' && (
        <PhotoUploadScreen onNext={() => setCurrentScreen('review')} />
      )}

      <View style={styles.footer}>
        <Text style={styles.version}>v0.1.0 - Phase 1 MVP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  version: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
