import { ChartOptions, ChartData, TooltipItem } from 'chart.js';

export const applicationPerJobChartConfig = {
  getData: (labels: string[], values: number[]): ChartData<'bar'> => ({
    labels,
    datasets: [
      {
        label: 'Total Applications',
        data: values,
        backgroundColor: '#4F46E5', // Tailwind indigo-600 atau sesuaikan
      },
    ],
  }),

  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (context: TooltipItem<'bar'>[]) => context[0].label.split('\n')[0],
          afterTitle: (context: TooltipItem<'bar'>[]) => context[0].label.split('\n')[1],
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: function (val) {
            const label = this.getLabelForValue(val as number);
            return label.length > 20 ? label.slice(0, 20) + '…' : label;
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Applications',
        },
      },
    },
  } satisfies ChartOptions<'bar'>,
};
