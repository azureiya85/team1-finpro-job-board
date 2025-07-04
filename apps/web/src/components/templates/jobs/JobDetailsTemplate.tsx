'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import axios from 'axios';
import { JobPostingFeatured } from '@/types';
import { JobDetailsHeader } from '@/components/organisms/jobs/JobDetailsHeader';
import { JobDetailsContent } from '@/components/organisms/jobs/JobDetailsContent';
import { JobDetailsRelated } from '@/components/organisms/jobs/JobDetailsRelated';
import CVSubmitModal from '@/components/atoms/modals/CVSubmitModal';

export default function JobsDetailsTemplate() {
  const params = useParams();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [job, setJob] = useState<JobPostingFeatured | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      notFound();
      return;
    }

    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<JobPostingFeatured>(`/api/jobs/${jobId}`);
        setJob(response.data);
      } catch (err) {
        console.error(`Failed to fetch job ${jobId} from Next.js API:`, err);
        
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            notFound();
            return;
          }
          // Set a user-friendly error message
          setError(err.response?.data?.error || 'Failed to load job details. Please try again.');
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading job details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null; // notFound() was called in useEffect, so this prevents a flash of empty content
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <JobDetailsHeader job={job} />
        <JobDetailsContent job={job} />
        <div className="mt-8">
          <JobDetailsRelated currentJob={job} />
        </div>
      </div>
      <CVSubmitModal />
    </div>
  );
}