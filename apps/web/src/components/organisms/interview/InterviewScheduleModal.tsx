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
  interview?: InterviewSchedule; // For editing mode
}

export function InterviewScheduleModal({
  isOpen,
  onClose,
  applicationId,
  jobId,
  candidateId,
  interview
}: InterviewScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const formattedData = {
        ...data,
        scheduledAt: formatDateTimeForAPI(data.scheduledAt)
      };

      const endpoint = interview 
        ? `/api/interviews/${interview.id}`
        : '/api/interviews';
      const method = interview ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });


      if (!response.ok) {
        throw new Error('Failed to schedule interview');
      }

      toast.success(interview ? 'Interview updated successfully' : 'Interview scheduled successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to schedule interview');
      console.error('Error scheduling interview:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {interview ? 'Edit Interview Schedule' : 'Schedule New Interview'}
          </DialogTitle>
        </DialogHeader>
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
        isSubmitting={isSubmitting}
        mode={interview ? 'edit' : 'create'}
        />
      </DialogContent>
    </Dialog>
  );
}