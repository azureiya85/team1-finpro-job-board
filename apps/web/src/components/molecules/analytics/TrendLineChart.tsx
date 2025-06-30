'use client';

import { Line } from 'react-chartjs-2';
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
    <ChartWrapper >
      <Line data={chart.data} options={chart.options} />
    </ChartWrapper>
  );
}
