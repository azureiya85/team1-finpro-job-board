"use client"; // Client component for fetching data

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // For accessing route parameters
import Link from 'next/link';
import { JobPostingFeatured } from '@/types'; // Assuming JobPostingFeatured is in @/types
                                           // Or a similar type that matches the API response for a single job

export default function FetchNextJobDetailPage() {
  const params = useParams();
  const jobId = params.id as string; // Get the 'id' from the URL

  const [job, setJob] = useState<JobPostingFeatured | null>(null); // Use JobPostingFeatured or a specific detail type
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      // This case should ideally not happen if routing is set up correctly
      setError("Job ID is missing from URL.");
      setLoading(false);
      return;
    }

    async function fetchJobDetailData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/jobs/${jobId}`); // Your API route for a single job
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: JobPostingFeatured = await response.json(); // Expecting a single job object
        setJob(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error(`Failed to fetch job ${jobId}:`, e);
        setError(e.message || "Failed to load job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchJobDetailData();
  }, [jobId]); // Re-run effect if jobId changes

  if (loading) {
    return <div>Loading job details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!job) {
    return <div>Job not found or ID is invalid.</div>;
  }

  return (
    <div>
      <Link href="/fetchNext">← Back to Jobs List</Link>
      <h1>{job.title}</h1>
      <p><strong>Company:</strong> {job.company?.name || 'N/A'}</p>
      <p><strong>Category:</strong> {job.category}</p>
      
      <h2>Description:</h2>
      <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
        {job.description}
      </div>

      {/* You can add more fields from the 'job' object as needed */}
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