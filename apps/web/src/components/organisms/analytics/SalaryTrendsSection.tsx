'use client';

import { useSalaryTrendChart } from '@/hooks/analytics/useSalaryTrendChart';
import { getTrendLineChartData } from '@/lib/analytics/chartConfigs/salaryTrendChartConfig';
import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';

interface SalaryTrendsSectionProps {
  location: string;
  startDate?: Date;
  endDate?: Date;
}

const dummyChartData = {
  labels: ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025'],
  values: [5200000, 5300000, 5000000, 5500000, 5800000],
};

export default function SalaryTrendsSection({
  location,
  startDate,
  endDate,
}: SalaryTrendsSectionProps) {
  const { chartData, isLoading, isError } = useSalaryTrendChart({
    location,
    start: startDate,
    end: endDate,
  });

  const chart = getTrendLineChartData(chartData ?? dummyChartData);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Salary Trends</h2>

      {isLoading && <p className="text-gray-500">Loading chart...</p>}
      {isError && <p className="text-red-500">Failed to load salary trends. Showing sample data.</p>}

      <ChartWrapper
        type="line"
        data={chart.data}
        options={chart.options}
        height={400}
      />

      {!isLoading && chartData?.labels.length === 0 && (
        <p className="text-gray-500 text-sm mt-2">No salary data available for this period. Showing dummy.</p>
      )}
    </div>
  );
}
