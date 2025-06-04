'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useCVModalStore } from '@/stores/CVModalStores';
import { useAuthStore } from '@/stores/authStores';
import { cvSubmissionSchema, CVSubmissionForm } from '@/lib/validations/zodApplicationValidation';
import { CVSubmissionHeader, CVSubmissionFooter } from './CVSubmissionHeaderFooter'; 
import CVSubmissionContent from './CVSubmissionContent'; 

const FORM_ID = 'cv-submission-form';
const EXPRESS_API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001/api';

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

export default function CVSubmitModal() {
  const { isOpen, selectedJob, closeModal, isSubmitting, setSubmitting } = useCVModalStore();
  const { user } = useAuthStore();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CVSubmissionForm>({
    resolver: zodResolver(cvSubmissionSchema),
    defaultValues: {
      fullName: user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      currentLocation: user?.currentAddress || '',
      expectedSalary: 0,
      coverLetter: '',
      availableStartDate: '',
      portfolioUrl: '',
      linkedinUrl: '',
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a PDF or Word document');
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
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const uploadFileToExpress = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'cvs');

    const uploadResponse = await fetch(`${EXPRESS_API_BASE_URL}/upload`, {
      method: 'POST',
      credentials: 'include', 
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload CV');
    }

    const uploadResult = await uploadResponse.json();
    return uploadResult.url;
  };

  interface ApplicationData {
    jobPostingId: string;
    cvUrl: string;
    expectedSalary: number;
    coverLetter: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    currentLocation: string;
    availableStartDate: string;
    portfolioUrl: string;
    linkedinUrl: string;
  }

  const submitApplicationToExpress = async (applicationData: ApplicationData) => {
    const submitResponse = await fetch(`${EXPRESS_API_BASE_URL}/applications/submit-cv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Ensure cookies are sent for authentication
      body: JSON.stringify(applicationData),
    });

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit application');
    }

    return await submitResponse.json();
  };

  const onSubmit = async (data: CVSubmissionForm) => {
    if (!cvFile && (selectedJob as Job)?.requiresCoverLetter !== false) {
      setUploadError('Please upload your CV');
      return;
    }
    if (!selectedJob) return;

    setSubmitting(true);
    setUploadError('');

    try {
      let cvUrl = '';
      
      // Upload CV file if provided
      if (cvFile) {
        cvUrl = await uploadFileToExpress(cvFile);
      }

      // Prepare application data 
      const applicationData = {
        jobPostingId: selectedJob.id,
        cvUrl: cvUrl || '',
        expectedSalary: data.expectedSalary,
        coverLetter: data.coverLetter,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        currentLocation: data.currentLocation,
        availableStartDate: data.availableStartDate,
        portfolioUrl: data.portfolioUrl || '',
        linkedinUrl: data.linkedinUrl || '',
      };

      // Submit application to Express API
      await submitApplicationToExpress(applicationData);

      setSubmitSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      closeModal();
      reset();
      setCvFile(null);
      setUploadError('');
      setSubmitSuccess(false);
    }
  };

  if (!isOpen || !selectedJob) return null;

  const showCoverLetterSection = (selectedJob as Job)?.requiresCoverLetter !== false; 
  const showCompensationSection = (selectedJob as Job)?.type !== "Internship"; 

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-slate-50 dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border/50 flex flex-col"
        >
          <CVSubmissionHeader
            selectedJob={selectedJob as Job}
            handleClose={handleClose}
            isSubmitting={isSubmitting}
            submitSuccess={submitSuccess}
          />

          <div className="overflow-y-auto flex-grow min-h-0">
            <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
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
          </div>

          <CVSubmissionFooter
            handleClose={handleClose}
            isSubmitting={isSubmitting}
            submitSuccess={submitSuccess}
            formId={FORM_ID}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}