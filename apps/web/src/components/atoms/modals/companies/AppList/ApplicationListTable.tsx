import React from 'react';
import cn from 'classnames';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileText, MoreHorizontal, Crown, Zap } from 'lucide-react';
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
  onScheduleInterview: (
    applicationId: string,
    scheduleData: ApplicantWithPriority['latestInterview'],
    isRescheduling: boolean
  ) => void;
}

export default function ApplicantTableRow({
  applicant: app,
  onStatusChange,
  onCvPreview,
  onScheduleInterview,
}: ApplicantTableRowProps) {
  const statusInfo = statusConfig[app.status];

  return (
    <TableRow 
      className={cn(
        "hover:bg-gray-50/50 transition-colors",
        app.isPriority && "bg-gradient-to-r from-amber-50/70 to-orange-50/70 border-l-4 border-l-amber-400 hover:from-amber-50 hover:to-orange-50"
      )}
    >
      <TableCell className="pl-6">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={app.applicant.profileImage || undefined} alt={app.applicant.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {app.applicant.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {app.isPriority && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 truncate">{app.applicant.name}</p>
            {app.isPriority && (
              <Badge 
                variant="default"
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 px-2 py-0.5 text-xs font-bold shadow-md border-0 animate-pulse"
              >
                <Zap className="w-3 h-3 mr-1" />
                PRIORITY
              </Badge>
            )}
          </div>
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
        {app.status === 'INTERVIEW_SCHEDULED' || app.status === 'TEST_COMPLETED' || app.status === 'REVIEWED' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onScheduleInterview(app.id, app.latestInterview, !!app.latestInterview)}
            className="h-8 px-2 text-xs"
          >
            {app.status === 'INTERVIEW_SCHEDULED' ? 'Reschedule' : 'Schedule'}
          </Button>
        ) : (
          <span className="text-xs text-gray-400">
            N/A
          </span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={statusInfo.variant} className={cn(statusInfo.className, 'text-xs whitespace-nowrap')}>
          <statusInfo.icon className="mr-1.5 h-3.5 w-3.5" />
          {statusInfo.text}
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
}