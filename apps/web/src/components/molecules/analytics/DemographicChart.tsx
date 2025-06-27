'use client';

import { useMemo } from 'react';
import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';
import { getDemographicsChartData } from '@/lib/analytics/chartConfigs/demographicsChartConfig';
import { DemographicChartData } from '@/types/analyticsTypes';

interface DemographicChartProps {
  chartData?: DemographicChartData;
}

export default function DemographicChart({ chartData }: DemographicChartProps) {
  const chart = useMemo(() => {
    if (!chartData) return null;
    return getDemographicsChartData(chartData);
  }, [chartData]);

  if (!chart) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4" style={{ width: '500px', height: '350px' }}>
      <ChartWrapper
        type="doughnut"
        data={chart.data}
        options={chart.options}
        height={300}
      />
    </div>
  );
}