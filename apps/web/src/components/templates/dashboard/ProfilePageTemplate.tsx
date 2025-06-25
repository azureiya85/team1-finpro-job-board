'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStores';
import ProfileDisplay, { UserProfile } from '@/components/molecules/dashboard/ProfileDisplay';
import GenerateCvModal from '@/components/organisms/dashboard/cv/GenerateCVModal';
import CvHistoryList from '@/components/organisms/dashboard/cv/CVHistoryList';
import { AlertTriangle, PlusCircle, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

interface CvRecord {
  id: string;
  fileName: string | null;
  createdAt: string;
  url: string;
}

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

  // State for CV Feature
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedCvs, setGeneratedCvs] = useState<CvRecord[]>([]);
  const [isCvLoading, setIsCvLoading] = useState(true);
  const [cvError, setCvError] = useState<string | null>(null);

  const fetchCvHistory = useCallback(async () => {
    if (!authUser?.id) return;
    
    setIsCvLoading(true);
    setCvError(null);
    
    try {
      const response = await axiosInstance.get<CvRecord[]>('/api/users/cv');
      setGeneratedCvs(response.data);
    } catch (error) {
      console.error("Failed to fetch CV history", error);
      setCvError('Failed to load CV history');
      
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data as ApiErrorResponse;
        const message = errorResponse?.error || errorResponse?.message || error.message;
        setCvError(message);
      } else if (error instanceof Error) {
        setCvError(error.message);
      } else {
        setCvError('Failed to load CV history');
      }
    } finally {
      setIsCvLoading(false);
    }
  }, [authUser?.id]);

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
      setIsCvLoading(false);
      return;
    }

    fetchUserProfile();
    fetchCvHistory();
  }, [authUser?.id, fetchUserProfile, fetchCvHistory]);

  const handleCvSuccess = useCallback(() => {
    fetchCvHistory();
    toast.success('CV list updated!');
  }, [fetchCvHistory]);

  const handleRetryProfile = () => {
    fetchUserProfile();
  };

  const handleRetryCvHistory = () => {
    fetchCvHistory();
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
        
        {/* CV Section Loading */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
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
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-primary-50 to-indigo-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">CV Generator</h2>
                <p className="text-sm text-gray-600">
                  Create professional, ATS-friendly CVs based on your profile
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate New CV
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {cvError ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800">Failed to load CV history</h4>
                  <p className="text-red-700 text-sm mt-1">{cvError}</p>
                  <Button 
                    onClick={handleRetryCvHistory}
                    variant="outline" 
                    size="sm"
                    className="mt-2 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <CvHistoryList cvs={generatedCvs} isLoading={isCvLoading} />
          )}
        </div>
      </div>
      
      <GenerateCvModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCvSuccess}
      />
    </div>
  );
}