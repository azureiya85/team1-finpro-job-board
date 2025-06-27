'use client';

import { useMemo } from 'react';
import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';
import { getAgeChartData } from '@/lib/analytics/chartConfigs/ageDemographicChartConfig';
import { AgeDemographicData } from '@/types/analyticsTypes';

interface Props {
  data?: AgeDemographicData[];
}

export default function AgeDemographicChart({ data = [] }: Props) {
  const chart = useMemo(() => getAgeChartData(data), [data]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <ChartWrapper type="bar" data={chart.data} options={chart.options} height={300} />
    </div>
  );
}