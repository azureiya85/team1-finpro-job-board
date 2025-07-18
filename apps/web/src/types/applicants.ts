import {
  ApplicationStatus,
  Education,
  InterviewStatus,
  InterviewType,
  Prisma,
} from '@prisma/client';

// ========================================================================
// CORE DOMAIN TYPES
// ========================================================================

export interface ApplicantProfile {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  profileImage?: string | null;
  age?: number | null;
  education?: Education | null;
  phoneNumber?: string | null;
  location?: string;
  currentAddress?: string | null;
}

export interface JobApplicationDetails {
  id: string;
  status: ApplicationStatus;
  expectedSalary?: number | null;
  coverLetter?: string | null;
  cvUrl: string;
  testScore?: number | null;
  testCompletedAt?: Date | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date | null;
  applicant: ApplicantProfile;
  jobPosting: {
    id: string;
    title: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    preSelectionTest?: {
      id: string;
    } | null;
  } | null;
  testResult?: {
    score: number;
    passed: boolean;
  } | null;
  latestInterview?: {
    id: string;
    scheduledAt: Date;
    duration: number;
    status: InterviewStatus;
    interviewType: InterviewType;
    location?: string | null;
    notes?: string | null;
  } | null;
}

// ========================================================================
// FILTERING & PAGINATION TYPES
// ========================================================================

export interface ApplicationFilters {
  name?: string;
  ageMin?: number;
  ageMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  education?: string;
  status?: ApplicationStatus
  location?: string;
  hasCV?: boolean;
  hasCoverLetter?: boolean;
  testScoreMin?: number;
  testScoreMax?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'expectedSalary' | 'name' | 'testScore' | 'age';
  sortOrder?: 'asc' | 'desc';
}

export interface RouteAndPaginationFilters extends ApplicationFilters {
  page?: number;
  limit?: number;
  jobPostingId?: string | null;
}

export interface ApplicationsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========================================================================
// API & HELPER FUNCTION SIGNATURES/TYPES
// ========================================================================

// ADDED: A specific type for the subscription plan features JSON object.
export interface SubscriptionPlanFeatures {
  priorityCvReview?: boolean;
  // Add other feature flags here as your application grows
}

export interface UpdateApplicationRequestBody {
  applicationId: string;
  status: ApplicationStatus;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  scheduleInterview?: {
    scheduledAt: string; // ISO date string
    duration?: number;
    location?: string | null;
    interviewType?: InterviewType;
    notes?: string | null;
  } | null;
}

export interface StatusUpdateOptions {
  rejectionReason?: string;
  adminNotes?: string;
  reviewedBy?: string;
}

export interface StatusUpdateResult {
  success: boolean;
  message: string;
  application?: JobApplicationDetails;
  error?: string;
}

export type ApplicationDatabaseUpdateData = {
  status: ApplicationStatus;
  updatedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  adminNotes?: string;
};

export type ApplicationForStatusUpdate = Prisma.JobApplicationGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
      };
    };
    jobPosting: {
      select: {
        id: true;
        title: true;
        company: {
          select: {
            name: true;
          };
        };
      };
    };
  };
}>;

export type ApplicationStatsWhereClause = Prisma.JobApplicationWhereInput & {
  jobPostingId?: string;
};

export interface StatusDisplayInfo {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

// ========================================================================
// ZUSTAND STORE STATE & ACTIONS
// ========================================================================

export interface ApplicationStatistics {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  byEducation: Record<string, number>;
  ageRange: { min: number | null; max: number | null };
  salaryRange: { min: number | null; max: number | null };
  withCV: number;
  withCoverLetter: number;
  withTestScore: number;
}

export interface ApplicationsZustandState {
  applications: JobApplicationDetails[];
  selectedApplications: string[];
  currentApplication: JobApplicationDetails | null;
  pagination: ApplicationsPagination;
  filters: ApplicationFilters;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
  statistics: ApplicationStatistics;
  currentCompanyIdForStore?: string | null;
  currentJobPostingIdForStore?: string | null;
}

export interface ApplicationsZustandActions {
  fetchApplications: (companyId: string, jobPostingId?: string | null) => Promise<void>;
  refreshApplications: () => Promise<void>;
  updateApplicationStatus: (
    companyId: string, // Pass companyId to construct API endpoint
    applicationId: string,
    status: ApplicationStatus,
    options?: { // Corresponds to parts of UpdateApplicationRequestBody
      rejectionReason?: string;
      adminNotes?: string;
      scheduleInterview?: UpdateApplicationRequestBody['scheduleInterview'];
    }
  ) => Promise<boolean>;
  setCurrentApplication: (application: JobApplicationDetails | null) => void;
  selectApplication: (applicationId: string) => void;
  selectAllApplications: () => void;
  deselectApplication: (applicationId: string) => void;
  clearSelection: () => void;
  bulkUpdateStatus: (
    companyId: string, // Pass companyId
    status: ApplicationStatus,
    options?: { rejectionReason?: string; adminNotes?: string }
  ) => Promise<boolean>;
  setFilters: (filters: Partial<ApplicationFilters>) => void;
  clearFilters: () => void;
  setPagination: (page: number, limit?: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUpdating: (updating: boolean) => void;
  setCurrentContextForStore: (companyId: string, jobPostingId?: string | null) => void;
  reset: () => void;
}