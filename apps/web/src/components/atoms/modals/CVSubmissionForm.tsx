'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStores';
import { cvSubmissionSchema, CVSubmissionForm as CVSubmissionFormType } from '@/lib/validations/zodApplicationValidation';
import { formatCurrency } from '@/lib/utils';
import CVSubmissionContent from './CVSubmissionContent';

interface Job {
  id: string;
  title: string;
  isPriority?: boolean;
  location?: string;
  type?: string;
  company?: {
    logo?: string;
  };
  requiresCoverLetter?: boolean;
}

interface Props {
  selectedJob: Job;
  onSubmitSuccess: () => void;
  setSubmitting: (submitting: boolean) => void;
}

interface ValidationError {
  path?: (string | number)[];
  message: string;
}

interface ErrorResponse {
  message?: string;
  error?: string;
  details?: ValidationError[];
}

export default function CVSubmissionForm({ 
  selectedJob, 
  onSubmitSuccess, 
  setSubmitting 
}: Props) {
  const { user } = useAuthStore();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CVSubmissionFormType>({
    resolver: zodResolver(cvSubmissionSchema),
    defaultValues: {
      fullName: user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      currentLocation: user?.currentAddress || '',
      expectedSalary: 1000000, 
      coverLetter: '',
      availableStartDate: '',
      portfolioUrl: '',
      linkedinUrl: '',
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const documentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!documentTypes.includes(file.type)) {
        setUploadError('Please upload a PDF or Word document (PDF, DOC, DOCX)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size should not exceed 5MB');
        return;
      }
      
      setCvFile(file);
      setUploadError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
  });

  const formatSalary = (value: number) => {
    return formatCurrency(value);
  };

  const onSubmit = async (data: CVSubmissionFormType) => {
    if (!cvFile) {
      setUploadError('Please upload your CV');
      return;
    }
    
    if (!selectedJob) {
      setUploadError('No job selected');
      return;
    }

    setSubmitting(true);
    setUploadError('');

    try {
      let cvUrl = '';
      if (cvFile) {
        const formData = new FormData();
        formData.append('file', cvFile);
        formData.append('folder', 'cv-uploads');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to upload CV');
        }
        
        const uploadJson = await uploadResponse.json();
        cvUrl = uploadJson.url;
      }

      const applicationData = {
        jobPostingId: selectedJob.id,
        cvUrl: cvUrl,
        expectedSalary: Number(data.expectedSalary), 
        coverLetter: data.coverLetter || '', 
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        currentLocation: data.currentLocation,
        availableStartDate: data.availableStartDate,
        portfolioUrl: data.portfolioUrl || null, 
        linkedinUrl: data.linkedinUrl || null, 
      };

      const submitResponse = await fetch('/api/submit-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        
        let errorData: ErrorResponse;
        try {
          errorData = JSON.parse(errorText) as ErrorResponse;
        } catch {
          errorData = { message: errorText };
        }
        
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map((detail: ValidationError) => 
            `${detail.path?.join('.')}: ${detail.message}`
          ).join(', ');
          throw new Error(`Validation errors: ${validationErrors}`);
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to submit application');
      }
      
      await submitResponse.json();
      onSubmitSuccess();
      reset();
      setCvFile(null);
      setUploadError('');

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const showCoverLetterSection = selectedJob?.requiresCoverLetter !== false; 
  const showCompensationSection = selectedJob?.type !== "Internship"; 

  return (
    <form id="cv-submission-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
      <CVSubmissionContent
        register={register}
        errors={errors}
        watch={watch}
        cvFile={cvFile}
        uploadError={uploadError}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        formatSalary={formatSalary}
        showUploadCV={true} 
        showPersonalInfo={true} 
        showCompensationAvailability={showCompensationSection}
        showCoverLetter={showCoverLetterSection}
      />
    </form>
  );
}