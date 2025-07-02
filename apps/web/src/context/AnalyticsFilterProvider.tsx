'use client';

import { createContext, useState } from 'react';
import { LocationFilter } from '@/types/analyticsTypes';

interface AnalyticsFilterContextType {
  filters: LocationFilter;
  setLocation: (loc: LocationFilter['location']) => void;
  setDateRange: (start: Date, end: Date) => void;
  resetFilters: () => void;
}

export const AnalyticsFilterContext = createContext<AnalyticsFilterContextType | undefined>(undefined);

export function AnalyticsFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<LocationFilter>({
    location: 'all',
  });

  const setLocation = (loc: LocationFilter['location']) =>
    setFilters((prev) => ({ ...prev, location: loc }));

  const setDateRange = (start: Date, end: Date) =>
    setFilters((prev) => ({ ...prev, dateRange: { start, end } }));

  const resetFilters = () =>
    setFilters({
      location: 'all',
    });

  return (
    <AnalyticsFilterContext.Provider value={{ filters, setLocation, setDateRange, resetFilters }}>
      {children}
    </AnalyticsFilterContext.Provider>
  );
}
