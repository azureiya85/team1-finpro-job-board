import { z } from 'zod';

export const interviewFormSchema = z.object({
  scheduledAt: z.date(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  interviewType: z.enum(['ONLINE', 'ONSITE']),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export type InterviewFormData = z.infer<typeof interviewFormSchema>;
export type InterviewSubmitData = InterviewFormData & {
  jobApplicationId: string;
  jobPostingId: string;
  candidateId: string;
};

export interface InterviewScheduleFormProps {
  applicationId: string;
  jobId: string;
  candidateId: string;
  defaultValues?: Partial<InterviewFormData>;
  onSubmit: (data: InterviewSubmitData) => void;
  onDelete?: () => Promise<void>;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
}