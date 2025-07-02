// ==========================================
// IMPORTS
// ==========================================

// --- Imports for Subscription Management (New) ---
import type {
  SubscriptionPlan,
  Subscription,
  SubscriptionListState,
  SubscriptionPaymentState,
  PlanManagementState,
  PlanFormData,
} from '@/types/subscription';

// --- Imports for Assessment Management (Old) ---
import type { 
  SkillCategory as PrismaSkillCategory, 
  SkillAssessment as PrismaSkillAssessment, 
  SkillAssessmentQuestion as PrismaSkillAssessmentQuestion 
} from '@/types';


// ==========================================
// SUBSCRIPTION MANAGEMENT STORE TYPES 
// ==========================================

// --- Core Slice (Shared State) ---
export interface SubscriptionCoreState {
  loading: boolean;
  error: string | null;
}

export interface SubscriptionCoreActions {
  clearError: () => void;
}

// --- Feature Slices (Actions) ---
export interface SubscriptionListSliceActions {
  fetchSubscriptions: (page?: number, filters?: Record<string, string | undefined>) => Promise<void>;
  setSubscriptionFilters: (filters: Record<string, string | undefined>) => void;
}

export interface SubscriptionPaymentSliceActions {
  fetchPendingPayments: () => Promise<void>;
  selectPayment: (payment: Subscription | null) => void;
  approvePayment: (subscriptionId: string) => Promise<boolean>;
  rejectPayment: (subscriptionId: string, reason?: string) => Promise<boolean>;
}

export interface SubscriptionPlanSliceActions {
  fetchPlans: () => Promise<void>;
  selectPlan: (plan: SubscriptionPlan | null) => void;
  createPlan: (planData: PlanFormData) => Promise<boolean>;
  updatePlan: (planId: string, planData: Partial<PlanFormData>) => Promise<boolean>;
  deletePlan: (planId: string) => Promise<boolean>;
}

// --- Combined Subscription Store State ---
export interface SubscriptionManagementState 
  extends SubscriptionCoreState,
          SubscriptionListState,      
          SubscriptionPaymentState,   
          PlanManagementState,        
          SubscriptionCoreActions,
          SubscriptionListSliceActions,
          SubscriptionPaymentSliceActions,
          SubscriptionPlanSliceActions {}


// ==========================================
// ASSESSMENT MANAGEMENT STORE TYPES
// ==========================================

// --- Model Type Aliases ---
export type SkillCategory = PrismaSkillCategory;
export type SkillAssessmentQuestion = PrismaSkillAssessmentQuestion;

export interface SkillAssessment extends PrismaSkillAssessment {
  category?: PrismaSkillCategory;
  _count?: {
    questions: number;
  };
}

// --- Feature Slices ---
export interface CategorySlice {
  categories: SkillCategory[];
  isCategoriesLoading: boolean;
  categoryError: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: { name: string; description?: string }) => Promise<boolean>;
  updateCategory: (id: string, data: { name: string; description?: string }) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export interface AssessmentSlice {
  assessments: SkillAssessment[];
  selectedAssessment: SkillAssessment | null;
  isAssessmentsLoading: boolean;
  assessmentError: string | null;
  fetchAssessments: () => Promise<void>;
  selectAssessment: (assessment: SkillAssessment | null) => void;
  createAssessment: (data: Omit<SkillAssessment, 'id'|'createdAt'|'updatedAt'|'category'|'_count'|'isActive'>) => Promise<boolean>;
  updateAssessment: (id: string, data: Partial<SkillAssessment>) => Promise<boolean>;
  deleteAssessment: (id: string) => Promise<boolean>;
}

export interface QuestionSlice {
  questions: SkillAssessmentQuestion[];
  isQuestionsLoading: boolean;
  questionError: string | null;
  fetchQuestions: (assessmentId: string) => Promise<void>;
  createQuestion: (assessmentId: string, data: Omit<SkillAssessmentQuestion, 'id'|'createdAt'|'updatedAt'|'assessmentId'>) => Promise<boolean>;
  updateQuestion: (assessmentId: string, questionId: string, data: Partial<SkillAssessmentQuestion>) => Promise<boolean>;
  deleteQuestion: (assessmentId: string, questionId: string) => Promise<boolean>;
  clearQuestions: () => void;
}

// --- Combined Assessment Store State ---
export type AssessmentMgtStoreState = CategorySlice & AssessmentSlice & QuestionSlice;