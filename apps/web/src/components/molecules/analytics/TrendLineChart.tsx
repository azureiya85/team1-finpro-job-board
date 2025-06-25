'use client';

import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';
import { getTrendLineChartData } from '@/lib/analytics/chartConfigs/salaryTrendChartConfig';
import { useMemo } from 'react';

const dummyTrendData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [3800, 4000, 4200, 4100, 4300, 4400],
};

export default function TrendLineChart() {
  const chart = useMemo(() => getTrendLineChartData(dummyTrendData), []);

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
