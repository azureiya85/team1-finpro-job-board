'use client';

import AnalyticsSidebar from '@/components/organisms/analytics/AnalyticsSidebar';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';
import SalaryTrendsSection from '@/components/organisms/analytics/SalaryTrendsSection';
import DemographicsSection from '@/components/organisms/analytics/DemographicsSection';
import ApplicantInterestsSection from '@/components/organisms/analytics/ApplicantInterestsSection';
import LocationMapSection from '@/components/organisms/analytics/LocationMapSection';

interface Props {
  title: string;
  filters: AnalyticsFilters;
  metricType: 'salary' | 'demographics' | 'interests' | 'location';
}

export default function AnalyticsTemplate({ title, filters, metricType }: Props) {
  return (
    <main className="flex flex-col md:flex-row gap-6 px-4 py-6 max-w-screen-xl mt-16">
      {/* Sidebar */}
      <div className="flex-shrink-0 w-full md:w-80">
        <AnalyticsSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold">{title}</h1>

        {metricType === 'salary' && <SalaryTrendsSection filters={filters} />}
        {metricType === 'demographics' && <DemographicsSection filters={filters} />}
        {metricType === 'interests' && <ApplicantInterestsSection filters={filters} />}
        {metricType === 'location' && <LocationMapSection filters={filters} />}
      </div>
    </main>
  );
}
