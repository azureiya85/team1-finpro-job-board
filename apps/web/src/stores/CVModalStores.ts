import { create } from 'zustand';
import { JobPostingFeatured } from '@/types';

interface CVModalState {
  isOpen: boolean;
  selectedJob: JobPostingFeatured | null;
  isSubmitting: boolean;
  openModal: (job: JobPostingFeatured) => void;
  closeModal: () => void;
  setSubmitting: (submitting: boolean) => void;
}

export const useCVModalStore = create<CVModalState>((set) => ({
  isOpen: false,
  selectedJob: null,
  isSubmitting: false,
  openModal: (job: JobPostingFeatured) => 
    set({ isOpen: true, selectedJob: job }),
  closeModal: () => 
    set({ isOpen: false, selectedJob: null, isSubmitting: false }),
  setSubmitting: (submitting: boolean) => 
    set({ isSubmitting: submitting }),
}));