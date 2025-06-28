'use client';

import { 
  MapPin, Clock, DollarSign, Calendar, Briefcase
} from 'lucide-react';
import type { JobPostingInStore } from '@/types';
import { 
  formatJobSalary, 
  formatJobType, 
  formatExperienceLevel, 
  formatJobPostedDate, 
  formatDeadlineDate 
} from '@/lib/utils';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CompanyJobCardActions from '@/components/atoms/modals/companies/CompanyJobCardActions';
import CompanyJobCardDescription from '@/components/atoms/modals/companies/CompanyJobCardDescription';

interface CompanyJobCardProps {
  job: JobPostingInStore;
}

export default function CompanyJobCard({ job }: CompanyJobCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {job.title}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.isRemote ? 'Remote' : (job.city?.name || 'N/A')}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatJobType(job.employmentType)} 
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {formatExperienceLevel(job.experienceLevel)}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>{formatJobSalary(job.salaryMin, job.salaryMax)}</span> 
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Posted {formatJobPostedDate(job.createdAt)}</span>
              </div>
            </div>
          </div>

          <CompanyJobCardActions job={job} />
        </div>
      </CardHeader>

      <CardContent>
        <CompanyJobCardDescription job={job} />
      </CardContent>

      {job.applicationDeadline && (
        <CardFooter className="pt-4">
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-md border border-orange-200">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">
              Application deadline: {formatDeadlineDate(job.applicationDeadline)}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}