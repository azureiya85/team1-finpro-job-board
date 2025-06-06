import { create } from 'zustand';
import type {
  CompanyDetailed,
  JobPostingInStore,
  JobApplicationDetails,
  ApplicationFilters,
  CompanyProfileTabId 
} from '@/types';

interface CompanyProfileState {
  company: CompanyDetailed | null;
  activeTab: CompanyProfileTabId;
  isLoadingCompany: boolean;

  // Jobs Display State (for public jobs tab)
  displayJobs: JobPostingInStore[];
  isLoadingDisplayJobs: boolean;
  displayJobsPage: number;
  hasMoreDisplayJobs: boolean;

  // Job Management State (for admin job management)
  managementJobs: JobPostingInStore[];
  isLoadingManagementJobs: boolean;
  managementJobsError: string | null;
  managementJobFilters: { search?: string; status?: string };
  managementJobPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Shared Job Count
  totalJobs: number | null; 

  // Applicant Management State
  selectedJobForApplicants: JobPostingInStore | null;
  isApplicantModalOpen: boolean;
  applicants: JobApplicationDetails[];
  isLoadingApplicants: boolean;
  applicantsError: string | null;
  applicantFilters: ApplicationFilters;
  applicantPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Company Profile Actions
  setCompany: (company: CompanyDetailed) => void;
  setActiveTab: (tab: CompanyProfileTabId) => void;
  setLoadingCompany: (loading: boolean) => void;

  // Jobs Display Actions (public jobs tab)
  setDisplayJobs: (jobs: JobPostingInStore[]) => void;
  addDisplayJobs: (jobs: JobPostingInStore[]) => void;
  setLoadingDisplayJobs: (loading: boolean) => void;
  setDisplayJobsPagination: (page: number, hasMore: boolean) => void;

  // Job Management Actions (admin job management)
  setManagementJobs: (jobs: JobPostingInStore[]) => void;
  setLoadingManagementJobs: (loading: boolean) => void;
  setManagementJobsError: (error: string | null) => void;
  setManagementJobPagination: (pagination: Partial<CompanyProfileState['managementJobPagination']>) => void;
  removeJobFromManagement: (jobId: string) => void;
  updateJobInManagement: (updatedJob: JobPostingInStore) => void;

  // Shared Job Count Actions
  setTotalJobs: (total: number) => void;
  incrementTotalJobs: () => void;
  decrementTotalJobs: () => void;

  // Applicant Management Actions
  setSelectedJobForApplicants: (job: JobPostingInStore | null) => void;
  setIsApplicantModalOpen: (isOpen: boolean) => void;
  setApplicants: (applicants: JobApplicationDetails[]) => void;
  setLoadingApplicants: (loading: boolean) => void;
  setApplicantsError: (error: string | null) => void;
  setApplicantFilters: (filters: ApplicationFilters) => void;
  setApplicantPagination: (pagination: Partial<CompanyProfileState['applicantPagination']>) => void;
  updateApplicantInList: (updatedApplicant: JobApplicationDetails) => void;

  // Reset Functions
  resetStore: () => void;
  resetJobManagement: () => void;
  resetApplicantManagement: () => void;
}

export const useCompanyProfileStore = create<CompanyProfileState>((set) => ({
  // Company Profile State
  company: null,
  activeTab: 'overview',
  isLoadingCompany: false,

  // Jobs Display State
  displayJobs: [],
  isLoadingDisplayJobs: false,
  displayJobsPage: 1,
  hasMoreDisplayJobs: true,

  // Job Management State
  managementJobs: [],
  isLoadingManagementJobs: false,
  managementJobsError: null,
  managementJobFilters: {},
  managementJobPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },

  // Shared Job Count
  totalJobs: null, 

  // Applicant Management State
  selectedJobForApplicants: null,
  isApplicantModalOpen: false,
  applicants: [],
  isLoadingApplicants: false,
  applicantsError: null,
  applicantFilters: { sortBy: 'createdAt', sortOrder: 'asc' },
  applicantPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  },

  // Company Profile Actions
  setCompany: (company) => set({ company }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoadingCompany: (loading) => set({ isLoadingCompany: loading }),

  // Jobs Display Actions
  setDisplayJobs: (jobs) => set({ displayJobs: jobs }),
  addDisplayJobs: (newJobs) => set((state) => ({
    displayJobs: [...state.displayJobs, ...newJobs]
  })),
  setLoadingDisplayJobs: (loading) => set({ isLoadingDisplayJobs: loading }),
  setDisplayJobsPagination: (page, hasMore) => set({
    displayJobsPage: page,
    hasMoreDisplayJobs: hasMore
  }),

  // Job Management Actions
  setManagementJobs: (jobs) => set({ managementJobs: jobs }),
  setLoadingManagementJobs: (loading) => set({ isLoadingManagementJobs: loading }),
  setManagementJobsError: (error) => set({ managementJobsError: error }),
  setManagementJobPagination: (pagination) => set((state) => ({
    managementJobPagination: { ...state.managementJobPagination, ...pagination }
  })),
  removeJobFromManagement: (jobId) => set((state) => {
    const newJobs = state.managementJobs.filter(job => job.id !== jobId);
    const newTotalJobs = typeof state.totalJobs === 'number' ? Math.max(0, state.totalJobs - 1) : 0;
    return {
      managementJobs: newJobs,
      totalJobs: newTotalJobs 
    };
  }),
  updateJobInManagement: (updatedJob) => set((state) => ({
    managementJobs: state.managementJobs.map(job =>
      job.id === updatedJob.id ? { ...job, ...updatedJob } : job
    )
  })),

  // Shared Job Count Actions
  setTotalJobs: (total) => set({ totalJobs: total }),
  incrementTotalJobs: () => set((state) => ({
    totalJobs: typeof state.totalJobs === 'number' ? state.totalJobs + 1 : 1
  })), 
  decrementTotalJobs: () => set((state) => ({
    totalJobs: typeof state.totalJobs === 'number' ? Math.max(0, state.totalJobs - 1) : 0
  })), 

  // Applicant Management Actions
  setSelectedJobForApplicants: (job) => set({
    selectedJobForApplicants: job,
    isApplicantModalOpen: !!job
  }),
  setIsApplicantModalOpen: (isOpen) => set({ isApplicantModalOpen: isOpen }),
  setApplicants: (applicants) => set({ applicants }),
  setLoadingApplicants: (loading) => set({ isLoadingApplicants: loading }),
  setApplicantsError: (error) => set({ applicantsError: error }),
  setApplicantFilters: (filters) => set({ applicantFilters: filters }),
  setApplicantPagination: (pagination) => set((state) => ({
    applicantPagination: { ...state.applicantPagination, ...pagination }
  })),
  updateApplicantInList: (updatedApplicant) => set((state) => ({
    applicants: state.applicants.map(app =>
      app.id === updatedApplicant.id ? updatedApplicant : app
    )
  })),

  // Reset Functions
  resetStore: () => set({
    company: null,
    activeTab: 'overview',
    isLoadingCompany: false,
    displayJobs: [],
    isLoadingDisplayJobs: false,
    displayJobsPage: 1,
    hasMoreDisplayJobs: true,
    managementJobs: [],
    isLoadingManagementJobs: false,
    managementJobsError: null,
    managementJobFilters: {},
    managementJobPagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    totalJobs: null, 
    selectedJobForApplicants: null,
    isApplicantModalOpen: false,
    applicants: [],
    isLoadingApplicants: false,
    applicantsError: null,
    applicantFilters: { sortBy: 'createdAt', sortOrder: 'asc' },
    applicantPagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    },
  }),

  resetJobManagement: () => set({
    managementJobs: [],
    isLoadingManagementJobs: false,
    managementJobsError: null,
    managementJobFilters: {},
    managementJobPagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  }),

  resetApplicantManagement: () => set({
    selectedJobForApplicants: null,
    isApplicantModalOpen: false,
    applicants: [],
    isLoadingApplicants: false,
    applicantsError: null,
    applicantFilters: { sortBy: 'createdAt', sortOrder: 'asc' },
    applicantPagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    },
  }),
}));

export type { CompanyProfileTabId };