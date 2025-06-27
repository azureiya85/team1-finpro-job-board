// /components/your-path/ApplicationListModal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import type { JobApplicationDetails } from '@/types/applicants';
import { useApplicantList } from '@/hooks/useApplicantList'; 
import ApplicationListFilter from './AppList/ApplicationListFilter';
import ApplicationListPagination from './AppList/ApplicationListPagination';
import ApplicationListCVPreview from './AppList/ApplicationListCVPreview';
import ApplicantListContent from './AppList/ApplicationListContent';
import RejectionReasonDialog from './AppList/RejectionReasonDialog';
import { InterviewScheduleModal } from '@/components/organisms/interview/InterviewScheduleModal';

type ApplicantWithPriority = JobApplicationDetails & { isPriority: boolean };

export default function ApplicantListModal() {
  const {
    isApplicantModalOpen, setIsApplicantModalOpen,
    selectedJobForApplicants,
    companyId,
    applicants,
    isLoadingApplicants,
    applicantsError,
    applicantFilters,
    applicantPagination,
    showFullCvPreview, setShowFullCvPreview,
    isRejectionDialogOpen, setIsRejectionDialogOpen,
    setPendingRejection,
    isInterviewModalOpen, setIsInterviewModalOpen,
    selectedInterview, setSelectedInterview,
    handleFiltersChange,
    handleClearFilters,
    handlePageChange,
    handleStatusChange,
    handleCvPreview,
    handleScheduleInterview,
    handleRejectionConfirm,
  } = useApplicantList();

  if (!isApplicantModalOpen || !selectedJobForApplicants) {
    return null;
  }

  return (
    <>
      <Dialog open={isApplicantModalOpen} onOpenChange={(open) => {
        setIsApplicantModalOpen(open);
        if (!open) setShowFullCvPreview(null);
      }}>
        <DialogContent className="!w-[88vw] !max-w-none h-[95vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b bg-gray-50/50">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Applicants for: {selectedJobForApplicants.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Manage and review applications for this job posting. Total applications: {applicantPagination.total || 0}
            </DialogDescription>
          </DialogHeader>

          <ApplicationListFilter
            filters={applicantFilters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              {isLoadingApplicants ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-gray-600">Loading applicants...</p>
                  </div>
                </div>
              ) : applicantsError ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-red-500">{applicantsError}</p>
                </div>
              ) : (
                <ApplicantListContent
                    applicants={applicants as ApplicantWithPriority[]}
                    onStatusChange={handleStatusChange}
                    onCvPreview={handleCvPreview}
                    onScheduleInterview={handleScheduleInterview}
                    companyId={companyId}
                />
              )}
            </ScrollArea>
          </div>

          <ApplicationListPagination
           pagination={applicantPagination}
           currentItemsCount={applicants.length}
           onPageChange={handlePageChange}
          />
        </DialogContent>
      </Dialog>

      {showFullCvPreview && (
         <ApplicationListCVPreview
         cvUrl={showFullCvPreview}
         isOpen={!!showFullCvPreview}
         onClose={() => setShowFullCvPreview(null)}
       />
      )}

      <RejectionReasonDialog
        isOpen={isRejectionDialogOpen}
        onClose={() => {
          setIsRejectionDialogOpen(false);
          setPendingRejection(null);
        }}
        onConfirm={handleRejectionConfirm}
      />

      {selectedInterview && selectedJobForApplicants && (
        <InterviewScheduleModal
          isOpen={isInterviewModalOpen}
          onClose={() => {
            setIsInterviewModalOpen(false);
            setSelectedInterview(null);
          }}
          applicationId={selectedInterview.applicationId}
          jobId={selectedJobForApplicants.id}
          candidateId={selectedInterview.candidateId}
          companyId={selectedJobForApplicants.companyId}
          interview={selectedInterview.interview}
        />
      )}
    </>
  );
}