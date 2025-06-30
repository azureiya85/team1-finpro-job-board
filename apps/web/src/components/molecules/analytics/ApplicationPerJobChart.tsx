'use client';

import { useApplicationsPerJobChart } from '@/hooks/analytics/useApplicationsPerJobChart';
import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';
import { Bar } from 'react-chartjs-2';
import { applicationPerJobChartConfig } from '@/lib/analytics/chartConfigs/applicationPerJobChartConfig';
import { ApplicationPerJobData } from '@/types/analyticsTypes';

export function ApplicationPerJobChart() {
  const { data, isLoading, error } = useApplicationsPerJobChart();

  if (isLoading || !data) return <ChartWrapper loading />;
  if (error) return <ChartWrapper error />;

  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);
  const labels = sortedData.map((item: ApplicationPerJobData) => `${item.label}\n(${item.subLabel})`);
  const counts = sortedData.map((item: ApplicationPerJobData) => item.count);

  return (
    <ChartWrapper>
      <Bar
        data={applicationPerJobChartConfig.getData(labels, counts)}
        options={applicationPerJobChartConfig.options}
      />
    </ChartWrapper>
  );
}
