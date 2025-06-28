'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStores';
import GenerateCvModal from '@/components/organisms/dashboard/cv/GenerateCVModal';
import CvHistoryList from '@/components/organisms/dashboard/cv/CVHistoryList';
import { AlertTriangle, PlusCircle, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import axios from 'axios';
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

export default function CVGeneratorDisplay() {
  const { user: authUser } = useAuthStore();
  
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

  useEffect(() => {
    if (!authUser?.id) {
      setIsCvLoading(false);
      return;
    }

    fetchCvHistory();
  }, [authUser?.id, fetchCvHistory]);

  const handleCvSuccess = useCallback(() => {
    fetchCvHistory();
    toast.success('CV list updated!');
  }, [fetchCvHistory]);

  const handleRetryCvHistory = () => {
    fetchCvHistory();
  };

  // Loading state for CV section
  if (isCvLoading && generatedCvs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}