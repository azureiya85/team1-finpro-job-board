'use client';

import { useAnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';
import DemographicChart from '@/components/molecules/analytics/DemographicChart';
import { useDemographicChart } from '@/hooks/analytics/useDemographicChart';

export default function DemographicsSection() {
  const { filters } = useAnalyticsFilters();
  const { location, dateRange } = filters;

  const { data, isLoading, error } = useDemographicChart({ location, dateRange });

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Applicant Demographics</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Breakdown of applicant genders based on selected filters.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading chart...</p>
      ) : error ? (
        <p className="text-sm text-red-500">Failed to load data</p>
      ) : data ? (
        <DemographicChart chartData={data} />
      ) : (
        <p className="text-sm text-gray-400">No data available</p>
      )}
    </section>
  );
}
