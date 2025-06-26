'use client';

import { Building, Briefcase, TrendingUp, HeartHandshake, Home, Wallet, Edit, Trash2, Calendar, User } from 'lucide-react';
import RatingStars from '@/components/atoms/stars/RatingStars';
import { CompanyReview } from '@/types/reviews';
import { EmploymentStatus } from '@prisma/client';

interface ReviewCardProps {
  review: CompanyReview;
  currentUserId?: string;
  onEdit: (review: CompanyReview) => void;
  onDelete: (reviewId: string) => void;
  isDeleting: boolean;
}

export default function ReviewCard({ 
  review, 
  currentUserId, 
  onEdit, 
  onDelete, 
  isDeleting 
}: ReviewCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
  };

  const formatEmploymentStatus = (status: EmploymentStatus) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-grow">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{review.title}</h3>
          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span>{review.jobPosition}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{formatEmploymentStatus(review.employmentStatus)}</span>
            </div>
            {review.workDuration && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{review.workDuration}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={review.rating} />
            <span className="text-sm font-medium text-gray-700">{review.rating}/5</span>
          </div>
          <p className="text-xs text-gray-500">
            {new Date(review.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          {currentUserId === review.userId && (
            <div className="flex items-center justify-end gap-2 mt-3">
              <button 
                onClick={() => onEdit(review)} 
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button 
                onClick={() => onDelete(review.id)}
                disabled={isDeleting}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-gray-700 leading-relaxed mb-4">{review.review}</p>
      
      {review.salaryEstimate && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm font-medium mb-4 w-fit">
          <Wallet className="w-4 h-4" />
          <span>Estimated Salary: {formatCurrency(review.salaryEstimate)}/month</span>
        </div>
      )}

      {/* Rating Breakdown */}
      <div className="pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2" title="Work-Life Balance">
            <Home className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div className="flex items-center gap-1">
              <RatingStars rating={review.workLifeBalance ?? 0} size={14} />
              <span className="text-xs text-gray-500">({review.workLifeBalance ?? 0})</span>
            </div>
          </div>
          <div className="flex items-center gap-2" title="Culture & Values">
            <HeartHandshake className="w-4 h-4 text-green-500 flex-shrink-0" />
            <div className="flex items-center gap-1">
              <RatingStars rating={review.cultureRating ?? 0} size={14} />
              <span className="text-xs text-gray-500">({review.cultureRating ?? 0})</span>
            </div>
          </div>
          <div className="flex items-center gap-2" title="Career Opportunities">
            <TrendingUp className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <div className="flex items-center gap-1">
              <RatingStars rating={review.careerRating ?? 0} size={14} />
              <span className="text-xs text-gray-500">({review.careerRating ?? 0})</span>
            </div>
          </div>
          <div className="flex items-center gap-2" title="Facilities">
            <Building className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <div className="flex items-center gap-1">
              <RatingStars rating={review.facilitiesRating ?? 0} size={14} />
              <span className="text-xs text-gray-500">({review.facilitiesRating ?? 0})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}