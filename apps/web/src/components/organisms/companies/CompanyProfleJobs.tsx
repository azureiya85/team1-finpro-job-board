'use client';

import { useEffect, useState, useCallback } from 'react'; 
import { Briefcase } from 'lucide-react';
import { useCompanyProfileStore } from '@/stores/companyProfileStores';
import type { JobPostingInStore } from '@/types';
import type { JobPosting, City, Province, CompanySize } from '@prisma/client';
import CompanyJobCard from '@/components/molecules/companies/CompanyJobCard';
import CVSubmitModal from '@/components/atoms/modals/CVSubmitModal';

interface CompanyProfileJobsProps {
  companyId: string;
  className?: string;
}

type ApiJob = JobPosting & {
  company: { 
    id: string;
    name: string;
    logo: string | null;
    size: CompanySize | null;
  } | null;
  city: Pick<City, 'id' | 'name' | 'type'> | null; 
  province: Pick<Province, 'id' | 'name' | 'code'> | null; 
  _count: { applications: number } | null; 
};


export default function CompanyProfileJobs({ companyId, className }: CompanyProfileJobsProps) {
  const {
    displayJobs: jobs, 
    isLoadingDisplayJobs: isLoadingJobs,
    displayJobsPage: jobsPage,
    hasMoreDisplayJobs: hasMoreJobs,
    setDisplayJobs: setJobs,
    addDisplayJobs: addJobs,
    setLoadingDisplayJobs: setLoadingJobs,
    setDisplayJobsPagination 
  } = useCompanyProfileStore();

  const totalJobsCount = useCompanyProfileStore(state => state.totalJobs); // Get the count separately

  const [initialLoad, setInitialLoad] = useState(true);

  const transformApiJobToStoreJob = useCallback((apiJob: ApiJob): JobPostingInStore => {
    let locationString = 'Location not specified';
    if (apiJob.isRemote) {
      locationString = 'Remote';
    } else if (apiJob.city?.name && apiJob.province?.name) {
      locationString = `${apiJob.city.name}, ${apiJob.province.name}`;
    } else if (apiJob.city?.name) {
      locationString = apiJob.city.name;
    } else if (apiJob.province?.name) {
      locationString = apiJob.province.name;
    }

    let derivedWorkType = 'ON_SITE'; 
    if (apiJob.isRemote) {
        derivedWorkType = 'REMOTE';
    }

    const companyForStore = apiJob.company ? {
        id: apiJob.company.id,
        name: apiJob.company.name,
        logo: apiJob.company.logo,
        size: apiJob.company.size,
    } : null;
 
    return {
      id: apiJob.id,
      title: apiJob.title,
      description: apiJob.description,
      employmentType: apiJob.employmentType,
      experienceLevel: apiJob.experienceLevel,
      category: apiJob.category,
      isRemote: apiJob.isRemote,
      createdAt: new Date(apiJob.createdAt),
      publishedAt: apiJob.publishedAt ? new Date(apiJob.publishedAt) : null,
      salaryMin: apiJob.salaryMin,
      salaryMax: apiJob.salaryMax,
      salaryCurrency: apiJob.salaryCurrency,
      isPriority: apiJob.isPriority,
      tags: apiJob.tags,
      requirements: apiJob.requirements,
      benefits: apiJob.benefits,
      applicationDeadline: apiJob.applicationDeadline ? new Date(apiJob.applicationDeadline) : null,
      requiresCoverLetter: apiJob.requiresCoverLetter,
      banner: apiJob.banner,
      isActive: apiJob.isActive,
      companyId: apiJob.companyId,
      cityId: apiJob.cityId,
      provinceId: apiJob.provinceId,
      preSelectionTestId: apiJob.preSelectionTestId,
      updatedAt: new Date(apiJob.updatedAt),
      latitude: apiJob.latitude,
      longitude: apiJob.longitude,
      country: apiJob.country,
      workType: derivedWorkType,
      location: locationString,
      company: companyForStore,
      city: apiJob.city ? { id: apiJob.city.id, name: apiJob.city.name, type: apiJob.city.type } : null,
      province: apiJob.province ? { id: apiJob.province.id, name: apiJob.province.name, code: apiJob.province.code } : null,
      _count: apiJob._count ? { applications: apiJob._count.applications } : { applications: 0 },
    };
  }, []);

  const fetchJobs = useCallback(async (pageToFetch: number = 1, append: boolean = false) => {
    if (!companyId) {
      console.error('[CompanyProfileJobs] companyId is undefined or null. Cannot fetch jobs.');
      setLoadingJobs(false);
      if (!append) setInitialLoad(false);
      return;
    }

    setLoadingJobs(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const itemsPerPage = 10; 
      const skip = (pageToFetch - 1) * itemsPerPage;

      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        take: itemsPerPage.toString(),
      });

      const response = await fetch(
        `${apiUrl}/api/companies/${companyId}/jobs?${queryParams.toString()}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[CompanyProfileJobs] Failed to fetch jobs. Status: ${response.status}, URL: ${response.url}, Body: ${errorText}`);
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const data = await response.json();
      const transformedJobs = (data.jobPostings || []).map(transformApiJobToStoreJob);

      if (append) {
        addJobs(transformedJobs);
      } else {
        setJobs(transformedJobs);
      }

      setDisplayJobsPagination(
        data.pagination?.page || pageToFetch,
        data.pagination?.hasNext || false
      );

    } catch (error) {
      console.error('[CompanyProfileJobs] Error fetching jobs:', error);
    } finally {
      setLoadingJobs(false);
      if (!append) {
        setInitialLoad(false);
      }
    }
   
  }, [companyId, setLoadingJobs, transformApiJobToStoreJob, addJobs, setJobs, setDisplayJobsPagination]); 

  useEffect(() => {
    if (companyId && initialLoad) {
      fetchJobs(1, false);
    }
  }, [companyId, initialLoad, fetchJobs]);

  const loadMoreJobs = () => {
    if (hasMoreJobs && !isLoadingJobs) {
      fetchJobs(jobsPage + 1, true);
    }
  };

  if (initialLoad && isLoadingJobs) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-2/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!jobs.length && !isLoadingJobs && !initialLoad) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Active Jobs
        </h3>
        <p className="text-gray-500">
          This company does not have any active job postings at the moment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Open Positions ({totalJobsCount ?? 0}) 
          </h2>
        </div>
        <div className="space-y-4">
          {jobs.map((job) => (
            <CompanyJobCard key={job.id} job={job} />
          ))}
        </div>

        {hasMoreJobs && (
          <div className="text-center pt-4">
            <button
              onClick={loadMoreJobs}
              disabled={isLoadingJobs}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingJobs ? 'Loading...' : 'Load More Jobs'}
            </button>
          </div>
        )}

        {isLoadingJobs && !initialLoad && jobs.length > 0 && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span>Loading more jobs...</span>
            </div>
          </div>
        )}
      </div>
      <CVSubmitModal />
    </>
  );
}