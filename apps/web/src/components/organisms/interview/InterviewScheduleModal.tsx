"use client";

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InterviewScheduleForm } from '@/components/molecules/interview/InterviewScheduleForm';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatDateTimeForAPI } from '@/lib/dateTimeUtils';
import type { InterviewSchedule } from '@prisma/client';

type InterviewFormData = {
  scheduledAt: Date;
  duration: number;
  interviewType: 'ONLINE' | 'ONSITE';
  location?: string;
  notes?: string;
};

type InterviewSubmitData = InterviewFormData & {
  jobApplicationId: string;
  jobPostingId: string;
  candidateId: string;
};

type InitialInterviewData = Pick<
  InterviewSchedule,
  'id' | 'scheduledAt' | 'duration' | 'interviewType' | 'status'
> & {
  location?: string | null;
  notes?: string | null;
};

interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  interview?: InterviewSchedule | null;
  onInterviewUpdate?: (interview: InterviewSchedule) => void;
}

export function InterviewScheduleModal({
  isOpen,
  onClose,
  applicationId,
  jobId,
  candidateId,
  companyId,
  interview,
  onInterviewUpdate
}: InterviewScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentInterview, setCurrentInterview] = useState<InterviewSchedule | InitialInterviewData | null>(interview || null);

  useEffect(() => {
    const fetchInterviewData = async () => {
      if (interview?.id && isOpen) {
        try {
          const response = await fetch(
            `/api/companies/${companyId}/jobs/${jobId}/applicants/${applicationId}/interview/${interview.id}`
          );
          const data = await response.json();
          setCurrentInterview(data);
          onInterviewUpdate?.(data);
        } catch (fetchError) {
          console.error('Failed to fetch interview data:', fetchError);
          toast.error('Failed to load interview data');
        }
      }
    };

    fetchInterviewData();
  }, [isOpen, interview?.id, companyId, jobId, applicationId, onInterviewUpdate]);

  const handleSubmit = async (data: InterviewSubmitData) => {
    setIsSubmitting(true);
    
    try {
      const formattedData = {
        scheduledAt: formatDateTimeForAPI(data.scheduledAt),
        duration: data.duration,
        interviewType: data.interviewType,
        location: data.location || null,
        notes: data.notes || null
      };

      const endpoint = interview 
        ? `/api/companies/${companyId}/jobs/${jobId}/applicants/${applicationId}/interview/${interview.id}`
        : `/api/companies/${companyId}/jobs/${jobId}/applicants/${applicationId}/interview`;
      
      const response = await fetch(endpoint, {
        method: interview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule interview');
      }

      const responseData = await response.json();
      setCurrentInterview(responseData);
      onInterviewUpdate?.(responseData);
      toast.success(interview ? 'Interview rescheduled successfully' : 'Interview scheduled successfully');
      onClose();
    } catch (submitError) {
      console.error('Submit error:', submitError);
      toast.error('Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    
    if (!interview) return;

    try {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/applicants/${applicationId}/interview/${interview.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete interview');
      }

      toast.success('Interview deleted successfully');
      onClose();
    } catch (deleteError) {
      console.error('Delete error:', deleteError);
      toast.error('Failed to delete interview');
    } finally {
      setIsSubmitting(false);
    }
  };


  const formDefaultValues: Partial<InterviewFormData> | undefined = currentInterview ? {
    scheduledAt: new Date(currentInterview.scheduledAt),
    duration: currentInterview.duration,
    interviewType: currentInterview.interviewType as 'ONLINE' | 'ONSITE',
    location: currentInterview.location || undefined,
    notes: currentInterview.notes || undefined
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <InterviewScheduleForm
          applicationId={applicationId}
          jobId={jobId}
          candidateId={candidateId}
          defaultValues={formDefaultValues}
          onSubmit={handleSubmit}
          onDelete={currentInterview ? handleDelete : undefined}
          isSubmitting={isSubmitting}
          mode={currentInterview ? 'edit' : 'create'}
        />
      </DialogContent>
    </Dialog>
  );
}