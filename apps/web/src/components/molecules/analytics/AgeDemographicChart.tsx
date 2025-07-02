'use client';

import { Bar } from 'react-chartjs-2';
import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';
import { AgeDemographicData } from '@/types/analyticsTypes';

interface AgeDemographicChartProps {
  data: AgeDemographicData[]
}

export default function AgeDemographicChart({ data }: AgeDemographicChartProps) {
  const labels = data.map((item) => item.ageRange);
  const values = data.map((item) => item.count);

  return (
    <ChartWrapper >
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: 'Applicants',
              data: values,
              backgroundColor: '#4CAF50',
            },
          ],
        }}
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        }}
      />
    </ChartWrapper>
  );
}
