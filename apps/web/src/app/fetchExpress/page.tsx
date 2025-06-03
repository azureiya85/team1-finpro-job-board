"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
// Assuming JobPostingFeatured and GetJobsResult are accessible from apps/web
// You might need to adjust the import path if types are in apps/api or a shared package
import { JobPostingFeatured, GetJobsResult } from '@/types'; // Or your shared types path

// **IMPORTANT: Replace with your actual Express API URL**
const EXPRESS_API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001/api';

export default function FetchExpressJobsPage() {
  const [jobs, setJobs] = useState<JobPostingFeatured[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobsDataFromExpress() {
      try {
        setLoading(true);
        setError(null);
        // Fetch a small number of jobs for testing, e.g., 5
        // Your Express controller defaults includePagination=true
        const response = await fetch(`${EXPRESS_API_BASE_URL}/jobs?take=5`);

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            // Not a JSON response
          }
          throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }

        const data: GetJobsResult | JobPostingFeatured[] = await response.json();

        // Your job.controller.getAllJobs uses jobService.fetchJobs
        // which returns GetJobsResult when includePagination is true (default for controller)
        if ('jobs' in data && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        } else if (Array.isArray(data)) { // Fallback if it somehow returns just the array
          setJobs(data);
        } else {
          console.warn("Received data from Express is not in expected format (GetJobsResult or array):", data);
          setJobs([]);
        }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error("Failed to fetch jobs from Express API:", e);
        setError(e.message || "Failed to load jobs from Express. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchJobsDataFromExpress();
  }, []);

  if (loading) {
    return <div>Loading jobs from Express API...</div>;
  }

  if (error) {
    return <div>Error fetching from Express: {error}</div>;
  }

  if (jobs.length === 0) {
    return <div>No jobs found from Express API.</div>;
  }

  return (
    <div>
      <h1>Available Jobs (Fetched from Express API)</h1>
      <ul>
        {jobs.map((job) => (
          <li key={job.id} style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <h2>
              <Link href={`/fetchExpress/${job.id}`}>{job.title}</Link>
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