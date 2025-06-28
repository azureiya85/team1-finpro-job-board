import { useState, useEffect, useCallback } from 'react'; 
import { UserRole } from '@prisma/client';
import { ProfileUser } from '@/lib/applicantProfileService';

interface UseApplicantProfileResult {
  data: {
    user: ProfileUser;
    viewerRole: UserRole;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface ApiResponse {
  success: boolean;
  data?: {
    user: ProfileUser;
    viewerRole: UserRole;
  };
  error?: string;
}

export function useApplicantProfile(applicantId: string): UseApplicantProfileResult {
  const [data, setData] = useState<{
    user: ProfileUser;
    viewerRole: UserRole;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!applicantId) {
      setError('Applicant ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/companies/applicants-profile?id=${applicantId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch profile data');
      }

      setData(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [applicantId]); 

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); 

  const refetch = () => {
    fetchProfile();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}