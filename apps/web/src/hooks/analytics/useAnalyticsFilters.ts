import { useContext } from 'react';
import { AnalyticsFilterContext } from '@/context/AnalyticsFilterProvider';

export function useAnalyticsFilters() {
  const ctx = useContext(AnalyticsFilterContext);
  if (!ctx) throw new Error('useAnalyticsFilters must be used within AnalyticsFilterProvider');
  return ctx;
}
