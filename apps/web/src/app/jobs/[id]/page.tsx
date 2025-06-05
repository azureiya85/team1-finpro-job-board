'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { JobPostingFeatured } from '@/types';
import { JobDetailsHeader } from '@/components/templates/jobs/JobDetailsHeader';
import { JobDetailsContent } from '@/components/templates/jobs/JobDetailsContent';
import { JobDetailsRelated } from '@/components/templates/jobs/JobDetailsRelated';
import CVSubmitModal from '@/components/atoms/modals/CVSubmitModal';  

const EXPRESS_API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001/api';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobPostingFeatured | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError("Job ID is missing from URL.");
      setLoading(false);
      return;
    }

    async function fetchJobFromExpress() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${EXPRESS_API_BASE_URL}/jobs/${jobId}`, {
          cache: 'no-store', // Fresh data
        });

        if (!response.ok) {
          if (response.status === 404) {
            notFound();
            return;
          }
          
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            // Not a JSON response
          }
          throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }

        const data: JobPostingFeatured = await response.json();
        setJob(data);
      } catch (err) {
        console.error(`Failed to fetch job ${jobId} from Express API:`, err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : typeof err === 'string'
            ? err 
            : "Failed to load job details from Express. Please try again later.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchJobFromExpress();
  }, [jobId]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
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
    notFound();
    return null;
  }

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