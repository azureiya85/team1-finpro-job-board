import type { Subscription, SubscriptionStatus } from '@/types';
import type { 
  SkillCategory as PrismaSkillCategory, 
  SkillAssessment as PrismaSkillAssessment, 
  SkillAssessmentQuestion as PrismaSkillAssessmentQuestion 
} from '@/types';

type PrismaSubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  features: JSON; 
  createdAt: Date;
  updatedAt: Date;
};

// --- Base States ---
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==========================================
// Subscription Management Store Types
// ==========================================

// --- Slices ---
export interface SubscriptionListSlice {
  subscriptions: Subscription[];
  pagination: PaginationState;
  filters: {
    search?: string;
    status?: SubscriptionStatus;
    planId?: string;
  };
  isLoading: boolean;
  error: string | null;
  fetchSubscriptions: (page?: number) => Promise<void>;
  setSubscriptionFilters: (filters: Partial<SubscriptionListSlice['filters']>) => void;
  clearSubscriptionError: () => void; 
}

export interface PaymentApprovalSlice {
  pendingPayments: Subscription[];
  selectedPayment: Subscription | null;
  isPaymentsLoading: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  paymentsError: string | null;
  fetchPendingPayments: () => Promise<void>;
  selectPayment: (payment: Subscription | null) => void;
  approvePayment: (subscriptionId: string) => Promise<boolean>;
  rejectPayment: (subscriptionId: string, reason?: string) => Promise<boolean>;
  clearPaymentsError: () => void;
}

export interface PlanManagementSlice {
  plans: PrismaSubscriptionPlan[];
  selectedPlan: PrismaSubscriptionPlan | null;
  isPlansLoading: boolean;
  isCreatingPlan: boolean;
  isUpdatingPlan: boolean;
  isDeletingPlan: boolean;
  plansError: string | null;
  fetchPlans: () => Promise<void>;
  selectPlan: (plan: PrismaSubscriptionPlan | null) => void;
  createPlan: (planData: Omit<PrismaSubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updatePlan: (planId: string, planData: Partial<Omit<PrismaSubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<boolean>;
  deletePlan: (planId: string) => Promise<boolean>;
  clearPlansError: () => void;
}

// --- Combined State ---
export type SubscriptionMgtStoreState = SubscriptionListSlice & PaymentApprovalSlice & PlanManagementSlice;

// ==========================================
// Assessment Management Store Types
// ==========================================

export type SkillCategory = PrismaSkillCategory;
export type SkillAssessmentQuestion = PrismaSkillAssessmentQuestion;

export interface SkillAssessment extends PrismaSkillAssessment {
  category?: PrismaSkillCategory;
  _count?: {
    questions: number;
  };
}

// --- Slices ---
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

// --- Combined State ---
export type AssessmentMgtStoreState = CategorySlice & AssessmentSlice & QuestionSlice;