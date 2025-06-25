import { ChartData, ChartOptions } from 'chart.js';
import { InterestChartData } from '@/types/analyticsTypes';

export function getInterestChartData(data: InterestChartData[]): {
  data: ChartData<'bar'>;
  options: ChartOptions<'bar'>;
} {
  return {
    data: {
      labels: data.map(d => d.label),
      datasets: [
        {
          label: 'Applicants',
          data: data.map(d => d.count),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 5,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  };
}
