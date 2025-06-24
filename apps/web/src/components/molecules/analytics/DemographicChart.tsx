'use client';

import { useMemo } from 'react';
import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';
import { getDemographicsChartData } from '@/lib/analytics/chartConfigs/demographicsChartConfig';
import { DemographicChartData } from '@/types/analyticsTypes';

interface DemographicChartProps {
  chartData?: DemographicChartData; // optional
}

const dummyData: DemographicChartData = {
  labels: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  values: [55, 40, 3, 2],
};

export default function DemographicChart({ chartData }: DemographicChartProps) {
  const chart = useMemo(() => {
    const source = chartData ?? dummyData;
    return getDemographicsChartData(source);
  }, [chartData]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Applicant Demographics</h2>
      <ChartWrapper
        type="doughnut"
        data={chart.data}
        options={chart.options}
        height={300}
      />
    </div>
  );
}
