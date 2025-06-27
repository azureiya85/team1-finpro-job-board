'use client';

import { useMemo } from 'react';
import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';
import { getInterestChartData } from '@/lib/analytics/chartConfigs/applicantInterestChartConfig';
import { InterestChartData } from '@/types/analyticsTypes';

interface ApplicantInterestChartProps {
  data?: InterestChartData[];
}

export default function ApplicantInterestChart({ data = [] }: ApplicantInterestChartProps) {
  const chart = useMemo(() => getInterestChartData(data), [data]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Applicant Interest by Job Category</h2>
      <ChartWrapper
        type="bar"
        data={chart.data}
        options={chart.options}
        height={300}
      />
    </div>
  );
}