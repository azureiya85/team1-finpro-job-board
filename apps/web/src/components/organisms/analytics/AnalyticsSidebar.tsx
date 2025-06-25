'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import FilterGroup from '@/components/molecules/analytics/FilterGroup';
import { useAnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';
import cn from 'classnames';

const items = [
  { label: 'Salary Trends', path: 'salary' },
  { label: 'Demographics', path: 'demographics' },
  { label: 'Interests', path: 'interests' },
  { label: 'Location', path: 'location' },
];

export default function AnalyticsSidebar() {
  const { filters, setDateRange, setLocation } = useAnalyticsFilters();
  const pathname = usePathname();

  return (
    <aside className="w-full sm:w-80 bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Analytics Menu</h2>
      <nav className="mb-6 space-y-2">
        {items.map((item) => {
          const isActive = pathname.includes(`/analytics/${item.path}`);
          return (
            <Link
              key={item.path}
              href={`/analytics/${item.path}`}
              className={cn(
                'block px-4 py-2 rounded-md text-sm font-medium',
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <h2 className="text-lg font-semibold mb-2">Filters</h2>
      <FilterGroup
        onDateChange={(start, end) => setDateRange(start, end)}
        onLocationChange={(loc) => setLocation(loc)}
      />

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
