'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/dateTimeUtils';
import { InterviewSchedule, InterviewStatus } from '@prisma/client';

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
}: ApplicationDetailsInterviewProps) {

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Interview Details</span>
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
      </CardContent>
    </Card>
  );
}