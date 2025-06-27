'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCompanyProfileStore } from '@/stores/companyProfileStores';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ApplicationStatus, InterviewSchedule } from '@prisma/client';
import type { ApplicationFilters, JobApplicationDetails } from '@/types/applicants';
import { getStatusDisplay } from '@/lib/applicants/statusValidation';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import ApplicationListFilter from './AppList/ApplicationListFilter';
import ApplicationListPagination from './AppList/ApplicationListPagination';
import ApplicationListCVPreview from './AppList/ApplicationListCVPreview';
import ApplicantListContent from './AppList/ApplicationListContent';
import RejectionReasonDialog from './AppList/RejectionReasonDialog';
import { InterviewScheduleModal } from '@/components/organisms/interview/InterviewScheduleModal';

type LatestInterviewData = NonNullable<JobApplicationDetails['latestInterview']>;

export default function ApplicantListModal() {
  const {
    isApplicantModalOpen, setIsApplicantModalOpen,
    selectedJobForApplicants,
    applicants, setApplicants,
    isLoadingApplicants, setLoadingApplicants,
    applicantsError, setApplicantsError,
    applicantFilters, setApplicantFilters,
    applicantPagination, setApplicantPagination,
    updateApplicantInList,
  } = useCompanyProfileStore();

  const [showFullCvPreview, setShowFullCvPreview] = useState<string | null>(null);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [pendingRejection, setPendingRejection] = useState<{ applicationId: string; status: ApplicationStatus } | null>(null);

  // State untuk modal interview
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<{
    applicationId: string;
    candidateId: string;
    interview?: InterviewSchedule;
  } | null>(null);

  const companyId = selectedJobForApplicants?.companyId;

  const fetchApplicants = useCallback(async (jobId: string, filters: ApplicationFilters, page: number, limit: number) => {
    if (!companyId) {
      setApplicantsError("Company context is missing.");
      return;
    }
    setLoadingApplicants(true);
    setApplicantsError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.ageMin) queryParams.append('ageMin', String(filters.ageMin));
      if (filters.ageMax) queryParams.append('ageMax', String(filters.ageMax));
      if (filters.salaryMin) queryParams.append('salaryMin', String(filters.salaryMin));
      if (filters.salaryMax) queryParams.append('salaryMax', String(filters.salaryMax));
      if (filters.education) queryParams.append('education', filters.education);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/applicants?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch applicants');
      }
      const data = await response.json();
      setApplicants(data.applications || []);
      setApplicantPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasNext: data.pagination.hasNext,
        hasPrev: data.pagination.hasPrev,
      });
    } catch (error) {
      console.error("Fetch applicants error:", error);
      setApplicantsError(error instanceof Error ? error.message : 'An unknown error occurred');
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  }, [companyId, setLoadingApplicants, setApplicantsError, setApplicants, setApplicantPagination]);

  useEffect(() => {
    if (selectedJobForApplicants && isApplicantModalOpen) {
      const defaultFilters = { sortBy: 'createdAt', sortOrder: 'asc' } as ApplicationFilters;
      setApplicantFilters(defaultFilters);
      fetchApplicants(selectedJobForApplicants.id, defaultFilters, 1, applicantPagination.limit);
    } else {
      setApplicants([]);
      setApplicantsError(null);
    }
  }, [
    selectedJobForApplicants,
    isApplicantModalOpen,
    fetchApplicants,
    setApplicantFilters,
    setApplicants,
    setApplicantsError,
    applicantPagination.limit
  ]);

  const handleFiltersChange = (newFilters: ApplicationFilters) => {
    if (selectedJobForApplicants) {
      setApplicantFilters(newFilters);
      fetchApplicants(selectedJobForApplicants.id, newFilters, 1, applicantPagination.limit);
    }
  };

  const handleClearFilters = () => {
    const defaultFilters = { sortBy: 'createdAt', sortOrder: 'asc' } as ApplicationFilters;
    setApplicantFilters(defaultFilters);
    if (selectedJobForApplicants) {
      fetchApplicants(selectedJobForApplicants.id, defaultFilters, 1, applicantPagination.limit);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (selectedJobForApplicants) {
      fetchApplicants(selectedJobForApplicants.id, applicantFilters, newPage, applicantPagination.limit);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    if (!selectedJobForApplicants || !companyId) return;

    if (newStatus === ApplicationStatus.REJECTED) {
      setPendingRejection({ applicationId, status: newStatus });
      setIsRejectionDialogOpen(true);
      return;
    }

    await updateApplicationStatus(applicationId, newStatus);
  };

  const handleCvPreview = (cvUrl: string | null) => {
    setShowFullCvPreview(cvUrl);
  };

  // FIX: Replaced 'any' with a specific, safe type.
  const handleScheduleInterview = (applicationId: string, scheduleData: LatestInterviewData | null, isRescheduling: boolean) => {
    console.log('handleScheduleInterview - Input Data:', {
      applicationId,
      scheduleData,
      isRescheduling
    });

    const applicant = applicants.find(app => app.id === applicationId);
    if (!applicant) {
      console.error('Applicant not found:', applicationId);
      return;
    }

    console.log('Found applicant:', applicant);

    setSelectedInterview({
      applicationId,
      candidateId: applicant.applicant.id,
      interview: isRescheduling && scheduleData ? {
        id: scheduleData.id,
        jobApplicationId: applicationId,
        jobPostingId: selectedJobForApplicants?.id || '',
        candidateId: applicant.applicant.id,
        status: 'SCHEDULED',
        scheduledAt: new Date(scheduleData.scheduledAt),
        duration: Number(scheduleData.duration),
        interviewType: scheduleData.interviewType,
        location: scheduleData.location || '',
        notes: scheduleData.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        reminderSent: false
      } : undefined
    });
    setIsInterviewModalOpen(true);
};

  const updateApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus, rejectionReason?: string) => {
    if (!selectedJobForApplicants || !companyId) return;

    try {
      const response = await fetch(`/api/companies/${companyId}/jobs/${selectedJobForApplicants.id}/applicants/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejectionReason }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }
      toast.success(`Status updated to ${getStatusDisplay(newStatus).label}`);
      updateApplicantInList(result.application);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const handleRejectionConfirm = (reason: string) => {
    if (pendingRejection) {
      updateApplicationStatus(pendingRejection.applicationId, pendingRejection.status, reason);
      setPendingRejection(null);
    }
  };

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
                      applicants={applicants}
                      onStatusChange={handleStatusChange}
                      onCvPreview={handleCvPreview}
                      onScheduleInterview={handleScheduleInterview} companyId={''}                />
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