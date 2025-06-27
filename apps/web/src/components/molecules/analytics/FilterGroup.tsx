'use client';

import { useState, useEffect } from 'react';
import DateRangePicker from '@/components/atoms/analytics/DateRangePicker';
import { cn } from '@/lib/utils';

interface City {
  id: string;
  name: string;
  provinceId: string;
}

interface FilterGroupProps {
  onDateChange?: (start: Date, end: Date) => void;
  onLocationChange?: (location: { id: string; name: string } | 'all') => void;
}

export default function FilterGroup({
  onDateChange,
  onLocationChange,
}: FilterGroupProps) {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities');
        if (response.ok) {
          const citiesData: City[] = await response.json();
          setCities(citiesData);
        } else {
          console.error('Failed to fetch cities');
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedLocation(selectedId);

    if (selectedId === 'all') {
      onLocationChange?.('all');
    } else {
      const selectedCity = cities.find((c) => c.id === selectedId);
      if (selectedCity) {
        onLocationChange?.({ id: selectedCity.id, name: selectedCity.name });
      }
    }
  };

  const handleDateChange = (start: Date, end: Date) => {
    onDateChange?.(start, end);
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex flex-col gap-4'
      )}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Date Range:
        </label>
        <DateRangePicker onChange={handleDateChange} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Location:
        </label>
        <select
          value={selectedLocation}
          onChange={handleLocationChange}
          className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white w-full"
          disabled={loading}
        >
          <option value="all">All</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}