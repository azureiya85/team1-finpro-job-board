'use client';

import { JobApplication, JobPosting, Company, InterviewSchedule, PreSelectionTest } from '@prisma/client';
import { MapPin, CalendarDays, Briefcase, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ApplicationStatus } from '@prisma/client';
import { TakeTestButton } from '../test/TakeTestButton';
import { statusConfig } from '@/lib/statusConfig';

export type ApplicationWithDetails = JobApplication & {
  jobPosting: Pick<JobPosting, 'id' | 'title' | 'isRemote' | 'preSelectionTestId'> & { 
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
    id?: string; 
    score: number;
    passed: boolean;
  } | null;
  candidateId: string; 
};

interface ApplicationCardProps {
  application: ApplicationWithDetails;
  onViewDetails: (application: ApplicationWithDetails) => void;
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} gap-1.5 font-medium`}>
      <IconComponent className="w-3 h-3" />
      {config.text}
    </Badge>
  );
}

export default function ApplicationCard({ application, onViewDetails }: ApplicationCardProps) {
  const { jobPosting, createdAt, status } = application;
  const company = jobPosting.company;

  const getDisplayLocation = () => {
    if (jobPosting.isRemote) {
      return 'Remote';
    }
    const city = jobPosting.city?.name;
    const province = jobPosting.province?.name;

    if (city && province) {
      return `${city}, ${province}`;
    }
    return city || province || 'Location N/A';
  };

  const displayLocation = getDisplayLocation();
  const companyInitials = company.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleTakeTest = () => {
    window.location.href = `/jobs/${jobPosting.id}/test/${jobPosting.preSelectionTestId}/take-test`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="w-14 h-14 border-2 border-border/20">
            <AvatarImage 
              src={company.logo || undefined} 
              alt={`${company.name} logo`}
              className="object-contain"
            />
            <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-sm">
              {company.logo ? <Briefcase className="w-6 h-6" /> : companyInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {jobPosting.title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">{company.name}</p>
              </div>
              <StatusBadge status={status} />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{displayLocation}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                <span>Applied {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>    
      <CardFooter className="px-6 py-4 bg-muted/20 border-t border-border/50">
        <div className="flex justify-end items-center w-full gap-2">
        {status === ApplicationStatus.TEST_REQUIRED && !application.testResult && jobPosting.preSelectionTestId && (
              <TakeTestButton
                applicationId={application.id}
                status={status}
                testCompleted={false}
                onTakeTest={handleTakeTest}
              />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(application)}
            className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-1 group/button"
          >
            View Details
            <ChevronRight className="w-4 h-4 transition-transform group-hover/button:translate-x-0.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}