"use client"; // Client component for fetching data

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { JobPostingFeatured } from '@/types'; // Assuming JobPostingFeatured is in @/types
                                           // Or if it's part of jobUtils.ts exports:
                                           // import { JobPostingFeatured } from '@/lib/jobsUtils';

export default function FetchNextJobsPage() {
  const [jobs, setJobs] = useState<JobPostingFeatured[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobsData() {
      try {
        setLoading(true);
        setError(null);
        // Your API route for listing jobs (uses getJobs from jobUtils)
        // Let's fetch a small number for testing, e.g., 5 jobs
        const response = await fetch('/api/jobs?take=5');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Your getJobs can return JobPostingFeatured[] or GetJobsResult (with pagination)
        // This simple page will assume it gets an array directly or extracts it.
        if (Array.isArray(data)) {
          setJobs(data as JobPostingFeatured[]);
        } else if (data && Array.isArray(data.jobs)) { // Handling GetJobsResult
          setJobs(data.jobs as JobPostingFeatured[]);
        } else {
          console.warn("Received data is not in expected format (array or {jobs: array}):", data);
          setJobs([]);
        }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error("Failed to fetch jobs:", e);
        setError(e.message || "Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchJobsData();
  }, []);

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (jobs.length === 0) {
    return <div>No jobs found.</div>;
  }

  return (
    <div>
      <h1>Available Jobs (Testing /fetchNext)</h1>
      <ul>
        {jobs.map((job) => (
          <li key={job.id} style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <h2>
              <Link href={`/fetchNext/${job.id}`}>{job.title}</Link>
            </h2>
            <p><strong>Category:</strong> {job.category}</p>
            <p><strong>Company:</strong> {job.company?.name || 'N/A'}</p>
            {/* Display application count if available from JobPostingFeatured */}
          </li>
        ))}
      </ul>
    </div>
  );
}