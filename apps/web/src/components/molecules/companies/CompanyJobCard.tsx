'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, Clock, DollarSign, Calendar, Briefcase, ChevronDown, 
  ChevronUp, LogIn, ArrowRight, Share2, Linkedin, Facebook, Twitter, MessageCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { EmploymentType, ExperienceLevel } from '@prisma/client';
import type { JobPostingInStore } from '@/types';
import { employmentTypeLabels, experienceLevelLabels } from '@/lib/jobConstants';
import { useAuthStore } from '@/stores/authStores';
import { useCVModalStore } from '@/stores/CVModalStores';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface CompanyJobCardProps {
  job: JobPostingInStore;
}

export default function CompanyJobCard({ job }: CompanyJobCardProps) {
  const [showAllRequirements, setShowAllRequirements] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useCVModalStore();

  // Social Sharing Logic

  const jobUrl = typeof window !== 'undefined' ? `${window.location.origin}/jobs/${job.id}` : '';
  const shareText = `Check out this job opportunity: ${job.title}`;
  const encodedUrl = encodeURIComponent(jobUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
  };
  
  const formatSalary = (minSalary?: number | null, maxSalary?: number | null) => { 
    const formatNumber = (num: number) => num.toLocaleString('id-ID');

    if (minSalary && maxSalary) {
      if (minSalary === maxSalary) return `Rp ${formatNumber(minSalary)}`;
      return `Rp ${formatNumber(minSalary)} - Rp ${formatNumber(maxSalary)}`;
    }
    if (minSalary) return `Rp ${formatNumber(minSalary)}+`;
    if (maxSalary) return `Up to Rp ${formatNumber(maxSalary)}`;

    return 'Competitive';
  };

  const formatJobType = (type: EmploymentType) => {
    return employmentTypeLabels[type] || type;
  };

  const formatExperienceLevel = (level: ExperienceLevel) => {
    return experienceLevelLabels[level] || level;
  };

  const handleApplyClick = () => {
    if (isAuthenticated) {
      openModal(job);
    }
  };

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
                <span>{formatSalary(job.salaryMin, job.salaryMax)}</span> 
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* --- Social Sharing --- */}
          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12" aria-label="Share job posting">
                  <Share2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Share via</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    <Linkedin className="mr-2 h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    <Facebook className="mr-2 h-4 w-4" />
                    <span>Facebook</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    <Twitter className="mr-2 h-4 w-4" />
                    <span>Twitter</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <Button
                onClick={handleApplyClick}
                className="shrink-0 group/btn h-12"
                size="lg"
              >
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </Button>
            ) : (
              <Button asChild variant="secondary" size="lg" className="shrink-0 group/btn h-12">
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                  Sign In To Apply
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <CardDescription className="text-base leading-relaxed">
          {job.description}
        </CardDescription>

        {job.requirements && job.requirements.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <Collapsible open={showAllRequirements} onOpenChange={setShowAllRequirements}>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  Requirements
                  <Badge variant="secondary" className="text-xs">
                    {job.requirements.length}
                  </Badge>
                </h4>

                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  {job.requirements.slice(0, 3).map((requirement, index) => (
                    <li key={index} className="leading-relaxed">
                      {requirement}
                    </li>
                  ))}
                </ul>

                <CollapsibleContent className="space-y-2">
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    {job.requirements.slice(3).map((requirement, index) => (
                      <li key={index + 3} className="leading-relaxed">
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>

                {job.requirements.length > 3 && (
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 p-0 text-primary hover:text-primary/80">
                      {showAllRequirements ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Show {job.requirements.length - 3} more requirements
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
            </Collapsible>
          </div>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <Collapsible open={showAllBenefits} onOpenChange={setShowAllBenefits}>
              <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                  Benefits
                  <Badge variant="secondary" className="text-xs">
                    {job.benefits.length}
                  </Badge>
                </h4>

                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  {job.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="leading-relaxed">
                      {benefit}
                    </li>
                  ))}
                </ul>

                <CollapsibleContent className="space-y-2">
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    {job.benefits.slice(3).map((benefit, index) => (
                      <li key={index + 3} className="leading-relaxed">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>

                {job.benefits.length > 3 && (
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 p-0 text-primary hover:text-primary/80">
                      {showAllBenefits ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Show {job.benefits.length - 3} more benefits
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
            </Collapsible>
          </div>
        )}
      </CardContent>

      {job.applicationDeadline && (
        <CardFooter className="pt-4">
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-md border border-orange-200">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">
              Application deadline: {new Date(job.applicationDeadline).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}