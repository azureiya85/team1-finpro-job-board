"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { JobPostingFeatured } from '@/types'; 
                                           
export default function FetchNextJobsPage() {
  const [jobs, setJobs] = useState<JobPostingFeatured[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobsData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/jobs?take=5');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
          setJobs(data as JobPostingFeatured[]);
        } else if (data && Array.isArray(data.jobs)) { 
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
          </li>
        ))}
      </ul>
    </div>
  );
}