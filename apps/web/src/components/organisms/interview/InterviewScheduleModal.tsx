'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InterviewScheduleForm } from '@/components/molecules/interview/InterviewScheduleForm';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDateTimeForAPI } from '@/lib/dateTimeUtils';
import type { InterviewSchedule } from '@prisma/client';


interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  interview?: InterviewSchedule; // For editing mode
}

export function InterviewScheduleModal({
  isOpen,
  onClose,
  applicationId,
  jobId,
  candidateId,
  companyId,
  interview
}: InterviewScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const formattedData = {
        ...data,
        scheduledAt: formatDateTimeForAPI(data.scheduledAt),
        jobApplicationId: applicationId,
        jobPostingId: jobId,
        candidateId: candidateId
      };

      // Perbaiki endpoint sesuai struktur API
      const endpoint = interview 
        ? `/api/companies/${companyId}/jobs/${jobId}/applicants/${applicationId}/interview/${interview.id}`
        : `/api/companies/${companyId}/jobs/${jobId}/applicants/${applicationId}/interview`;
      const method = interview ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule interview');
      }

      toast.success(interview ? 'Interview updated successfully' : 'Interview scheduled successfully');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to schedule interview');
      console.error('Error scheduling interview:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      
      if (!interview) return;

      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/applicants/${applicationId}/interview/${interview.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete interview');
      }

      toast.success('Interview deleted successfully');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete interview');
      console.error('Error deleting interview:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <InterviewScheduleForm
          applicationId={applicationId}
          jobId={jobId}
          candidateId={candidateId}
          defaultValues={interview ? {
              scheduledAt: interview.scheduledAt,
              duration: interview.duration,
              location: interview.location || undefined,
              interviewType: interview.interviewType as "ONLINE" | "ONSITE",
              notes: interview.notes || undefined
          } : undefined}
          onSubmit={handleSubmit}
          onDelete={interview ? handleDelete : undefined}
          isSubmitting={isSubmitting}
          mode={interview ? 'edit' : 'create'}
        />
      </DialogContent>
    </Dialog>
  );
}