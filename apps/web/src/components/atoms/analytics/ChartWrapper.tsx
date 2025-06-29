'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { ChartProps } from '@/types/analyticsTypes';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, ArcElement, Filler );

export default function ChartWrapper({ type, data, options, height = 300 }: ChartProps) {
  return (
    <div className="w-full">
      <Chart type={type} data={data} options={options} height={height} />
    </div>
  );
}
