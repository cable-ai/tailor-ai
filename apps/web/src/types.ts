export interface ClothingAnalysisResult {
  itemType: string;
  brand: string;
  size: string;
  color: string[];
  pattern: string;
  material: string;
  condition: string;
  conditionGrade: 'NWT' | 'NWOT' | 'EUC' | 'GUC' | 'Fair';
  conditionNotes: string;
  style: string;
  gender: string;
  keywords: string[];
}
