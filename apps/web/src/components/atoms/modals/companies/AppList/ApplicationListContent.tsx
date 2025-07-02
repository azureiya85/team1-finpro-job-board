import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText } from 'lucide-react';
import { ApplicationStatus } from '@prisma/client';
import type { JobApplicationDetails } from '@/types/applicants';
import ApplicantTableRow from './ApplicationListTable';

// Define a more specific type for the component's props
type ApplicantWithPriority = JobApplicationDetails & { isPriority: boolean };

interface ApplicantListContentProps {
  applicants?: ApplicantWithPriority[];
  onStatusChange?: (applicationId: string, newStatus: ApplicationStatus) => void;
  onCvPreview?: (cvUrl: string) => void;
  onCoverLetterPreview?: (coverLetter: string) => void;
  onScheduleInterview?: (
    applicationId: string,
    scheduleData: ApplicantWithPriority['latestInterview'],
    isRescheduling: boolean
  ) => void;
  companyId?: string;
}

export default function ApplicantListContent({
  applicants = [],
  onStatusChange = () => {},
  onCvPreview = () => {},
  onCoverLetterPreview = () => {},
  onScheduleInterview = () => {},
}: ApplicantListContentProps) {

  if (applicants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="w-16 h-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-800">No Applicants Yet</h3>
        <p className="mt-1 text-sm text-gray-500">Applications for this job will appear here.</p>
      </div>
    );
  }

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
            <TableHead className="w-24 font-semibold text-center">Cover Letter</TableHead>
            <TableHead className="w-24 font-semibold text-center">Test Score</TableHead>
            <TableHead className="w-32 font-semibold text-center">Interview</TableHead>
            <TableHead className="w-32 font-semibold">Status</TableHead>
            <TableHead className="w-28 font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants.map((app) => (
            <ApplicantTableRow
              key={app.id}
              applicant={app}
              onStatusChange={onStatusChange}
              onCvPreview={onCvPreview}
              onCoverLetterPreview={onCoverLetterPreview}
              onScheduleInterview={onScheduleInterview}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}