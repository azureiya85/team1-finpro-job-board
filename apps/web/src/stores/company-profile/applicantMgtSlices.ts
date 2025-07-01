import type { StateCreator } from 'zustand';
import type { 
  ApplicantManagementSlice, 
  CompanyProfileState, 
  ApplicationFilters} from '@/types/zustandProfile';

const initialFilters: ApplicationFilters = { 
  sortBy: 'createdAt', 
  sortOrder: 'asc' 
};

const initialState = {
  selectedJobForApplicants: null,
  isApplicantModalOpen: false,
  applicants: [],
  isLoadingApplicants: false,
  applicantsError: null,
  applicantFilters: initialFilters,
  applicantPagination: {
    page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false
  },
};

export const createApplicantManagementSlice: StateCreator<
  CompanyProfileState,
  [],
  [],
  ApplicantManagementSlice
> = (set) => ({
  ...initialState,
  setSelectedJobForApplicants: (job) =>
    set({ selectedJobForApplicants: job, isApplicantModalOpen: !!job }),
  setIsApplicantModalOpen: (isOpen) => set({ isApplicantModalOpen: isOpen }),
  setApplicants: (applicants) => set({ applicants }),
  setLoadingApplicants: (loading) => set({ isLoadingApplicants: loading }),
  setApplicantsError: (error) => set({ applicantsError: error }),
  setApplicantFilters: (filters) => set({ applicantFilters: filters }),
  setApplicantPagination: (pagination) =>
    set((state) => ({
      applicantPagination: { ...state.applicantPagination, ...pagination },
    })),
  updateApplicantInList: (updatedApplicant) =>
    set((state) => ({
      applicants: state.applicants.map((app) =>
        app.id === updatedApplicant.id ? updatedApplicant : app
      ),
    })),
  resetApplicantManagement: () => set(initialState),
});