export type CompanyDetailed = { id: string; name: string; /* ...other fields */ };
export type JobPostingInStore = { id:string; title: string; applicantCount?: number; /*...other fields */ };
export type JobApplicationDetails = { id: string; applicantName: string; /* ...other fields */ };
export type ApplicationFilters = { 
  sortBy: string; 
  sortOrder: 'asc' | 'desc'; 
  [key: string]: string | number | boolean | undefined | unknown;
};export type CompanyProfileTabId = 'overview' | 'jobs' | 'manage-jobs';

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  lastEducation?: string;
  currentAddress?: string;
  country?: string;
}

export interface Message {
  type: 'success' | 'error';
  text: string;
}

// --- Company Profile Store Interfaces ---

export interface CompanySlice {
  company: CompanyDetailed | null;
  activeTab: CompanyProfileTabId;
  isLoadingCompany: boolean;
  totalJobs: number | null;
  setCompany: (company: CompanyDetailed) => void;
  setActiveTab: (tab: CompanyProfileTabId) => void;
  setLoadingCompany: (loading: boolean) => void;
  setTotalJobs: (total: number) => void;
  incrementTotalJobs: () => void;
  decrementTotalJobs: () => void;
}

export interface DisplayJobsSlice {
  displayJobs: JobPostingInStore[];
  isLoadingDisplayJobs: boolean;
  displayJobsPage: number;
  hasMoreDisplayJobs: boolean;
  setDisplayJobs: (jobs: JobPostingInStore[]) => void;
  addDisplayJobs: (jobs: JobPostingInStore[]) => void;
  setLoadingDisplayJobs: (loading: boolean) => void;
  setDisplayJobsPagination: (page: number, hasMore: boolean) => void;
  resetDisplayJobs: () => void;
}

export interface ManagementJobsSlice {
  managementJobs: JobPostingInStore[];
  isLoadingManagementJobs: boolean;
  managementJobsError: string | null;
  managementJobFilters: { search?: string; status?: string };
  managementJobPagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean; };
  setManagementJobs: (jobs: JobPostingInStore[]) => void;
  setLoadingManagementJobs: (loading: boolean) => void;
  setManagementJobsError: (error: string | null) => void;
  setManagementJobPagination: (pagination: Partial<ManagementJobsSlice['managementJobPagination']>) => void;
  removeJobFromManagement: (jobId: string) => void;
  updateJobInManagement: (updatedJob: JobPostingInStore) => void;
  resetJobManagement: () => void;
}

export interface ApplicantManagementSlice {
  selectedJobForApplicants: JobPostingInStore | null;
  isApplicantModalOpen: boolean;
  applicants: JobApplicationDetails[];
  isLoadingApplicants: boolean;
  applicantsError: string | null;
  applicantFilters: ApplicationFilters;
  applicantPagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean; };
  setSelectedJobForApplicants: (job: JobPostingInStore | null) => void;
  setIsApplicantModalOpen: (isOpen: boolean) => void;
  setApplicants: (applicants: JobApplicationDetails[]) => void;
  setLoadingApplicants: (loading: boolean) => void;
  setApplicantsError: (error: string | null) => void;
  setApplicantFilters: (filters: ApplicationFilters) => void;
  setApplicantPagination: (pagination: Partial<ApplicantManagementSlice['applicantPagination']>) => void;
  updateApplicantInList: (updatedApplicant: JobApplicationDetails) => void;
  resetApplicantManagement: () => void;
}

// Combined Company Profile State
export type CompanyProfileState = CompanySlice & DisplayJobsSlice & ManagementJobsSlice & ApplicantManagementSlice & {
  resetStore: () => void;
};


// --- User Profile Edit Store Interfaces ---

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  lastEducation: string;
  currentAddress: string;
  country: string;
}

export interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailFormValues {
  newEmail: string;
}

export interface ShowPasswordsState {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

export interface CoreSlice {
  user: UserProfile | null;
  initialLoading: boolean;
  message: Message | null;
  activeTab: string;
  fetchUserData: (userId: string) => Promise<void>;
  setMessage: (message: Message | null) => void;
  setActiveTab: (tab: string) => void;
}

export interface PersonalInfoSlice {
  profileForm: ProfileFormValues;
  savingProfile: boolean;
  setProfileForm: (data: Partial<ProfileFormValues>) => void;
  submitProfileForm: () => Promise<void>;
  resetProfileForm: () => void;
}

export interface PasswordSlice {
  passwordForm: PasswordFormValues;
  showPasswords: ShowPasswordsState;
  savingPassword: boolean;
  setPasswordForm: (data: Partial<PasswordFormValues>) => void;
  toggleShowPassword: (field: keyof ShowPasswordsState) => void;
  submitPasswordForm: () => Promise<void>;
  resetPasswordForm: () => void;
}

export interface EmailSlice {
  emailForm: EmailFormValues;
  savingEmail: boolean;
  resendingVerification: boolean;
  setEmailForm: (data: Partial<EmailFormValues>) => void;
  submitEmailForm: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  resetEmailForm: () => void;
}

export interface ProfileImageSlice {
  profileImageFile: File | null;
  profileImagePreview: string | null;
  uploadingImage: boolean;
  setProfileImageFile: (file: File | null) => void;
  clearProfileImagePreview: () => void;
  uploadProfileImage: () => Promise<void>;
  removeProfileImage: () => Promise<void>;
}

// Combined Profile Edit State
export type ProfileEditState = CoreSlice & PersonalInfoSlice & PasswordSlice & EmailSlice & ProfileImageSlice;