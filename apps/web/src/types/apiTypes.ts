import { ApplicationStatus, JobPosting, NotificationType } from '@prisma/client';

export interface ApiSuccessResponse<T = Record<string, unknown>> {
  success: true;
  message?: string;
  data?: T;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

export type ApiResponse<T = Record<string, unknown>> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface JobPostingWithCompany extends JobPosting {
  company: {
    id: string;
    name: string;
     email: string | null; 
    adminId: string;
  };
}

export interface JobApplicationWithDetails {
  id: string;
  status: ApplicationStatus;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
    currentAddress: string | null;
  };
  jobPosting: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
    };
  };
}

export interface NotificationCreateData {
  userId: string;
  type: NotificationType;
  message: string;
  link: string;
}

export interface ApplicationStatusResponse {
  hasApplied: boolean;
  application: {
    id: string;
    status: ApplicationStatus;
    createdAt: Date;
  } | null;
}

export interface ApplicationSubmissionResponse {
  success: true;
  message: string;
  application: {
    id: string;
    status: string;
    submittedAt: Date;
    jobTitle: string;
    companyName: string;
  };
}