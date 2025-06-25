'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/dateTimeUtils';
import { InterviewStatusBadge } from '@/components/atoms/badges/InterviewStatusBadge';
import { InterviewActionButton } from '@/components/atoms/buttons/InterviewActionButton';
import { InterviewSchedule, InterviewStatus } from '@prisma/client';
import { toast } from 'sonner';

interface InterviewData extends Pick<InterviewSchedule, 
  'id' | 
  'scheduledAt' | 
  'duration' | 
  'location' | 
  'status' | 
  'interviewType' | 
  'notes'
> {
  jobApplicationId: string;
  jobPostingId: string;
  candidateId: string;
}

interface ApplicationDetailsInterviewProps {
  interview: InterviewData;
  onStatusChange?: (status: InterviewStatus) => void;
  onReschedule?: () => void;
}

export function ApplicationDetailsInterview({ 
  interview,
  onStatusChange,
  onReschedule 
}: ApplicationDetailsInterviewProps) {

  const handleComplete = async () => {
    try {
      await onStatusChange?.('COMPLETED');
      toast.success('Interview marked as completed');
    } catch {
      toast.error('Failed to update interview status');
    }
  };

  const handleCancel = async () => {
    try {
      await onStatusChange?.('CANCELLED');
      toast.success('Interview cancelled');
    } catch {
      toast.error('Failed to cancel interview');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Interview Details</span>
          <InterviewStatusBadge status={interview.status} />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Scheduled At</span>
            <span className="font-medium">{formatDateTime(interview.scheduledAt)}</span>
          </div>
          
          
          {interview.location && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">{interview.location}</span>
            </div>
          )}
        </div>

        {interview.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="text-sm mt-1">{interview.notes}</p>
          </div>
        )}

        <div className="pt-4 flex justify-end">
        <InterviewActionButton
          status={interview.status}
          scheduledAt={interview.scheduledAt}
          duration={interview.duration}
          applicationId={interview.jobApplicationId}
          jobId={interview.jobPostingId}
          candidateId={interview.candidateId}
          onComplete={handleComplete}
          onCancel={handleCancel}
          onReschedule={onReschedule}
        />
        </div>
      </CardContent>
    </Card>
  );
}