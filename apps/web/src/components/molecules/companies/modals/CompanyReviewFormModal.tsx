'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { createReviewSchema } from '@/lib/validations/zodReviewValidation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { EmploymentStatus } from '@prisma/client';
import { CompanyReviewFormModalProps } from '@/types/reviews';
import CompanyReviewFormField from '@/components/atoms/modals/companies/reviews/ReviewFormField';
import CompanyReviewFormRating from '@/components/atoms/modals/companies/reviews/ReviewFormRating';
import CompanyReviewFormAction from '@/components/atoms/modals/companies/reviews/ReviewFormActions';

type ReviewFormData = z.infer<typeof createReviewSchema>;

export default function CompanyReviewFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  companyId, 
  companyName,
  initialData 
}: CompanyReviewFormModalProps) {
  const isEditMode = !!initialData;
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');

  const getInitialValues = useCallback(() => {
    return {
      title: initialData?.title || '',
      review: initialData?.review || '',
      rating: initialData?.rating || 0,
      cultureRating: initialData?.cultureRating || 0,
      workLifeBalance: initialData?.workLifeBalance || 0,
      facilitiesRating: initialData?.facilitiesRating || 0,
      careerRating: initialData?.careerRating || 0,
      jobPosition: initialData?.jobPosition || '',
      employmentStatus: initialData?.employmentStatus || 'CURRENT_EMPLOYEE' as EmploymentStatus,
      workDuration: initialData?.workDuration || '',
      salaryEstimate: initialData?.salaryEstimate || undefined,
    };
  }, [initialData]);

  const { control, handleSubmit, formState: { errors, isSubmitting, isValid }, reset, watch } = useForm<ReviewFormData>({
    resolver: zodResolver(createReviewSchema),
    mode: 'onChange',
    defaultValues: getInitialValues()
  });
  
  const watchedFields = watch();

  useEffect(() => {
    if (isOpen) {
        reset(getInitialValues());
        setStep('form');
    }
  }, [isOpen, initialData, reset, getInitialValues]); 

  const onSubmit = async (data: ReviewFormData) => {
    setStep('submitting');
    const url = isEditMode
      ? `/api/companies/${companyId}/reviews/${initialData!.id}`
      : `/api/companies/${companyId}/reviews`;
      
    const method = isEditMode ? 'PUT' : 'POST';

    // Sanitize data before sending: convert empty strings for nullable fields back to null
    const payload = {
      ...data,
      workDuration: data.workDuration || null,
      salaryEstimate: data.salaryEstimate || null
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'submit'} review.`);
      }
      
      setStep('success');
      toast.success(`Review ${isEditMode ? 'updated' : 'submitted'} successfully!`);
      
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);

    } catch (error: unknown) {
      setStep('form');
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setStep('form');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-primary-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Star className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Your Review' : 'Write a Review'}
              </h2>
              <p className="text-sm text-gray-600">{companyName}</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {step === 'form' && (
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
              <CompanyReviewFormField 
                control={control}
                errors={errors}
                watchedFields={watchedFields}
              />
              
              <CompanyReviewFormRating 
                control={control}
                errors={errors}
              />
              
              <CompanyReviewFormAction
                isEditMode={isEditMode}
                isSubmitting={isSubmitting}
                isValid={isValid}
                onCancel={handleClose}
              />
            </form>
          )}
          
          {/* Submitting State */}
          {step === 'submitting' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-primary-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditMode ? 'Updating Your Review...' : 'Submitting Your Review...'}
                </h3>
                <p className="text-gray-600">Please wait while we process your request.</p>
              </div>
            </div>
          )}
          
          {/* Success State */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditMode ? 'Review Updated Successfully!' : 'Review Submitted Successfully!'}
                </h3>
                <p className="text-gray-600">
                  Thank you for sharing your experience with {companyName}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}