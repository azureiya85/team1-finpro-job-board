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

  console.log('InterviewScheduleModal - Props:', {
    applicationId,
    jobId,
    candidateId,
    companyId,
    interview
  });

  const handleSubmit = async (data: any) => {
    try {
      console.log('handleSubmit - Input data:', data);
      setIsSubmitting(true);
      
      if (!interview?.id) {
        console.log('Creating new interview');
      } else {
        console.log('Updating interview with ID:', interview.id);
      }

      const formattedData = {
        ...data,
        scheduledAt: formatDateTimeForAPI(data.scheduledAt)
      };

      console.log('Formatted data for API:', formattedData);

      const endpoint = interview 
        ? `/api/companies/${companyId}/jobs/${jobId}/applicants/${applicationId}/interview/${interview.id}`
        : `/api/companies/${companyId}/jobs/${jobId}/applicants/${applicationId}/interview`;
      
      console.log('Using endpoint:', endpoint);
      console.log('Method:', interview ? 'PUT' : 'POST');

      const response = await fetch(endpoint, {
        method: interview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to schedule interview');
      }

      toast.success(interview ? 'Interview updated successfully' : 'Interview scheduled successfully');
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to schedule interview');
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
            scheduledAt: new Date(interview.scheduledAt), // Pastikan ini adalah objek Date
            duration: interview.duration,
            location: interview.location || '',
            interviewType: interview.interviewType as "ONLINE" | "ONSITE",
            notes: interview.notes || ''
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