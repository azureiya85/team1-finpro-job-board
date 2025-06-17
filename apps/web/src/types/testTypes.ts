// Tambahkan import untuk komponen
import { PreSelectionTest, PreSelectionQuestion } from '@prisma/client';

// Interface untuk data test
export interface Test extends PreSelectionTest {
  id: string;
  title: string;
  questions: Question[];
  isEditing?: boolean;
  isDraft?: boolean;
}

// Interface untuk data question dengan field tambahan untuk UI
export interface Question extends PreSelectionQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  createdAt: Date;
  updatedAt: Date;
  isValid?: boolean;
  errors?: Record<string, string>;
}

export type CreateTestData = {
  title: string;
  description: string; // pastikan tidak nullable
  timeLimit: number;
  passingScore: number;
  questions: CreateQuestionData[];
  isActive: boolean;
  companyId: string;
};

export type CreateQuestionData = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  testId: string;
};

// Interface untuk state management
export interface TestState {
  tests: Test[];
  currentTest: Test | null;
  isLoading: boolean;
  error: string | null;
}

export interface TestAnswer {
  questionId: string;
  selectedAnswer: string;
}

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  passingScore: number;
  isPassed: boolean;
  answers: TestAnswer[];
  createdAt: Date;
  test: Test;
}