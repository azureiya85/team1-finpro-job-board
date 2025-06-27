import { ChartData, ChartOptions } from 'chart.js';
import { TrendChartData } from '@/types/analyticsTypes';

export function getTrendLineChartData(data: TrendChartData): {
  data: ChartData<'line'>;
  options: ChartOptions<'line'>;
} {
  return {
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Average Salary',
          data: data.values,
          fill: true,
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: 'rgba(33, 150, 243, 1)',
          tension: 0.3,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => `$${value}`,
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `$${context.raw}`;
            },
          },
        },
      },
    },
  };
}
