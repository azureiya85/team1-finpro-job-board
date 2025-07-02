import React from 'react';
import Link from 'next/link';
import cn from 'classnames';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileText, MoreHorizontal, Crown, Zap, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ApplicationStatus } from '@prisma/client';
import type { JobApplicationDetails } from '@/types/applicants';
import { getStatusAction, statusConfig } from '@/lib/statusConfig';
import { formatEducationLevelDisplay } from '@/lib/jobConstants';

type ApplicantWithPriority = JobApplicationDetails & { isPriority: boolean };

interface ApplicantTableRowProps {
  applicant: ApplicantWithPriority;
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
  onCvPreview: (cvUrl: string) => void;
  onCoverLetterPreview: (coverLetter: string) => void;
  onScheduleInterview: (
    applicationId: string,
    scheduleData: ApplicantWithPriority['latestInterview'],
    isRescheduling: boolean
  ) => void;
}

function ApplicantAvatar({ name, image, isPriority }: { name: string; image?: string; isPriority: boolean }) {
  return (
    <div className="relative">
      <Avatar className="w-10 h-10">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback>{name?.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      {isPriority && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
          <Crown className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
}

function ApplicantStatusDropdown({
  currentStatus,
  onChange,
  appId,
}: {
  currentStatus: ApplicationStatus;
  onChange: (id: string, status: ApplicationStatus) => void;
  appId: string;
}) {
  return (
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
              onClick={() => onChange(appId, status)}
              disabled={currentStatus === status}
              className={currentStatus === status ? 'bg-muted cursor-not-allowed' : ''}
            >
              <Icon className={cn("mr-2 h-4 w-4", actionConfig.color)} />
              <span>{actionConfig.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ApplicantTableRow({
  applicant,
  onStatusChange,
  onCvPreview,
  onCoverLetterPreview,
  onScheduleInterview,
}: ApplicantTableRowProps) {
  const {
    id, isPriority, applicant: user, expectedSalary, createdAt, cvUrl, coverLetter, 
    status, jobPosting, testResult, latestInterview,
  } = applicant;
  const statusInfo = statusConfig[status];
  const hasInterviewAction = ['INTERVIEW_SCHEDULED', 'TEST_COMPLETED', 'REVIEWED'].includes(status);

  return (
    <TableRow className={cn("hover:bg-gray-50/50 transition-colors", isPriority && "bg-gradient-to-r from-amber-50/70 to-orange-50/70 border-l-4 border-l-amber-400")}>
      <TableCell className="pl-6"><ApplicantAvatar name={user.name} image={user.profileImage ?? undefined} isPriority={isPriority} /></TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${user.id}`} className="font-semibold hover:text-blue-600 underline">{user.name}</Link>
            {isPriority && <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 text-xs font-bold"><Zap className="w-3 h-3 mr-1" />PRIORITY</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">{user.email}</p>
            <Link href={`/profile/${user.id}`} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><ExternalLink className="w-3 h-3" />Profile</Link>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="text-sm"><span className="text-gray-600">Age:</span> <span className="font-medium ml-1">{user.age ?? 'N/A'}</span></p>
        <p className="text-sm"><span className="text-gray-600">Edu:</span> <span className="font-medium ml-1 text-xs">{formatEducationLevelDisplay(user.education)}</span></p>
      </TableCell>
      <TableCell><span className="text-sm">{expectedSalary ? `Rp ${expectedSalary.toLocaleString('id-ID')}` : <span className="text-gray-400">Not specified</span>}</span></TableCell>
      <TableCell><span className="text-sm text-gray-600">{new Date(createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}</span></TableCell>
      <TableCell className="text-center">
        {cvUrl ? <Button variant="outline" size="sm" onClick={() => onCvPreview(cvUrl)} className="h-8 px-2 text-xs"><FileText className="w-3 h-3" /></Button> : <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">No CV</span>}
      </TableCell>
      <TableCell className="text-center">
        {coverLetter ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onCoverLetterPreview(coverLetter)} 
            className="h-8 px-2 text-xs"
          >
            <FileText className="w-3 h-3" />
          </Button>
        ) : (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            No Cover Letter
          </span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {testResult?.score !== undefined ? (
          <Link href={`/jobs/${jobPosting?.id}/test/${jobPosting?.preSelectionTest?.id}/result`} className={cn("text-sm font-medium hover:underline", testResult.passed ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700")}>{testResult.score}%</Link>
        ) : <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Not taken</span>}
      </TableCell>
      <TableCell className="text-center">
        {hasInterviewAction ? (
          <Button variant="outline" size="sm" onClick={() => onScheduleInterview(id, latestInterview, !!latestInterview)} className="h-8 px-2 text-xs">{status === 'INTERVIEW_SCHEDULED' ? 'Reschedule' : 'Schedule'}</Button>
        ) : <span className="text-xs text-gray-400">N/A</span>}
      </TableCell>
      <TableCell>
        <Badge variant={statusInfo.variant} className={cn(statusInfo.className, 'text-xs whitespace-nowrap')}>
          <statusInfo.icon className="mr-1.5 h-3.5 w-3.5" />
          {statusInfo.text}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <ApplicantStatusDropdown currentStatus={status} onChange={onStatusChange} appId={id} />
      </TableCell>
    </TableRow>
  );
}