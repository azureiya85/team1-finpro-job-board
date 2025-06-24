'use client';

import { useState } from 'react';
import DateRangePicker from '@/components/atoms/analytics/DateRangePicker';
import { cn } from '@/lib/utils';

interface FilterGroupProps {
  onDateChange?: (start: Date, end: Date) => void;
  onLocationChange?: (location: string) => void;
}

export default function FilterGroup({
  onDateChange,
  onLocationChange,
}: FilterGroupProps) {
  const [selectedLocation, setSelectedLocation] = useState('all');

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = e.target.value;
    setSelectedLocation(loc);
    onLocationChange?.(loc);
  };

  const handleDateChange = (start: Date, end: Date) => {
    onDateChange?.(start, end);
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between'
      )}
    >
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Date Range:
        </label>
        <DateRangePicker onChange={handleDateChange} />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Location:
        </label>
        <select
          value={selectedLocation}
          onChange={handleLocationChange}
          className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
        >
          <option value="all">All</option>
          <option value="jakarta">Jakarta</option>
          <option value="bandung">Bandung</option>
          <option value="surabaya">Surabaya</option>
        </select>
      </div>
    </div>
  );
}
