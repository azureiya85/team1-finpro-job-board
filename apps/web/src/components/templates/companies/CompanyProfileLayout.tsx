'use client';

import Image from 'next/image';
import CompanyProfileOverview from '@/components/organisms/companies/CompanyProfileOverview';
import CompanyProfileManagement from '@/components/organisms/companies/CompanyProfileManagement';
import CompanyJobsManagement from '@/components/organisms/companies/CompanyJobsManagement';
import CompanyProfileJobs from '@/components/organisms/companies/CompanyProfleJobs';
import type { CompanyDetailed } from '@/types';
import type { CompanyProfileTabId } from '@/stores/companyProfileStores';

interface Tab {
  id: CompanyProfileTabId;
  label: string;
}

interface CompanyProfileLayoutProps {
  company: CompanyDetailed;
  className?: string;
  authLoading: boolean;
  isCompanyAdmin: boolean;
  bannerError: boolean;
  bannerLoading: boolean;
  tabs: Tab[];
  activeTab: CompanyProfileTabId;
  displayJobsCount: number;
  onTabChange: (tab: CompanyProfileTabId) => void;
  onBannerError: () => void;
  onBannerLoad: () => void;
}

export default function CompanyProfileLayout({
  company,
  className,
  authLoading,
  isCompanyAdmin,
  bannerError,
  bannerLoading,
  tabs,
  activeTab,
  displayJobsCount,
  onTabChange,
  onBannerError,
  onBannerLoad
}: CompanyProfileLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-100 ${className}`}>
      {authLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validating access...</p>
          </div>
        </div>
      )}

      <div className="relative h-56 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        {company?.banner && !bannerError ? (
          <>
            <Image
              src={company.banner}
              alt={`${company.name} banner`}
              fill
              className="object-cover"
              priority={true}
              unoptimized={company.banner.startsWith('http')} 
              onError={onBannerError}
              onLoad={onBannerLoad}
            />
            {bannerLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center z-10">
                <div className="text-white text-lg">Loading banner...</div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-lg font-medium">{company?.name || 'Company'}</div>
              <div className="text-sm opacity-75 mt-1">
                {bannerError && company?.banner ? 'Banner image failed to load' : 'Company Banner'}
              </div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
      </div>

      {isCompanyAdmin && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You are viewing this company profile as an administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-6 md:space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  whitespace-nowrap py-3 md:py-4 px-1 border-b-2 font-medium text-sm md:text-base
                  focus:outline-none transition-colors duration-150 ease-in-out
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
                {tab.id === 'jobs' && displayJobsCount > 0 && (
                  <span
                    className={`
                      ml-2 py-0.5 px-2 rounded-full text-xs font-semibold
                      ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }
                    `}
                  >
                    {displayJobsCount}
                  </span>
                )}
                {(tab.id === 'profile-management' || tab.id === 'job-management') && (
                  <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200">
                    Admin
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="py-6 md:py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {activeTab === 'overview' && company && (
              <CompanyProfileOverview />
            )}
            {activeTab === 'jobs' && company && (
              <CompanyProfileJobs companyId={company.id} />
            )}
            {activeTab === 'profile-management' && isCompanyAdmin && company && (
              <CompanyProfileManagement />
            )}
            {activeTab === 'job-management' && isCompanyAdmin && company && (
              <CompanyJobsManagement />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}