import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { generateCvSchema, type GenerateCvPayload } from '@/lib/validations/zodCVGenerateValidation';
import axiosInstance from '@/lib/axios';
import axios from 'axios';
import { z } from 'zod';
import { toast } from 'sonner';

// Define the expected error response structure
interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: Array<{
    path: string[];
    message: string;
  }>;
}

// Extended form data type that includes arrays for easier UI handling
export interface ExtendedGenerateCvPayload {
  professionalSummary: string;
  customSkillsArray?: string[];
  languagesArray?: Array<{ language: string; proficiency: string }>;
  educationHistoryArray?: Array<{ startYear: string; endYear: string; universityName: string; degree: string }>;
}

export type GenerateCVStep = 'form' | 'generating' | 'success';

interface UseGenerateCVFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function useGenerateCVForm({ onSuccess, onClose }: UseGenerateCVFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<GenerateCVStep>('form');

  const form = useForm<ExtendedGenerateCvPayload>({
    mode: 'onChange',
    defaultValues: {
      professionalSummary: '',
      customSkillsArray: [],
      languagesArray: [{ language: '', proficiency: '' }],
      educationHistoryArray: [{ startYear: '', endYear: '', universityName: '', degree: '' }]
    }
  });

  const transformFormData = (data: ExtendedGenerateCvPayload): GenerateCvPayload => {
    return {
      professionalSummary: data.professionalSummary,
      customSkills: data.customSkillsArray?.filter(skill => skill.trim()).join(', ') || '',
      languages: data.languagesArray
        ?.filter(lang => lang.language && lang.proficiency)
        .map(lang => `${lang.language.trim()}:${lang.proficiency.trim()}`)
        .join(', ') || '',
      educationHistory: data.educationHistoryArray
        ?.filter(edu => edu.startYear && edu.endYear && edu.universityName && edu.degree)
        .map(edu => `${edu.startYear.trim()}:${edu.endYear.trim()}:${edu.universityName.trim()}:${edu.degree.trim()}`)
        .join(', ') || ''
    };
  };

  const handleApiError = (error: unknown) => {
    console.error('CV Generation Error:', error);
    
    // Handle client-side Zod validation errors first
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        toast.error(`${err.path.join('.')}: ${err.message}`);
      });
      return;
    }
    
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
      return;
    }
    
    // Handle other types of errors
    let errorMessage = 'Failed to generate CV. Please try again.';
    
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ApiErrorResponse;
      errorMessage = errorData?.error || errorData?.message || error.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
  };

  const handleFormSubmit = async (data: ExtendedGenerateCvPayload) => {
    setIsSubmitting(true);
    setStep('generating');

    try {
      // Transform the data to match the original schema
      const transformedData = transformFormData(data);

      // Validate the transformed data against the original schema
      const validatedData = generateCvSchema.parse(transformedData);
      
      console.log('Sending CV data:', validatedData); // Debug log

      await axiosInstance.post('/api/users/cv/generate', validatedData);
      
      setStep('success');
      toast.success('CV generated successfully!');
      
      // Auto-close after showing success for 2 seconds
      setTimeout(() => {
        handleReset();
        onSuccess();
        onClose();
      }, 2000);
      
    } catch (error: unknown) {
      setStep('form');
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset({
      professionalSummary: '',
      customSkillsArray: [],
      languagesArray: [{ language: '', proficiency: '' }],
      educationHistoryArray: [{ startYear: '', endYear: '', universityName: '', degree: '' }]
    });
    setStep('form');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      handleReset();
      onClose();
    }
  };

  return {
    // Form state and methods
    form,
    
    // UI state
    isSubmitting,
    step,
    
    // Actions
    handleFormSubmit,
    handleReset,
    handleClose,
    
    // Computed values
    isValid: form.formState.isValid,
    errors: form.formState.errors,
  };
}