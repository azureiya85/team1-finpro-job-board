'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { InterviewStatus } from '@prisma/client';
import { useState } from 'react';
import { InterviewScheduleModal } from '@/components/organisms/interview/InterviewScheduleModal';
import { isInterviewPassed } from '@/lib/dateTimeUtils';

interface InterviewActionButtonProps {
  status: InterviewStatus;
  scheduledAt: Date;
  duration: number;
  applicationId: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  onComplete: () => Promise<void>;
  onCancel: () => Promise<void>;
  onReschedule?: () => void;
}

export function InterviewActionButton({
  status,
  scheduledAt,
  duration,
  applicationId,
  jobId,
  candidateId,
  companyId,
  onComplete,
  onCancel,
  onReschedule,
}: InterviewActionButtonProps) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const isPassed = isInterviewPassed(scheduledAt, duration);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status !== 'SCHEDULED' && (
            <DropdownMenuItem
              onClick={() => setIsScheduleModalOpen(true)}
            >
              Schedule Interview
            </DropdownMenuItem>
          )}
          {status === 'SCHEDULED' && (
            <>
              {isPassed ? (
                <DropdownMenuItem
                  onClick={onComplete}
                >
                  Mark as Completed
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={onCancel}
                  >
                    Cancel Interview
                  </DropdownMenuItem>
                  {onReschedule && (
                    <DropdownMenuItem
                      onClick={onReschedule}
                    >
                      Reschedule Interview
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isScheduleModalOpen && (
        <InterviewScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          applicationId={applicationId}
          jobId={jobId}
          candidateId={candidateId}
          companyId={companyId}
        />
      )}
    </>
  );
}