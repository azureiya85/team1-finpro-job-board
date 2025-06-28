export interface SubmitAssessmentInput {
  assessmentId: string;
  answers: Array<{
    questionId: string;
    answer: 'A' | 'B' | 'C' | 'D';
  }>;
}

export interface AssessmentResult {
  score: number;
  passed: boolean;
  certificateUrl: string | null;
}
