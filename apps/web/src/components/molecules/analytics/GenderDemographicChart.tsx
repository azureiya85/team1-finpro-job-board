'use client';

import { Pie } from 'react-chartjs-2';
import ChartWrapper from '@/components/atoms/analytics/ChartWrapper';
import { DemographicChartData } from '@/types/analyticsTypes';

interface GenderDemographicChartProps {
  chartData: DemographicChartData
}

export default function GenderDemographicChart({ chartData }: GenderDemographicChartProps) {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.values,
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '300px', marginTop: '15px' }}>
        <Pie data={data} options={options} />
      </div>
  );
}
