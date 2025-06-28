'use client';

import { Star } from 'lucide-react';

interface ReviewStatesProps {
  isLoading: boolean;
  error: string | null;
  hasReviews: boolean;
  companyName: string;
}

export default function ReviewStates({ 
  isLoading, 
  error, 
  hasReviews, 
  companyName 
}: ReviewStatesProps) {
  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-700 text-center">{error}</p>
      </div>
    );
  }

  // Empty State
  if (!hasReviews) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">No Reviews Yet</h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            Be the first to share your experience working at {companyName}
          </p>
        </div>
      </div>
    );
  }

  // Return null if none of the states apply (reviews exist and loaded successfully)
  return null;
}