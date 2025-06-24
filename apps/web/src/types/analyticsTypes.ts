import { ChartType, ChartData, ChartOptions } from 'chart.js';

export interface ChartProps {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  height?: number;
}

export interface DemographicChartData {
    labels: string[];
    values: number[];
}

export interface StatCardItem {
  label: string;
  value: number | string;
  change?: number;
  positive?: boolean;
  icon?: React.ReactNode;
}

export interface TrendChartData {
  labels: string[];
  values: number[];
}
