'use client';

import { 
  X, 
  FileText, 
  CheckCircle2
} from 'lucide-react';
import GenerateCVModalSummary from './GenerateCVModalSummary';
import GenerateCVModalSkills from './GenerateCVModalSkills';
import GenerateCVModalLanguages from './GenerateCVModalLanguages';
import GenerateCVModalEducationHistory from './GenerateCVModalEducationHistory';
import GenerateCVModalAction from './GenerateCVModalAction';
import { useGenerateCVForm } from './GenerateCVModalForm';

interface GenerateCvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GenerateCvModal({ isOpen, onClose, onSuccess }: GenerateCvModalProps) {
  const {
    form,
    isSubmitting,
    step,
    handleFormSubmit,
    handleClose,
    isValid,
    errors
  } = useGenerateCVForm({ onSuccess, onClose });

  const { register, handleSubmit, watch, setValue, control } = form;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
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
                watch={watch}
              />

              <GenerateCVModalEducationHistory 
                control={control}
                register={register}
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