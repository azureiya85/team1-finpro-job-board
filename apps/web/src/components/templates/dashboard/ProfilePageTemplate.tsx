'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStores';
import ProfileDisplay, { UserProfile } from '@/components/molecules/dashboard/ProfileDisplay';
import CVGeneratorDisplay from '@/components/molecules/dashboard/CVGeneratorDisplay';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import axios, { AxiosError } from 'axios';

// Define the expected error response structure
interface ApiErrorResponse {
  error?: string;
  message?: string;
}

export default function ProfilePageTemplate() {
  const { user: authUser } = useAuthStore();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!authUser?.id) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get<UserProfile>(`/api/users/${authUser.id}`);
      setProfileData(response.data);
    } catch (err: unknown) {
      console.error(err);
      
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<ApiErrorResponse>;
        const errorMessage = axiosErr.response?.data?.error || 
                           axiosErr.response?.data?.message ||
                           axiosErr.response?.statusText || 
                           axiosErr.message || 
                           'Failed to fetch profile';
        setError(errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (!authUser?.id) {
      setIsLoading(false);
      return;
    }

    fetchUserProfile();
  }, [authUser?.id, fetchUserProfile]);

  const handleRetryProfile = () => {
    fetchUserProfile();
  };

  // Loading state for profile
  if (isLoading && !profileData) { 
    return (
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md border animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CV Section Loading - Now handled by CVGeneratorDisplay */}
        <CVGeneratorDisplay />
      </div>
    );
  }

  // Error state for profile
  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">Error loading profile</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <Button 
                onClick={handleRetryProfile}
                variant="outline" 
                size="sm"
                className="mt-3 border-red-200 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
        <ProfileDisplay user={profileData} />
      </div>

      {/* CV Generator Section */}
      <CVGeneratorDisplay />
    </div>
  );
}