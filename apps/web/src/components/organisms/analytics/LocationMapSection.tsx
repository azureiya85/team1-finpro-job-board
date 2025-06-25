"use client";

import { useEffect, useState } from "react";
import { getUserLocationDistribution } from "@/lib/api/analytics/getUserLocationDistribution";
import { Skeleton } from "@/components/ui/skeleton";
import LocationMap from "@/components/molecules/analytics/LocationMap";
import { LocationData } from "@/types/analyticsTypes";


export default function LocationMapSection() {
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserLocationDistribution();
        setLocationData(data);
      } catch (error) {
        console.error("Error fetching location data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
