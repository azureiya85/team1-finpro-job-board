'use client';

import { SavedJob, JobPosting, Company, City, Province } from '@prisma/client';
import { MapPin, CalendarDays, Briefcase, ArrowRight, BookmarkX, } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCVModalStore } from '@/stores/CVModalStores';
import { JobPostingFeatured } from '@/types'; 

export type SavedJobWithDetails = SavedJob & {
  jobPosting: JobPosting & {
    company: Pick<Company, 'id' | 'name' | 'logo'>;
    city: Pick<City, 'name'> | null;
    province: Pick<Province, 'name'> | null;
  };
};

interface SavedJobCardProps {
  savedJob: SavedJobWithDetails;
  onUnsave?: (jobId: string) => void; 
}

export default function SavedJobCard({ savedJob, onUnsave }: SavedJobCardProps) {
  const { jobPosting, createdAt } = savedJob;
  const company = jobPosting.company;
  const { openModal } = useCVModalStore();

  const handleApplyClick = () => {
    openModal(jobPosting as JobPostingFeatured);
  };
  
  const getDisplayLocation = () => {
    if (jobPosting.isRemote) return 'Remote';
    const city = jobPosting.city?.name;
    const province = jobPosting.province?.name.replace('Provinsi ', '');
    if (city && province) return `${city}, ${province}`;
    return city || province || 'Location Undisclosed';
  };

  const displayLocation = getDisplayLocation();
  const companyInitials = company.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleUnsave = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobPosting.id}/save`, { method: 'POST' });
      if (response.ok) {
        onUnsave?.(jobPosting.id);
      }
    } catch (error) {
      console.error("Failed to unsave job:", error);
    }
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
                 {/* Unsave Button on top right */}
                 <Button variant="ghost" size="icon" onClick={handleUnsave} className="text-muted-foreground hover:text-destructive">
                    <BookmarkX className="h-5 w-5" />
                 </Button> 
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{displayLocation}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                <span>Saved {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>    
      <CardFooter className="px-6 py-4 bg-muted/20 border-t border-border/50">
        <div className="flex justify-end items-center w-full">
          <Button
            size="sm"
            onClick={handleApplyClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 group/button"
          >
            Apply Now
            <ArrowRight className="w-4 h-4 transition-transform group-hover/button:translate-x-0.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}