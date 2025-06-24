import { ChartData, ChartOptions } from 'chart.js';

interface DemographicData {
  labels: string[];
  values: number[];
}

export function getDemographicsChartData(data: DemographicData): {
  data: ChartData<'doughnut'>;
  options: ChartOptions<'doughnut'>;
} {
  return {
    data: {
      labels: data.labels,
      datasets: [
        {
          data: data.values,
          backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right' as const,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw as number;
              return `${label}: ${value}`;
            },
          },
        },
      },
    },
  };
}
