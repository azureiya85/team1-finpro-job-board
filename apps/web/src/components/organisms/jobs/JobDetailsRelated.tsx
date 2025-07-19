'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Briefcase, Loader2 } from 'lucide-react';
import { JobPostingFeatured } from '@/types';
import { RelatedJobCard } from '@/components/molecules/jobs/RelatedJobCard';
import { AnimatePresence } from 'framer-motion';
import { useHorizontalScroll, createScrollIndicators } from '@/lib/scrollHelper';

interface Props { currentJob: JobPostingFeatured }

export function JobDetailsRelated({ currentJob }: Props) {
  const [relatedJobs, setRelatedJobs] = useState<JobPostingFeatured[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollState, scrollLeft, scrollRight } = useHorizontalScroll(scrollRef, relatedJobs.length);

    const fetchRelatedJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRelatedJobs([]);

    try {
      const res = await fetch(`/api/jobs/related?jobId=${currentJob.id}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error: ${res.status}`);
      }

      const data: JobPostingFeatured[] = await res.json();
      setRelatedJobs(data);
      if (data.length === 0) {
        console.log("No related jobs were found by the API.");
      }

    } catch (err: unknown) {
      console.error("Failed to load related jobs:", err);
      
      let errorMessage = 'An unexpected error occurred.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setRelatedJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentJob.id]);

  useEffect(() => {
    if (currentJob.id) {
      fetchRelatedJobs();
    }
  }, [currentJob.id, fetchRelatedJobs]); 

  const renderHeader = () => (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Related Jobs
        </CardTitle>
        {(scrollState.canScrollLeft || scrollState.canScrollRight) && (
          <div className="flex gap-2">
            <Button onClick={scrollLeft} disabled={!scrollState.canScrollLeft} variant="outline" size="sm" className="h-8 w-8 p-0 border-2 border-border">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={scrollRight} disabled={!scrollState.canScrollRight} variant="outline" size="sm" className="h-8 w-8 p-0 border-2 border-border">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </CardHeader>
  );

  if (isLoading) return (
    <Card className="border-2 border-border/50">
      {renderHeader()}
      <CardContent>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading related jobs...</span>
        </div>
      </CardContent>
    </Card>
  );

  if (error) return (
    <Card className="border-2 border-border/50">
      {renderHeader()}
      <CardContent className="text-center py-8">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchRelatedJobs} className="mt-4">Try Again</Button>
      </CardContent>
    </Card>
  );

  if (!relatedJobs.length) return (
    <Card className="border-2 border-border/50">
      {renderHeader()}
      <CardContent className="text-center py-8">
        <p className="text-muted-foreground">No related jobs found at the moment.</p>
      </CardContent>
    </Card>
  );

  const indicators = createScrollIndicators(relatedJobs.length, 5);

  return (
    <Card className="border-2 border-border/50 overflow-hidden">
      {renderHeader()}
      <CardContent className="px-6 pb-6">
        <div className="relative">
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2" style={{ scrollSnapType: 'x mandatory' }}>
            <AnimatePresence>
              {relatedJobs.map((job, i) => (
                <RelatedJobCard key={job.id} job={job} index={i} />
              ))}
            </AnimatePresence>
          </div>
          {indicators.length > 1 && (
            <div className="flex justify-center mt-4 gap-1">
              {indicators.map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/20" />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}