'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Briefcase, Loader2 } from 'lucide-react';
import { JobPostingFeatured } from '@/types'; 
import { RelatedJobCard } from '@/components/molecules/jobs/RelatedJobCard';
import { AnimatePresence } from 'framer-motion';
import { buildRelatedJobsQuery, filterRelatedJobs, parseJobsResponse } from '@/lib/attemptFilterHelper';
import { useHorizontalScroll, createScrollIndicators } from '@/lib/scrollHelper';

const EXPRESS_API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001/api';

interface JobDetailsRelatedProps {
  currentJob: JobPostingFeatured;
}

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: EXPRESS_API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for CORS
});

export function JobDetailsRelated({ currentJob }: JobDetailsRelatedProps) {
  const [relatedJobs, setRelatedJobs] = useState<JobPostingFeatured[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use the scroll helper hook
  const { scrollState, scrollLeft, scrollRight } = useHorizontalScroll(
    scrollContainerRef, 
    relatedJobs.length
  );

  // Fetch related jobs with multi-stage attempts
  const fetchRelatedJobs = useCallback(async (attempt = 1) => {
    if (attempt === 1) {
      setIsLoading(true);
      setError(null);
      setRelatedJobs([]); 
    }
    
    try {
      const queryString = buildRelatedJobsQuery(currentJob, attempt);
      if (!queryString.includes('take=')) {
        console.warn("Query string seems empty, might not fetch anything useful.", queryString);
      }

      // Use the configured axios instance
      const response = await apiClient.get(`/jobs?${queryString}`, {
      });

      const responseData: unknown = response.data;
      const fetchedJobsArray = parseJobsResponse(responseData);
      const filteredJobs = filterRelatedJobs(fetchedJobsArray, currentJob.id, 5);

      const MAX_ATTEMPTS = 4; 
      if (filteredJobs.length >= 3 || attempt >= MAX_ATTEMPTS) {
        setRelatedJobs(filteredJobs);
        setIsLoading(false); 
        if (filteredJobs.length === 0 && attempt >= MAX_ATTEMPTS) {
          setError("Could not find suitably related jobs after several tries.");
        }
      } else {
        fetchRelatedJobs(attempt + 1);
      }

    } catch (err) {
      console.error(`Error fetching related jobs (attempt ${attempt}):`, err);
      
      const MAX_ATTEMPTS = 4;
      if (attempt < MAX_ATTEMPTS) {
        fetchRelatedJobs(attempt + 1);
      } else {
        let errorMessage = 'Failed to load related jobs after multiple attempts.';
        
        if (axios.isAxiosError(err)) {
          if (err.code === 'NETWORK_ERR' || err.message === 'Network Error') {
            errorMessage = 'Network connection error. Please check your connection and try again.';
          } else if (err.response) {
            errorMessage = err.response.data?.error || 
                          err.response.data?.message || 
                          `Server error: ${err.response.status}`;
          } else if (err.request) {
            errorMessage = 'No response from server. Please try again later.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
        setRelatedJobs([]);
        setIsLoading(false);
      }
    }
  }, [currentJob]); 

  // Initial fetch when currentJob.id changes
  useEffect(() => {
    if (currentJob.id) { 
      fetchRelatedJobs(1); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [currentJob.id]); 

  if (isLoading) {
    return (
      <Card className="border-2 border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Related Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading related jobs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Related Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{error}</p>
            <button 
              onClick={() => fetchRelatedJobs(1)} 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedJobs.length === 0) {
    return (
      <Card className="border-2 border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Related Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No related jobs found at the moment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scrollIndicators = createScrollIndicators(relatedJobs.length, 5);

  return (
    <Card className="border-2 border-border/50 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Related Jobs
          </CardTitle>
          
          {/* Scroll buttons */}
          {(scrollState.canScrollLeft || scrollState.canScrollRight) && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollLeft}
                disabled={!scrollState.canScrollLeft}
                className="h-8 w-8 p-0 border-2 border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Scroll related jobs left"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollRight}
                disabled={!scrollState.canScrollRight}
                className="h-8 w-8 p-0 border-2 border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Scroll related jobs right"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{
              scrollSnapType: 'x mandatory', 
            }}
          >
            <AnimatePresence>
              {relatedJobs.map((job, index) => (
                <RelatedJobCard
                  key={job.id}
                  job={job}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {(scrollState.canScrollLeft || scrollState.canScrollRight) && relatedJobs.length > 1 && (
            <div className="flex justify-center mt-4 gap-1">
              {scrollIndicators.map((index) => ( 
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-muted-foreground/20 transition-colors duration-200"
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}