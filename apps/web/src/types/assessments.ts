import { SubscriptionStatus, UserRole } from '@prisma/client';

export interface SkillCategory {
  id: string;
  name: string;
  description: string | null; 
  icon: string | null; 
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillAssessment {
  id: string;
  title: string;
  description: string | null; 
  categoryId: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillAssessmentQuestion {
  id: string;
  assessmentId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string | null; 
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSkillAssessment {
  id: string;
  userId: string;
  assessmentId: string;
  score: number;
  isPassed: boolean;
  completedAt: Date;
  timeSpent: number; 
  badgeEarned: boolean;
  badgeIssuedAt: Date | null; 
  createdAt: Date;
  updatedAt: Date;
}

export interface Certificate {
  id: string;
  userId: string;
  userAssessmentId: string;
  title: string;
  description: string | null; 
  certificateCode: string;
  certificateUrl: string;
  qrCodeUrl: string | null; 
  issueDate: Date;
  expiryDate: Date | null; 
  isValid: boolean; 
  verificationCount: number; 
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Extended interfaces with relations
export interface SkillAssessmentWithRelations extends SkillAssessment {
  category: SkillCategory;
  questions: SkillAssessmentQuestion[];
}

export interface UserSkillAssessmentWithRelations extends UserSkillAssessment {
  assessment: SkillAssessment;
  certificate?: Certificate;
}

// For AssessmentsPage component
export interface AssessmentCategory {
  name: string;
  icon: string | null;
}

export interface ListedAssessment {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number;
  category: AssessmentCategory;
  _count: {
    questions: number;
  };
  userAssessment?: {
    isPassed: boolean;
    certificate?: {
      certificateUrl: string | null;
    }
  };
}

// For TakeAssessmentPage component
export interface AssessmentQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface AssessmentData {
  assessmentId: string;
  title: string;
  timeLimit: number; // minutes
  questions: AssessmentQuestion[];
}

export interface AssessmentAnswer {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D';
}

export interface AssessmentSubmissionRequest {
  answers: AssessmentAnswer[];
  timeSpent: number; // in seconds
}

export interface AssessmentSubmissionResponse {
  score: number;
  isPassed: boolean;
  passingScore: number;
  userAssessmentId: string;
  certificate?: Certificate;
  badgeEarned: boolean;
}

// Certificate info for submission results
export interface CertificateInfo {
  id: string;
  certificateCode: string;
  certificateUrl: string | null;
  issueDate: string;
}

export interface SubmissionResult {
  score: number;
  isPassed: boolean;
  passingScore: number;
  userAssessmentId: string;
  certificate: CertificateInfo | null;
  badgeEarned: boolean;
}

// Assessment stages for UI state management
export type AssessmentStage = 'loading' | 'taking' | 'submitting' | 'results' | 'error';

// Error interfaces
export interface PrismaError {
  code: string;
  message: string;
  meta?: {
    target?: string[];
    cause?: string;
  };
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, unknown>; 
}

export interface ApiSuccessResponse<T = Record<string, unknown>> { 
  data?: T;
  message?: string;
}

// Route parameter interfaces
export interface AssessmentRouteParams {
  params: { 
    assessmentId: string;
  };
}

export interface QuestionRouteParams {
  params: { 
    assessmentId: string; 
    questionId: string;
  };
}

export interface CategoryRouteParams {
  params: { 
    categoryId: string;
  };
}

export interface SubmissionRouteParams {
  params: { 
    assessmentId: string;
  };
}

// Session interface
export interface SessionUser {
  id: string;
  email: string;
  name: string | null; 
  role: UserRole;
}

export interface AuthSession {
  user: SessionUser;
  expires: string;
}

// Utility types for validation schemas (Create/Update data)
export interface SkillCategoryCreateData {
  name: string;
  description?: string | null;
  icon?: string | null; 
}

export interface SkillCategoryUpdateData {
  name?: string;
  description?: string | null; 
  icon?: string | null; 
}

export interface SkillAssessmentCreateData {
  title: string;
  description?: string | null;
  categoryId: string;
  timeLimit: number;
  passingScore: number;
  isActive?: boolean;
}

export interface SkillAssessmentUpdateData {
  title?: string;
  description?: string | null; 
  categoryId?: string;
  timeLimit?: number;
  passingScore?: number;
  isActive?: boolean;
}

export interface SkillAssessmentQuestionCreateData {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string | null;
}

export interface SkillAssessmentQuestionUpdateData {
  question?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: 'A' | 'B' | 'C' | 'D';
  explanation?: string | null; 
}

// Certificate generation data
export interface CertificateGenerationData {
  userId: string;
  userAssessmentId: string;
  assessmentTitle: string;
  userName: string;
  completionDate: Date; 
  score: number; 
}

// Validation result interfaces
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Assessment statistics interfaces
export interface AssessmentStats {
  totalAttempts: number;
  passedAttempts: number;
  averageScore: number;
  averageTimeSpent: number;
  passRate: number; // percentage
}

export interface UserAssessmentProgress {
  totalAssessments: number;
  completedAssessments: number;
  passedAssessments: number;
  certificates: number;
  averageScore: number;
}

// Type guards
export function isPrismaError(error: unknown): error is PrismaError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export function isRecordNotFoundError(error: unknown): boolean {
  return isPrismaError(error) && error.code === 'P2025';
}

export function isUniqueConstraintError(error: unknown): boolean {
  return isPrismaError(error) && error.code === 'P2002';
}

export function isForeignKeyConstraintError(error: unknown): boolean {
  return isPrismaError(error) && error.code === 'P2003';
}

export function isValidAnswerOption(option: string): option is 'A' | 'B' | 'C' | 'D' {
  return ['A', 'B', 'C', 'D'].includes(option);
}

// Utility functions for data transformation
export function transformPrismaQuestion(
  prismaQuestion: Record<string, unknown>
): SkillAssessmentQuestion {
  return {
    id: prismaQuestion.id as string,
    assessmentId: prismaQuestion.assessmentId as string,
    question: prismaQuestion.question as string,
    optionA: prismaQuestion.optionA as string,
    optionB: prismaQuestion.optionB as string,
    optionC: prismaQuestion.optionC as string,
    optionD: prismaQuestion.optionD as string,
    correctAnswer: prismaQuestion.correctAnswer as 'A' | 'B' | 'C' | 'D',
    explanation: prismaQuestion.explanation as string | null,
    createdAt: prismaQuestion.createdAt as Date,
    updatedAt: prismaQuestion.updatedAt as Date,
  };
}

export function transformPrismaAssessment(
  prismaAssessment: Record<string, unknown>
): SkillAssessment {
  return {
    id: prismaAssessment.id as string,
    title: prismaAssessment.title as string,
    description: prismaAssessment.description as string | null,
    categoryId: prismaAssessment.categoryId as string,
    timeLimit: prismaAssessment.timeLimit as number,
    passingScore: prismaAssessment.passingScore as number,
    isActive: prismaAssessment.isActive as boolean,
    createdAt: prismaAssessment.createdAt as Date,
    updatedAt: prismaAssessment.updatedAt as Date,
  };
}

export function transformPrismaCategory(
  prismaCategory: Record<string, unknown>
): SkillCategory {
  return {
    id: prismaCategory.id as string,
    name: prismaCategory.name as string,
    description: prismaCategory.description as string | null,
    icon: prismaCategory.icon as string | null,
    createdAt: prismaCategory.createdAt as Date,
    updatedAt: prismaCategory.updatedAt as Date,
  };
}