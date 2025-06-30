import { ChartType, ChartData, ChartOptions } from 'chart.js';

export interface ChartProps {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  height?: number;
}
export interface AgeDemographicData {
  ageRange: string;
  count: number;
}

export interface DemographicChartData {
    labels: string[];
    values: number[];
}

export interface SalaryTrendChartData {
  labels: string[];
  values: number[];
}

export interface InterestChartData {
  label: string;
  count: number;
}

export interface MapData {
  city: string;
  latitude: number;
  longitude: number;
  count: number;
}

export interface TrendChartData {
  labels: string[];
  values: number[];
}

export interface LocationData {
  cityId: string;
  city: string;
  latitude: number;
  longitude: number;
  count: number;
}

export interface StatCardItem {
  title: string;
  value: number | string;
  change?: number;
  positive?: boolean;
  icon?: React.ReactNode;
}

export interface LocationFilter {
  location: { id: string; name: string } | 'all';
}