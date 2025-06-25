'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateCvSchema, type GenerateCvPayload } from '@/lib/validations/zodCVGenerateValidation';
import axiosInstance from '@/lib/axios';
import axios from 'axios';
import { Loader2, X, FileText, Users, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GenerateCvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Define the expected error response structure
interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: Array<{
    path: string[];
    message: string;
  }>;
}

export default function GenerateCvModal({ isOpen, onClose, onSuccess }: GenerateCvModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'generating' | 'success'>('form');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<GenerateCvPayload>({
    resolver: zodResolver(generateCvSchema),
    mode: 'onChange',
  });

  const professionalSummary = watch('professionalSummary');
  const summaryLength = professionalSummary?.length || 0;

  const handleFormSubmit = async (data: GenerateCvPayload) => {
    setIsSubmitting(true);
    setStep('generating');

    try {
      await axiosInstance.post('/api/users/cv/generate', data);
      
      setStep('success');
      toast.success('CV generated successfully!');
      
      // Auto-close after showing success for 2 seconds
      setTimeout(() => {
        reset();
        setStep('form');
        onSuccess();
        onClose();
      }, 2000);
      
    } catch (error: unknown) {
      console.error('CV Generation Error:', error);
      setStep('form');
      
      // Handle validation errors from server
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const errorData = error.response.data as ApiErrorResponse;
        
        if (errorData.details && Array.isArray(errorData.details)) {
          errorData.details.forEach((err) => {
            toast.error(`${err.path.join('.')}: ${err.message}`);
          });
        } else {
          const errorMessage = errorData.error || errorData.message || 'Validation failed';
          toast.error(errorMessage);
        }
      } else {
        let errorMessage = 'Failed to generate CV. Please try again.';
        
        if (axios.isAxiosError(error)) {
          const errorData = error.response?.data as ApiErrorResponse;
          errorMessage = errorData?.error || errorData?.message || error.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setStep('form');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-primary-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Generate New CV</h2>
              <p className="text-sm text-gray-600">Create your professional ATS-friendly CV</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {step === 'form' && (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
              {/* Professional Summary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="professionalSummary" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="w-4 h-4" />
                    Professional Summary <span className="text-red-500">*</span>
                  </label>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    summaryLength < 50 ? "bg-red-100 text-red-600" :
                    summaryLength > 1000 ? "bg-red-100 text-red-600" :
                    "bg-green-100 text-green-600"
                  )}>
                    {summaryLength}/1000
                  </span>
                </div>
                <Textarea
                  id="professionalSummary"
                  {...register('professionalSummary')}
                  rows={6}
                  placeholder="Write a compelling summary of your professional experience, key skills, and career objectives. This will be the first thing employers see on your CV."
                  className={cn(
                    "resize-none transition-colors",
                    errors.professionalSummary ? 'border-red-500 focus:border-red-500' : 'focus:border-primary-500'
                  )}
                />
                {errors.professionalSummary && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.professionalSummary.message}
                  </div>
                )}
                {!errors.professionalSummary && summaryLength >= 50 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Great! Your summary looks good.
                  </div>
                )}
              </div>

              {/* Custom Skills */}
              <div className="space-y-2">
                <label htmlFor="customSkills" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4" />
                  Additional Skills
                  <span className="text-xs text-gray-500 font-normal">(optional)</span>
                </label>
                <Input
                  id="customSkills"
                  {...register('customSkills')}
                  placeholder="Project Management, Agile Methodology, Team Leadership, Data Analysis"
                  className={cn(
                    "transition-colors",
                    errors.customSkills ? 'border-red-500 focus:border-red-500' : 'focus:border-primary-500'
                  )}
                />
                <p className="text-xs text-gray-500">
                  Add skills not covered in your assessments. Separate multiple skills with commas.
                </p>
                {errors.customSkills && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.customSkills.message}
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <label htmlFor="languages" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe className="w-4 h-4" />
                  Languages
                  <span className="text-xs text-gray-500 font-normal">(optional)</span>
                </label>
                <Input
                  id="languages"
                  {...register('languages')}
                  placeholder="English:Fluent, Spanish:Conversational, French:Basic"
                  className={cn(
                    "transition-colors",
                    errors.languages ? 'border-red-500 focus:border-red-500' : 'focus:border-primary-500'
                  )}
                />
                <p className="text-xs text-gray-500">
                  Format: <code className="bg-gray-100 px-1 rounded">Language:Proficiency</code>, separate multiple with commas
                </p>
                {errors.languages && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.languages.message}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose} 
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !isValid}
                  className="min-w-[140px] bg-primary-600 hover:bg-primary-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate CV
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === 'generating' && (
            <div className="p-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-primary-600 rounded-full animate-spin border-t-transparent"></div>
                  <FileText className="absolute inset-0 m-auto w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Generating Your CV</h3>
                <p className="text-gray-600">
                  We&apos;re creating your professional CV with all your profile information...
                </p>
              </div>
              <div className="max-w-md mx-auto bg-primary-50 rounded-lg p-4">
                <p className="text-sm text-primary-700">
                  This usually takes 10-30 seconds. Please don&apos;t close this window.
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="p-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">CV Generated Successfully!</h3>
                <p className="text-gray-600">
                  Your professional CV has been created and is now available in your CV history.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}