'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCVModalStore } from '@/stores/CVModalStores';
import { CVSubmissionHeader, CVSubmissionFooter } from './CVSubmissionHeaderFooter'; 
import CVSubmissionForm from './CVSubmissionForm';

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
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      closeModal();
      setSubmitSuccess(false);
    }
  };

  const handleSubmitSuccess = () => {
    setSubmitSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  if (!isOpen || !selectedJob) return null;

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
            <CVSubmissionForm
              selectedJob={selectedJob as Job}
              onSubmitSuccess={handleSubmitSuccess}
              setSubmitting={setSubmitting}
            />
          </div>

          <CVSubmissionFooter
            handleClose={handleClose}
            isSubmitting={isSubmitting}
            submitSuccess={submitSuccess}
            formId="cv-submission-form"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}