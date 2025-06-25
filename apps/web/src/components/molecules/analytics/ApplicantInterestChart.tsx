'use client';

import { useMemo } from 'react';
import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';
import { getInterestChartData } from '@/lib/analytics/chartConfigs/applicantInterestChartConfig';
import { InterestChartData } from '@/types/analyticsTypes';

interface ApplicantInterestChartProps {
  data?: InterestChartData[];
}

const dummyData: InterestChartData[] = [
  { label: 'Technology', count: 30 },
  { label: 'Marketing', count: 20 },
  { label: 'Finance', count: 15 },
  { label: 'Other', count: 10 },
];

export default function ApplicantInterestChart({ data = dummyData }: ApplicantInterestChartProps) {
  const chart = useMemo(() => getInterestChartData(data), [data]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Applicant Interests</h2>
      <ChartWrapper
        type="bar"
        data={chart.data}
        options={chart.options}
        height={300}
      />
    </div>
  );
}
