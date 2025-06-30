'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { ChartProps } from '@/types/analyticsTypes';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, ArcElement, Filler );

  export default function ChartWrapper({ children, loading, error }: ChartProps) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow p-4 space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load data</p>
        ) : (
          children
        )}
      </div>
    );
  }
