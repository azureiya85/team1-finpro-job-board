'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import StarRatingInput from '@/components/atoms/stars/StarsRatingInput'; 
import { createReviewSchema } from '@/lib/validations/zodReviewValidation';
import { useEffect } from 'react';

type ReviewFormData = z.infer<typeof createReviewSchema>;

// Define a shape for the review data passed for editing
interface EditableReviewData extends ReviewFormData {
  id: string;
}

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  companyName: string;
  initialData?: EditableReviewData | null; 
}

export default function CompanyReviewFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  companyId, 
  companyName,
  initialData 
}: ReviewFormModalProps) {
  const isEditMode = !!initialData;

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ReviewFormData>({
    resolver: zodResolver(createReviewSchema),
    // Set default values based on whether we are editing or creating
    defaultValues: initialData || {
      title: '',
      review: '',
      rating: 0,
      cultureRating: 0,
      workLifeBalance: 0,
      facilitiesRating: 0,
      careerRating: 0,
      workDuration: '',
    }
  });
  
  // Effect to reset the form when the modal opens with new data
  useEffect(() => {
    if (isOpen) {
        // When using initialData, make sure all fields are present or have a fallback
        reset(initialData || {
          title: '',
          review: '',
          rating: 0,
          cultureRating: 0,
          workLifeBalance: 0,
          facilitiesRating: 0,
          careerRating: 0,
          workDuration: '',
        });
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: ReviewFormData) => {
    const url = isEditMode
      ? `/api/companies/${companyId}/reviews/${initialData!.id}`
      : `/api/companies/${companyId}/reviews`;
      
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'submit'} review.`);
      }
      
      onSuccess();
      handleClose();

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;
  
  const renderError = (fieldName: keyof ReviewFormData) => errors[fieldName] && (
    <p className="text-red-500 text-sm mt-1">{errors[fieldName]?.message}</p>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditMode ? 'Edit Your Review' : `Write a review for ${companyName}`}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Review Title</label>
            <Controller name="title" control={control} render={({ field }) => (
              <input {...field} id="title" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            )} />
            {renderError('title')}
          </div>
          
          {/* === MISSING FIELD ADDED HERE === */}
          <div>
            <label htmlFor="review" className="block text-sm font-medium text-gray-700">Your Anonymous Review</label>
             <Controller name="review" control={control} render={({ field }) => (
                <textarea 
                    {...field} 
                    id="review" 
                    rows={5} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                    placeholder="Share details of your own experience at this company..."
                />
            )} />
            {renderError('review')}
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Overall Rating*</label>
                <Controller name="rating" control={control} render={({ field }) => 
                  <StarRatingInput value={field.value ?? 0} onChange={field.onChange} size={28} />
                } />
                {renderError('rating')}
            </div>
             <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Work-Life Balance*</label>
                <Controller name="workLifeBalance" control={control} render={({ field }) => 
                  <StarRatingInput value={field.value ?? 0} onChange={field.onChange} />
                } />
                {renderError('workLifeBalance')}
            </div>
             <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Culture*</label>
                <Controller name="cultureRating" control={control} render={({ field }) => 
                  <StarRatingInput value={field.value ?? 0} onChange={field.onChange} />
                } />
                {renderError('cultureRating')}
            </div>
             <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Career Opportunities*</label>
                <Controller name="careerRating" control={control} render={({ field }) => 
                  <StarRatingInput value={field.value ?? 0} onChange={field.onChange} />
                } />
                {renderError('careerRating')}
            </div>
             <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Company Facilities*</label>
                <Controller name="facilitiesRating" control={control} render={({ field }) => 
                  <StarRatingInput value={field.value ?? 0} onChange={field.onChange} />
                } />
                {renderError('facilitiesRating')}
            </div>
          </div>
          
          <footer className="pt-6 border-t flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-accent disabled:bg-primary-300">
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Review' : 'Submit Review')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}