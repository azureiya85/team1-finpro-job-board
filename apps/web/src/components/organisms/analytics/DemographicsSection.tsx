'use client';

import { useAnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';
import GenderDemographicChart from '@/components/molecules/analytics/GenderDemographicChart';
import AgeDemographicChart from '@/components/molecules/analytics/AgeDemographicChart';
import { useGenderDemographicChart } from '@/hooks/analytics/useGenderDemographicChart';
import { useAgeDemographicChart } from '@/hooks/analytics/useAgeDemographicChart';
import { Skeleton } from '@/components/ui/skeleton';

export default function DemographicsSection() {
  const { filters } = useAnalyticsFilters();
  const { location, dateRange } = filters;

  const {
    data: genderData,
    isLoading: genderLoading,
    error: genderError,
  } = useGenderDemographicChart({ location, dateRange });

  const {
    data: ageData,
    isLoading: ageLoading,
    error: ageError,
  } = useAgeDemographicChart();

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 space-y-8">
      {/* Gender Chart */}
      <div>
        <h2 className="text-xl font-semibold">Gender Distribution</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Breakdown of applicant genders based on selected filters.
        </p>
        {genderLoading ? (
          <Skeleton className="w-full h-[300px] mt-4 rounded-lg" />
        ) : genderError ? (
          <p className="text-sm text-red-500 mt-2">Failed to load gender data</p>
        ) : genderData ? (
          <GenderDemographicChart chartData={genderData} />
        ) : (
          <p className="text-sm text-gray-400 mt-2">No gender data available</p>
        )}
      </div>

      {/* Age Chart */}
      <div>
        <h2 className="text-xl font-semibold">Age Distribution</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Breakdown of applicant ages based on selected filters.
        </p>
        {ageLoading ? (
          <Skeleton className="w-full h-[300px] mt-4 rounded-lg" />
        ) : ageError ? (
          <p className="text-sm text-red-500 mt-2">Failed to load age data</p>
        ) : ageData ? (
          <AgeDemographicChart data={ageData} />
        ) : (
          <p className="text-sm text-gray-400 mt-2">No age data available</p>
        )}
      </div>
    </section>
  );
}
