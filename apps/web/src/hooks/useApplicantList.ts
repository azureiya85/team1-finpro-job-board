'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCompanyProfileStore } from '@/stores/companyProfileStores';
import { ApplicationStatus, InterviewStatus, InterviewType } from '@prisma/client';
import type { ApplicationFilters, JobApplicationDetails, ApplicationsPagination } from '@/types/applicants';
import { toast } from "sonner";
import { statusConfig } from '@/lib/statusConfig';

type ApplicantWithPriority = JobApplicationDetails & { isPriority: boolean };
type LatestInterviewData = ApplicantWithPriority['latestInterview'];

interface ApplicantsApiResponse {
  applications: ApplicantWithPriority[];
  pagination: ApplicationsPagination;
}

type InterviewMetaData = {
  createdAt: string | Date;
  updatedAt: string | Date;
  reminderSent: boolean;
};

export function useApplicantList() {
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
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<{
    applicationId: string;
    candidateId: string;
    interview?: { id: string; jobApplicationId: string; jobPostingId: string; candidateId: string; status: InterviewStatus; scheduledAt: Date; duration: number; interviewType: InterviewType; location: string | null; notes: string | null; createdAt: Date; updatedAt: Date; reminderSent: boolean; };
  } | null>(null);

  const companyId = selectedJobForApplicants?.companyId;

  const fetchApplicants = useCallback(async (jobId: string, filters: ApplicationFilters, page: number, limit: number) => {
    if (!companyId) return setApplicantsError("Company context is missing.");
    setLoadingApplicants(true);
    setApplicantsError(null);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== '')),
      });

      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/applicants?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch applicants');
      }
      const data: ApplicantsApiResponse = await response.json();
      setApplicants(data.applications || []);
      setApplicantPagination(data.pagination);
    } catch (error) {
      console.error("Fetch applicants error:", error);
      setApplicantsError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoadingApplicants(false);
    }
  }, [companyId, setLoadingApplicants, setApplicantsError, setApplicants, setApplicantPagination]);

  useEffect(() => {
    if (selectedJobForApplicants && isApplicantModalOpen) {
      const defaultFilters = { sortBy: 'createdAt', sortOrder: 'asc' } as ApplicationFilters;
      setApplicantFilters(defaultFilters);
      fetchApplicants(selectedJobForApplicants.id, defaultFilters, 1, applicantPagination.limit);
    } else if (!isApplicantModalOpen) {
      setApplicants([]);
    }
  }, [selectedJobForApplicants, isApplicantModalOpen, fetchApplicants, setApplicantFilters, setApplicants, applicantPagination.limit]);

  const updateApplicationStatus = useCallback(async (applicationId: string, newStatus: ApplicationStatus, rejectionReason?: string) => {
    if (!selectedJobForApplicants || !companyId) return;
    try {
      const response = await fetch(`/api/companies/${companyId}/jobs/${selectedJobForApplicants.id}/applicants/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejectionReason }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update status');
      toast.success(`Status updated to ${statusConfig[newStatus].text}`);
      updateApplicantInList(result.application);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  }, [companyId, selectedJobForApplicants, updateApplicantInList]);

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

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    if (newStatus === ApplicationStatus.REJECTED) {
      setPendingRejection({ applicationId, status: newStatus });
      setIsRejectionDialogOpen(true);
    } else {
      updateApplicationStatus(applicationId, newStatus);
    }
  };
  
  const handleRejectionConfirm = (reason: string) => {
    if (pendingRejection) {
      updateApplicationStatus(pendingRejection.applicationId, pendingRejection.status, reason);
      setPendingRejection(null);
      setIsRejectionDialogOpen(false);
    }
  };
  
  const handleScheduleInterview = (applicationId: string, scheduleData: LatestInterviewData | null | undefined, isRescheduling: boolean) => {
    const applicant = applicants.find(app => app.id === applicationId);
    if (!applicant || !selectedJobForApplicants) {
      return toast.error('Applicant or Job context is missing.');
    }
    
    const completeScheduleData = scheduleData as LatestInterviewData & InterviewMetaData;

    const interviewForState = (isRescheduling && scheduleData) ? {
        ...completeScheduleData,
        jobApplicationId: applicationId,
        jobPostingId: selectedJobForApplicants.id,
        candidateId: applicant.applicant.id,
        scheduledAt: new Date(completeScheduleData.scheduledAt),
        createdAt: new Date(completeScheduleData.createdAt),
        updatedAt: new Date(completeScheduleData.updatedAt),
        location: completeScheduleData.location ?? null,
        notes: completeScheduleData.notes ?? null,
    } : undefined;

    setSelectedInterview({
      applicationId,
      candidateId: applicant.applicant.id,
      interview: interviewForState,
    });
    setIsInterviewModalOpen(true);
  };

  return {
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
    handleCvPreview: setShowFullCvPreview,
    handleScheduleInterview,
    handleRejectionConfirm,
  };
}