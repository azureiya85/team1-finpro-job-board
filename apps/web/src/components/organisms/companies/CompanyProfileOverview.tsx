'use client';

import { useState, useEffect } from 'react';
import { useCompanyProfileStore } from '@/stores/companyProfileStores';
import { CompanyDetailed } from '@/types';
import CompanyProfileHeader from '@/components/molecules/companies/CompanyProfileHeader';
import CompanyProfileDetails from '@/components/molecules/companies/CompanyProfileDetails';
import CompanyReviewListModal from '@/components/molecules/companies/modals/CompanyReviewListModal';
import CompanyReviewFormModal from '@/components/molecules/companies/modals/CompanyReviewFormModal';
import { useAuthStore } from '@/stores/authStores';

interface CompanyProfileOverviewProps {
  className?: string;
}

function useCanReview(companyId?: string) {
  const { user } = useAuthStore();
  const [canReview, setCanReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!companyId || !user) {
      setIsLoading(false);
      setCanReview(false);
      return;
    }

    const check = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/companies/${companyId}/reviews/can-review`);
        const data = await response.json();
        setCanReview(data.canReview === true);
      } catch (error) {
        console.error("Failed to check review eligibility", error);
        setCanReview(false);
      } finally {
        setIsLoading(false);
      }
    };

    check();
  }, [companyId, user]);

  return { canReview, isLoading };
}


export default function CompanyProfileOverview({ className }: CompanyProfileOverviewProps) {
  const company = useCompanyProfileStore((state) => state.company) as CompanyDetailed | null;
  const setCompany = useCompanyProfileStore((state) => state.setCompany);

  const [isReviewListOpen, setIsReviewListOpen] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  
  const { canReview, isLoading: isCheckingCanReview } = useCanReview(company?.id);

   const handleReviewDataChange = async () => {
    if (!company) return;

    try {
        const res = await fetch(`/api/companies/${company.id}`);
        if(res.ok) {
            const updatedCompanyData = await res.json();
            setCompany(updatedCompanyData); // Update store with fresh stats
        }
    } catch (error) {
        console.error("Failed to re-fetch company data after review change", error);
    }
  };

  if (!company) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

   return (
    <div className={`space-y-8 ${className}`}>
      <CompanyProfileHeader
        company={company}
        canReview={canReview}
        isCheckingCanReview={isCheckingCanReview}
        onOpenReviewList={() => setIsReviewListOpen(true)}
        onOpenReviewForm={() => setIsReviewFormOpen(true)}
      />
      <CompanyProfileDetails company={company} />

      <CompanyReviewListModal
        isOpen={isReviewListOpen}
        onClose={() => setIsReviewListOpen(false)}
        companyId={company.id}
        companyName={company.name}
        onReviewChange={handleReviewDataChange} 
      />
      
      <CompanyReviewFormModal
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
        onSuccess={() => {
            setIsReviewFormOpen(false);
            handleReviewDataChange();
        }}
        companyId={company.id}
        companyName={company.name}
      />
    </div>
  );
}