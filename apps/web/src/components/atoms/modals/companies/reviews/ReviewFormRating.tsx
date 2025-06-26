import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Star, Home, HeartHandshake, TrendingUp, Building, AlertCircle } from 'lucide-react';
import StarRatingInput from '@/components/atoms/stars/StarsRatingInput';
import { createReviewSchema } from '@/lib/validations/zodReviewValidation';
import { z } from 'zod';

type ReviewFormData = z.infer<typeof createReviewSchema>;

interface CompanyReviewFormRatingProps {
  control: Control<ReviewFormData>;
  errors: FieldErrors<ReviewFormData>;
}

export default function CompanyReviewFormRating({ 
  control, 
  errors 
}: CompanyReviewFormRatingProps) {
  const renderError = (fieldName: keyof ReviewFormData) => errors[fieldName] && (
    <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
      <AlertCircle className="w-4 h-4" />
      <p>{errors[fieldName]?.message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Rate Different Aspects</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Star className="w-4 h-4 text-yellow-500" />
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <Controller name="rating" control={control} render={({ field }) => (
            <div className="flex items-center gap-3">
              <StarRatingInput value={field.value ?? 0} onChange={field.onChange} size={28} />
              <span className="text-sm text-gray-600 min-w-[60px]">
                {field.value ? `${field.value}/5` : '0/5'}
              </span>
            </div>
          )} />
          {renderError('rating')}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Home className="w-4 h-4 text-blue-500" />
            Work-Life Balance <span className="text-red-500">*</span>
          </label>
          <Controller name="workLifeBalance" control={control} render={({ field }) => (
            <div className="flex items-center gap-3">
              <StarRatingInput value={field.value ?? 0} onChange={field.onChange} />
              <span className="text-sm text-gray-600 min-w-[60px]">
                {field.value ? `${field.value}/5` : '0/5'}
              </span>
            </div>
          )} />
          {renderError('workLifeBalance')}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <HeartHandshake className="w-4 h-4 text-green-500" />
            Culture & Values <span className="text-red-500">*</span>
          </label>
          <Controller name="cultureRating" control={control} render={({ field }) => (
            <div className="flex items-center gap-3">
              <StarRatingInput value={field.value ?? 0} onChange={field.onChange} />
              <span className="text-sm text-gray-600 min-w-[60px]">
                {field.value ? `${field.value}/5` : '0/5'}
              </span>
            </div>
          )} />
          {renderError('cultureRating')}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            Career Opportunities <span className="text-red-500">*</span>
          </label>
          <Controller name="careerRating" control={control} render={({ field }) => (
            <div className="flex items-center gap-3">
              <StarRatingInput value={field.value ?? 0} onChange={field.onChange} />
              <span className="text-sm text-gray-600 min-w-[60px]">
                {field.value ? `${field.value}/5` : '0/5'}
              </span>
            </div>
          )} />
          {renderError('careerRating')}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building className="w-4 h-4 text-orange-500" />
            Facilities <span className="text-red-500">*</span>
          </label>
          <Controller name="facilitiesRating" control={control} render={({ field }) => (
            <div className="flex items-center gap-3">
              <StarRatingInput value={field.value ?? 0} onChange={field.onChange} />
              <span className="text-sm text-gray-600 min-w-[60px]">
                {field.value ? `${field.value}/5` : '0/5'}
              </span>
            </div>
          )} />
          {renderError('facilitiesRating')}
        </div>
      </div>
    </div>
  );
}