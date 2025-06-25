'use client';

import SalaryTrendsSection from '@/components/organisms/analytics/SalaryTrendsSection';
import DemographicsSection from '@/components/organisms/analytics/DemographicsSection';
import ApplicantInterestsSection from '@/components/organisms/analytics/ApplicantInterestsSection';
import LocationMapSection from '@/components/organisms/analytics/LocationMapSection';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';

interface AnalyticsDetailTemplateProps {
  title: string;
  description?: string;
  filters: AnalyticsFilters;
  metricType: 'salary' | 'demographics' | 'interests' | 'location';
}

export default function AnalyticsDetailTemplate({
  title,
  description,
  filters,
  metricType,
}: AnalyticsDetailTemplateProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{description}</p>
        )}
      </div>

      {/* Dynamic Content */}
      {metricType === 'salary' && (
        <SalaryTrendsSection filters={filters}/>
      )}

      {metricType === 'demographics' && (
        <DemographicsSection filters={filters} />
      )}

      {metricType === 'interests' && (
        <ApplicantInterestsSection filters={filters} />
      )}

      {metricType === 'location' && (
        <LocationMapSection filters={filters} />
      )}
    </div>
  );
}
