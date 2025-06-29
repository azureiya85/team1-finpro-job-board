'use client';

import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';
import { getTrendLineChartData } from '@/lib/analytics/chartConfigs/salaryTrendChartConfig';
import { useMemo } from 'react';
import { TrendChartData } from '@/types/analyticsTypes';

interface TrendLineChartProps {
  data: TrendChartData;
}

export default function TrendLineChart({ data }: TrendLineChartProps) {
  const chart = useMemo(() => getTrendLineChartData(data), [data]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Salary Trends</h2>
      <ChartWrapper
        type="line"
        data={chart.data}
        options={chart.options}
        height={320}
      />
    </div>
  );
}