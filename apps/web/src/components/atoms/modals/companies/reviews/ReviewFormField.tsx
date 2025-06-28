import { Controller, Control, FieldErrors } from 'react-hook-form';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createReviewSchema } from '@/lib/validations/zodReviewValidation';
import { z } from 'zod';

type ReviewFormData = z.infer<typeof createReviewSchema>;

interface CompanyReviewFormFieldProps {
  control: Control<ReviewFormData>;
  errors: FieldErrors<ReviewFormData>;
  watchedFields: Partial<ReviewFormData>;
}

export default function CompanyReviewFormField({ 
  control, 
  errors, 
  watchedFields 
}: CompanyReviewFormFieldProps) {
  const reviewLength = watchedFields.review?.length || 0;
  const titleLength = watchedFields.title?.length || 0;

  const renderError = (fieldName: keyof ReviewFormData) => errors[fieldName] && (
    <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
      <AlertCircle className="w-4 h-4" />
      <p>{errors[fieldName]?.message}</p>
    </div>
  );

  const renderSuccess = (condition: boolean, message: string) => condition && (
    <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
      <CheckCircle2 className="w-4 h-4" />
      {message}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Review Title */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            Review Title <span className="text-red-500">*</span>
          </label>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            titleLength < 10 ? "bg-red-100 text-red-600" :
            titleLength > 100 ? "bg-red-100 text-red-600" :
            "bg-green-100 text-green-600"
          )}>
            {titleLength}/100
          </span>
        </div>
        <Controller name="title" control={control} render={({ field }) => (
          <input 
            {...field} 
            value={field.value || ''}
            id="title" 
            placeholder="e.g., Great workplace with excellent benefits"
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
              errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
            )}
          />
        )} />
        {renderError('title')}
        {renderSuccess(titleLength >= 10 && titleLength <= 100, 'Title looks good!')}
      </div>
      
      {/* Job Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="jobPosition" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            Job Position <span className="text-red-500">*</span>
          </label>
          <Controller name="jobPosition" control={control} render={({ field }) => (
            <input 
              {...field}
              value={field.value || ''} 
              id="jobPosition" 
              placeholder="e.g., Software Engineer"
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                errors.jobPosition ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
              )}
            />
          )} />
          {renderError('jobPosition')}
        </div>

        <div className="space-y-2">
          <label htmlFor="employmentStatus" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            Employment Status <span className="text-red-500">*</span>
          </label>
          <Controller name="employmentStatus" control={control} render={({ field }) => (
            <select 
              {...field} 
              value={field.value || ''}
              id="employmentStatus"
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                errors.employmentStatus ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
              )}
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FREELANCE">Freelance</option>
            </select>
          )} />
          {renderError('employmentStatus')}
        </div>
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="workDuration" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            Work Duration
          </label>
          <Controller name="workDuration" control={control} render={({ field }) => (
            <input 
              {...field} 
              value={field.value || ''}
              id="workDuration" 
              placeholder="e.g., 2 years, 6 months"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
          )} />
        </div>

        <div className="space-y-2">
          <label htmlFor="salaryEstimate" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            Salary Estimate (IDR/month)
          </label>
          <Controller name="salaryEstimate" control={control} render={({ field }) => (
            <input 
              {...field} 
              value={field.value ?? ''}
              id="salaryEstimate" 
              type="number"
              placeholder="e.g., 15000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
            />
          )} />
          {renderError('salaryEstimate')}
        </div>
      </div>
      
      {/* Review Text */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="review" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            Your Review <span className="text-red-500">*</span>
          </label>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            reviewLength < 50 ? "bg-red-100 text-red-600" :
            reviewLength > 2000 ? "bg-red-100 text-red-600" :
            "bg-green-100 text-green-600"
          )}>
            {reviewLength}/2000
          </span>
        </div>
        <Controller name="review" control={control} render={({ field }) => (
          <textarea 
            {...field} 
            id="review" 
            rows={6} 
            placeholder="Share your honest experience working at this company. Include details about the work environment, management, growth opportunities, and overall satisfaction..."
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none",
              errors.review ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
            )}
          />
        )} />
        {renderError('review')}
        {renderSuccess(reviewLength >= 50 && reviewLength <= 2000, 'Great review length!')}
      </div>
    </div>
  );
}