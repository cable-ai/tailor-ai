import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { PhotoUploadScreen } from './screens/PhotoUploadScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { ClothingAnalysisResult } from './types';

type Screen = 'upload' | 'review' | 'publish';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('upload');
  const [analysisResult, setAnalysisResult] = useState<ClothingAnalysisResult | null>(null);

  const handleAnalysisDone = (result: ClothingAnalysisResult) => {
    setAnalysisResult(result);
    setCurrentScreen('review');
  };

  const handlePublish = (result: ClothingAnalysisResult) => {
    setAnalysisResult(result);
    setCurrentScreen('publish');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tailor AI</Text>
        <Text style={styles.subtitle}>AI-Powered Clothing Resale Listings</Text>
      </View>

      {currentScreen === 'upload' && (
        <PhotoUploadScreen onNext={handleAnalysisDone} />
      )}

      {currentScreen === 'review' && analysisResult && (
        <ReviewScreen
          result={analysisResult}
          onBack={() => setCurrentScreen('upload')}
          onNext={handlePublish}
        />
      )}

      {currentScreen === 'publish' && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>eBay Publishing</Text>
          <Text style={styles.placeholderText}>Coming soon — eBay OAuth integration pending.</Text>
        </View>
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
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
