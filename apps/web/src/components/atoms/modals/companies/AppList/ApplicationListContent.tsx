'use client';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@prisma/client';
import { getStatusDisplay } from '@/lib/applicants/statusValidation'; 
import { getStatusAction } from '@/components/atoms/modals/dashboard/AppDetails/statusConfig';
import { FileText, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import { formatEducationLevelDisplay } from '@/lib/utils';
import type { JobApplicationDetails } from '@/types/applicants';
import { InterviewScheduleForm } from '@/components/molecules/interview/InterviewScheduleForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/dateTimeUtils';
import { useState } from 'react';
import { toast } from 'sonner';
import cn from 'classnames';

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
}

export default function ApplicantListContent({ 
  applicants, 
  onStatusChange, 
  onCvPreview,
  onScheduleInterview
}: ApplicantListContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInterviewSubmit = async (
    applicationId: string, 
    data: {
      scheduledAt: Date;
      duration: number;
      interviewType: 'ONLINE' | 'ONSITE';
      location?: string;
      notes?: string;
    },
    isRescheduling: boolean = false
  ) => {
    try {
      setIsSubmitting(true);
      await onScheduleInterview(applicationId, data, isRescheduling);
      toast.success('Interview scheduled successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule interview';
      toast.error(errorMessage);
      console.error('Error scheduling interview:', error);
    } finally {
      setIsSubmitting(false);
    }
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
                {app.status === ApplicationStatus.INTERVIEW_SCHEDULED ? (
                  <Button
                    variant="ghost"
                    className="text-sm hover:bg-gray-50 space-y-1 w-full h-auto py-2 px-3"
                    onClick={() => onScheduleInterview(app.id, {
                      id: app.latestInterview?.id, // ✅ wajib untuk PUT
                      scheduledAt: app.latestInterview ? new Date(app.latestInterview.scheduledAt) : new Date(),
                      duration: app.latestInterview?.duration || 60,
                      interviewType: app.latestInterview?.interviewType || 'ONLINE',
                      location: app.latestInterview?.location || '',
                      notes: app.latestInterview?.notes || ''
                    }, true)}
                  >
                    <div className="text-primary">
                      {app.latestInterview ? formatDateTime(new Date(app.latestInterview.scheduledAt)) : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {app.latestInterview?.location ? `📍 ${app.latestInterview.location}` : ''}
                    </div>
                    <div className="text-xs text-gray-500 italic">
                      {app.latestInterview?.notes ? `📝 ${app.latestInterview.notes}` : ''}
                    </div>
                  </Button>
                ) : app.status === ApplicationStatus.TEST_COMPLETED ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onScheduleInterview(app.id, {
                      scheduledAt: new Date(),
                      duration: 60,
                      interviewType: 'ONLINE',
                      location: '',
                      notes: ''
                    }, false)}
                  >
                    Schedule Interview
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
    </div>
  );
}