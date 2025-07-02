'use client';

import { useSalaryTrendChart } from '@/hooks/analytics/useSalaryTrendChart';
import TrendLineChart from '@/components/molecules/analytics/TrendLineChart';
import { Skeleton } from '@/components/ui/skeleton';

export default function SalaryTrendsSection() {
  const { chartData, isLoading, isError } = useSalaryTrendChart();

  if (isLoading) {
    return <Skeleton className="w-full h-[320px] rounded-xl" />;
  }

  if (isError || !chartData) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
        <p className="text-red-500 text-sm">Failed to load salary trends</p>
      </div>
    );
  }

  return <TrendLineChart data={chartData} />;
}
