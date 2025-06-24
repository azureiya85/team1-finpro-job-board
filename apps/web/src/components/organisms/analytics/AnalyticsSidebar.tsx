'use client';

import FilterGroup from '@/components/molecules/analytics/FilterGroup';
import { useAnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';

export default function AnalyticsSidebar() {
  const { filters, setDateRange, setLocation } = useAnalyticsFilters();

  return (
    <aside className="w-full sm:w-80 bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <FilterGroup
        onDateChange={(start, end) => setDateRange(start, end)}
        onLocationChange={(loc) => setLocation(loc)}
      />

      {/* Preview for debugging */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 space-y-1">
        <p><strong>Selected Location:</strong> {filters.location}</p>
        <p>
          <strong>Date Range:</strong>{' '}
          {filters.dateRange
            ? `${filters.dateRange.start.toDateString()} → ${filters.dateRange.end.toDateString()}`
            : 'Not selected'}
        </p>
      </div>
    </aside>
  );
}
