export interface FieldStats {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  totalResponses: number;
  uniqueValues: number;
  valueCounts: { value: string; count: number; percentage: number }[];
  distributionCounts: { value: string; count: number; percentage: number }[];
}

export interface QuizStats {
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  scoreDistribution: { range: string; count: number }[];
  questionStats: {
    fieldId: string;
    label: string;
    correctCount: number;
    incorrectCount: number;
    correctRate: number;
  }[];
}
