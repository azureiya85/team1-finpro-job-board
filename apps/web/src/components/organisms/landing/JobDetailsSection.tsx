'use client';

import { useJobSearchStore } from '@/stores/jobSearchStore';
import type { JobSearchStoreState } from '@/types/zustandSearch';
import type { JobPostingFeatured } from '@/types';
import { JobCard } from '@/components/molecules/landing/JobCard';
import { AlertCircle, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function JobDetailsSection() {
  // Select individual state slices and actions
  const jobs = useJobSearchStore((state: JobSearchStoreState) => state.jobs);
  const isLoading = useJobSearchStore((state: JobSearchStoreState) => state.isLoading);
  const error = useJobSearchStore((state: JobSearchStoreState) => state.error);
  const totalJobs = useJobSearchStore((state: JobSearchStoreState) => state.totalJobs);
  const currentPage = useJobSearchStore((state: JobSearchStoreState) => state.currentPage);
  const pageSize = useJobSearchStore((state: JobSearchStoreState) => state.pageSize);
  
  // State and actions for hybrid pagination
  const displayedJobsCount = useJobSearchStore((state) => state.displayedJobsCount);
  const isLoadingMore = useJobSearchStore((state) => state.isLoadingMore);
  const loadMoreJobs = useJobSearchStore((state) => state.loadMoreJobs);
  const setCurrentPage = useJobSearchStore((state) => state.setCurrentPage);

  // Derived state for rendering
  const displayJobs = jobs.slice(0, displayedJobsCount);
  const totalPages = Math.ceil(Math.max(0, totalJobs - 50) / pageSize) + 1; // Adjust total pages for hybrid model

  const isHybridMode = currentPage === 1;
  const canLoadMore = isHybridMode && displayedJobsCount < jobs.length;
  const hasMoreJobsInDb = totalJobs > jobs.length;
  
  // Skeleton loader
  if (isLoading && jobs.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(pageSize)].map((_, i) => (
          <div key={i} className="p-6 bg-card rounded-lg shadow-sm border animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive-foreground rounded-lg border border-destructive flex items-center gap-3">
        <AlertCircle className="h-6 w-6" />
        <div>
          <p className="font-semibold">Error loading jobs:</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0 && !isLoading) {
    return (
      <div className="p-10 text-center bg-card rounded-lg shadow-sm border">
        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Jobs Found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

   return (
    <div className="space-y-4">
      {/* Job Results Counter */}
      <div className="text-sm text-muted-foreground mb-4">
        Showing {displayJobs.length} of {totalJobs} jobs
      </div>

      {/* Job Cards */}
      {displayJobs.map((job: JobPostingFeatured) => (
        <JobCard key={job.id} job={job} />
      ))}

      {/* Pagination Controls */}
      <div className="mt-8 flex flex-col items-center gap-4">
        {/* Load More Button (Hybrid Mode) */}
        {canLoadMore && (
          <Button
            onClick={loadMoreJobs}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
            className="min-w-[150px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        )}

        {/* Switch to Traditional Pagination */}
        {isHybridMode && !canLoadMore && hasMoreJobsInDb && (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              You&apos;ve viewed all {jobs.length} initially loaded jobs.
            </p>
            <Button onClick={() => setCurrentPage(2)} variant="default">
              Continue to Page 2
            </Button>
          </div>
        )}

        {/* Traditional Pagination Controls */}
        {!isHybridMode && totalPages > 1 && (
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}