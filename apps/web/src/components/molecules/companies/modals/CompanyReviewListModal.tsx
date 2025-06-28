'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/authStores';
import CompanyReviewFormModal from './CompanyReviewFormModal';
import ReviewCard from '@/components/atoms/modals/companies/reviews/ReviewListCard';
import ReviewStates from '@/components/atoms/modals/companies/reviews/ReviewListStates';
import { toast } from 'sonner';
import { CompanyReview, CompanyReviewListModalProps } from '@/types/reviews';

export default function CompanyReviewListModal({ 
  isOpen, 
  onClose, 
  companyId, 
  companyName, 
  onReviewChange 
}: CompanyReviewListModalProps) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasMore: true });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
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
        toast.error(message);
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
    const confirmDelete = window.confirm("Are you sure you want to delete this review? This action cannot be undone.");
    if (!confirmDelete) return;

    setDeletingId(reviewId);
    try {
      const response = await fetch(`/api/companies/${companyId}/reviews/${reviewId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review.');
      }

      setReviews(prev => prev.filter(r => r.id !== reviewId));
      onReviewChange();
      toast.success('Review deleted successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingReview(null);
    fetchReviews(1);
    onReviewChange();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Employee Reviews</h2>
                <p className="text-sm text-gray-600">{companyName}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="p-6">
              <ReviewStates 
                isLoading={isLoading && reviews.length === 0}
                error={error}
                hasReviews={reviews.length > 0}
                companyName={companyName}
              />
              
              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    currentUserId={user?.id}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={deletingId === review.id}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {pagination.hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => fetchReviews(pagination.page + 1)}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      'Load More Reviews'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
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