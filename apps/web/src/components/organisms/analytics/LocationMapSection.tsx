'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getLocationMapData } from '@/lib/api/analytics/getLocationMapData';
import { Skeleton } from '@/components/ui/skeleton';
import { LocationData, AnalyticsFilters } from '@/types/analyticsTypes';

// ⬅️ Dynamic import agar LocationMap hanya dirender di client
const LocationMap = dynamic(() => import('@/components/molecules/analytics/LocationMap'), {
  ssr: false,
});

interface LocationMapSectionProps {
  filters: AnalyticsFilters;
}

export default function LocationMapSection({ filters }: LocationMapSectionProps) {
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLocationMapData(filters);
        setLocationData(data);
      } catch (error) {
        console.error('Error fetching location data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Location Distribution</h2>
      {loading ? (
        <Skeleton className="h-[300px] w-full rounded-md" />
      ) : (
        <LocationMap data={locationData} />
      )}
    </div>
  );
}