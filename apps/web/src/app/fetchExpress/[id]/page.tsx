"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
// Assuming JobPostingFeatured is accessible from apps/web
import { JobPostingFeatured } from '@/types'; // Or your shared types path

// **IMPORTANT: Replace with your actual Express API URL**
const EXPRESS_API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001/api';


export default function FetchExpressJobDetailPage() {
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

    async function fetchJobDetailFromExpress() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${EXPRESS_API_BASE_URL}/jobs/${jobId}`);

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

        const data: JobPostingFeatured = await response.json();
        setJob(data);
      } catch (e: any) {
        console.error(`Failed to fetch job ${jobId} from Express API:`, e);
        setError(e.message || "Failed to load job details from Express. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchJobDetailFromExpress();
  }, [jobId]);

  if (loading) {
    return <div>Loading job details from Express API...</div>;
  }

  if (error) {
    return <div>Error fetching from Express: {error}</div>;
  }

  if (!job) {
    return <div>Job not found from Express API or ID is invalid.</div>;
  }

  return (
    <div>
      <Link href="/fetchExpress">← Back to Express Jobs List</Link>
      <h1>{job.title}</h1>
      <p><strong>Company:</strong> {job.company?.name || 'N/A'}</p>
      <p><strong>Category:</strong> {job.category}</p>
      
      <h2>Description:</h2>
      <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
        {job.description}
      </div>

      {job.requirements && job.requirements.length > 0 && (
        <>
          <h3>Requirements:</h3>
          <ul>
            {job.requirements.map((req, index) => <li key={`req-${index}`}>{req}</li>)}
          </ul>
        </>
      )}
      {job.benefits && job.benefits.length > 0 && (
        <>
          <h3>Benefits:</h3>
          <ul>
            {job.benefits.map((benefit, index) => <li key={`ben-${index}`}>{benefit}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}