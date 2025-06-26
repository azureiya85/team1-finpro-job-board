import { EmploymentStatus } from '@prisma/client';

export type CompanyReview = {
  id: string;
  title: string;
  review: string;
  rating: number;
  cultureRating: number | null;
  workLifeBalance: number | null;
  facilitiesRating: number | null;
  careerRating: number | null;
  jobPosition: string;
  employmentStatus: EmploymentStatus;
  workDuration: string | null;
  salaryEstimate: number | null;
  createdAt: string;
  userId: string;
};

export type EditableReviewData = Omit<CompanyReview, 'createdAt' | 'userId'>;

export interface CompanyReviewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onReviewChange: () => void; 
}

export interface CompanyReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  companyName: string;
  initialData?: EditableReviewData | null; 
}