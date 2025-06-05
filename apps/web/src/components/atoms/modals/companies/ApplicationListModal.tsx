'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCompanyProfileStore } from '@/stores/companyProfileStores';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ApplicationStatus } from '@prisma/client';
import type { ApplicationFilters } from '@/types/applicants';
import { getStatusDisplay } from '@/lib/applicants/statusValidation'; 
import { toast } from "sonner";
import { Loader2, FileText } from 'lucide-react';
import ApplicationListFilter from './AppList/ApplicationListFilter';
import ApplicationListPagination from './AppList/ApplicationListPagination';
import ApplicationListCVPreview from './AppList/ApplicationListCVPreview';
import ApplicantListContent from './AppList/ApplicationListContent';

export default function ApplicantListModal() {
  const {
    isApplicantModalOpen,
    setIsApplicantModalOpen,
    selectedJobForApplicants,
    applicants,
    setApplicants,
    isLoadingApplicants,    
    setLoadingApplicants, 
    applicantsError,
    setApplicantsError,
    applicantFilters,
    setApplicantFilters,
    applicantPagination,
    setApplicantPagination,
    updateApplicantInList,
  } = useCompanyProfileStore();

  const [showFullCvPreview, setShowFullCvPreview] = useState<string | null>(null);
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
  }, [companyId, setLoadingApplicants, setApplicantsError, setApplicants, setApplicantPagination, ]);

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
    
    let rejectionReason: string | undefined;
    if (newStatus === ApplicationStatus.REJECTED) {
      const reasonInput = prompt("Enter rejection reason (optional):");
      if (reasonInput !== null && reasonInput.trim() !== "") {
        rejectionReason = reasonInput;
      } else if (reasonInput === null) { // User cancelled
        return; 
      }
    }

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

          {/* Filters Section */}
          <ApplicationListFilter
            filters={applicantFilters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              {isLoadingApplicants && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-gray-600">Loading applicants...</p>
                  </div>
                </div>
              )}
              
              {applicantsError && (
                <div className="m-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <strong>Error:</strong> {applicantsError}
                  </div>
                </div>
              )}
              
              {!isLoadingApplicants && !applicantsError && applicants.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2">
                    <FileText className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">No applicants found</p>
                  <p className="text-gray-500">Try adjusting your filters or check back later.</p>
                </div>
              )}

              {!isLoadingApplicants && !applicantsError && applicants.length > 0 && (
                <ApplicantListContent
                  applicants={applicants}
                  onStatusChange={handleStatusChange}
                  onCvPreview={(cvUrl) => setShowFullCvPreview(cvUrl)}
                />
              )}
            </ScrollArea>
          </div>

          {/* Pagination */}
          <ApplicationListPagination
            pagination={applicantPagination}
            currentItemsCount={applicants.length}
            onPageChange={handlePageChange}
            isLoading={isLoadingApplicants}
          />
        </DialogContent>
      </Dialog>

      {/* CV Preview Modal */}
      <ApplicationListCVPreview
        cvUrl={showFullCvPreview}
        isOpen={!!showFullCvPreview}
        onClose={() => setShowFullCvPreview(null)}
      />
    </>
  );
}