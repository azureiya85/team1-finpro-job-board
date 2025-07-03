'use client';

import { ApplicationStatus, JobApplication, JobPosting, Company, InterviewSchedule, InterviewStatus } from '@prisma/client';
import { XCircle, AlertTriangle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ApplicationDetailsTimeline from './AppDetails/ApplicationDetailsTimeline';
import { ApplicationDetailsInterview } from './AppDetails/ApplicationDetailsInterview';
import { PreSelectionTest } from '@prisma/client';

export type ApplicationWithDetails = JobApplication & {
  jobPosting: Pick<JobPosting, 'id' | 'title' | 'isRemote'> & {
    province?: { name: string } | null;
    city?: { name: string } | null;
    company: Pick<Company, 'id' | 'name' | 'logo'>;
    preSelectionTest?: PreSelectionTest | null;
  };
  interviewSchedules: (Pick<
    InterviewSchedule,
    'id' | 'scheduledAt' | 'interviewType' | 'location' | 'status' | 'duration' | 'notes' | 
    'jobApplicationId' | 'jobPostingId' | 'candidateId'
  >)[]; 
  testResult?: {
    score: number;
    passed: boolean;
  } | null;
  candidateId: string;
};

interface ApplicationDetailModalProps {
  application: ApplicationWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationDetailModal({ application, isOpen, onClose }: ApplicationDetailModalProps) {
  if (!application) return null;

  const { jobPosting, status, createdAt, updatedAt, rejectionReason, adminNotes, interviewSchedules, testResult } = application;
  const hasScheduledInterview = interviewSchedules && interviewSchedules.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 sm:top-[1%] translate-y-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-foreground">Application Details for {jobPosting.title}</DialogTitle>
          <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 p-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="flex-1 [&>div>div]:!px-6 [&>div>div]:!pb-6 [&>div>div]:pt-2"> 
          <div className="space-y-6">
            <ApplicationDetailsTimeline 
              status={status}
              createdAt={createdAt}
              updatedAt={updatedAt}
              interviewSchedules={interviewSchedules}
            />

{hasScheduledInterview ? (
              <ApplicationDetailsInterview
                interview={{
                  ...interviewSchedules[0],
                  jobApplicationId: application.id,
                  jobPostingId: jobPosting.id,
                  candidateId: application.candidateId
                }}
                onStatusChange={async (newStatus: InterviewStatus) => {
                  try {
                    const response = await fetch(`/api/interviews/${interviewSchedules[0].id}/status`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: newStatus })
                    });
                    
                    if (!response.ok) throw new Error('Failed to update status');
                    window.location.reload();
                  } catch (error) {
                    console.error('Error updating interview status:', error);
                  }
                }}
                onReschedule={() => {
                  window.location.href = `/interviews/${interviewSchedules[0].id}/reschedule`;
                }}
              />
            ) : testResult && (
              <Card className={testResult.passed ? 'bg-green-50' : 'bg-red-50'}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Pre-Selection Test Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <span>Score:</span>
                    <span className="font-medium">{testResult.score}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span>Status:</span>
                    <span className={`font-medium ${testResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {status === ApplicationStatus.REJECTED && (
              <Card className="bg-red-50 border-red-100 shadow-sm">
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-base font-semibold text-red-800 flex items-center">
                    <XCircle className="w-4 h-4 mr-2 text-red-600" />
                    Application Outcome
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-red-700 pt-0 pb-3">
                  {rejectionReason ? (
                    <p>{rejectionReason}</p>
                  ) : (
                    <p>
                      Unfortunately, your application was not successful at this time. We encourage you to apply for
                      other suitable roles.
                    </p>
                  )}
                  {adminNotes && <p className="text-xs text-red-600 mt-1.5 italic">(Internal Feedback: {adminNotes})</p>}
                </CardContent>
              </Card>
            )}

            {status === ApplicationStatus.WITHDRAWN && (
              <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-gray-600" />
                    Application Withdrawn
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 pt-0">
                  <p>You have withdrawn this application on {format(new Date(updatedAt), 'MMMM d, yyyy')}.</p>
                </CardContent>
              </Card>
            )}

            <p className="text-xs text-muted-foreground text-center pt-2">
              Applied: {format(new Date(createdAt), 'MMM d, yyyy')} | Last Update: {format(new Date(updatedAt), 'MMM d, yyyy')}
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}