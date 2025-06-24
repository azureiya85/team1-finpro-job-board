'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Building, Briefcase, TrendingUp, HeartHandshake, Home, Wallet, Edit, Trash2 } from 'lucide-react';
import RatingStars from '@/components/atoms/stars/RatingStars';
import { EmploymentStatus } from '@prisma/client';
import { useAuthStore } from '@/stores/authStores';
import CompanyReviewFormModal from './CompanyReviewFormModal';

interface ReviewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onReviewChange: () => void; 
}

type CompanyReview = {
  id: string;
  title: string;
  review: string;
  rating: number;
  cultureRating: number | null;
  workLifeBalance: number | null;
  facilitiesRating: number | null;
  careerRating: number | null;
  jobPosition: string;
  employmentStatus: EmploymentStatus;
  workDuration: string | null;
  salaryEstimate: number | null;
  createdAt: string;
  userId: string;
};

export default function CompanyReviewListModal({ isOpen, onClose, companyId, companyName, onReviewChange }: ReviewListModalProps) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasMore: true });
  
  // State to manage the review being edited and the form modal
  const [editingReview, setEditingReview] = useState<CompanyReview | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchReviews = useCallback(async (page = 1) => {
    if (page === 1) setReviews([]);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/companies/${companyId}/reviews?page=${page}&limit=10`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch reviews.');
      }
      
      const data = await response.json();
      setReviews(prev => page === 1 ? data.data : [...prev, ...data.data]);
      setPagination({
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        hasMore: data.pagination.page < data.pagination.totalPages,
      });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (isOpen) {
        fetchReviews(1);
    }
  }, [isOpen, fetchReviews]);
  
  const handleEdit = (review: CompanyReview) => {
    setEditingReview(review);
    setIsFormOpen(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/companies/${companyId}/reviews/${reviewId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review.');
      }

      setReviews(prev => prev.filter(r => r.id !== reviewId));
      onReviewChange();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingReview(null);
    fetchReviews(1);
    onReviewChange();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
  }

  if (!isOpen) return null;

  return (
    <> {/* Use a fragment to wrap both modals */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800">Reviews for {companyName}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <X className="w-6 h-6" />
            </button>
          </header>

          <main className="p-6 overflow-y-auto space-y-6">
            {isLoading && reviews.length === 0 && <p className="text-center text-gray-500">Loading reviews...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!isLoading && reviews.length === 0 && <p className="text-center text-gray-500">No reviews have been submitted for this company yet.</p>}
            
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border rounded-lg p-4 bg-gray-50/50">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow"> {/* Added flex-grow to take up available space */}
                      <h3 className="font-bold text-lg text-gray-900">{review.title}</h3>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> <span>{review.jobPosition}</span></div>
                        <span className="text-gray-300 hidden md:inline">|</span>
                        <span className="capitalize">{review.employmentStatus.replace('_', ' ').toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <RatingStars rating={review.rating} />
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      {user?.id === review.userId && (
                        <div className="flex items-center justify-end gap-3 mt-2">
                          <button onClick={() => handleEdit(review)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium transition-colors">
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 my-3">{review.review}</p>
                  
                  {review.salaryEstimate && (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-1.5 text-sm font-semibold mb-4 w-fit">
                          <Wallet className="w-4 h-4" />
                          <span>Estimated Salary: {formatCurrency(review.salaryEstimate)}/month</span>
                      </div>
                  )}

                  <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2" title="Work-Life Balance">
                          <Home className="w-4 h-4 text-blue-500"/> <RatingStars rating={review.workLifeBalance ?? 0} />
                      </div>
                      <div className="flex items-center gap-2" title="Culture & Values">
                          <HeartHandshake className="w-4 h-4 text-green-500"/> <RatingStars rating={review.cultureRating ?? 0} />
                      </div>
                      <div className="flex items-center gap-2" title="Career Opportunities">
                          <TrendingUp className="w-4 h-4 text-purple-500"/> <RatingStars rating={review.careerRating ?? 0} />
                      </div>
                      <div className="flex items-center gap-2" title="Facilities">
                          <Building className="w-4 h-4 text-orange-500"/> <RatingStars rating={review.facilitiesRating ?? 0} />
                      </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={() => fetchReviews(pagination.page + 1)}
                  disabled={isLoading}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Load More Reviews'}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <CompanyReviewFormModal
        isOpen={isFormOpen}
        onClose={() => {
            setIsFormOpen(false);
            setEditingReview(null); 
        }}
        onSuccess={handleFormSuccess}
        companyId={companyId}
        companyName={companyName}
        initialData={editingReview}
      />
    </>
  );
}