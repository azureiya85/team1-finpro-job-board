'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateCvSchema, type GenerateCvPayload } from '@/lib/validations/zodCVGenerateValidation';
import axiosInstance from '@/lib/axios';
import axios from 'axios';
import { 
  X, 
  FileText, 
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import GenerateCVModalSummary from './GenerateCVModalSummary';
import GenerateCVModalSkills from './GenerateCVModalSkills';
import GenerateCVModalLanguages from './GenerateCVModalLanguages';
import GenerateCVModalAction from './GenerateCVModalAction';

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

// Extended form data type to handle languages array
export interface ExtendedGenerateCvPayload extends Omit<GenerateCvPayload, 'languages'> {
  customSkillsArray?: string[];
  languagesArray?: Array<{ language: string; proficiency: string }>;
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
    setValue,
    control,
  } = useForm<ExtendedGenerateCvPayload>({
    resolver: zodResolver(generateCvSchema),
    mode: 'onChange',
    defaultValues: {
      customSkillsArray: [],
      languagesArray: [{ language: '', proficiency: '' }]
    }
  });

  const handleFormSubmit = async (data: ExtendedGenerateCvPayload) => {
    setIsSubmitting(true);
    setStep('generating');

    try {
      // Transform the data back to the expected format
      const transformedData: GenerateCvPayload = {
        professionalSummary: data.professionalSummary,
        customSkills: data.customSkillsArray?.join(', ') || '',
        languages: data.languagesArray
          ?.filter(lang => lang.language && lang.proficiency)
          .map(lang => `${lang.language}:${lang.proficiency}`)
          .join(', ') || ''
      };

      await axiosInstance.post('/api/users/cv/generate', transformedData);
      
      setStep('success');
      toast.success('CV generated successfully!');
      
      // Auto-close after showing success for 2 seconds
      setTimeout(() => {
        handleReset();
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

  const handleReset = () => {
    reset();
    setStep('form');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      handleReset();
      onClose();
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
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-8">
              <GenerateCVModalSummary 
                register={register}
                errors={errors}
                watch={watch}
              />

              <GenerateCVModalSkills 
                watch={watch}
                setValue={setValue}
              />

              <GenerateCVModalLanguages 
                control={control}
                register={register}
                setValue={setValue}
              />

              <GenerateCVModalAction 
                isSubmitting={isSubmitting}
                isValid={isValid}
                onCancel={handleClose}
              />
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