'use client';

import { useEffect, useState, useCallback } from 'react'; 
import { useCompanyProfileStore, type CompanyProfileTabId } from '@/stores/companyProfileStores';
import { useAuthStore } from '@/stores/authStores';
import CompanyProfileLayout from './CompanyProfileLayout';
import type { CompanyDetailed } from '@/types';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

function useCompanyAdminAuth(companyId: string) {
  const [authData, setAuthData] = useState<{
    isAuthenticated: boolean;
    isCompanyAdmin: boolean;
    isOwner: boolean;
    user: AuthUser | null;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      setLoading(true); // Ensure loading is true at the start of validation
      try {
        const response = await fetch(`/api/companies/${companyId}/auth`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          console.error('Error validating company access:', response.status, errorData);
          setAuthData({
            isAuthenticated: false,
            isCompanyAdmin: false,
            isOwner: false,
            user: null,
            error: errorData.error || `Access validation failed with status ${response.status}`
          });
          return;
        }
        const data = await response.json();
        setAuthData(data);
      } catch (error) {
        console.error('Error validating company access:', error);
        setAuthData({
          isAuthenticated: false,
          isCompanyAdmin: false,
          isOwner: false,
          user: null,
          error: 'Failed to validate access due to a network or unexpected error'
        });
      } finally {
        setLoading(false);
      }
    };
    if (companyId) {
      validateAccess();
    } else {
      setLoading(false); // If no companyId, not loading
    }
  }, [companyId]);
  return { authData, loading };
}

interface CompanyProfileTemplateProps {
  company: CompanyDetailed;
  className?: string;
}

interface Tab {
  id: CompanyProfileTabId;
  label: string;
}

export default function CompanyProfileTemplate({ company, className }: CompanyProfileTemplateProps) {
  const {
    activeTab,
    setActiveTab,
    setCompany: setStoreCompany,
    resetStore,
    totalJobs: jobsCountFromStore,
    setTotalJobs
  } = useCompanyProfileStore();

  const { user } = useAuthStore();
  const { authData, loading: authLoading } = useCompanyAdminAuth(company.id);
  const [bannerError, setBannerError] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(!!company.banner);
  const isCompanyAdmin = authData?.isOwner || false;
  const fetchJobCount = useCallback(async (companyId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/jobs?page=1&take=1`);
      if (response.ok) {
        const data = await response.json();
        setTotalJobs(data.pagination.total);
      } else {
        console.error('Failed to fetch job count:', response.status);
      }
    } catch (error) {
      console.error('Error fetching job count:', error);
    }
  }, [setTotalJobs]); 

  const getAvailableTabs = (): Tab[] => {
    const baseTabs: Tab[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'jobs', label: 'Jobs' }
    ];

    if (isCompanyAdmin) {
      return [
        ...baseTabs,
        { id: 'profile-management', label: 'Profile Management' },
        { id: 'job-management', label: 'Job Management' }
      ];
    }
    return baseTabs;
  };

  useEffect(() => {
    console.log("[CompanyProfileTemplate] Main effect triggered. Company ID:", company?.id, "User:", user?.id, "IsAdmin:", isCompanyAdmin);

    if (company) {
      setStoreCompany(company);
      fetchJobCount(company.id);
    } else {
      console.error("[CompanyProfileTemplate] useEffect - company prop is null or undefined, cannot set in store.");
    }

    setBannerError(false);
    setBannerLoading(!!company?.banner); 

    return () => {
      console.log('[CompanyProfileTemplate] Main effect cleanup - resetting store on unmount.');
      resetStore();
    };
  }, [company, setStoreCompany, resetStore, user, isCompanyAdmin, fetchJobCount]);

  useEffect(() => {
    const baseTabsIds: CompanyProfileTabId[] = ['overview', 'jobs'];
    const adminTabsIds: CompanyProfileTabId[] = ['profile-management', 'job-management'];
    const availableTabIds = isCompanyAdmin
      ? [...baseTabsIds, ...adminTabsIds]
      : baseTabsIds;

    if (!availableTabIds.includes(activeTab)) {
      console.log(`[CompanyProfileTemplate] Active tab '${activeTab}' not available for admin status '${isCompanyAdmin}'. Resetting to 'overview'.`);
      setActiveTab('overview');
    }
  }, [isCompanyAdmin, activeTab, setActiveTab]);

  const tabs = getAvailableTabs();
  const displayJobsCount = jobsCountFromStore !== null
    ? jobsCountFromStore
    : company.stats.activeJobs;

  const handleBannerError = () => {
    setBannerError(true);
    setBannerLoading(false);
  };

  const handleBannerLoad = () => {
    setBannerError(false);
    setBannerLoading(false);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    if (bannerLoading && company?.banner) {
      timeoutId = setTimeout(() => {
        if (bannerLoading) { // Check again in case onLoad fired just before timeout
          console.log(`[CompanyProfileTemplate] Banner loading timeout for ${company.banner}`);
          setBannerLoading(false);
        }
      }, 5000); 
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [bannerLoading, company?.banner]);

  return (
    <CompanyProfileLayout
      company={company}
      className={className}
      authLoading={authLoading}
      isCompanyAdmin={isCompanyAdmin}
      bannerError={bannerError}
      bannerLoading={bannerLoading}
      tabs={tabs}
      activeTab={activeTab}
      displayJobsCount={displayJobsCount}
      onTabChange={setActiveTab}
      onBannerError={handleBannerError}
      onBannerLoad={handleBannerLoad}
    />
  );
}