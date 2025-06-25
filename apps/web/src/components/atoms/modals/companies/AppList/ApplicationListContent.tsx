"use client";

import { useState } from 'react';
import cn from 'classnames';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileText, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ApplicationStatus } from '@prisma/client';
import { getStatusDisplay } from '@/lib/applicants/statusValidation';
import { getStatusAction } from '@/lib/statusConfig';
import { formatEducationLevelDisplay } from '@/lib/utils';
import type { JobApplicationDetails } from '@/types/applicants';
import { InterviewScheduleModal } from '@/components/organisms/interview/InterviewScheduleModal';
import type { InterviewSchedule } from '@prisma/client';

type InterviewModalData = JobApplicationDetails['latestInterview'];

interface ApplicantListContentProps {
  applicants: JobApplicationDetails[];
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
  onCvPreview: (cvUrl: string | null) => void;
  onScheduleInterview: (
    applicationId: string,
    scheduleData: {
      id?: string;
      scheduledAt: Date;
      duration: number;
      interviewType: 'ONLINE' | 'ONSITE';
      location?: string;
      notes?: string;
    },
    isRescheduling: boolean
  ) => void;
  companyId: string;
}

export default function ApplicantListContent({ 
  applicants, 
  onStatusChange, 
  onCvPreview,
  onScheduleInterview,
  companyId
}: ApplicantListContentProps) {
  const [selectedInterview, setSelectedInterview] = useState<{
    applicationId: string;
    jobId: string;
    candidateId: string;
    interview?: InterviewModalData; 
  } | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  
  const handleOpenInterviewModal = (
    applicationId: string,
    jobId: string,
    candidateId: string,
    interview?: InterviewModalData
  ) => {
    setSelectedInterview({ applicationId, jobId, candidateId, interview });
    setModalOpen(true);
  };

  const handleInterviewUpdate = (interview: InterviewSchedule) => {
    const scheduleData = {
      id: interview.id,
      scheduledAt: new Date(interview.scheduledAt),
      duration: interview.duration,
      interviewType: interview.interviewType as 'ONLINE' | 'ONSITE',
      location: interview.location || undefined,
      notes: interview.notes || undefined
    };

    if (selectedInterview) {
      const isRescheduling = !!selectedInterview.interview;
      onScheduleInterview(selectedInterview.applicationId, scheduleData, isRescheduling);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedInterview(null);
  };

  return (
    <div className="w-full">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="w-16 pl-6">Photo</TableHead>
            <TableHead className="w-48 font-semibold">Applicant Info</TableHead>
            <TableHead className="w-32 font-semibold">Details</TableHead>
            <TableHead className="w-36 font-semibold">Salary Expectation</TableHead>
            <TableHead className="w-32 font-semibold">Applied Date</TableHead>
            <TableHead className="w-24 font-semibold text-center">CV</TableHead>
            <TableHead className="w-24 font-semibold text-center">Test Score</TableHead>
            <TableHead className="w-32 font-semibold text-center">Interview</TableHead>
            <TableHead className="w-32 font-semibold">Status</TableHead>
            <TableHead className="w-28 font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants.map((app) => {
            const statusInfo = getStatusDisplay(app.status);
            return (
              <TableRow key={app.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="pl-6">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={app.applicant.profileImage || undefined} alt={app.applicant.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {app.applicant.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 truncate">{app.applicant.name}</p>
                    <p className="text-sm text-gray-600 truncate">{app.applicant.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium ml-1">{app.applicant.age ?? 'N/A'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Edu:</span>
                      <span className="font-medium ml-1 text-xs">
                        {formatEducationLevelDisplay(app.applicant.education)}
                      </span>
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {app.expectedSalary ? (
                      <span className="font-semibold text-green-700">
                        Rp {app.expectedSalary.toLocaleString('id-ID')}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {new Date(app.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit'
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {app.cvUrl ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onCvPreview(app.cvUrl)}
                      className="h-8 px-2 text-xs"
                    >
                      <FileText className="w-3 h-3" />
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      No CV
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {app.testResult ? (
                    <span className={`text-sm font-medium ${app.testResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {app.testResult.score}%
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      Not taken
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {app.status === ApplicationStatus.INTERVIEW_SCHEDULED || app.status === ApplicationStatus.TEST_COMPLETED ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInterviewModal(
                        app.id,
                        app.jobPosting?.id || '',
                        app.applicant.id,
                        // Pass app.latestInterview if status is INTERVIEW_SCHEDULED and it exists, otherwise pass undefined
                        app.status === ApplicationStatus.INTERVIEW_SCHEDULED && app.latestInterview ? 
                          app.latestInterview : undefined 
                      )}
                      className="h-8 px-2 text-xs"
                    >
                      {app.status === ApplicationStatus.INTERVIEW_SCHEDULED ? 'Reschedule' : 'Schedule Interview'}
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Not available
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`${statusInfo.bgColor} ${statusInfo.color} hover:${statusInfo.bgColor} px-2 py-1 text-xs whitespace-nowrap`}
                  >
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-2">
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {Object.values(ApplicationStatus).map(status => {
                        const actionConfig = getStatusAction(status);
                        const Icon = actionConfig.icon;
                        return (
                          <DropdownMenuItem 
                            key={status}
                            onClick={() => onStatusChange(app.id, status)}
                            disabled={app.status === status}
                            className={app.status === status ? 'bg-muted cursor-not-allowed' : ''}
                          >
                            <Icon className={cn("mr-2 h-4 w-4", actionConfig.color)} />
                            <span>{actionConfig.label}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {selectedInterview && (
        <InterviewScheduleModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          applicationId={selectedInterview.applicationId}
          jobId={selectedInterview.jobId}
          candidateId={selectedInterview.candidateId}
          companyId={companyId}
          interview={selectedInterview.interview}
          onInterviewUpdate={handleInterviewUpdate}
        />
      )}
    </div>
  );
}