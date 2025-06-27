import { ChartData, ChartOptions } from 'chart.js';
import { AgeDemographicData } from '@/types/analyticsTypes';

export function getAgeChartData(raw: AgeDemographicData[]) {
  const labels = raw.map((d) => d.ageRange);
  const values = raw.map((d) => d.count);

  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Applicant Count',
        data: values,
        backgroundColor: '#4A90E2',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { title: { display: true, text: 'Age Range' } },
      y: { title: { display: true, text: 'Count' }, beginAtZero: true },
    },
  };

  return { data, options };
}
