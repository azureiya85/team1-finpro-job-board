'use client';

import { createContext, useState } from 'react';
import { AnalyticsFilters } from '@/types/analyticsTypes';

interface AnalyticsFilterContextType {
  filters: AnalyticsFilters;
  setLocation: (loc: AnalyticsFilters['location']) => void;
  setDateRange: (start: Date, end: Date) => void;
  resetFilters: () => void;
}

export const AnalyticsFilterContext = createContext<AnalyticsFilterContextType | undefined>(undefined);

export function AnalyticsFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    location: 'all',
    dateRange: null,
  });

  const setLocation = (loc: AnalyticsFilters['location']) =>
    setFilters((prev) => ({ ...prev, location: loc }));

  const setDateRange = (start: Date, end: Date) =>
    setFilters((prev) => ({ ...prev, dateRange: { start, end } }));

  const resetFilters = () =>
    setFilters({
      location: 'all',
      dateRange: null,
    });

  return (
    <AnalyticsFilterContext.Provider value={{ filters, setLocation, setDateRange, resetFilters }}>
      {children}
    </AnalyticsFilterContext.Provider>
  );
}
