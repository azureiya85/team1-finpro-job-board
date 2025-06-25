import { useState } from 'react';

export interface AnalyticsFilters {
  location: string;
  dateRange: {
    start: Date;
    end: Date;
  } | null;
  companyId: string;
}

export function useAnalyticsFilters() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    location: 'all',
    dateRange: null,
    companyId: '',
  });

  const setLocation = (location: string) =>
    setFilters((prev) => ({ ...prev, location }));

  const setDateRange = (start: Date, end: Date) =>
    setFilters((prev) => ({ ...prev, dateRange: { start, end } }));

  const resetFilters = () =>
    setFilters({
      location: 'all',
      dateRange: null,
      companyId: '',
    });

  return {
    filters,
    setFilters,
    setLocation,
    setDateRange,
    resetFilters,
  };
}
