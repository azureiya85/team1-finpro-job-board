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
  lat: number;
  lng: number;
  count: number;
}

export interface TrendChartData {
  labels: string[];
  values: number[];
}

export interface LocationData {
  city: string;
  lat: number;
  lng: number;
  count: number;
}

export interface StatCardItem {
  title: string;
  value: number | string;
  change?: number;
  positive?: boolean;
  icon?: React.ReactNode;
}

export interface AnalyticsFilters {
  location: string;
  dateRange: {
    start: Date;
    end: Date;
  } | null;
  companyId?: string;
}