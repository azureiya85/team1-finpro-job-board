'use client';

import { useAnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';
import { useSalaryTrendChart } from '@/hooks/analytics/useSalaryTrendChart';
import { getTrendLineChartData } from '@/lib/analytics/chartConfigs/salaryTrendChartConfig';
import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';

export default function SalaryTrendsSection() {
  const { filters } = useAnalyticsFilters();
  const { location, dateRange } = filters;

  const { chartData, isLoading, isError } = useSalaryTrendChart({
    location,
    start: dateRange?.start,
    end: dateRange?.end,
  });

  const chart = getTrendLineChartData(chartData || { labels: [], values: [] });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">

      {isLoading && <p className="text-gray-500">Loading chart...</p>}
      {isError && <p className="text-red-500">Failed to load salary trends. Showing sample data.</p>}

      <ChartWrapper type="line" data={chart.data} options={chart.options} height={400} />

      {!isLoading && chartData?.labels.length === 0 && (
        <p className="text-gray-500 text-sm mt-2">No salary data available for this period. Showing dummy.</p>
      )}
    </div>
  );
}
