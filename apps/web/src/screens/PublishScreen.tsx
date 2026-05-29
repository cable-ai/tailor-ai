import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { ClothingAnalysisResult } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

interface PublishScreenProps {
  result: ClothingAnalysisResult;
  onBack: () => void;
  onStartOver: () => void;
}

type PublishStatus = 'idle' | 'publishing' | 'success' | 'error';

export const PublishScreen: React.FC<PublishScreenProps> = ({ result, onBack, onStartOver }) => {
  const [price, setPrice] = useState('');
  const [ebayConnected, setEbayConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle');
  const [listingUrl, setListingUrl] = useState<string | null>(null);

  useEffect(() => {
    checkEbayStatus();
  }, []);

  useEffect(() => {
    if (!isPolling || ebayConnected) {
      setIsPolling(false);
      return;
    }
    const id = setInterval(checkEbayStatus, 2500);
    return () => clearInterval(id);
  }, [isPolling, ebayConnected]);

  const checkEbayStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/ebay/status`);
      const data = (await res.json()) as { connected: boolean };
      setEbayConnected(data.connected);
    } catch {
      // ignore — API may not be running
    }
  };

  const connectEbay = () => {
    window.open(
      `${API_URL}/api/auth/ebay`,
      'ebay_auth',
      'width=600,height=700,scrollbars=yes,resizable=yes',
    );
    setIsPolling(true);
  };

  const handlePublish = async () => {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    setPublishStatus('publishing');

    try {
      const res = await fetch(`${API_URL}/api/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, price: parsedPrice }),
      });

      const data = (await res.json()) as { listingUrl?: string; error?: string };

      if (!res.ok) throw new Error(data.error ?? 'Publishing failed');

      setListingUrl(data.listingUrl ?? null);
      setPublishStatus('success');
    } catch {
      setPublishStatus('error');
    }
  };

  if (publishStatus === 'error') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorDescription}>
          We couldn't publish your listing. Please try again.
        </Text>
        <Button
          title="Try Again"
          onPress={() => setPublishStatus('idle')}
          color="#007AFF"
        />
        <View style={styles.startOverButton}>
          <Button title="Start Over" onPress={onStartOver} color="#666" />
        </View>
      </View>
    );
  }

  if (publishStatus === 'success' && listingUrl) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>Listed on eBay!</Text>
        <Text style={styles.successDescription}>
          Your item is now live in the eBay sandbox.
        </Text>
        <Button
          title="View Listing"
          onPress={() => window.open(listingUrl, '_blank')}
          color="#007AFF"
        />
        <View style={styles.startOverButton}>
          <Button title="List Another Item" onPress={onStartOver} color="#666" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Publish to eBay</Text>
        <Text style={styles.sectionDescription}>Set a price and publish your listing.</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {result.brand} {result.itemType}
          </Text>
          <Text style={styles.summaryMeta}>
            {result.conditionGrade} · Size {result.size} · {result.color.join('/')}
          </Text>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Listing Price (USD)</Text>
          <View style={styles.priceInputRow}>
            <Text style={styles.priceCurrency}>$</Text>
            <TextInput
              style={styles.priceInput}
              value={price}
              onChangeText={(v) => setPrice(v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {!ebayConnected ? (
          <View style={styles.connectCard}>
            <Text style={styles.connectTitle}>Connect your eBay account</Text>
            <Text style={styles.connectDescription}>
              Authorize Tailor AI to publish listings on your behalf. A window will open for
              sign-in.
            </Text>
            <Button title="Connect to eBay" onPress={connectEbay} color="#E53238" />
            {isPolling && (
              <View style={styles.pollingRow}>
                <ActivityIndicator size="small" color="#999" />
                <Text style={styles.pollingText}>Waiting for authorization…</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>eBay connected</Text>
          </View>
        )}

        <View style={styles.actions}>
          <View style={styles.backButton}>
            <Button title="Back" onPress={onBack} color="#666" />
          </View>
          <View style={styles.publishButton}>
            {publishStatus === 'publishing' ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Publishing…</Text>
              </View>
            ) : (
              <Button
                title="Publish to eBay"
                onPress={handlePublish}
                disabled={!ebayConnected || !price}
                color={ebayConnected && price ? '#007AFF' : '#ccc'}
              />
            )}
          </View>
        </View>
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
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  summaryMeta: {
    fontSize: 14,
    color: '#666',
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceCurrency: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  priceInput: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    padding: 0,
  },
  connectCard: {
    backgroundColor: '#fff8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffd0d0',
  },
  connectTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  connectDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  pollingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  pollingText: {
    fontSize: 13,
    color: '#999',
  },
  connectedBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 64,
    color: '#c62828',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  backButton: {
    flex: 1,
  },
  publishButton: {
    flex: 2,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successIcon: {
    fontSize: 64,
    color: '#2e7d32',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  startOverButton: {
    marginTop: 16,
  },
});
