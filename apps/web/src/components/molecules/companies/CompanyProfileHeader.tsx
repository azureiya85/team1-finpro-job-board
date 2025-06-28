'use client';

import { MapPin, Users, Calendar, Pencil, MessageSquareQuote } from 'lucide-react';
import { CompanyDetailed } from '@/types';
import Image from 'next/image';
import RatingStars from '@/components/atoms/stars/RatingStars'; 

interface CompanyProfileHeaderProps {
  company: CompanyDetailed;
  canReview: boolean;
  isCheckingCanReview: boolean;
  onOpenReviewList: () => void;
  onOpenReviewForm: () => void;
}

export default function CompanyProfileHeader({
  company,
  canReview,
  isCheckingCanReview,
  onOpenReviewList,
  onOpenReviewForm
}: CompanyProfileHeaderProps) {
  const formatCompanySize = (size?: string) => {
    // ... (keep this function as is)
    if (!size) return 'Not specified';
    
    const sizeMap: Record<string, string> = {
      'STARTUP': '1-10 employees',
      'SMALL': '11-50 employees', 
      'MEDIUM': '51-200 employees',
      'LARGE': '201-1000 employees',
      'ENTERPRISE': '1000+ employees'
    };
    
    return sizeMap[size] || size;
  };

  return (
    <>
      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start gap-6">
          {company.logo && (
            <div className="flex-shrink-0">
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={80}
                height={80}
                className="w-20 h-20 rounded-lg object-cover border"
                style={{ width: '80px', height: '80px' }}
                unoptimized={company.logo.startsWith('http')}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className='flex-1'>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {company.name}
                </h1>
                
                {company.industry && (
                  <p className="text-lg text-gray-600 mb-2">
                    {company.industry}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                  {company.province && company.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{company.city.name}, {company.province.name}</span>
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{formatCompanySize(company.size)}</span>
                    </div>
                  )}
                  {company.foundedYear && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Founded {company.foundedYear}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Rating and Review Actions */}
              <div className="text-right flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                  {company.stats.totalReviews > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <RatingStars rating={company.stats.averageRating} />
                            <span className="text-lg font-semibold">
                            {company.stats.averageRating.toFixed(1)}
                            </span>
                        </div>
                        <button 
                            onClick={onOpenReviewList}
                            className="text-sm text-primary-600 hover:underline hover:text-primary-800"
                        >
                            Based on {company.stats.totalReviews} reviews
                        </button>
                    </div>
                  )}

                  { isCheckingCanReview && <p className="text-sm text-gray-500">Checking eligibility...</p> }

                  { canReview && (
                     <button
                        onClick={onOpenReviewForm}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Write a review
                      </button>
                  )}
                  
                  { !canReview && !isCheckingCanReview && company.stats.totalReviews === 0 && (
                     <button 
                        onClick={onOpenReviewList}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <MessageSquareQuote className="w-4 h-4" />
                        See Reviews
                      </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Stats  */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {company.stats.activeJobs}
          </div>
          <p className="text-gray-600">Active Jobs</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {company.stats.totalReviews}
          </div>
          <p className="text-gray-600">Reviews</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {company.stats.averageRating.toFixed(1)}
          </div>
          <p className="text-gray-600">Rating</p>
        </div>
      </div>
    </>
  );
}