import { ReactNode } from 'react';

export interface ChartProps {
  children?: ReactNode;
  loading?: boolean;
  error?: boolean;
}
export interface AgeDemographicData {
  ageRange: string;
  count: number;
}

export interface DemographicChartData {
    labels: string[];
    values: number[];
}

export interface DemographicItem {
  label: string;
  count: number;
}

export interface SalaryTrendChartData {
  labels: string[];
  values: number[];
}

export interface InterestChartData {
  label: string;
  count: number;
}

export interface InterestItem {
  category: string;
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

export interface ApplicationPerJobData {
  label: string;  
  subLabel: string;  
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