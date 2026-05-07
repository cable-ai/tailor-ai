import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { ClothingAnalysisResult } from '../types';

interface ReviewScreenProps {
  result: ClothingAnalysisResult;
  onBack: () => void;
  onNext: (result: ClothingAnalysisResult) => void;
}

const CONDITION_GRADES: ClothingAnalysisResult['conditionGrade'][] = [
  'NWT',
  'NWOT',
  'EUC',
  'GUC',
  'Fair',
];

const CONDITION_LABELS: Record<ClothingAnalysisResult['conditionGrade'], string> = {
  NWT: 'New w/ Tags',
  NWOT: 'New w/o Tags',
  EUC: 'Excellent',
  GUC: 'Good',
  Fair: 'Fair',
};

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ result, onBack, onNext }) => {
  const [draft, setDraft] = useState<ClothingAnalysisResult>(result);

  const update = <K extends keyof ClothingAnalysisResult>(
    field: K,
    value: ClothingAnalysisResult[K],
  ) => setDraft((prev) => ({ ...prev, [field]: value }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Review Listing Details</Text>
        <Text style={styles.sectionDescription}>
          AI-generated — review and edit before publishing to eBay.
        </Text>

        <SectionHeader title="Item" />

        <Field label="Type">
          <TextInput
            style={styles.input}
            value={draft.itemType}
            onChangeText={(v) => update('itemType', v)}
          />
        </Field>

        <Field label="Brand">
          <TextInput
            style={styles.input}
            value={draft.brand}
            onChangeText={(v) => update('brand', v)}
          />
        </Field>

        <Field label="Size">
          <TextInput
            style={styles.input}
            value={draft.size}
            onChangeText={(v) => update('size', v)}
          />
        </Field>

        <Field label="Pattern">
          <TextInput
            style={styles.input}
            value={draft.pattern}
            onChangeText={(v) => update('pattern', v)}
          />
        </Field>

        <Field label="Material">
          <TextInput
            style={styles.input}
            value={draft.material}
            onChangeText={(v) => update('material', v)}
          />
        </Field>

        <Field label="Style">
          <TextInput
            style={styles.input}
            value={draft.style}
            onChangeText={(v) => update('style', v)}
          />
        </Field>

        <Field label="Gender">
          <TextInput
            style={styles.input}
            value={draft.gender}
            onChangeText={(v) => update('gender', v)}
          />
        </Field>

        <Field label="Colors (comma-separated)">
          <TextInput
            style={styles.input}
            value={draft.color.join(', ')}
            onChangeText={(v) =>
              update(
                'color',
                v.split(',').map((c) => c.trim()).filter(Boolean),
              )
            }
          />
        </Field>

        <SectionHeader title="Condition" />

        <View style={styles.gradeRow}>
          {CONDITION_GRADES.map((grade) => (
            <TouchableOpacity
              key={grade}
              style={[styles.gradeButton, draft.conditionGrade === grade && styles.gradeButtonActive]}
              onPress={() => update('conditionGrade', grade)}
            >
              <Text
                style={[
                  styles.gradeButtonText,
                  draft.conditionGrade === grade && styles.gradeButtonTextActive,
                ]}
              >
                {grade}
              </Text>
              <Text
                style={[
                  styles.gradeButtonLabel,
                  draft.conditionGrade === grade && styles.gradeButtonTextActive,
                ]}
              >
                {CONDITION_LABELS[grade]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label="Condition description">
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={draft.condition}
            onChangeText={(v) => update('condition', v)}
            multiline
            numberOfLines={3}
          />
        </Field>

        <Field label="Flaw notes (leave blank if none)">
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={draft.conditionNotes}
            onChangeText={(v) => update('conditionNotes', v)}
            multiline
            numberOfLines={2}
            placeholder="e.g. small stain on left sleeve"
          />
        </Field>

        <SectionHeader title="Keywords" />

        <Field label="eBay search keywords (comma-separated)">
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={draft.keywords.join(', ')}
            onChangeText={(v) =>
              update(
                'keywords',
                v.split(',').map((k) => k.trim()).filter(Boolean),
              )
            }
            multiline
            numberOfLines={3}
          />
        </Field>

        <View style={styles.actions}>
          <View style={styles.backButton}>
            <Button title="Back" onPress={onBack} color="#666" />
          </View>
          <View style={styles.nextButton}>
            <Button title="Publish to eBay →" onPress={() => onNext(draft)} color="#007AFF" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

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
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 8,
  },
  fieldRow: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  gradeButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  gradeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  gradeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  gradeButtonLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  gradeButtonTextActive: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 40,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
