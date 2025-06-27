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
          label: 'Number of Applicants',
          data: data.map(d => d.count),
          backgroundColor: data.map(() => `hsla(${Math.random() * 360}, 70%, 50%, 0.5)`),
          borderColor: data.map(() => `hsla(${Math.random() * 360}, 70%, 50%, 1)`),
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
            stepSize: 1,
          },
          title: {
            display: true,
            text: 'Number of Applicants'
          }
        },
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          }
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `Applicants: ${context.parsed.y}`
          }
        }
      },
    },
  };
}