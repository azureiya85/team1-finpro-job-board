'use client';

import { Bar } from 'react-chartjs-2';
import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';
import { InterestChartData } from '@/types/analyticsTypes';

interface ApplicantInterestChartProps {
  data: InterestChartData[]
}

export default function ApplicantInterestChart({ data }: ApplicantInterestChartProps) {

  const topTen = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

    
  return (
    <ChartWrapper>
  <Bar
    data={{
      labels: topTen.map(d => d.label), 
      datasets: [
        {
          label: 'Total Applicants',
          data: topTen.map(d => d.count),
          backgroundColor: '#3B82F6',
        },
      ],
    }}
    options={{
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `${context.raw} applicants`,
          },
        },
      },
    }}
  />
</ChartWrapper>
  );
}
